import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

const ROTATING_TEXTS = [
  "CARGANDO CATÁLOGO DE ÉLITE...",
  "CALIBRANDO INVENTARIO & AMORTIGUACIÓN...",
  "PREPARANDO EXPERIENCIA CINEMATOGRÁFICA...",
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Ciclo de mensajes rotativos
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % ROTATING_TEXTS.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Animación del trazado SVG del logo con GSAP
  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength?.() || 800;
    gsap.set(pathRef.current, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: "power2.inOut",
    });
  }, []);

  // Carga con progreso automático fluido (sin bloquearse nunca en 25%)
  useEffect(() => {
    let progressVal = 5;
    setProgress(5);

    // Disparar precarga en background sin bloquear la intro
    fetch("/api/products?limit=8").catch(() => {});

    const startTime = Date.now();
    const duration = 1500; // 1.5s de intro cinematográfica

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const target = Math.min(100, Math.floor((elapsed / duration) * 100));
      if (target > progressVal) {
        progressVal = target;
        setProgress(progressVal);
      }

      if (progressVal >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (!containerRef.current) {
            onComplete();
            return;
          }
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.45,
            ease: "power2.out",
            onComplete,
          });
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden select-none"
    >
      {/* Grilla infinita en perspectiva deportiva (Warp Speed / Sports Field) */}
      <div className="preloader-grid absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CCFF0015_1px,transparent_1px),linear-gradient(to_bottom,#CCFF0015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[warpGrid_8s_linear_infinite]" />
      </div>

      {/* Contenido Central */}
      <div className="preloader-logo relative z-10 flex flex-col items-center px-6 text-center">
        {/* SVG Logo con trazo dinámico */}
        <div className="relative mb-6">
          <svg
            className="w-48 h-20 sm:w-64 sm:h-24"
            viewBox="0 0 320 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Símbolo dinámico del swoosh / X deportiva */}
            <path
              ref={pathRef}
              d="M 20 75 Q 80 15, 160 40 T 300 20 M 120 85 L 200 15 M 130 15 L 210 85"
              stroke="#CCFF00"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-center font-black italic tracking-tighter text-4xl sm:text-5xl text-white">
            SPORT<span className="text-accent drop-shadow-[0_0_20px_#CCFF00]">X</span>
          </div>
        </div>

        {/* Contador numérico Monospace grande */}
        <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-widest text-zinc-100 mb-4 tabular-nums">
          {progress.toString().padStart(3, "0")}
          <span className="text-accent text-3xl sm:text-4xl ml-1">%</span>
        </div>

        {/* Barra de progreso de neón */}
        <div className="w-64 sm:w-80 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 mb-6 p-0.5">
          <div
            className="h-full bg-accent rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#CCFF00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Líneas de texto rotativas con animación sutil */}
        <div
          ref={textRef}
          key={statusIndex}
          className="animate__animated animate__fadeInUp animate__faster text-xs sm:text-sm font-mono tracking-widest text-zinc-400 uppercase"
        >
          {ROTATING_TEXTS[statusIndex]}
        </div>
      </div>

      {/* Marca de pie de carga */}
      <div className="absolute bottom-8 text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase">
        PERFORMANCE ENGINE • V2.0
      </div>

      <style>{`
        @keyframes warpGrid {
          0% { transform: translateY(0); }
          100% { transform: translateY(4rem); }
        }
      `}</style>
    </div>
  );
}
