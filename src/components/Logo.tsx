import React from "react";

interface LogoProps {
  variant?: "full" | "icon" | "wordmark";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({
  variant = "full",
  className = "",
  size = "md",
}: LogoProps) {
  const sizeMap = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-14",
  };

  // Ícono de marca: Emblema 'X' cinético de alta velocidad (hojas aerodinámicas en ángulo deportivo)
  const Emblem = () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto aspect-square drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]"
    >
      <defs>
        <linearGradient id="voltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CCFF00" />
          <stop offset="100%" stopColor="#9EE600" />
        </linearGradient>
      </defs>
      {/* Hoja 1: Ala supersónica izquierda a derecha (Volt neón) */}
      <path
        d="M8 40L24 8H34L18 40H8Z"
        fill="url(#voltGrad)"
      />
      {/* Hoja 2 superior: Contra-corte de precisión en negro/blanco */}
      <path
        d="M20 8L28 22L23 30L12 8H20Z"
        className="fill-zinc-900 dark:fill-white"
      />
      {/* Hoja 3 inferior: Ala de propulsión de salida */}
      <path
        d="M38 40L30 26L35 18L46 40H38Z"
        className="fill-zinc-900 dark:fill-white"
      />
      {/* Vórtice dinámico de velocidad central */}
      <circle cx="28.5" cy="24" r="2.5" fill="#CCFF00" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center ${sizeMap[size]} ${className}`}>
        <Emblem />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center gap-0.5 tracking-tighter ${sizeMap[size]} ${className}`}>
        <span className="text-2xl sm:text-3xl font-black italic text-zinc-900 dark:text-white transition-colors">
          SPORT
        </span>
        <span className="text-2xl sm:text-3xl font-black italic text-accent drop-shadow-[0_0_12px_#CCFF00]">
          X
        </span>
      </div>
    );
  }

  // Variant "full": Emblema Aerodinámico + Logotipo Tipográfico
  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${sizeMap[size]} ${className}`}>
      <div className="h-full group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
        <Emblem />
      </div>
      <div className="flex items-center tracking-tighter font-display leading-none">
        <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
          SPORT
        </span>
        <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-accent group-hover:scale-110 transition-transform drop-shadow-[0_0_14px_#CCFF00]">
          X
        </span>
      </div>
    </div>
  );
}
