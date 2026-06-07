import type { Tab } from "../App.js";

const items: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: "discover",
    label: "Início",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? "url(#grad)" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1E56" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>
        </defs>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" fill={a ? "url(#grad)" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: "map",
    label: "Mapa",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? "url(#grad2)" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1E56" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>
        </defs>
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
        <circle cx="12" cy="10" r="3" fill={a ? "white" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? "url(#grad3)" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1E56" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>
        </defs>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Perfil",
    icon: (a) => (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill={a ? "url(#grad4)" : "none"} stroke={a ? "none" : "currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1E56" />
            <stop offset="100%" stopColor="#FFB020" />
          </linearGradient>
        </defs>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

type Props = { active: Tab; onChange: (t: Tab) => void };

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="flex-shrink-0 flex items-center justify-around px-2 py-3 bg-surface/80 backdrop-blur-xl border-t border-line safe-bottom">
      {items.map((item) => {
        const on = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-1 px-4 py-1"
          >
            {item.icon(on)}
            <span className={`text-[10px] font-semibold tracking-wide ${on ? "text-heat-1" : "text-ink-3"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
