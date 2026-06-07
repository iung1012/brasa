import { useRef, useState } from "react";
import { uploadMedia, createPost } from "../services/api.js";

type Visibility = "PUBLIC" | "VERIFIED_ONLY" | "FOLLOWERS";

const VIS_LABELS: Record<Visibility, string> = {
  PUBLIC:         "Publico",
  VERIFIED_ONLY:  "So verificados",
  FOLLOWERS:      "So seguidores",
};

type Props = { onClose: () => void; onPosted: () => void };

export function CreatePostScreen({ onClose, onPosted }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews]   = useState<{ url: string; file: File }[]>([]);
  const [description, setDesc]    = useState("");
  const [visibility, setVis]      = useState<Visibility>("PUBLIC");
  const [ageConsent, setAge]      = useState(false);
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting]     = useState(false);
  const [error, setError]         = useState("");

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])].slice(0, 5);
    setPreviews(files.map((f) => ({ url: URL.createObjectURL(f), file: f })));
    e.target.value = "";
  }

  async function submit() {
    if (previews.length === 0 || !ageConsent) return;
    setError("");
    setUploading(true);
    try {
      const mediaUrls: string[] = [];
      for (let i = 0; i < previews.length; i++) {
        const url = await uploadMedia(previews[i].file, (pct) =>
          setProgress(Math.round((i / previews.length) * 100 + pct / previews.length))
        );
        mediaUrls.push(url);
      }
      setUploading(false);
      setPosting(true);
      await createPost({ description: description || undefined, mediaUrls, visibility, ageConsent: true });
      onPosted();
    } catch (e: any) {
      setError(e.message ?? "Erro ao publicar");
      setUploading(false);
      setPosting(false);
    }
  }

  const busy = uploading || posting;
  const canSubmit = previews.length > 0 && ageConsent && !busy;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg max-w-[430px] mx-auto">
      {/* header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4 border-b border-line">
        <button onClick={onClose} disabled={busy} className="text-ink-3 text-sm font-semibold disabled:opacity-40">
          Cancelar
        </button>
        <h2 className="font-display font-bold text-base text-ink">Nova publicacao</h2>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="text-sm font-bold text-heat-1 disabled:opacity-30"
        >
          {uploading ? `${progress}%` : posting ? "Publicando..." : "Publicar"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* area de midia */}
        {previews.length === 0 ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-video rounded-[20px] border-2 border-dashed border-line flex flex-col items-center justify-center gap-3 text-ink-3 active:bg-surface-2 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M3 16l5-5 4 4 3-3 6 6" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            </svg>
            <p className="text-sm font-semibold">Adicionar fotos ou video</p>
            <p className="text-xs">ate 5 arquivos · JPG, PNG, MP4</p>
          </button>
        ) : (
          <div className="space-y-2">
            {/* grid de previews */}
            <div className={`grid gap-1 rounded-[20px] overflow-hidden ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {previews.map((p, i) => (
                <div key={i} className="relative aspect-square bg-surface-2">
                  <img src={p.url} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {previews.length < 5 && (
              <button onClick={() => fileRef.current?.click()} className="text-xs text-heat-1 font-semibold">
                + Adicionar mais
              </button>
            )}
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple className="hidden" onChange={onFileChange} />

        {/* barra de progresso durante upload */}
        {uploading && (
          <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-heat rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* descricao */}
        <div>
          <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide mb-1.5">Descricao</label>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            maxLength={2200}
            rows={3}
            placeholder="Escreva algo sobre a publicacao..."
            className="w-full bg-surface-2 border border-line rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 resize-none transition-colors"
          />
          <p className="text-right text-[10px] text-ink-3 mt-1">{description.length}/2200</p>
        </div>

        {/* visibilidade */}
        <div>
          <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide mb-1.5">Visibilidade</label>
          <div className="flex gap-2">
            {(Object.keys(VIS_LABELS) as Visibility[]).map((v) => (
              <button
                key={v}
                onClick={() => setVis(v)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  visibility === v ? "bg-heat text-white border-heat-1" : "bg-surface-2 text-ink-2 border-line"
                }`}
              >
                {VIS_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        {/* aceite de maioridade dos retratados */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAge((v) => !v)}
            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${ageConsent ? "bg-heat border-heat-1" : "border-line"}`}
          >
            {ageConsent && (
              <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M1 5l3 3 7-7"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-ink-2 leading-relaxed">
            Confirmo que todas as pessoas retratadas sao maiores de 18 anos e consentiram com a publicacao.
          </span>
        </label>

        {error && (
          <p className="text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
