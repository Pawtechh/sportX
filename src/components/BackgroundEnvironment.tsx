import React, { useEffect, useState } from "react";

export default function BackgroundEnvironment() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-zinc-950">
      {/* Spotlight reactivo al cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, rgba(204, 255, 0, 0.07), transparent 80%)`,
        }}
      />

      {/* Segundo foco atmosférico naranja eléctrico en esquina inferior */}
      <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-orange-600/10 via-amber-500/5 to-transparent blur-3xl opacity-60" />

      {/* Grilla sutil tipo cancha deportiva con parallax */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "6rem 6rem",
        }}
      />

      {/* Textura de grano cinematográfico (Film Grain) */}
      <div
        className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
