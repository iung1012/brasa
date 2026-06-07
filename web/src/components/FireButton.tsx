import { useState } from "react";
import { FlameIcon } from "./Icons.js";

type Props = {
  count?: number;
  active?: boolean;
  onToggle?: (next: boolean) => void;
  size?: "sm" | "action";
};

export function FireButton({ count = 0, active = false, onToggle, size = "sm" }: Props) {
  const [on, setOn] = useState(active);
  const [burst, setBurst] = useState(0);

  function toggle() {
    const next = !on;
    setOn(next);
    if (next) setBurst((b) => b + 1);
    if (navigator.vibrate) navigator.vibrate(next ? 18 : 0);
    onToggle?.(next);
  }

  if (size === "action") {
    return (
      <button
        onClick={toggle}
        aria-pressed={on}
        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${
          on
            ? "bg-heat shadow-[0_8px_32px_rgba(255,46,86,0.5)]"
            : "bg-surface-2 border border-line"
        }`}
      >
        <FlameIcon
          className={`w-7 h-7 transition-colors ${
            on ? "text-white animate-firepop" : "text-ink-3"
          }`}
        />
        {on && (
          <span className="pointer-events-none absolute inset-0">
            {[0, 1, 2].map((i) => (
              <span
                key={`${burst}-${i}`}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-[#FFB020] animate-spark"
                style={{ marginLeft: (i - 1) * 10, animationDelay: `${i * 50}ms` }}
              />
            ))}
          </span>
        )}
      </button>
    );
  }

  return (
    <button onClick={toggle} aria-pressed={on} className="flex items-center gap-1.5">
      <FlameIcon
        className={`w-5 h-5 transition-all ${
          on ? "text-heat-1 animate-firepop" : "text-ink-3"
        }`}
      />
      <span className={`text-sm font-semibold ${on ? "text-heat-2" : "text-ink-3"}`}>
        {count + (on && !active ? 1 : 0)}
      </span>
    </button>
  );
}
