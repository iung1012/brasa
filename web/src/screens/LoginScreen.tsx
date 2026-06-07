import { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { FlameIcon } from "../components/Icons.js";

type Props = { onRegister: () => void };

export function LoginScreen({ onRegister }: Props) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao entrar"); return; }
      login(data.token, data.user);
    } catch {
      setError("Sem conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg px-6 pt-20 pb-8">
      {/* logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-heat flex items-center justify-center">
          <FlameIcon className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-2xl font-bold text-ink">
          Bra<span className="bg-heat bg-clip-text text-transparent">sa</span>
        </span>
      </div>

      <h2 className="font-display text-3xl font-bold text-ink mb-1">Entrar</h2>
      <p className="text-sm text-ink-3 mb-8">Bem-vindo de volta.</p>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wide">
            @ ou e-mail
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="@usuario ou email@exemplo.com"
            autoCapitalize="none"
            className="w-full bg-surface-2 border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-2 mb-1.5 uppercase tracking-wide">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface-2 border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-heat-1 transition-colors"
          />
        </div>

        {error && (
          <p className="text-xs text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !identifier || !password}
          className="mt-2 w-full bg-heat text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_rgba(255,46,86,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-[.98]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="flex-1" />

      <p className="text-center text-sm text-ink-3">
        Não tem conta?{" "}
        <button onClick={onRegister} className="text-heat-1 font-semibold">
          Criar conta
        </button>
      </p>
    </div>
  );
}
