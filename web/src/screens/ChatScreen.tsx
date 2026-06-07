import { VerifiedIcon } from "../components/Icons.js";
import type { ChatContact } from "./ConversationScreen.js";

const CHATS: (ChatContact & { last: string; time: string; unread: number })[] = [
  {
    chatId: "chat-1", userId: "u2",
    displayName: "Marina & Leo", username: "marina_leo", verified: true, online: true,
    avatarUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80",
    last: "Que tal quinta a noite?", time: "agora", unread: 2,
  },
  {
    chatId: "chat-2", userId: "u3",
    displayName: "Sofia", username: "sofialiberta", verified: true, online: true,
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
    last: "Adorei seu perfil!", time: "2min", unread: 0,
  },
  {
    chatId: "chat-3", userId: "u4",
    displayName: "Bia & Carol", username: "bia_carol", verified: false, online: false,
    avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80",
    last: "Adoramos seu perfil!", time: "1h", unread: 1,
  },
];

const INTERESTS = [
  { id: "i1", displayName: "Rafa",       verified: false, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" },
  { id: "i2", displayName: "Paulo & Ana", verified: true,  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" },
];

type Props = { onOpenChat: (contact: ChatContact) => void };

export function ChatScreen({ onOpenChat }: Props) {
  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 px-5 pt-12 pb-4">
        <h1 className="font-display text-xl font-bold text-ink mb-4">Mensagens</h1>

        <p className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
          Interesses pendentes
        </p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {INTERESTS.map((it) => (
            <div key={it.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-[2px] bg-heat">
                  <img src={it.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-bg" alt={it.displayName} />
                </div>
                {it.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FFB020] rounded-full flex items-center justify-center">
                    <VerifiedIcon className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-ink-2 font-medium">{it.displayName}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 divide-y divide-line">
        {CHATS.map((c) => (
          <button
            key={c.chatId}
            onClick={() => onOpenChat(c)}
            className="w-full flex items-center gap-3 py-3.5 text-left active:bg-surface-2 transition-colors rounded-xl -mx-2 px-2"
          >
            <div className="relative flex-shrink-0">
              <img src={c.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt={c.displayName} />
              {c.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ED47A] rounded-full border-2 border-bg" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-ink truncate">{c.displayName}</span>
                {c.verified && (
                  <span className="w-4 h-4 rounded-full bg-[#FFB020] flex items-center justify-center flex-shrink-0">
                    <VerifiedIcon className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-3 truncate mt-0.5">{c.last}</p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <span className="text-[10px] text-ink-3">{c.time}</span>
              {c.unread > 0 && (
                <span className="w-5 h-5 bg-heat rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
