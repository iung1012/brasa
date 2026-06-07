import { FireButton } from "../components/FireButton.js";
import { VerifiedIcon, UsersIcon, MapPinIcon } from "../components/Icons.js";

const POSTS = [
  "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=300&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=300&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=80",
];

export function ProfileScreen() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="relative h-40 bg-heat flex-shrink-0">
        <div className="absolute inset-0 bg-black/20" />
        <button className="absolute top-12 right-4 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
          Editar perfil
        </button>
      </div>

      <div className="px-5 pb-4 flex-shrink-0">
        <div className="flex items-end justify-between -mt-8 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full p-[3px] bg-heat shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=160&q=80"
                className="w-full h-full rounded-full object-cover border-2 border-bg"
                alt="Meu perfil"
              />
            </div>
            <span
              className="absolute bottom-0 right-0 w-6 h-6 bg-[#FFB020] rounded-full flex items-center justify-center shadow"
              title="Identidade verificada"
            >
              <VerifiedIcon className="w-3.5 h-3.5 text-white" />
            </span>
          </div>

          <button className="flex items-center gap-1.5 bg-heat text-white text-sm font-semibold px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(255,46,86,0.4)] active:scale-95 transition-transform">
            Interesse
          </button>
        </div>

        <h2 className="font-display text-2xl font-bold text-ink leading-tight">
          Marina & Leo
          <span className="ml-2 text-ink-3 text-base font-normal">@marina_leo</span>
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
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-2 text-ink-2 border border-line">4km</span>
        </div>

        <p className="mt-3 text-sm text-ink-2 leading-relaxed">
          Curtindo a vida sem julgamentos. Buscando conexoes reais e momentos inesqueciveis.
        </p>

        <div className="flex gap-0 mt-4 bg-surface-2 rounded-2xl overflow-hidden border border-line">
          {[
            { label: "Posts", value: "48" },
            { label: "Seguidores", value: "1.2k" },
            { label: "Fogos", value: "8.4k" },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 py-3 text-center ${i > 0 ? "border-l border-line" : ""}`}>
              <p className="font-display font-bold text-lg text-ink">{s.value}</p>
              <p className="text-[11px] text-ink-3">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-1">
        <div className="grid grid-cols-3 gap-0.5">
          {POSTS.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden">
              <img src={src} className="w-full h-full object-cover" alt="" />
              {i === 0 && (
                <div className="absolute bottom-1.5 left-1.5">
                  <FireButton count={284} active={false} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="h-4 flex-shrink-0" />
    </div>
  );
}
