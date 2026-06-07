import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "../components/Logo.js";
import { getFeed, toggleFire, type Post } from "../services/api.js";
import { FireButton } from "../components/FireButton.js";
import { CommentsSheet } from "../components/CommentsSheet.js";
import { PostSkeleton } from "../components/Skeleton.js";
import {
  VerifiedIcon, UsersIcon, PersonIcon, MapPinIcon,
  StarIcon, XIcon, DotsIcon, CommentIcon, BookmarkIcon,
} from "../components/Icons.js";

// ── mock posts: usado como fallback quando a API está offline ─────
const MOCK_POSTS: Post[] = [
  {
    id: "m1", description: "Noite perfeita na cidade. Curtindo cada momento.", mediaUrls: ["https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&q=80"],
    fireCount: 284, commentCount: 31, firedByMe: false, createdAt: new Date().toISOString(),
    author: { username: "marina_leo", displayName: "Marina & Leo", avatarUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80", verification: "APPROVED" },
  },
  {
    id: "m2", description: "Sol, liberdade e sem arrependimentos.", mediaUrls: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80"],
    fireCount: 512, commentCount: 47, firedByMe: false, createdAt: new Date().toISOString(),
    author: { username: "sofialiberta", displayName: "Sofia", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80", verification: "APPROVED" },
  },
  {
    id: "m3", description: "Fim de semana incrivel com nossos amigos.", mediaUrls: ["https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"],
    fireCount: 198, commentCount: 22, firedByMe: false, createdAt: new Date().toISOString(),
    author: { username: "bia_carol", displayName: "Bia & Carol", avatarUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&q=80", verification: "NONE" },
  },
];

// ── mock de perfis para a aba Descobrir ───────────────────────────
const PROFILES = [
  { id: "1", name: "Marina & Leo", age: 28, type: "Casal", typeIcon: "couple", distance: "4km", tag: "Swing", verified: true, bio: "Curtindo a vida e buscando novas conexoes.", photo: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80" },
  { id: "2", name: "Sofia",        age: 24, type: "Solteira", typeIcon: "single", distance: "2km", tag: "Exibicionismo", verified: true, bio: "Vida livre, sem julgamentos.", photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80" },
  { id: "3", name: "Bia & Carol",  age: 26, type: "Casal FF", typeIcon: "couple", distance: "7km", tag: "Casual", verified: false, bio: "Casal aberto buscando novas amizades.", photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80" },
];

type SubTab = "discover" | "feed";

export function DiscoverScreen({ onCreatePost }: { onCreatePost: () => void }) {
  const [sub, setSub]   = useState<SubTab>("discover");
  const [idx, setIdx]   = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);

  function next(dir: "left" | "right") {
    setLeaving(dir);
    setTimeout(() => { setIdx((i) => i + 1); setLeaving(null); }, 280);
  }

  const profile = PROFILES[idx % PROFILES.length];

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-3">
        <Logo variant="full" height={28} />
        <div className="flex items-center bg-surface-2 rounded-full p-1 gap-0.5">
          {(["discover", "feed"] as SubTab[]).map((t) => (
            <button key={t} onClick={() => setSub(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${sub === t ? "bg-heat text-white shadow" : "text-ink-3"}`}>
              {t === "discover" ? "Descobrir" : "Feed"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {sub === "discover"
          ? <DiscoverCard profile={profile} leaving={leaving} onPass={() => next("left")} onInterest={() => next("right")} />
          : <FeedTab onCreatePost={onCreatePost} />
        }
      </div>
    </div>
  );
}

// ── Card de descoberta ────────────────────────────────────────────

const SWIPE_THRESHOLD = 80;

type CardProps = { profile: typeof PROFILES[0]; leaving: "left"|"right"|null; onPass:()=>void; onInterest:()=>void };

function DiscoverCard({ profile, leaving, onPass, onInterest }: CardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const start = useRef({ x: 0, y: 0 });

  function onPointerDown(e: React.PointerEvent) {
    if (leaving) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.active) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y, active: true });
  }

  function onPointerUp() {
    if (!drag.active) return;
    if      (drag.x >  SWIPE_THRESHOLD) onInterest();
    else if (drag.x < -SWIPE_THRESHOLD) onPass();
    setDrag({ x: 0, y: 0, active: false });
  }

  const rotate = drag.x * 0.06;
  const likeOpacity = Math.min(Math.max(drag.x / SWIPE_THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-drag.x / SWIPE_THRESHOLD, 0), 1);

  let transform: string;
  if (drag.active) {
    transform = `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${rotate}deg)`;
  } else if (leaving === "left") {
    transform = "translate(-130%, 20px) rotate(-20deg)";
  } else if (leaving === "right") {
    transform = "translate(130%, 20px) rotate(20deg)";
  } else {
    transform = "translate(0,0) rotate(0deg)";
  }

  return (
    <div className="relative h-full flex flex-col items-center px-4 pb-4">
      <div className="absolute inset-x-8 top-6 bottom-24 rounded-[28px] bg-surface-2 scale-95 opacity-50 pointer-events-none" />

      <div
        className="relative w-full flex-1 rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing select-none"
        style={{ transform, transition: drag.active ? "none" : "transform 300ms ease-out" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img src={profile.photo} alt={profile.name} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* label INTERESSE (arrastar direita) */}
        <div
          className="absolute top-8 left-5 border-[3px] border-heat-1 rounded-xl px-3 py-1 rotate-[-15deg]"
          style={{ opacity: likeOpacity }}
        >
          <span className="font-display font-black text-heat-1 text-xl tracking-widest">INTERESSE</span>
        </div>

        {/* label PULAR (arrastar esquerda) */}
        <div
          className="absolute top-8 right-5 border-[3px] border-white/60 rounded-xl px-3 py-1 rotate-[15deg]"
          style={{ opacity: passOpacity }}
        >
          <span className="font-display font-black text-white/80 text-xl tracking-widest">PULAR</span>
        </div>

        <div className="absolute top-0 left-0 right-0 p-5 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-display text-3xl font-bold text-white leading-tight drop-shadow-lg">{profile.name}</h2>
            {profile.verified && (
              <span className="w-5 h-5 rounded-full bg-[#FFB020] flex items-center justify-center">
                <VerifiedIcon className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip accent>{profile.age}</Chip>
            <Chip><span className="flex items-center gap-1">{profile.typeIcon === "couple" ? <UsersIcon className="w-3 h-3"/> : <PersonIcon className="w-3 h-3"/>}{profile.type}</span></Chip>
            <Chip><span className="flex items-center gap-1"><MapPinIcon className="w-3 h-3"/>{profile.distance}</span></Chip>
            <Chip>{profile.tag}</Chip>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
          <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-center gap-5 pt-4">
        <ActionBtn variant="pass" onClick={onPass}><XIcon /></ActionBtn>
        <ActionBtn variant="super"><StarIcon /></ActionBtn>
        <ActionBtn variant="fire" onClick={onInterest}>
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
            <path d="M12 2C9.8 4.5 8 7.2 8 10a4 4 0 008 0c0-.7-.1-1.3-.3-1.9C14.8 9.4 14 10.6 14 12a2 2 0 01-4 0c0-2.5 1.5-4.7 3.8-6.3C14.5 4.9 15 4 15 3c0-.4-.1-.8-.3-1.1C14 1.5 13 2 12 2zM6.5 11.5C5.6 13 5 14.5 5 16a7 7 0 0014 0c0-2.1-.7-4-1.9-5.6-.3.9-.8 1.7-1.4 2.4.2.5.3 1.1.3 1.7a4 4 0 01-8 0c0-1.1.3-2.1.8-3C8 12 7.3 12.2 6.5 11.5z"/>
          </svg>
        </ActionBtn>
      </div>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${accent ? "bg-heat text-white" : "bg-white/15 text-white backdrop-blur-sm border border-white/10"}`}>
      {children}
    </span>
  );
}

type ActionVariant = "pass"|"super"|"fire";
const variantCls: Record<ActionVariant, string> = {
  pass:  "w-14 h-14 bg-surface border border-line text-ink-3",
  super: "w-14 h-14 bg-[#FFC23C]/10 border border-[#FFC23C]/40 text-[#FFC23C]",
  fire:  "w-16 h-16 bg-heat shadow-[0_8px_32px_rgba(255,46,86,0.5)] text-white",
};
function ActionBtn({ children, variant, onClick }: { children: React.ReactNode; variant: ActionVariant; onClick?: () => void }) {
  return <button onClick={onClick} className={`rounded-full flex items-center justify-center transition-transform active:scale-90 ${variantCls[variant]}`}>{children}</button>;
}

// ── Feed real com API ─────────────────────────────────────────────

function FeedTab({ onCreatePost }: { onCreatePost: () => void }) {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState("");
  const [cursor, setCursor]       = useState<string | undefined>();
  const [hasMore, setHasMore]     = useState(true);
  const [tab, setTab]             = useState<"all" | "reco">("all");
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError("");
      const data = await getFeed(tab, reset ? undefined : cursor);
      setPosts((prev) => reset ? data : [...prev, ...data]);
      if (data.length > 0) setCursor(data[data.length - 1].id);
      if (data.length < 20) setHasMore(false);
    } catch {
      // API offline: usa mock como fallback para não deixar o feed vazio
      if (reset) {
        setPosts(MOCK_POSTS);
        setError("offline");   // sinaliza banner sutil, mas mostra posts
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [tab, cursor]);

  // carrega ao montar e ao trocar aba
  useEffect(() => {
    setHasMore(true);
    setCursor(undefined);
    load(true);
  }, [tab]); // eslint-disable-line

  // infinite scroll
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) load();
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, load]);

  function handleFire(postId: string, fired: boolean, delta: number) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, firedByMe: fired, fireCount: p.fireCount + delta } : p
      )
    );
    toggleFire(postId).catch(() => {
      // reverte em caso de erro
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, firedByMe: !fired, fireCount: p.fireCount - delta } : p
        )
      );
    });
  }

  return (
    // wrapper relative: FAB será absolute aqui, não fixed na viewport
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4 pb-24 space-y-4">
        {/* filtros de aba */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {(["all","reco"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${tab === t ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"}`}>
              {t === "all" ? "Recentes" : "Recomendados"}
            </button>
          ))}
          {["Casais","Solteiros","Casas"].map((f) => (
            <button key={f} className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold bg-surface-2 text-ink-2 border border-line">{f}</button>
          ))}
        </div>

        {/* skeletons */}
        {loading && [1,2,3].map((i) => <PostSkeleton key={i} />)}

        {/* banner offline — aparece acima dos posts, não bloqueia o feed */}
        {!loading && error === "offline" && (
          <div className="flex items-center justify-between bg-surface-2 border border-line rounded-2xl px-4 py-3">
            <p className="text-xs text-ink-3">Sem conexao com o servidor. Exibindo demonstracao.</p>
            <button onClick={() => load(true)} className="text-xs text-heat-1 font-semibold ml-3 flex-shrink-0">
              Tentar novamente
            </button>
          </div>
        )}

        {/* posts */}
        {posts.map((p) => (
          <FeedCard
            key={p.id}
            post={p}
            onFire={(fired, delta) => handleFire(p.id, fired, delta)}
            onComment={() => setCommentPostId(p.id)}
          />
        ))}

        {/* carregando mais */}
        {loadingMore && <PostSkeleton />}

        {/* sentinel infinite scroll */}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* FAB criar post — absolute no container, não fixed na viewport */}
      <button
        onClick={onCreatePost}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-heat shadow-[0_8px_32px_rgba(255,46,86,0.5)] flex items-center justify-center z-30 active:scale-95 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {commentPostId && (
        <CommentsSheet postId={commentPostId} onClose={() => setCommentPostId(null)} />
      )}
    </div>
  );
}

type FeedCardProps = { post: Post; onFire: (fired: boolean, delta: number) => void; onComment: () => void };

function FeedCard({ post, onFire, onComment }: FeedCardProps) {
  const initials = post.author.displayName?.[0]?.toUpperCase() ?? "?";
  const verified = post.author.verification === "APPROVED";

  return (
    <article className="bg-surface rounded-[20px] overflow-hidden border border-line">
      <div className="flex items-center gap-3 p-3">
        <div className="relative">
          {post.author.avatarUrl
            ? <img src={post.author.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={post.author.displayName} />
            : <div className="w-10 h-10 rounded-full bg-heat-2/20 flex items-center justify-center text-sm font-bold text-heat-2">{initials}</div>
          }
          <div className="absolute inset-0 rounded-full ring-2 ring-heat-1/40" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-ink truncate">{post.author.displayName}</span>
            {verified && (
              <span className="w-4 h-4 rounded-full bg-[#FFB020] flex items-center justify-center flex-shrink-0">
                <VerifiedIcon className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
          <span className="text-xs text-ink-3">@{post.author.username} · {new Date(post.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
        <button className="text-ink-3 px-1"><DotsIcon /></button>
      </div>

      {post.mediaUrls[0] && (
        <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
          <img src={post.mediaUrls[0]} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {post.mediaUrls.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              1/{post.mediaUrls.length}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 px-4 pt-3 pb-1">
        <button
          className="flex items-center gap-1.5"
          onClick={() => {
            const fired = !post.firedByMe;
            onFire(fired, fired ? 1 : -1);
          }}
        >
          <svg viewBox="0 0 24 24" className={`w-5 h-5 transition-colors ${post.firedByMe ? "text-heat-1" : "text-ink-3"}`} fill={post.firedByMe ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M12 2C9.8 4.5 8 7.2 8 10a4 4 0 008 0c0-.7-.1-1.3-.3-1.9C14.8 9.4 14 10.6 14 12a2 2 0 01-4 0c0-2.5 1.5-4.7 3.8-6.3C14.5 4.9 15 4 15 3c0-.4-.1-.8-.3-1.1C14 1.5 13 2 12 2zM6.5 11.5C5.6 13 5 14.5 5 16a7 7 0 0014 0c0-2.1-.7-4-1.9-5.6-.3.9-.8 1.7-1.4 2.4.2.5.3 1.1.3 1.7a4 4 0 01-8 0c0-1.1.3-2.1.8-3C8 12 7.3 12.2 6.5 11.5z"/>
          </svg>
          <span className={`text-sm font-semibold ${post.firedByMe ? "text-heat-1" : "text-ink-3"}`}>{post.fireCount}</span>
        </button>

        <button onClick={onComment} className="flex items-center gap-1.5 text-ink-3">
          <CommentIcon />
          <span className="text-sm font-semibold">{post.commentCount}</span>
        </button>
        <button className="ml-auto text-ink-3"><BookmarkIcon /></button>
      </div>

      {post.description && (
        <p className="px-4 pb-4 text-sm text-ink leading-relaxed">
          <span className="font-semibold">@{post.author.username} </span>
          {post.description}
        </p>
      )}
    </article>
  );
}
