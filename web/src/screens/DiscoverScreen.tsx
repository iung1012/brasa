import { useState } from "react";
import { FireButton } from "../components/FireButton.js";
import {
  VerifiedIcon, UsersIcon, PersonIcon, MapPinIcon,
  StarIcon, XIcon, DotsIcon, CommentIcon, BookmarkIcon,
} from "../components/Icons.js";

const PROFILES = [
  {
    id: "1",
    name: "Marina & Léo",
    age: 28,
    type: "Casal",
    typeIcon: "couple",
    distance: "4km",
    tag: "Swing",
    verified: true,
    bio: "Curtindo a vida e buscando novas conexões.",
    photo: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80",
  },
  {
    id: "2",
    name: "Sofia",
    age: 24,
    type: "Solteira",
    typeIcon: "single",
    distance: "2km",
    tag: "Exibicionismo",
    verified: true,
    bio: "Vida livre, sem julgamentos.",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
  },
  {
    id: "3",
    name: "Bia & Carol",
    age: 26,
    type: "Casal FF",
    typeIcon: "couple",
    distance: "7km",
    tag: "Casual",
    verified: false,
    bio: "Casal aberto buscando novas amizades.",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
  },
];

const FEED_POSTS = [
  {
    id: "p1",
    user: "Marina & Léo",
    handle: "@marina_leo",
    verified: true,
    distance: "4km",
    photo: "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&q=80",
    fires: 284,
    comments: 31,
    caption: "Noite perfeita na praia. Curtindo cada momento.",
    avatar: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=80&q=80",
  },
  {
    id: "p2",
    user: "Sofia",
    handle: "@sofialiberta",
    verified: true,
    distance: "2km",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    fires: 512,
    comments: 47,
    caption: "Sol, liberdade e sem arrependimentos.",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",
  },
];

type SubTab = "discover" | "feed";

export function DiscoverScreen() {
  const [sub, setSub] = useState<SubTab>("discover");
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);

  const profile = PROFILES[idx % PROFILES.length];

  function next(dir: "left" | "right") {
    setLeaving(dir);
    setTimeout(() => { setIdx((i) => i + 1); setLeaving(null); }, 280);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-3">
        <h1 className="font-display text-xl font-bold text-ink">
          Bra<span className="bg-heat bg-clip-text text-transparent">sa</span>
        </h1>
        <div className="flex items-center bg-surface-2 rounded-full p-1 gap-0.5">
          {(["discover", "feed"] as SubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setSub(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                sub === t ? "bg-heat text-white shadow" : "text-ink-3"
              }`}
            >
              {t === "discover" ? "Descobrir" : "Feed"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {sub === "discover" ? (
          <DiscoverCard profile={profile} leaving={leaving} onPass={() => next("left")} onInterest={() => next("right")} />
        ) : (
          <FeedTab posts={FEED_POSTS} />
        )}
      </div>
    </div>
  );
}

type CardProps = {
  profile: (typeof PROFILES)[0];
  leaving: "left" | "right" | null;
  onPass: () => void;
  onInterest: () => void;
};

function DiscoverCard({ profile, leaving, onPass, onInterest }: CardProps) {
  const transform =
    leaving === "left" ? "translate(-110%, 0) rotate(-15deg)" :
    leaving === "right" ? "translate(110%, 0) rotate(15deg)" :
    "translate(0,0) rotate(0deg)";

  return (
    <div className="relative h-full flex flex-col items-center px-4 pb-4">
      <div className="absolute inset-x-8 top-6 bottom-24 rounded-[28px] bg-surface-2 scale-95 opacity-50 pointer-events-none" />

      <div
        className="relative w-full flex-1 rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-[280ms] ease-in-out"
        style={{ transform }}
      >
        <img src={profile.photo} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF1E56]/10 via-transparent to-transparent" />

        <div className="absolute top-0 left-0 right-0 p-5">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="font-display text-3xl font-bold text-white leading-tight drop-shadow-lg">
              {profile.name}
            </h2>
            {profile.verified && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FFB020]" title="Identidade verificada">
                <VerifiedIcon className="w-3 h-3 text-white" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip accent>{profile.age}</Chip>
            <Chip>
              <span className="flex items-center gap-1">
                {profile.typeIcon === "couple"
                  ? <UsersIcon className="w-3 h-3" />
                  : <PersonIcon className="w-3 h-3" />}
                {profile.type}
              </span>
            </Chip>
            <Chip>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" />
                {profile.distance}
              </span>
            </Chip>
            <Chip>{profile.tag}</Chip>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white/80 text-sm leading-relaxed">{profile.bio}</p>
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center justify-center gap-5 pt-4">
        <ActionBtn variant="pass" onClick={onPass}><XIcon /></ActionBtn>
        <ActionBtn variant="super"><StarIcon /></ActionBtn>
        <ActionBtn variant="fire" onClick={onInterest}>
          <FireIcon />
        </ActionBtn>
      </div>
    </div>
  );
}

function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
      <path d="M12 2C9.8 4.5 8 7.2 8 10a4 4 0 008 0c0-.7-.1-1.3-.3-1.9C14.8 9.4 14 10.6 14 12a2 2 0 01-4 0c0-2.5 1.5-4.7 3.8-6.3C14.5 4.9 15 4 15 3c0-.4-.1-.8-.3-1.1C14 1.5 13 2 12 2zM6.5 11.5C5.6 13 5 14.5 5 16a7 7 0 0014 0c0-2.1-.7-4-1.9-5.6-.3.9-.8 1.7-1.4 2.4.2.5.3 1.1.3 1.7a4 4 0 01-8 0c0-1.1.3-2.1.8-3C8 12 7.3 12.2 6.5 11.5z" />
    </svg>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
      accent ? "bg-heat text-white" : "bg-white/15 text-white backdrop-blur-sm border border-white/10"
    }`}>
      {children}
    </span>
  );
}

type ActionVariant = "pass" | "super" | "fire";
const variantCls: Record<ActionVariant, string> = {
  pass:  "w-14 h-14 bg-surface border border-line text-ink-3",
  super: "w-14 h-14 bg-[#FFC23C]/10 border border-[#FFC23C]/40 text-[#FFC23C]",
  fire:  "w-16 h-16 bg-heat shadow-[0_8px_32px_rgba(255,46,86,0.5)] text-white",
};

function ActionBtn({ children, variant, onClick }: { children: React.ReactNode; variant: ActionVariant; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full flex items-center justify-center transition-transform active:scale-90 ${variantCls[variant]}`}>
      {children}
    </button>
  );
}

function FeedTab({ posts }: { posts: typeof FEED_POSTS }) {
  return (
    <div className="h-full overflow-y-auto px-4 pb-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {["Todos", "Proximos", "Casais", "Solteiros", "Casas"].map((f, i) => (
          <button key={f} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            i === 0 ? "bg-heat text-white" : "bg-surface-2 text-ink-2 border border-line"
          }`}>{f}</button>
        ))}
      </div>
      {posts.map((p) => <FeedCard key={p.id} post={p} />)}
    </div>
  );
}

type FeedPost = typeof FEED_POSTS[0];

function FeedCard({ post }: { post: FeedPost }) {
  return (
    <article className="bg-surface rounded-[20px] overflow-hidden border border-line">
      <div className="flex items-center gap-3 p-3">
        <div className="relative">
          <img src={post.avatar} className="w-10 h-10 rounded-full object-cover" alt={post.user} />
          <div className="absolute inset-0 rounded-full ring-2 ring-heat-1/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-ink truncate">{post.user}</span>
            {post.verified && (
              <span className="w-4 h-4 rounded-full bg-[#FFB020] flex items-center justify-center flex-shrink-0">
                <VerifiedIcon className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>
          <span className="text-xs text-ink-3">{post.handle} · {post.distance}</span>
        </div>
        <button className="text-ink-3 px-1"><DotsIcon /></button>
      </div>

      <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
        <img src={post.photo} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="flex items-center gap-4 px-4 pt-3 pb-1">
        <FireButton count={post.fires} />
        <button className="flex items-center gap-1.5 text-ink-3">
          <CommentIcon />
          <span className="text-sm font-semibold">{post.comments}</span>
        </button>
        <button className="ml-auto text-ink-3"><BookmarkIcon /></button>
      </div>

      <p className="px-4 pb-4 text-sm text-ink leading-relaxed">
        <span className="font-semibold">{post.handle} </span>{post.caption}
      </p>
    </article>
  );
}
