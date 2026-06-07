import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { prisma } from "../prisma.js";
import { env } from "../env.js";

// inicializa o Socket.io anexado ao servidor HTTP do Fastify
export function initChat(httpServer: HttpServer, verify: (token: string) => { sub: string }) {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin, credentials: true },
  });

  // autentica o socket pelo JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string;
      const payload = verify(token);
      (socket.data as any).userId = payload.sub;
      next();
    } catch {
      next(new Error("não autenticado"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as any).userId as string;
    socket.join(`user:${userId}`); // sala pessoal p/ notificações

    // entrar numa sala de chat (só se for participante)
    socket.on("chat:join", async (chatId: string) => {
      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (chat && (chat.userAId === userId || chat.userBId === userId)) {
        socket.join(`chat:${chatId}`);
      }
    });

    // enviar mensagem
    socket.on(
      "chat:message",
      async (data: { chatId: string; body?: string; mediaUrl?: string; viewOnce?: boolean }) => {
        const chat = await prisma.chat.findUnique({ where: { id: data.chatId } });
        if (!chat || (chat.userAId !== userId && chat.userBId !== userId)) return;

        // bloqueio impede mensagem
        const otherId = chat.userAId === userId ? chat.userBId : chat.userAId;
        const blocked = await prisma.block.findFirst({
          where: {
            OR: [
              { blockerId: otherId, blockedId: userId },
              { blockerId: userId, blockedId: otherId },
            ],
          },
        });
        if (blocked) return;

        const msg = await prisma.message.create({
          data: {
            chatId: data.chatId,
            senderId: userId,
            body: data.body,
            mediaUrl: data.mediaUrl,
            viewOnce: data.viewOnce ?? false,
          },
        });

        io.to(`chat:${data.chatId}`).emit("chat:message", msg);
        io.to(`user:${otherId}`).emit("notification", { type: "message", chatId: data.chatId });
      },
    );

    socket.on("chat:typing", (chatId: string) => {
      socket.to(`chat:${chatId}`).emit("chat:typing", { userId });
    });
  });

  return io;
}
