import React, { useState } from "react";
import { getCategoryFallback } from "./ProductImage";

interface ProductImageWrapperProps {
  src?: string;
  hoverSrc?: string;
  alt: string;
  category?: string;
  aspectRatio?: "1/1" | "4/5" | "4/3";
  className?: string;
  isHovered?: boolean;
}

export default function ProductImageWrapper({
  src,
  hoverSrc,
  alt,
  category,
  aspectRatio = "4/5",
  className = "",
  isHovered = false,
}: ProductImageWrapperProps) {
  const fallback = getCategoryFallback(category);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const ratioClasses = {
    "1/1": "aspect-square",
    "4/5": "aspect-[4/5]",
    "4/3": "aspect-[4/3]",
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900/80 transition-colors ${ratioClasses[aspectRatio]} ${className}`}
    >
      {/* Skeleton de carga mientras descarga el recurso */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
      )}

      {/* Fallback de Categoría cuando la imagen falla o no existe */}
      {hasError || !src ? (
        <div className="flex h-full w-full items-center justify-center p-4 select-none bg-zinc-100 dark:bg-zinc-900">
          <img
            src={fallback}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <>
          {/* Imagen Principal */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`absolute inset-0 h-full w-full object-contain p-4 transition-all duration-500 ease-out ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${isHovered && hoverSrc && hoverSrc !== src ? "opacity-0" : "group-hover:scale-105"}`}
          />

          {/* Segunda Imagen en Hover (Crossfade de Ángulo 2) */}
          {hoverSrc && hoverSrc !== src && (
            <img
              src={hoverSrc}
              alt={`${alt} perspectiva alterna`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-contain p-4 transition-all duration-500 ease-out ${
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
              }`}
            />
          )}
        </>
      )}
    </div>
  );
}
