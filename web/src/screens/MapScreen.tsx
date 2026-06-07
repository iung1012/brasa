import { useState } from "react";
import { VerifiedIcon, UsersIcon, SearchIcon } from "../components/Icons.js";

const PINS = [
  { id: "1", name: "Marina", verified: true,  top: "22%", left: "58%",
    avatar: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80" },
  { id: "2", name: "Sofia",  verified: true,  top: "38%", left: "28%",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80" },
  { id: "3", name: "Bia",    verified: false, top: "55%", left: "65%",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80" },
  { id: "4", name: "Rafa",   verified: false, top: "30%", left: "72%",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" },
  { id: "5", name: "Casal",  verified: true,  top: "48%", left: "42%",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" },
];

const VENUES = [
  { id: "v1", tag: "TOP 1", name: "Club Velvet", date: "Sab 21h", slots: "32/80",
    photo: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" },
  { id: "v2", tag: "TOP 2", name: "Eden Swing",  date: "Dom 20h", slots: "18/60",
    photo: "https://images.unsplash.com/photo-1574791050501-a43228ef8455?w=400&q=80" },
];

const FILTERS = ["Todos", "Casas de Swing", "Solteiros", "Casais", "< 5km"];

export function MapScreen() {
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-ink">
            Bra<span className="bg-heat bg-clip-text text-transparent">sa</span>
            <span className="text-ink-3 font-normal text-base ml-2">Mapa</span>
          </h1>
          <button className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-2">
            <SearchIcon />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden mx-4 rounded-[24px] border border-line">
        <MapBackground />

        {PINS.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelected(selected === pin.id ? null : pin.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-90"
            style={{ top: pin.top, left: pin.left }}
          >
            <div className={`relative ${selected === pin.id ? "scale-110" : ""} transition-transform`}>
              <div className={`absolute -inset-1 rounded-full ${pin.verified ? "bg-heat opacity-80" : "bg-surface-3 opacity-60"}`} />
              <img src={pin.avatar} alt={pin.name} className="relative w-11 h-11 rounded-full object-cover border-2 border-bg" />
              {pin.verified && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FFB020] rounded-full flex items-center justify-center">
                  <VerifiedIcon className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            {selected === pin.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-line rounded-xl px-3 py-1.5 whitespace-nowrap shadow-lg">
                <p className="text-xs font-semibold text-ink">{pin.name}</p>
              </div>
            )}
          </button>
        ))}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-heat-1/30 bg-heat-1/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-heat shadow-[0_0_12px_rgba(255,46,86,0.8)]" />

        <div className="absolute top-3 right-3 bg-heat text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
          {PINS.length} proximos
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-2">Eventos proximos</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {VENUES.map((v) => <VenueCard key={v.id} venue={v} />)}
        </div>
      </div>
    </div>
  );
}

function MapBackground() {
  return (
    <div className="absolute inset-0 bg-[#0f0c14] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 340" preserveAspectRatio="xMidYMid slice">
        {[40, 100, 160, 210, 270, 310].map((y) => (
          <rect key={y} x={0} y={y} width={400} height={6} rx={3} fill="#1e1728" />
        ))}
        {[50, 120, 180, 240, 310, 360].map((x) => (
          <rect key={x} x={x} y={0} width={5} height={340} rx={2.5} fill="#1e1728" />
        ))}
        {[
          [55,46,60,48],[130,46,44,48],[185,46,50,48],
          [55,106,60,48],[130,106,44,48],[185,106,50,48],
          [55,166,60,38],[130,166,44,38],[185,166,50,38],
          [55,216,60,48],[130,216,44,48],[185,216,50,48],
          [55,276,60,28],[130,276,44,28],[185,276,50,28],
          [245,46,60,48],[315,46,40,48],
          [245,106,60,48],[315,106,40,48],
          [245,166,60,38],[315,166,40,38],
          [245,216,60,48],[315,216,40,48],
        ].map(([x,y,w,h],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx={4} fill="#16111e" />
        ))}
        <ellipse cx={200} cy={170} rx={80} ry={60} fill="url(#heatmap)" />
        <defs>
          <radialGradient id="heatmap" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FF1E56" stopOpacity="0.18" />
            <stop offset="60%"  stopColor="#FF5E3A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFB020" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function VenueCard({ venue }: { venue: typeof VENUES[0] }) {
  return (
    <div className="flex-shrink-0 w-48 rounded-[18px] overflow-hidden bg-surface border border-line">
      <div className="relative h-24">
        <img src={venue.photo} className="w-full h-full object-cover" alt={venue.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute top-2 left-2 bg-heat text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">
          {venue.tag}
        </span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-ink leading-tight">{venue.name}</p>
        <p className="text-xs text-ink-3 mt-0.5">{venue.date}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1 text-xs text-ink-2">
            <UsersIcon className="w-3 h-3" />
            {venue.slots}
          </span>
          <button className="bg-ink text-bg text-xs font-bold px-3 py-1 rounded-full">
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
