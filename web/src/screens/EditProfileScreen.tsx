import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { uploadMedia, updateProfile } from "../services/api.js";
import { Logo } from "../components/Logo.js";

const INTERESTS_LIST = [
  "Swing", "Casual", "Exibicionismo", "Voyeurismo",
  "Festa", "Naturismo", "BDSM", "Fetiche",
];

const PROFILE_TYPES: Record<string, string> = {
  COUPLE_MF: "Casal H+M", COUPLE_MM: "Casal H+H",
  COUPLE_FF: "Casal F+F", SINGLE_M:  "Solteiro",  SINGLE_F: "Solteira",
};

type Props = { onClose: () => void; onSaved: () => void };

export function EditProfileScreen({ onClose, onSaved }: Props) {
  const { user, login, token } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio]                 = useState(user?.bio ?? "");
  const [city, setCity]               = useState(user?.city ?? "");
  const [interests, setInterests]     = useState<string[]>(user?.interests ?? []);
  const [avatarUrl, setAvatarUrl]     = useState(user?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl]       = useState(user?.coverUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? "");
  const [coverPreview, setCoverPreview]   = useState(user?.coverUrl ?? "");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover]   = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [error, setError]                     = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef  = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const url = await uploadMedia(file);
      setAvatarUrl(url);
    } catch { setError("Erro ao enviar foto de perfil"); }
    finally { setUploadingAvatar(false); }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(true);
    try {
      const url = await uploadMedia(file);
      setCoverUrl(url);
    } catch { setError("Erro ao enviar foto de capa"); }
    finally { setUploadingCover(false); }
  }

  function toggleInterest(tag: string) {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 10)
    );
  }

  async function save() {
    if (!displayName.trim()) { setError("Nome obrigatório"); return; }
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
        coverUrl: coverUrl || undefined,
        interests,
      });
      // atualiza o AuthContext com os dados novos
      if (token && user) {
        login(token, {
          ...user,
          displayName: updated.displayName,
          bio: updated.bio ?? undefined,
          city: updated.city ?? undefined,
          avatarUrl: updated.avatarUrl ?? undefined,
          interests: updated.interests,
        });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  const busy = uploadingAvatar || uploadingCover || saving;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg max-w-[430px] mx-auto">
      {/* header */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 pt-12 pb-4 border-b border-line">
        <button onClick={onClose} disabled={busy} className="text-sm font-semibold text-ink-3 disabled:opacity-40">
          Cancelar
        </button>
        <Logo variant="icon" height={28} className="rounded-lg" />
        <button onClick={save} disabled={busy} className="text-sm font-bold text-heat-1 disabled:opacity-30">
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* capa */}
        <div className="relative h-36 bg-heat cursor-pointer" onClick={() => !busy && coverRef.current?.click()}>
          {coverPreview
            ? <img src={coverPreview} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full bg-heat" />
          }
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            {uploadingCover
              ? <Spinner />
              : <CameraIcon className="w-7 h-7 text-white/80" />
            }
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* avatar */}
        <div className="relative flex justify-start px-5 -mt-10 mb-4">
          <div className="relative cursor-pointer" onClick={() => !busy && avatarRef.current?.click()}>
            <div className="w-20 h-20 rounded-full p-[3px] bg-heat shadow-lg">
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full rounded-full object-cover border-2 border-bg" alt="" />
                : <div className="w-full h-full rounded-full border-2 border-bg bg-surface-3 flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-ink-2">{displayName[0] ?? "?"}</span>
                  </div>
              }
            </div>
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30">
              {uploadingAvatar ? <Spinner /> : <CameraIcon className="w-5 h-5 text-white" />}
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* campos */}
        <div className="px-5 space-y-5 pb-8">
          <Field label="Nome de exibição">
            <input
              value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50} placeholder="Como aparece no perfil"
              className={inputCls}
            />
          </Field>

          <Field label="Bio">
            <textarea
              value={bio} onChange={(e) => setBio(e.target.value)}
              maxLength={500} rows={3} placeholder="Escreva algo sobre você..."
              className={`${inputCls} resize-none`}
            />
            <p className="text-right text-[10px] text-ink-3 mt-1">{bio.length}/500</p>
          </Field>

          <Field label="Cidade">
            <input
              value={city} onChange={(e) => setCity(e.target.value)}
              maxLength={80} placeholder="Sua cidade"
              className={inputCls}
            />
          </Field>

          <Field label="Tipo de perfil">
            <div className="bg-surface-2 border border-line rounded-2xl px-4 py-3 text-sm text-ink-2">
              {PROFILE_TYPES[user?.profileType ?? ""] ?? user?.profileType}
              <span className="text-xs text-ink-3 ml-2">(não editável)</span>
            </div>
          </Field>

          <Field label="Interesses">
            <div className="flex flex-wrap gap-2">
              {INTERESTS_LIST.map((tag) => {
                const on = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      on ? "bg-heat text-white border-heat-1" : "bg-surface-2 text-ink-2 border-line"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-3 mt-1.5">{interests.length}/10 selecionados</p>
          </Field>

          {error && (
            <p className="text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

const inputCls = "w-full bg-surface-2 border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 transition-colors";
