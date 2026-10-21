import React, { useState, useEffect } from "react";

export interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  aspectRatio?: "square" | "portrait" | "1:1" | "4:5";
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}

export function getCategoryFallback(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ropa") || cat.includes("remera") || cat.includes("apparel")) {
    return "/placeholder/placeholder-ropa.svg";
  }
  if (cat.includes("pelota") || cat.includes("balon") || cat.includes("ball")) {
    return "/placeholder/placeholder-pelotas.svg";
  }
  if (cat.includes("accesorio") || cat.includes("gear") || cat.includes("mochila") || cat.includes("accessory")) {
    return "/placeholder/placeholder-accesorios.svg";
  }
  return "/placeholder/placeholder-zapatillas.svg";
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  aspectRatio = "1:1",
  className = "",
  imgClassName = "",
  loading = "lazy",
}) => {
  const fallback = getCategoryFallback(category);
  const [imgSrc, setImgSrc] = useState<string>(src || fallback);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src || fallback);
    setIsLoading(true);
    setHasError(false);
  }, [src, fallback]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
      setIsLoading(false);
    } else if (imgSrc !== "/placeholder/placeholder-default.svg") {
      setImgSrc("/placeholder/placeholder-default.svg");
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const aspectClass =
    aspectRatio === "portrait" || aspectRatio === "4:5"
      ? "aspect-[4/5]"
      : "aspect-square";

  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center ${aspectClass} ${className}`}
    >
      {/* Skeleton loader while loading */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-neutral-200/70 dark:bg-neutral-800/80 animate-pulse z-10"
          aria-hidden="true"
        />
      )}

      {/* Main product image with smooth fade-in */}
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${imgClassName}`}
      />
    </div>
  );
};
