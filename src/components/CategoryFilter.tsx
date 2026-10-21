/** Filtros de categoría con indicador deslizante animado (estilo Magic UI / ReactBits). */
const OPTIONS = [["all", "Todo"], ["running", "Running"], ["basketball", "Basketball"], ["training", "Training"]] as const;

export default function CategoryFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const idx = OPTIONS.findIndex(([k]) => k === value);
  return (
    <div className="relative inline-grid grid-cols-4 rounded-full border border-zinc-800 bg-zinc-900 p-1">
      <span className="absolute inset-y-1 left-1 w-[calc(25%-2px)] rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ transform: `translateX(${idx * 100}%)` }} />
      {OPTIONS.map(([k, label]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`relative z-10 px-3 py-2 text-xs font-extrabold uppercase tracking-wide transition-colors sm:px-6 sm:text-sm ${value === k ? "text-black" : "text-zinc-400 hover:text-white"}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
