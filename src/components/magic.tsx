import { useState, type ButtonHTMLAttributes } from "react";

/** Estilo Magic UI "Shimmer Button" + feedback de pulsación y confirmación. */
export function ShimmerButton({ children, doneLabel, onClick, className = "", ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { doneLabel?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (doneLabel) { setDone(true); setTimeout(() => setDone(false), 1200); }
      }}
      className={`btn-primary hvr-sweep-to-right group ${done ? "buy-pop !bg-white" : ""} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-shimmer" />
      <span className="relative">{done ? doneLabel : children}</span>
    </button>
  );
}

/** Estilo Magic UI "Marquee". */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-zinc-800 py-4">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-2xl font-black uppercase italic text-zinc-700">
        {row.map((t, i) => <span key={i}>{t} <span className="text-accent">/</span></span>)}
      </div>
    </div>
  );
}
