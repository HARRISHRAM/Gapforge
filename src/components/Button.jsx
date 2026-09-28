export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-colors focus-ring disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-sm", lg: "px-8 py-3.5 text-base" };
  const variants = {
    primary: "bg-ink-900 text-paper hover:bg-teal-700",
    accent: "bg-amber-400 text-ink-950 hover:bg-amber-500",
    outline: "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper",
    ghost: "text-ink-700 hover:bg-teal-50",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
