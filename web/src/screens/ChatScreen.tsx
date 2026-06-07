import { VerifiedIcon } from "../components/Icons.js";

const CHATS = [
  {
    id: "c1", name: "Marina & Leo", handle: "@marina_leo", verified: true,
    last: "Que tal quinta a noite?", time: "agora", unread: 2, online: true,
    avatar: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80",
  },
  {
    id: "c2", name: "Sofia", handle: "@sofialiberta", verified: true,
    last: "Adorei seu perfil!", time: "2min", unread: 0, online: true,
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  },
  {
    id: "c3", name: "Bia & Carol", handle: "@bia_carol", verified: false,
    last: "Adoramos seu perfil!", time: "1h", unread: 1, online: false,
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80",
  },
];

const INTERESTS = [
  {
    id: "i1", name: "Rafa", verified: false,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  },
  {
    id: "i2", name: "Paulo & Ana", verified: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
  },
];

export function ChatScreen() {
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
                  <img
                    src={it.avatar}
                    className="w-full h-full rounded-full object-cover border-2 border-bg"
                    alt={it.name}
                  />
                </div>
                {it.verified && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FFB020] rounded-full flex items-center justify-center">
                    <VerifiedIcon className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-ink-2 font-medium">{it.name}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 divide-y divide-line">
        {CHATS.map((c) => (
          <button
            key={c.id}
            className="w-full flex items-center gap-3 py-3.5 text-left active:bg-surface-2 transition-colors rounded-xl -mx-2 px-2"
          >
            <div className="relative flex-shrink-0">
              <img src={c.avatar} className="w-12 h-12 rounded-full object-cover" alt={c.name} />
              {c.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ED47A] rounded-full border-2 border-bg" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-ink truncate">{c.name}</span>
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
