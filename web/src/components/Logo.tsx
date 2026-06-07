type Props = {
  variant?: "full" | "icon";
  className?: string;
  height?: number;
};

export function Logo({ variant = "full", className = "", height = 36 }: Props) {
  if (variant === "icon") {
    return (
      <img
        src="/icon.png"
        alt="Brasa"
        height={height}
        width={height}
        className={`object-contain ${className}`}
        draggable={false}
      />
    );
  }
  return (
    <img
      src="/logo.png"
      alt="Brasa"
      height={height}
      className={`object-contain ${className}`}
      draggable={false}
      style={{ height }}
    />
  );
}
