import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./Icons.js";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="absolute top-4 right-4 z-50 h-9 w-9 rounded-full bg-surface-2 border border-line flex items-center justify-center text-ink-2 shadow"
      aria-label="Alternar tema"
    >
      {dark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
    </button>
  );
}
