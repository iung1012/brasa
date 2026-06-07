import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket.js";
import { useAuth } from "../context/AuthContext.js";
import { VerifiedIcon } from "../components/Icons.js";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  body?: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface ChatContact {
  chatId: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  verified: boolean;
  online: boolean;
}

// mock messages para demonstracao quando o backend nao esta rodando
function mockMessages(myId: string, otherId: string): Message[] {
  const ts = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
  return [
    { id: "mk1", chatId: "", senderId: otherId, body: "Oi! Adorei seu perfil.", createdAt: ts(32) },
    { id: "mk2", chatId: "", senderId: myId,    body: "Obrigado! O seu tambem e incrivel.", createdAt: ts(30) },
    { id: "mk3", chatId: "", senderId: otherId, body: "Que tal nos encontrarmos essa semana?", createdAt: ts(15) },
    { id: "mk4", chatId: "", senderId: myId,    body: "Claro! Quinta ou sexta funcionam pra voce?", createdAt: ts(10) },
    { id: "mk5", chatId: "", senderId: otherId, body: "Quinta perfeito. Podemos combinar o local depois.", createdAt: ts(2) },
  ];
}

type Props = { contact: ChatContact; onBack: () => void };

export function ConversationScreen({ contact, onBack }: Props) {
  const { user } = useAuth();
  const myId = user?.id ?? "me";

  const [messages, setMessages]   = useState<Message[]>([]);
  const [text, setText]           = useState("");
  const [typing, setTyping]       = useState(false);
  const [connected, setConnected] = useState(false);
  const [offline, setOffline]     = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const typingRef  = useRef<ReturnType<typeof setTimeout>>();
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let sock: ReturnType<typeof getSocket>;
    try {
      sock = getSocket();

      sock.on("connect",    () => { setConnected(true); setOffline(false); });
      sock.on("connect_error", () => {
        setConnected(false);
        setOffline(true);
        // fallback: carrega mock
        setMessages(mockMessages(myId, contact.userId));
      });
      sock.on("disconnect", () => setConnected(false));

      sock.emit("chat:join", contact.chatId);

      sock.on("chat:message", (msg: Message) => {
        if (msg.chatId !== contact.chatId) return;
        setMessages((prev) => [...prev, msg]);
      });

      sock.on("chat:typing", ({ userId }: { userId: string }) => {
        if (userId === myId) return;
        setTyping(true);
        clearTimeout(typingRef.current);
        typingRef.current = setTimeout(() => setTyping(false), 2500);
      });
    } catch {
      setOffline(true);
      setMessages(mockMessages(myId, contact.userId));
    }

    return () => {
      try {
        sock?.off("chat:message");
        sock?.off("chat:typing");
      } catch {}
    };
  }, [contact.chatId, contact.userId, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    const body = text.trim();
    if (!body) return;

    // optimistic
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      chatId: contact.chatId,
      senderId: myId,
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    inputRef.current?.focus();

    if (!offline) {
      try {
        getSocket().emit("chat:message", { chatId: contact.chatId, body });
      } catch {}
    }
  }

  function onType(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (!offline) {
      try { getSocket().emit("chat:typing", contact.chatId); } catch {}
    }
  }

  const initials = contact.displayName[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* header */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 border-b border-line">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center text-ink-2 -ml-1">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="relative flex-shrink-0">
          {contact.avatarUrl
            ? <img src={contact.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={contact.displayName} />
            : <div className="w-10 h-10 rounded-full bg-heat-2/20 flex items-center justify-center text-sm font-bold text-heat-2">{initials}</div>
          }
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-bg ${contact.online && connected ? "bg-[#2ED47A]" : "bg-surface-3"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-ink truncate">{contact.displayName}</span>
            {contact.verified && (
              <span className="w-4 h-4 rounded-full bg-[#FFB020] flex items-center justify-center flex-shrink-0">
                <VerifiedIcon className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
          <p className="text-[11px] text-ink-3">
            {offline ? "demonstracao" : connected ? "online agora" : "conectando..."}
          </p>
        </div>

        <button className="w-9 h-9 flex items-center justify-center text-ink-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </header>

      {/* mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && !offline && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
            <div className="w-16 h-16 rounded-full bg-heat flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                <path d="M12 2C9.8 4.5 8 7.2 8 10a4 4 0 008 0c0-.7-.1-1.3-.3-1.9C14.8 9.4 14 10.6 14 12a2 2 0 01-4 0c0-2.5 1.5-4.7 3.8-6.3C14.5 4.9 15 4 15 3c0-.4-.1-.8-.3-1.1C14 1.5 13 2 12 2zM6.5 11.5C5.6 13 5 14.5 5 16a7 7 0 0014 0c0-2.1-.7-4-1.9-5.6-.3.9-.8 1.7-1.4 2.4.2.5.3 1.1.3 1.7a4 4 0 01-8 0c0-1.1.3-2.1.8-3C8 12 7.3 12.2 6.5 11.5z"/>
              </svg>
            </div>
            <p className="text-sm text-ink-2 font-semibold">Inicio da conversa</p>
            <p className="text-xs text-ink-3 text-center px-8">Diga ola para {contact.displayName} e comece a conexao.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === myId;
          const prev  = messages[i - 1];
          const sameSender = prev?.senderId === msg.senderId;
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={isMe}
              grouped={sameSender}
              avatarUrl={!isMe && !sameSender ? contact.avatarUrl : undefined}
              initials={initials}
            />
          );
        })}

        {typing && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-heat-2/20 flex items-center justify-center text-xs font-bold text-heat-2 flex-shrink-0">
              {initials}
            </div>
            <div className="bg-surface-2 border border-line rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink-3 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="flex-shrink-0 flex items-center gap-2.5 px-4 py-3 border-t border-line">
        <button className="w-9 h-9 flex items-center justify-center text-ink-3 flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          </svg>
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={onType}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Mensagem..."
          className="flex-1 bg-surface-2 border border-line rounded-full px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 transition-colors"
        />

        <button
          onClick={send}
          disabled={!text.trim()}
          className="w-9 h-9 rounded-full bg-heat flex items-center justify-center disabled:opacity-30 flex-shrink-0 transition-opacity active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMe, grouped, avatarUrl, initials }: {
  msg: Message; isMe: boolean; grouped: boolean;
  avatarUrl?: string; initials?: string;
}) {
  const time = new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""} ${grouped ? "mt-0.5" : "mt-3"}`}>
      {/* avatar do outro (so na primeira de uma sequencia) */}
      {!isMe && (
        <div className="w-7 h-7 flex-shrink-0">
          {!grouped && (
            avatarUrl
              ? <img src={avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
              : <div className="w-7 h-7 rounded-full bg-heat-2/20 flex items-center justify-center text-[10px] font-bold text-heat-2">{initials}</div>
          )}
        </div>
      )}

      <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        <div className={`px-4 py-2.5 text-sm leading-relaxed ${
          isMe
            ? "bg-heat text-white rounded-2xl rounded-br-sm"
            : "bg-surface-2 border border-line text-ink rounded-2xl rounded-bl-sm"
        }`}>
          {msg.body}
        </div>
        {!grouped && (
          <span className="text-[10px] text-ink-3 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}
