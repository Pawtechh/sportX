import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "../types";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
}

export default function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllLink,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 border-b border-zinc-200 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-5">
        {/* Cabecera del Carrusel con Controles y Botón "Ver más" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            {subtitle && (
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 block mb-1">
                {subtitle}
              </span>
            )}
            <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón "Ver más" Destacado */}
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white hover:border-black hover:bg-black hover:text-white dark:hover:border-accent dark:hover:bg-accent dark:hover:text-black transition-all shadow-sm mr-1"
            >
              <span>Ver más</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Flechas de Navegación < y > */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm"
                aria-label={`Desplazar carrusel ${title} a la izquierda`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm"
                aria-label={`Desplazar carrusel ${title} a la derecha`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor Scroll Snap Horizontal */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[300px] shrink-0 snap-start"
            >
              <ProductCard p={product} />
            </div>
          ))}

          {/* Tarjeta final "Ver más [Colección]" dentro del carrusel */}
          <div className="w-[200px] shrink-0 snap-start flex items-center justify-center">
            <Link
              to={viewAllLink}
              className="group flex flex-col items-center justify-center w-full aspect-[4/5] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-accent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all p-6 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 group-hover:bg-black group-hover:text-white dark:group-hover:bg-accent dark:group-hover:text-black transition-colors mb-3 shadow-sm">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Ver más
              </span>
              <span className="text-[11px] text-zinc-500 mt-1">
                Explorar todo
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
