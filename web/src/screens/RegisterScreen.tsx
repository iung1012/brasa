import { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Logo } from "../components/Logo.js";

type ProfileType = "COUPLE_MF" | "COUPLE_MM" | "COUPLE_FF" | "SINGLE_M" | "SINGLE_F";

const PROFILE_TYPES: { value: ProfileType; label: string; sub: string }[] = [
  { value: "COUPLE_MF", label: "Casal",     sub: "Homem + Mulher"   },
  { value: "COUPLE_MM", label: "Casal",     sub: "Homem + Homem"    },
  { value: "COUPLE_FF", label: "Casal",     sub: "Mulher + Mulher"  },
  { value: "SINGLE_M",  label: "Solteiro",  sub: "Homem"            },
  { value: "SINGLE_F",  label: "Solteira",  sub: "Mulher"           },
];

type Props = { onLogin: () => void };

type Step = "type" | "info" | "age" | "done";

export function RegisterScreen({ onLogin }: Props) {
  const { login } = useAuth();
  const [step, setStep]             = useState<Step>("type");
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername]     = useState("");
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [birthDate, setBirthDate]   = useState("");
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function checkUsername(u: string) {
    if (u.length < 3) { setUsernameOk(null); return; }
    try {
      const res = await fetch(`/api/auth/username-available?username=${encodeURIComponent(u)}`);
      const data = await res.json();
      setUsernameOk(data.available);
    } catch { setUsernameOk(null); }
  }

  async function submit() {
    if (!profileType || !ageConfirm) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, displayName, birthDate, profileType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao criar conta"); return; }
      login(data.token, data.user);
    } catch {
      setError("Sem conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP: tipo de perfil ──────────────────────────────────────────
  if (step === "type") {
    return (
      <div className="flex flex-col h-full bg-bg px-6 pt-16 pb-8">
        <LogoMark />
        <h2 className="font-display text-3xl font-bold text-ink mt-8 mb-1">Quem é você?</h2>
        <p className="text-sm text-ink-3 mb-6">Escolha o tipo de perfil.</p>

        <div className="flex flex-col gap-3">
          {PROFILE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setProfileType(t.value)}
              className={`flex items-center justify-between px-4 py-4 rounded-2xl border transition-all ${
                profileType === t.value
                  ? "border-heat-1 bg-heat-1/10"
                  : "border-line bg-surface-2"
              }`}
            >
              <div className="text-left">
                <p className="font-semibold text-sm text-ink">{t.label}</p>
                <p className="text-xs text-ink-3">{t.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                profileType === t.value ? "border-heat-1 bg-heat-1" : "border-line"
              }`}>
                {profileType === t.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <button
          onClick={() => setStep("info")}
          disabled={!profileType}
          className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[.98]"
        >
          Continuar
        </button>
        <button onClick={onLogin} className="mt-4 text-center text-sm text-ink-3">
          Ja tenho conta — <span className="text-heat-1 font-semibold">Entrar</span>
        </button>
      </div>
    );
  }

  // ── STEP: dados básicos ───────────────────────────────────────────
  if (step === "info") {
    return (
      <div className="flex flex-col h-full bg-bg px-6 pt-16 pb-8 overflow-y-auto">
        <StepBar current={1} total={2} />
        <h2 className="font-display text-3xl font-bold text-ink mt-6 mb-1">Seus dados</h2>
        <p className="text-sm text-ink-3 mb-6">Como você quer ser conhecido.</p>

        <div className="flex flex-col gap-4">
          <Field label="Nome de exibição">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como aparece no perfil"
              className={inputCls}
            />
          </Field>

          <Field label="@ único">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
                  setUsername(v);
                  checkUsername(v);
                }}
                placeholder="seuusuario"
                autoCapitalize="none"
                className={`${inputCls} pl-8 ${
                  usernameOk === true ? "border-[#2ED47A]" :
                  usernameOk === false ? "border-[#FF3B30]" : ""
                }`}
              />
              {usernameOk !== null && (
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold ${
                  usernameOk ? "text-[#2ED47A]" : "text-[#FF3B30]"
                }`}>
                  {usernameOk ? "Disponivel" : "Indisponivel"}
                </span>
              )}
            </div>
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className={inputCls}
            />
          </Field>

          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex-1" />
        <button
          onClick={() => setStep("age")}
          disabled={!displayName || !username || usernameOk !== true || !email || password.length < 8}
          className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[.98] mt-6"
        >
          Continuar
        </button>
      </div>
    );
  }

  // ── STEP: idade e confirmação ─────────────────────────────────────
  if (step === "age") {
    return (
      <div className="flex flex-col h-full bg-bg px-6 pt-16 pb-8">
        <StepBar current={2} total={2} />
        <h2 className="font-display text-3xl font-bold text-ink mt-6 mb-1">Confirmacao</h2>
        <p className="text-sm text-ink-3 mb-6">Apenas maiores de 18 anos.</p>

        <Field label="Data de nascimento">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={inputCls}
          />
        </Field>

        <label className="flex items-start gap-3 mt-6 cursor-pointer">
          <div
            onClick={() => setAgeConfirm((v) => !v)}
            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              ageConfirm ? "bg-heat border-heat-1" : "border-line"
            }`}
          >
            {ageConfirm && (
              <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M1 5l3 3 7-7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-ink-2 leading-relaxed">
            Confirmo que tenho mais de 18 anos e concordo com os{" "}
            <span className="text-heat-1 font-semibold">Termos de Uso</span> e a{" "}
            <span className="text-heat-1 font-semibold">Politica de Privacidade</span>.
          </span>
        </label>

        {error && (
          <p className="mt-4 text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex-1" />
        <button
          onClick={submit}
          disabled={!birthDate || !ageConfirm || loading}
          className="w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-40 disabled:shadow-none transition-all active:scale-[.98]"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </div>
    );
  }

  return null;
}

// ── helpers ───────────────────────────────────────────────────────

function LogoMark() {
  return <Logo variant="full" height={40} />;
}

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all ${
            i < current ? "bg-heat" : "bg-surface-2"
          }`}
        />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-surface-2 border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 transition-colors";
