const BASE = "/api";

function headers(extra: Record<string, string> = {}): HeadersInit {
  const token = localStorage.getItem("brasa_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

// ── Posts & feed ─────────────────────────────────────────────────

export interface Post {
  id: string;
  description: string | null;
  mediaUrls: string[];
  fireCount: number;
  commentCount: number;
  createdAt: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    verification: string;
  };
  // campo local — não vem da API, é gerenciado no cliente
  firedByMe?: boolean;
}

export async function getFeed(tab: "all" | "reco" = "all", cursor?: string): Promise<Post[]> {
  const p = new URLSearchParams({ tab });
  if (cursor) p.set("cursor", cursor);
  return req<Post[]>(`/posts/feed?${p}`);
}

export async function toggleFire(postId: string): Promise<{ fired: boolean; fireCount: number }> {
  return req(`/posts/${postId}/fire`, { method: "POST" });
}

export async function createPost(body: {
  description?: string;
  mediaUrls: string[];
  visibility: "PUBLIC" | "VERIFIED_ONLY" | "FOLLOWERS";
  lat?: number;
  lng?: number;
  ageConsent: true;
}): Promise<Post> {
  return req("/posts", { method: "POST", body: JSON.stringify(body) });
}

// ── Comentários ───────────────────────────────────────────────────

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  user: { username: string; displayName: string; avatarUrl: string | null };
  replies?: Comment[];
}

export async function getComments(postId: string): Promise<Comment[]> {
  return req<Comment[]>(`/posts/${postId}/comments`);
}

export async function addComment(postId: string, body: string, parentId?: string): Promise<Comment> {
  return req(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body, parentId }),
  });
}

// ── Upload de mídia ───────────────────────────────────────────────

export async function uploadMedia(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/upload`);
    const token = localStorage.getItem("brasa_token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).url as string);
      } else {
        reject(new Error("Falha no upload"));
      }
    };
    xhr.onerror = () => reject(new Error("Sem conexão"));
    xhr.send(form);
  });
}
