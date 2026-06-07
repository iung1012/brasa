import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { VerifiedIcon, SearchIcon } from "../components/Icons.js";
import { Logo } from "../components/Logo.js";

// usuários mock para demonstração (serão substituídos por dados reais da API)
const MOCK_USERS = [
  { id:"u1", name:"Marina & Leo",  lat:-23.561, lng:-46.655, verified:true,  avatar:"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80" },
  { id:"u2", name:"Sofia",         lat:-23.548, lng:-46.634, verified:true,  avatar:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80" },
  { id:"u3", name:"Bia & Carol",   lat:-23.572, lng:-46.642, verified:false, avatar:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80" },
  { id:"u4", name:"Rafa",          lat:-23.555, lng:-46.668, verified:false, avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" },
  { id:"u5", name:"Paulo & Ana",   lat:-23.538, lng:-46.649, verified:true,  avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" },
];

const VENUES = [
  { id:"v1", tag:"TOP 1", name:"Club Velvet", date:"Sab 21h", slots:"32/80", photo:"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80" },
  { id:"v2", tag:"TOP 2", name:"Eden Swing",  date:"Dom 20h", slots:"18/60", photo:"https://images.unsplash.com/photo-1574791050501-a43228ef8455?w=400&q=80" },
];

const FILTERS = ["Todos", "Casas de Swing", "Solteiros", "Casais", "< 5km"];

// ── estilo do mapa — anti-Google, tema escuro/quente ──────────────
const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "bg",
      type: "background",
      paint: { "background-color": "#0f0c14" },
    },
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      paint: {
        "raster-opacity": 0.18,
        "raster-saturation": -1,
        "raster-brightness-min": 0,
        "raster-brightness-max": 0.15,
        "raster-hue-rotate": 200,
      },
    },
  ],
};

const LIGHT_STYLE: maplibregl.StyleSpecification = {
  ...DARK_STYLE,
  layers: [
    {
      id: "bg",
      type: "background",
      paint: { "background-color": "#f3ecea" },
    },
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      paint: {
        "raster-opacity": 0.5,
        "raster-saturation": -0.8,
        "raster-brightness-min": 0.6,
        "raster-brightness-max": 1,
        "raster-hue-rotate": 350,
      },
    },
  ],
};

export function MapScreen() {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [filter, setFilter]     = useState("Todos");
  const [selected, setSelected] = useState<string | null>(null);
  const [userPos, setUserPos]   = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const isDark = document.documentElement.classList.contains("dark");

  // ── inicializa o mapa ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: isDark ? DARK_STYLE : LIGHT_STYLE,
      center: [-46.650, -23.555], // São Paulo
      zoom: 13,
      attributionControl: false,
      pitchWithRotate: false,
    });

    mapObj.current = map;

    map.on("load", () => {
      addUserPins(map);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapObj.current = null;
    };
  }, []); // eslint-disable-line

  function addUserPins(map: maplibregl.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    MOCK_USERS.forEach((user) => {
      // cria elemento do pin
      const el = document.createElement("div");
      el.className = "relative cursor-pointer group";
      el.style.cssText = "width:48px;height:48px;";

      el.innerHTML = `
        <div style="
          position:absolute;inset:-3px;border-radius:50%;
          background:${user.verified ? "linear-gradient(135deg,#FF1E56,#FFB020)" : "#2c2330"};
          opacity:0.85;
        "></div>
        <img src="${user.avatar}" alt="${user.name}"
          style="position:absolute;inset:3px;border-radius:50%;object-fit:cover;border:2px solid #0f0c14;"
          onerror="this.style.display='none'"
        />
        ${user.verified ? `<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;background:#FFB020;border-radius:50%;border:2px solid #0f0c14;display:flex;align-items:center;justify-content:center;font-size:7px;">✓</div>` : ""}
      `;

      el.addEventListener("click", () => {
        setSelected((prev) => prev === user.id ? null : user.id);
        map.easeTo({ center: [user.lng, user.lat], zoom: Math.max(map.getZoom(), 14) });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([user.lng, user.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserPos(coords);
        mapObj.current?.easeTo({ center: coords, zoom: 15 });

        // pin do usuário atual
        const el = document.createElement("div");
        el.style.cssText = "width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#FF1E56,#FFB020);border:3px solid white;box-shadow:0 0 12px rgba(255,46,86,.6);";
        new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(coords)
          .addTo(mapObj.current!);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  const selectedUser = MOCK_USERS.find((u) => u.id === selected);

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <header className="flex-shrink-0 px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Logo variant="full" height={28} />
            <span className="text-ink-3 font-normal text-base">Mapa</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={locateMe}
              disabled={locating}
              className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-2 disabled:opacity-50"
              title="Minha localização"
            >
              {locating
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
              }
            </button>
            <button className="w-9 h-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-2">
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* filtros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"}`}>
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* mapa MapLibre */}
      <div className="flex-1 relative mx-4 rounded-[24px] overflow-hidden border border-line">
        <div ref={mapRef} className="w-full h-full" />

        {/* badge de contagem */}
        <div className="absolute top-3 right-3 bg-heat text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none">
          {MOCK_USERS.length} proximos
        </div>

        {/* popup do usuário selecionado */}
        {selectedUser && (
          <div className="absolute bottom-4 left-4 right-4 bg-surface/95 backdrop-blur border border-line rounded-2xl p-3 flex items-center gap-3 shadow-xl">
            <img src={selectedUser.avatar} className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt="" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-ink truncate">{selectedUser.name}</p>
                {selectedUser.verified && <VerifiedIcon className="w-3.5 h-3.5 text-[#FFB020] flex-shrink-0" />}
              </div>
              <p className="text-xs text-ink-3">Clique para ver perfil</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-ink-3 text-lg leading-none flex-shrink-0"
            >×</button>
          </div>
        )}
      </div>

      {/* cards de eventos */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <p className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-2">Eventos proximos</p>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {VENUES.map((v) => <VenueCard key={v.id} venue={v} />)}
        </div>
      </div>
    </div>
  );
}

function VenueCard({ venue }: { venue: typeof VENUES[0] }) {
  return (
    <div className="flex-shrink-0 w-48 rounded-[18px] overflow-hidden bg-surface border border-line">
      <div className="relative h-24">
        <img src={venue.photo} className="w-full h-full object-cover" alt={venue.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <span className="absolute top-2 left-2 bg-heat text-white text-[10px] font-black px-2 py-0.5 rounded-full">{venue.tag}</span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-ink">{venue.name}</p>
        <p className="text-xs text-ink-3 mt-0.5">{venue.date}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-ink-2">👥 {venue.slots}</span>
          <button className="bg-ink text-bg text-xs font-bold px-3 py-1 rounded-full">Entrar</button>
        </div>
      </div>
    </div>
  );
}
