import { useRef, useState } from "react";
import { uploadMedia } from "../services/api.js";
import { VerifiedIcon } from "../components/Icons.js";

type Step = "intro" | "doc_front" | "doc_back" | "selfie" | "review" | "done" | "pending" | "rejected";

type Docs = { docFrontUrl: string; docBackUrl: string; selfieUrl: string };
type Previews = { front: string; back: string; selfie: string };

type Props = { currentStatus: string; onClose: () => void };

export function VerificationScreen({ currentStatus, onClose }: Props) {
  const [step, setStep]         = useState<Step>(
    currentStatus === "APPROVED" ? "done" :
    currentStatus === "PENDING"  ? "pending" :
    currentStatus === "REJECTED" ? "rejected" : "intro"
  );
  const [docs, setDocs]         = useState<Partial<Docs>>({});
  const [previews, setPreviews] = useState<Partial<Previews>>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingField = useRef<"front" | "back" | "selfie">("front");

  async function pickAndUpload(field: "front" | "back" | "selfie") {
    pendingField.current = field;
    fileRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const field = pendingField.current;
    const localUrl = URL.createObjectURL(file);
    setPreviews((p) => ({ ...p, [field]: localUrl }));
    setUploading(true);
    try {
      const url = await uploadMedia(file);
      setDocs((d) => ({ ...d, [`doc${field === "front" ? "Front" : field === "back" ? "Back" : "Selfie"}Url`]: url }));
    } catch {
      setError("Erro ao enviar imagem. Tente novamente.");
      setPreviews((p) => ({ ...p, [field]: undefined }));
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  async function submit() {
    if (!docs.docFrontUrl || !docs.docBackUrl || !docs.selfieUrl) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("brasa_token")}`,
        },
        body: JSON.stringify(docs),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao enviar");
      }
      setStep("pending");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── TELAS de STATUS ───────────────────────────────────────────

  if (step === "done") {
    return <StatusScreen icon="verified" title="Identidade verificada" desc="Seu perfil ja tem o selo de verificado." onClose={onClose} />;
  }
  if (step === "pending") {
    return <StatusScreen icon="pending" title="Em analise" desc="Enviamos seus documentos para revisao. Normalmente leva ate 24h." onClose={onClose} />;
  }
  if (step === "rejected") {
    return <StatusScreen icon="rejected" title="Verificacao rejeitada" desc="Seus documentos nao foram aceitos. Envie novamente com imagens claras e validas." onClose={onClose} action={{ label: "Tentar novamente", onClick: () => setStep("intro") }} />;
  }

  // ── FLUXO DE ENVIO ────────────────────────────────────────────

  const STEPS: Step[] = ["intro", "doc_front", "doc_back", "selfie", "review"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg max-w-[430px] mx-auto">
      {/* header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4 border-b border-line">
        <button onClick={step === "intro" ? onClose : () => setStep(STEPS[stepIdx - 1])} className="text-sm font-semibold text-ink-3">
          {step === "intro" ? "Fechar" : "Voltar"}
        </button>
        <p className="font-semibold text-sm text-ink">Verificacao de identidade</p>
        <div className="w-12" />
      </header>

      {/* barra de progresso */}
      {step !== "intro" && (
        <div className="flex gap-1 px-5 pt-3 flex-shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= stepIdx ? "bg-heat" : "bg-surface-3"}`} />
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col">

        {/* INTRO */}
        {step === "intro" && (
          <div className="flex flex-col items-center text-center gap-4 flex-1 justify-center pb-10">
            <div className="w-20 h-20 rounded-full bg-[#FFB020]/20 flex items-center justify-center">
              <VerifiedIcon className="w-10 h-10 text-[#FFB020]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-ink">Verifique sua identidade</h2>
            <p className="text-sm text-ink-3 leading-relaxed max-w-xs">
              Para receber o <span className="font-semibold text-[#FFB020]">selo de verificado</span>, voce precisara enviar:
            </p>
            <div className="w-full space-y-3 mt-2">
              {[
                { n: "1", t: "Documento frente", d: "RG ou CNH, frente" },
                { n: "2", t: "Documento verso", d: "RG ou CNH, verso" },
                { n: "3", t: "Selfie com documento", d: "Segure o doc proximo ao rosto" },
              ].map((item) => (
                <div key={item.n} className="flex items-center gap-3 bg-surface-2 border border-line rounded-2xl px-4 py-3 text-left">
                  <span className="w-7 h-7 rounded-full bg-heat text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{item.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.t}</p>
                    <p className="text-xs text-ink-3">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-3 mt-2">Seus documentos ficam armazenados com criptografia e nunca sao exibidos publicamente.</p>
            <button onClick={() => setStep("doc_front")} className="w-full mt-4 bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] active:scale-[.98]">
              Comecar verificacao
            </button>
          </div>
        )}

        {/* PASSOS DE UPLOAD */}
        {(step === "doc_front" || step === "doc_back" || step === "selfie") && (
          <UploadStep
            step={step}
            preview={previews[step === "doc_front" ? "front" : step === "doc_back" ? "back" : "selfie"]}
            uploading={uploading}
            error={error}
            onPick={() => pickAndUpload(step === "doc_front" ? "front" : step === "doc_back" ? "back" : "selfie")}
            onNext={() => {
              const hasDoc = step === "doc_front" ? docs.docFrontUrl : step === "doc_back" ? docs.docBackUrl : docs.selfieUrl;
              if (!hasDoc) { setError("Envie a imagem antes de continuar"); return; }
              setError("");
              setStep(step === "doc_front" ? "doc_back" : step === "doc_back" ? "selfie" : "review");
            }}
          />
        )}

        {/* REVISAO */}
        {step === "review" && (
          <div className="flex flex-col gap-5 flex-1">
            <h2 className="font-display text-2xl font-bold text-ink">Revisar e enviar</h2>
            <p className="text-sm text-ink-3">Confirme que as imagens estao claras e legiveis.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Doc frente", src: previews.front },
                { label: "Doc verso",  src: previews.back  },
                { label: "Selfie",     src: previews.selfie },
              ].map((p) => (
                <div key={p.label} className="flex flex-col gap-1">
                  <div className="aspect-square rounded-xl overflow-hidden bg-surface-3">
                    {p.src && <img src={p.src} className="w-full h-full object-cover" alt={p.label} />}
                  </div>
                  <p className="text-[10px] text-ink-3 text-center">{p.label}</p>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">{error}</p>}
            <div className="flex-1" />
            <button onClick={submit} disabled={submitting} className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-40 active:scale-[.98]">
              {submitting ? "Enviando..." : "Enviar para analise"}
            </button>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
    </div>
  );
}

function UploadStep({ step, preview, uploading, error, onPick, onNext }: {
  step: Step; preview?: string; uploading: boolean; error: string;
  onPick: () => void; onNext: () => void;
}) {
  const config = {
    doc_front: { title: "Documento — frente", desc: "Enquadre bem o documento. Foto clara e sem reflexo.", icon: "🪪" },
    doc_back:  { title: "Documento — verso",  desc: "Vire o documento e tire outra foto.", icon: "🪪" },
    selfie:    { title: "Selfie com documento", desc: "Segure o documento proximo ao seu rosto. Olhe para a camera.", icon: "🤳" },
  }[step as "doc_front" | "doc_back" | "selfie"];

  return (
    <div className="flex flex-col gap-5 flex-1">
      <h2 className="font-display text-2xl font-bold text-ink">{config.title}</h2>
      <p className="text-sm text-ink-3">{config.desc}</p>

      <button
        onClick={onPick}
        disabled={uploading}
        className="relative aspect-[4/3] rounded-[20px] border-2 border-dashed border-line bg-surface-2 overflow-hidden flex items-center justify-center active:bg-surface-3"
      >
        {preview ? (
          <>
            <img src={preview} className="absolute inset-0 w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-full">Trocar foto</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-ink-3">
            {uploading
              ? <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              : <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            }
            <p className="text-sm font-semibold">{uploading ? "Enviando..." : "Toque para fotografar"}</p>
          </div>
        )}
      </button>

      {error && <p className="text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">{error}</p>}
      <div className="flex-1" />
      <button onClick={onNext} disabled={uploading} className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-40 active:scale-[.98]">
        Continuar
      </button>
    </div>
  );
}

function StatusScreen({ icon, title, desc, onClose, action }: {
  icon: "verified" | "pending" | "rejected";
  title: string; desc: string; onClose: () => void;
  action?: { label: string; onClick: () => void };
}) {
  const colors = { verified: "bg-[#FFB020]/20 text-[#FFB020]", pending: "bg-heat-1/20 text-heat-1", rejected: "bg-[#FF3B30]/20 text-[#FF3B30]" };
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg max-w-[430px] mx-auto px-8 text-center gap-5">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center ${colors[icon]}`}>
        {icon === "verified" && <VerifiedIcon className="w-12 h-12" />}
        {icon === "pending"  && <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
        {icon === "rejected" && <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>}
      </div>
      <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
      <p className="text-sm text-ink-3 leading-relaxed">{desc}</p>
      {action && (
        <button onClick={action.onClick} className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)]">{action.label}</button>
      )}
      <button onClick={onClose} className="text-sm text-ink-3 font-semibold">{action ? "Fechar" : "Ok"}</button>
    </div>
  );
}
