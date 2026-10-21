import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setVisible(scrollTop > 300);
      if (docHeight > 0) {
        setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-[#CCFF00] shadow-xl border border-zinc-700 transition-all duration-300 hover:scale-110 hover:border-[#CCFF00] active:scale-95 ${
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none"
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2.5"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#CCFF00"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <ArrowUp className="h-5 w-5 relative z-10" />
    </button>
  );
}
