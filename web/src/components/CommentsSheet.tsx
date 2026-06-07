import { useEffect, useRef, useState } from "react";
import { getComments, addComment, type Comment } from "../services/api.js";

type Props = { postId: string; onClose: () => void };

export function CommentsSheet({ postId, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [body, setBody]         = useState("");
  const [sending, setSending]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getComments(postId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId]);

  async function send() {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const c = await addComment(postId, body.trim());
      setComments((prev) => [c, ...prev]);
      setBody("");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface rounded-t-[28px] border-t border-line flex flex-col" style={{ maxHeight: "75dvh" }}>
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-surface-3" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b border-line">
          <h3 className="font-semibold text-sm text-ink">Comentarios</h3>
          <button onClick={onClose} className="text-ink-3 text-xl leading-none">×</button>
        </div>

        {/* lista */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-surface-3 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-20 bg-surface-3 rounded-full" />
                    <div className="h-2.5 w-48 bg-surface-3 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-center text-sm text-ink-3 py-8">
              Nenhum comentario ainda. Seja o primeiro.
            </p>
          )}

          {comments.map((c) => <CommentRow key={c.id} comment={c} />)}
        </div>

        {/* input */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-t border-line">
          <input
            ref={inputRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Adicionar comentario..."
            className="flex-1 bg-surface-2 border border-line rounded-full px-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1"
          />
          <button
            onClick={send}
            disabled={!body.trim() || sending}
            className="w-9 h-9 rounded-full bg-heat flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const initials = comment.user.displayName?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        {comment.user.avatarUrl ? (
          <img src={comment.user.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-heat-2/20 flex items-center justify-center text-xs font-bold text-heat-2">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink">
          @{comment.user.username}
          <span className="ml-2 text-ink-3 font-normal">
            {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
          </span>
        </p>
        <p className="text-sm text-ink-2 mt-0.5 leading-relaxed">{comment.body}</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-3 border-l border-line space-y-2">
            {comment.replies.map((r) => <CommentRow key={r.id} comment={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
