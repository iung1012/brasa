import { useState } from "react";
import { FireButton } from "../components/FireButton.js";
import { VerifiedIcon, UsersIcon, MapPinIcon, SunIcon, MoonIcon, FlameIcon } from "../components/Icons.js";
import { useTheme } from "../context/ThemeContext.js";
import { useAuth } from "../context/AuthContext.js";

const POSTS = [
  "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=300&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80",
];

type Section = "posts" | "settings";

export function ProfileScreen() {
  const { theme, toggle } = useTheme();
  const { user, logout }  = useAuth();
  const [section, setSection] = useState<Section>("posts");

  const displayName = user?.displayName ?? "Marina & Leo";
  const username    = user?.username    ?? "marina_leo";
  const verified    = user?.verification === "APPROVED";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* capa */}
      <div className="relative h-40 bg-heat flex-shrink-0">
        <div className="absolute inset-0 bg-black/20" />
        <button
          onClick={() => setSection("settings")}
          className="absolute top-12 right-4 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30"
        >
          Editar perfil
        </button>
      </div>

      {/* avatar + info */}
      <div className="px-5 pb-4 flex-shrink-0">
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-[3px] bg-heat shadow-lg">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-bg" alt={displayName} />
              ) : (
                <div className="w-full h-full rounded-full border-2 border-bg bg-surface-3 flex items-center justify-center">
                  <span className="font-display text-2xl font-bold text-ink-2">
                    {displayName[0]}
                  </span>
                </div>
              )}
            </div>
            {verified && (
              <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#FFB020] rounded-full flex items-center justify-center shadow">
                <VerifiedIcon className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>
          <button className="flex items-center gap-1.5 bg-heat text-white text-sm font-semibold px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(255,46,86,0.4)] active:scale-95 transition-transform">
            Interesse
          </button>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink leading-tight">
          {displayName}
          <span className="ml-2 text-ink-3 text-base font-normal">@{username}</span>
        </h2>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-heat text-white">28 anos</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-2 border border-line flex items-center gap-1">
            <UsersIcon className="w-3 h-3" /> Casal
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-2 border border-line flex items-center gap-1">
            <MapPinIcon className="w-3 h-3" /> Sao Paulo, SP
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-2 border border-line">Swing</span>
        </div>

        <p className="mt-3 text-sm text-ink-2 leading-relaxed">
          Curtindo a vida sem julgamentos. Buscando conexoes reais e momentos inesqueciveis.
        </p>

        {/* stats */}
        <div className="flex mt-4 bg-surface-2 rounded-2xl overflow-hidden border border-line">
          {[{ label: "Posts", value: "48" }, { label: "Seguidores", value: "1.2k" }, { label: "Fogos", value: "8.4k" }].map((s, i) => (
            <div key={s.label} className={`flex-1 py-3 text-center ${i > 0 ? "border-l border-line" : ""}`}>
              <p className="font-display font-bold text-lg text-ink">{s.value}</p>
              <p className="text-[11px] text-ink-3">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* abas Posts / Configuracoes */}
      <div className="flex-shrink-0 flex border-b border-line mx-5 mb-0">
        {(["posts", "settings"] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              section === s
                ? "text-heat-1 border-b-2 border-heat-1"
                : "text-ink-3"
            }`}
          >
            {s === "posts" ? "Publicacoes" : "Configuracoes"}
          </button>
        ))}
      </div>

      {section === "posts" && (
        <div className="flex-1 px-1 pt-0.5">
          <div className="grid grid-cols-3 gap-0.5">
            {POSTS.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden">
                <img src={src} className="w-full h-full object-cover" alt="" />
                {i === 0 && (
                  <div className="absolute bottom-1.5 left-1.5">
                    <FireButton count={284} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "settings" && (
        <div className="flex-1 px-5 pt-4 space-y-2">
          {/* tema */}
          <SettingsRow
            label="Tema"
            description={theme === "dark" ? "Escuro" : "Claro"}
            icon={theme === "dark" ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
            action={
              <button
                onClick={toggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-surface-3" : "bg-heat"
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  theme === "dark" ? "left-0.5" : "left-6"
                }`} />
              </button>
            }
          />

          {/* verificacao */}
          <SettingsRow
            label="Verificacao de identidade"
            description="Envie seu documento para obter o selo"
            icon={<VerifiedIcon className="w-4 h-4" />}
            action={
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFB020]/20 text-[#FFB020]">
                Pendente
              </span>
            }
          />

          {/* notificacoes */}
          <SettingsRow
            label="Notificacoes"
            description="Alertas de proximidade e mensagens"
            icon={
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            }
            action={
              <ToggleSwitch on={true} />
            }
          />

          {/* privacidade localizacao */}
          <SettingsRow
            label="Localizacao"
            description="Aparecer no mapa para outros usuarios"
            icon={<MapPinIcon className="w-4 h-4" />}
            action={<ToggleSwitch on={true} />}
          />

          {/* sair */}
          <button
            onClick={logout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#FF3B30]/30 text-[#FF3B30] text-sm font-semibold bg-[#FF3B30]/5 active:scale-[.98] transition-transform"
          >
            Sair da conta
          </button>
        </div>
      )}

      <div className="h-4 flex-shrink-0" />
    </div>
  );
}

function SettingsRow({ label, description, icon, action }: {
  label: string; description: string;
  icon: React.ReactNode; action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-surface-2 border border-line rounded-2xl px-4 py-3.5">
      <div className="w-8 h-8 rounded-xl bg-surface-3 flex items-center justify-center text-ink-2 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-3 truncate">{description}</p>
      </div>
      {action}
    </div>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-heat" : "bg-surface-3"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "left-6" : "left-0.5"}`} />
    </div>
  );
}
