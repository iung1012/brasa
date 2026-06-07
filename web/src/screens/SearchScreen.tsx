import { useEffect, useRef, useState } from "react";
import { searchUsers, type UserProfile } from "../services/api.js";
import { VerifiedIcon, SearchIcon, UsersIcon, PersonIcon } from "../components/Icons.js";

const TYPES = [
  { value: "",          label: "Todos"     },
  { value: "COUPLE_MF", label: "Casal H+M" },
  { value: "COUPLE_MM", label: "Casal H+H" },
  { value: "COUPLE_FF", label: "Casal F+F" },
  { value: "SINGLE_M",  label: "Solteiro"  },
  { value: "SINGLE_F",  label: "Solteira"  },
];

const DISTANCES = [
  { value: 0,  label: "Qualquer" },
  { value: 5,  label: "< 5km"    },
  { value: 10, label: "< 10km"   },
  { value: 25, label: "< 25km"   },
  { value: 50, label: "< 50km"   },
];

// Mock local para quando a API não está disponível
const MOCK_USERS: UserProfile[] = [
  { id:"u1", username:"marina_leo", displayName:"Marina & Leo", bio:"Curtindo a vida.", avatarUrl:"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80", coverUrl:null, profileType:"COUPLE_MF", city:"São Paulo", interests:["Swing"], verification:"APPROVED", locationVisibility:"NEIGHBORHOOD", createdAt: new Date().toISOString(), _count:{posts:48,followers:120} },
  { id:"u2", username:"sofialiberta", displayName:"Sofia", bio:"Vida livre.", avatarUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80", coverUrl:null, profileType:"SINGLE_F", city:"Rio de Janeiro", interests:["Casual"], verification:"APPROVED", locationVisibility:"NEIGHBORHOOD", createdAt: new Date().toISOString(), _count:{posts:32,followers:88} },
  { id:"u3", username:"bia_carol", displayName:"Bia & Carol", bio:"Casal aberto.", avatarUrl:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80", coverUrl:null, profileType:"COUPLE_FF", city:"Belo Horizonte", interests:["Swing","Festa"], verification:"NONE", locationVisibility:"CITY", createdAt: new Date().toISOString(), _count:{posts:15,followers:45} },
  { id:"u4", username:"rafasilva", displayName:"Rafa", bio:null, avatarUrl:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80", coverUrl:null, profileType:"SINGLE_M", city:"São Paulo", interests:["Casual"], verification:"NONE", locationVisibility:"CITY", createdAt: new Date().toISOString(), _count:{posts:7,followers:22} },
];

type Props = { onClose: () => void };

export function SearchScreen({ onClose }: Props) {
  const [query, setQuery]       = useState("");
  const [type, setType]         = useState("");
  const [maxKm, setMaxKm]       = useState(0);
  const [users, setUsers]       = useState<UserProfile[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() && !type && !maxKm) {
      setUsers([]); setSearched(false); return;
    }
    debounceRef.current = setTimeout(() => { doSearch(); }, 350);
  }, [query, type, maxKm]); // eslint-disable-line

  async function doSearch() {
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchUsers({ q: query || undefined, type: type || undefined, maxKm: maxKm || undefined });
      setUsers(results);
    } catch {
      // fallback mock
      const q = query.toLowerCase();
      setUsers(
        MOCK_USERS.filter((u) =>
          (!q || u.username.includes(q) || u.displayName.toLowerCase().includes(q)) &&
          (!type || u.profileType === type)
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg max-w-[430px] mx-auto">
      {/* header com input */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 pt-12 pb-3 border-b border-line">
        <div className="flex-1 flex items-center gap-2 bg-surface-2 border border-line rounded-full px-4 py-2.5">
          <SearchIcon className="w-4 h-4 text-ink-3 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por @ ou nome..."
            autoCapitalize="none"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-ink-3 text-lg leading-none">×</button>
          )}
        </div>
        <button onClick={onClose} className="text-sm font-semibold text-ink-3 flex-shrink-0">
          Fechar
        </button>
      </header>

      {/* filtros */}
      <div className="flex-shrink-0 px-4 py-3 space-y-2 border-b border-line">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${type === t.value ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {DISTANCES.map((d) => (
            <button
              key={d.value}
              onClick={() => setMaxKm(d.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${maxKm === d.value ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* resultados */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16 text-center">
            <SearchIcon className="w-12 h-12 text-ink-3" />
            <p className="text-sm font-semibold text-ink-2">Encontre perfis</p>
            <p className="text-xs text-ink-3">Pesquise por @, nome ou filtre por tipo e distancia</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3 pt-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-surface-3 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-surface-3 rounded-full" />
                  <div className="h-2.5 w-48 bg-surface-3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searched && users.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm font-semibold text-ink-2">Nenhum resultado</p>
            <p className="text-xs text-ink-3">Tente outros termos ou filtros</p>
          </div>
        )}

        <div className="space-y-3">
          {users.map((u) => <UserRow key={u.id} user={u} />)}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: UserProfile }) {
  const initials = user.displayName[0]?.toUpperCase() ?? "?";
  const verified  = user.verification === "APPROVED";
  const isCouples = user.profileType.startsWith("COUPLE");

  return (
    <button className="w-full flex items-center gap-3 py-2 text-left active:bg-surface-2 rounded-2xl px-2 transition-colors">
      <div className="relative flex-shrink-0">
        {user.avatarUrl
          ? <img src={user.avatarUrl} className="w-14 h-14 rounded-full object-cover" alt={user.displayName} />
          : <div className="w-14 h-14 rounded-full bg-heat/20 flex items-center justify-center font-bold text-heat-1 text-lg">{initials}</div>
        }
        {verified && (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#FFB020] rounded-full flex items-center justify-center border-2 border-bg">
            <VerifiedIcon className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-ink truncate">{user.displayName}</span>
        </div>
        <p className="text-xs text-ink-3">@{user.username}{user.city ? ` · ${user.city}` : ""}</p>
        {user.bio && <p className="text-xs text-ink-2 truncate mt-0.5">{user.bio}</p>}
        {user.interests.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {user.interests.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-surface-2 border border-line text-ink-3 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1 text-ink-3">
        {isCouples ? <UsersIcon className="w-4 h-4" /> : <PersonIcon className="w-4 h-4" />}
        <span className="text-[10px]">{user._count.posts} posts</span>
      </div>
    </button>
  );
}
