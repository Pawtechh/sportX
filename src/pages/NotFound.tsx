import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center select-none pt-20">
      <div className="relative mb-6">
        <span className="font-mono text-8xl sm:text-9xl font-black italic tracking-tighter text-zinc-800 drop-shadow-[0_0_40px_rgba(204,255,0,0.15)]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="h-16 w-16 text-accent animate-spin [animation-duration:12s]" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-white">
        RUTA FUERA DE LOS LÍMITES
      </h1>
      <p className="mt-3 max-w-md text-xs sm:text-sm text-zinc-400">
        Esta silueta o coordenada no existe en el catálogo SportX o ha sido retirada por los atletas.
      </p>

      <Link
        to="/"
        className="btn-primary mt-8 inline-flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la Pista Principal</span>
      </Link>
    </div>
  );
}
