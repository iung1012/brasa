import { useEffect, useState } from "react";
import { VerifiedIcon } from "../components/Icons.js";
import { Logo } from "../components/Logo.js";

type AdminTab = "dashboard" | "verifications" | "users" | "reports" | "banners";

const API = (path: string) => fetch(`/api${path}`, {
  headers: { Authorization: `Bearer ${localStorage.getItem("brasa_token")}` },
}).then((r) => r.json());

const ACTION = (path: string, body?: unknown) => fetch(`/api${path}`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("brasa_token")}` },
  body: body ? JSON.stringify(body) : undefined,
}).then((r) => r.json());

type Props = { onClose: () => void };

export function AdminScreen({ onClose }: Props) {
  const [tab, setTab] = useState<AdminTab>("dashboard");

  const TABS: { id: AdminTab; label: string }[] = [
    { id: "dashboard",     label: "Dashboard"     },
    { id: "verifications", label: "Verificacoes"  },
    { id: "users",         label: "Usuarios"      },
    { id: "reports",       label: "Denuncias"     },
    { id: "banners",       label: "Banners"       },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg max-w-[430px] mx-auto">
      {/* header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Logo variant="icon" height={24} className="rounded-md" />
          <span className="font-display font-bold text-base text-ink">Admin</span>
        </div>
        <button onClick={onClose} className="text-sm font-semibold text-ink-3">Fechar</button>
      </header>

      {/* tabs */}
      <div className="flex-shrink-0 flex overflow-x-auto no-scrollbar border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors ${
              tab === t.id ? "text-heat-1 border-b-2 border-heat-1" : "text-ink-3"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "dashboard"     && <DashboardTab />}
        {tab === "verifications" && <VerificationsTab />}
        {tab === "users"         && <UsersTab />}
        {tab === "reports"       && <ReportsTab />}
        {tab === "banners"       && <BannersTab />}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────

const MOCK_STATS = { users: 1247, posts: 3891, pendingVerifs: 14, pendingReports: 7, newUsersToday: 23 };

function DashboardTab() {
  const [stats, setStats] = useState(MOCK_STATS);
  useEffect(() => { API("/admin/stats").then(setStats).catch(() => {}); }, []);

  const cards = [
    { label: "Usuarios ativos",   value: stats.users.toLocaleString("pt-BR"),          color: "text-heat-1"      },
    { label: "Publicacoes",       value: stats.posts.toLocaleString("pt-BR"),           color: "text-[#9B5CFF]"   },
    { label: "Verif. pendentes",  value: stats.pendingVerifs.toString(),                color: "text-[#FFB020]"   },
    { label: "Denuncias abertas", value: stats.pendingReports.toString(),               color: "text-[#FF3B30]"   },
    { label: "Novos hoje",        value: `+${stats.newUsersToday}`,                     color: "text-[#2ED47A]"   },
  ];

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-display text-lg font-bold text-ink">Visao geral</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface-2 border border-line rounded-2xl p-4">
            <p className={`font-display text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-ink-3 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Verificações ──────────────────────────────────────────────────

function VerificationsTab() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    API("/admin/verifications?status=PENDING")
      .then(setItems)
      .catch(() => setItems(MOCK_VERIFS))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function approve(id: string) {
    await ACTION(`/admin/verifications/${id}/approve`);
    setItems((p) => p.filter((v) => v.id !== id));
  }
  async function reject(id: string) {
    const reason = window.prompt("Motivo da rejeição:");
    if (!reason) return;
    await ACTION(`/admin/verifications/${id}/reject`, { reason });
    setItems((p) => p.filter((v) => v.id !== id));
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-display text-lg font-bold text-ink">Verificacoes pendentes ({items.length})</h2>
      {loading && <p className="text-sm text-ink-3">Carregando...</p>}
      {!loading && items.length === 0 && <p className="text-sm text-ink-3">Nenhuma pendente.</p>}
      {items.map((v) => (
        <div key={v.id} className="bg-surface-2 border border-line rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-3 border-b border-line">
            {v.user?.avatarUrl
              ? <img src={v.user.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
              : <div className="w-10 h-10 rounded-full bg-heat/20 flex items-center justify-center font-bold text-heat-1">{v.user?.displayName?.[0]}</div>
            }
            <div>
              <p className="font-semibold text-sm text-ink">{v.user?.displayName}</p>
              <p className="text-xs text-ink-3">@{v.user?.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 p-2">
            {[v.docFrontUrl, v.docBackUrl, v.selfieUrl].map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden bg-surface-3 block">
                <img src={url} className="w-full h-full object-cover" alt="" />
              </a>
            ))}
          </div>
          <div className="flex gap-2 p-3 pt-1">
            <button onClick={() => approve(v.id)} className="flex-1 bg-[#2ED47A] text-white text-sm font-bold py-2.5 rounded-xl active:scale-[.98]">
              Aprovar
            </button>
            <button onClick={() => reject(v.id)} className="flex-1 bg-[#FF3B30]/10 text-[#FF3B30] text-sm font-bold py-2.5 rounded-xl border border-[#FF3B30]/20 active:scale-[.98]">
              Rejeitar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Usuários ──────────────────────────────────────────────────────

function UsersTab() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    API(`/admin/users?q=${encodeURIComponent(query)}`)
      .then(setUsers)
      .catch(() => setUsers(MOCK_USERS_ADMIN))
      .finally(() => setLoading(false));
  }

  useEffect(() => { search(); }, []); // eslint-disable-line

  async function ban(id: string) {
    const reason = window.prompt("Motivo do banimento:");
    if (!reason) return;
    await ACTION(`/admin/users/${id}/ban`, { reason });
    setUsers((p) => p.map((u) => u.id === id ? { ...u, bannedAt: new Date().toISOString() } : u));
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Buscar @, nome ou email..." className="flex-1 bg-surface-2 border border-line rounded-full px-4 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1" />
        <button onClick={search} className="bg-heat text-white text-sm font-bold px-4 rounded-full">Buscar</button>
      </div>
      {loading && <p className="text-sm text-ink-3">Buscando...</p>}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-surface-2 border border-line rounded-2xl p-3 flex items-center gap-3">
            {u.avatarUrl
              ? <img src={u.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
              : <div className="w-10 h-10 rounded-full bg-heat/20 flex items-center justify-center font-bold text-heat-1 flex-shrink-0">{u.displayName?.[0]}</div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm text-ink truncate">{u.displayName}</p>
                {u.verification === "APPROVED" && <VerifiedIcon className="w-3 h-3 text-[#FFB020] flex-shrink-0" />}
                {u.bannedAt && <span className="text-[10px] bg-[#FF3B30]/20 text-[#FF3B30] px-1.5 py-0.5 rounded-full">Banido</span>}
              </div>
              <p className="text-xs text-ink-3">@{u.username} · {u.role} · {u._count?.posts ?? 0} posts</p>
            </div>
            {!u.bannedAt && (
              <button onClick={() => ban(u.id)} className="text-xs text-[#FF3B30] border border-[#FF3B30]/30 px-2.5 py-1 rounded-full flex-shrink-0">Banir</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Denúncias ─────────────────────────────────────────────────────

function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API("/admin/reports?status=OPEN")
      .then(setReports)
      .catch(() => setReports(MOCK_REPORTS))
      .finally(() => setLoading(false));
  }, []);

  async function resolve(id: string, action: string) {
    await ACTION(`/admin/reports/${id}/resolve`, { action });
    setReports((p) => p.filter((r) => r.id !== id));
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-display text-lg font-bold text-ink">Denuncias abertas ({reports.length})</h2>
      {loading && <p className="text-sm text-ink-3">Carregando...</p>}
      {!loading && reports.length === 0 && <p className="text-sm text-ink-3">Nenhuma denuncia aberta.</p>}
      {reports.map((r) => (
        <div key={r.id} className="bg-surface-2 border border-line rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-heat-1">{r.targetType}</span>
            <span className="text-xs text-ink-3">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
          <p className="text-sm text-ink">{r.category}</p>
          {r.body && <p className="text-xs text-ink-3 leading-relaxed">{r.body}</p>}
          <p className="text-xs text-ink-3">por @{r.reporter?.username}</p>
          <div className="flex gap-2 flex-wrap">
            {["IGNORE", "WARN", "REMOVE_CONTENT", "BAN_USER"].map((action) => (
              <button key={action} onClick={() => resolve(r.id, action)}
                className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-line bg-surface-3 text-ink-2 active:bg-heat active:text-white active:border-heat-1 transition-colors">
                {action.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Banners ───────────────────────────────────────────────────────

function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API("/admin/banners").then(setBanners).catch(() => setBanners([])).finally(() => setLoading(false));
  }, []);

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("brasa_token")}` },
      body: JSON.stringify({ active }),
    });
    setBanners((p) => p.map((b) => b.id === id ? { ...b, active } : b));
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-display text-lg font-bold text-ink">Banners ({banners.length})</h2>
      {loading && <p className="text-sm text-ink-3">Carregando...</p>}
      {!loading && banners.length === 0 && <p className="text-sm text-ink-3 py-8 text-center">Nenhum banner cadastrado.</p>}
      {banners.map((b) => (
        <div key={b.id} className="bg-surface-2 border border-line rounded-2xl overflow-hidden">
          <img src={b.imageUrl} className="w-full h-24 object-cover" alt="" />
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-xs font-semibold text-ink">{b.position}</p>
              <p className="text-[10px] text-ink-3">{b.audienceFilter ?? "Todos"}</p>
            </div>
            <button
              onClick={() => toggle(b.id, !b.active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${b.active ? "bg-heat" : "bg-surface-3"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${b.active ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────

const MOCK_VERIFS = [
  { id: "v1", docFrontUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=200&q=60", docBackUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&q=60", selfieUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=60", user: { id:"u2", username:"sofialiberta", displayName:"Sofia", avatarUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80" } },
];

const MOCK_USERS_ADMIN = [
  { id:"u1", username:"marina_leo", displayName:"Marina & Leo", role:"USER", verification:"APPROVED", bannedAt:null, avatarUrl:"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80", _count:{posts:48} },
  { id:"u2", username:"sofialiberta", displayName:"Sofia", role:"USER", verification:"NONE", bannedAt:null, avatarUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80", _count:{posts:32} },
  { id:"u3", username:"admin", displayName:"Admin Brasa", role:"ADMIN", verification:"APPROVED", bannedAt:null, avatarUrl:null, _count:{posts:0} },
];

const MOCK_REPORTS = [
  { id:"r1", targetType:"POST", category:"Spam", body:"Perfil enviando links suspeitos.", createdAt: new Date().toISOString(), reporter: { username:"marina_leo" } },
  { id:"r2", targetType:"USER", category:"Perfil falso", body:"Fotos roubadas de outra pessoa.", createdAt: new Date().toISOString(), reporter: { username:"sofialiberta" } },
];
