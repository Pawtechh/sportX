import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Desactivar en pantallas táctiles o si prefiere reducción de movimiento
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: targetX, y: targetY });
      if (!visible) setVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("interactive") ||
          target.closest(".card-lift"))
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    const render = () => {
      // Lerp suave (15%) para el aro exterior
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      setTrail({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseover", onMouseOver);
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {/* Punto central exacto */}
      <div
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-accent transition-transform duration-75"
        style={{
          transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0) scale(${hovered ? 0 : 1})`,
        }}
      />
      {/* Aro seguidor con lerp e iluminación reactiva */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-accent/80 transition-all duration-200 ease-out ${
          hovered
            ? "h-14 w-14 -mt-7 -ml-7 bg-accent/15 border-accent shadow-[0_0_20px_rgba(204,255,0,0.5)] scale-110"
            : "h-8 w-8 -mt-4 -ml-4 shadow-[0_0_10px_rgba(204,255,0,0.2)]"
        }`}
        style={{
          transform: `translate3d(${trail.x}px, ${trail.y}px, 0)`,
        }}
      />
    </div>
  );
}
