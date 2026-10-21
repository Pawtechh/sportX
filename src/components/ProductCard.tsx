import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { money } from "../api";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { Star, Zap, Check, X } from "lucide-react";
import ProductImageWrapper from "./ProductImageWrapper";

export default function ProductCard({ p }: { p: Product }) {
  const { add, setOpen } = useCart();
  const [showSizes, setShowSizes] = useState(false);
  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  const img1 = p.images?.[0] || (p as any).imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff";
  const img2 = p.images?.[1] || img1;

  const availableSizes = p.sizes && p.sizes.length > 0 ? p.sizes : ["US 9"];

  const handleSelectSize = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p, size);
    setAddedSize(size);
    toast.success(`${p.name} (Talle: ${size}) agregado a la bolsa`, {
      action: {
        label: "Ver bolsa",
        onClick: () => setOpen(true),
      },
    });
    setTimeout(() => {
      setAddedSize(null);
      setShowSizes(false);
    }, 900);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (availableSizes.length === 1) {
      handleSelectSize(availableSizes[0], e);
    } else {
      setShowSizes(true);
    }
  };

  const isLowStock = p.stock > 0 && p.stock <= 15;
  const isNew = p.id > 30 || p.rating >= 4.9;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowSizes(false);
      }}
      className="product-card card-lift group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm hover:shadow-xl"
    >
      {/* Contenedor de Imagen con Wrapper Robusto */}
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Badges animados */}
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {isNew && (
            <span className="animate-pulse inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-md">
              <Zap className="h-2.5 w-2.5 fill-black" />
              Novedad
            </span>
          )}
          {isLowStock && (
            <span className="inline-flex items-center rounded-full bg-orange-500/20 border border-orange-500/40 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 backdrop-blur-sm">
              Últimas {p.stock}
            </span>
          )}
        </div>

        {/* Rating en esquina superior derecha con contraste asegurado */}
        <div
          className="absolute right-3 top-3 z-20 badge-rating !px-2 !py-0.5 !text-[10px] !bg-neutral-900 !text-white"
          aria-label={`Calificación: ${p.rating ? p.rating.toFixed(1) : "4.8"} de 5 estrellas`}
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="!text-white font-mono font-bold">{p.rating ? p.rating.toFixed(1) : "4.8"}</span>
        </div>

        <Link to={`/product/${p.id}`} className="block h-full w-full">
          <ProductImageWrapper
            src={img1}
            hoverSrc={img2}
            alt={p.name}
            category={p.category}
            aspectRatio="4/5"
            isHovered={hovered}
          />
        </Link>

        {/* Panel Quick Add / Selector de Talles deslizante */}
        <div
          className={`absolute inset-x-2.5 bottom-2.5 z-20 transition-all duration-300 ${
            hovered || showSizes
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-6 opacity-0 pointer-events-none group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
          }`}
        >
          {showSizes ? (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 p-2.5 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-mono">
                  Selecciona Talle:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSizes(false);
                  }}
                  aria-label="Cerrar selector de talles"
                  className="rounded-full p-1 text-zinc-400 hover:text-black dark:hover:text-white transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => handleSelectSize(size, e)}
                    className={`flex-1 min-w-[50px] py-1.5 px-2 text-[11px] font-black uppercase rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      addedSize === size
                        ? "bg-zinc-900 text-white dark:bg-accent dark:text-black border-transparent scale-95"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-200 hover:border-black dark:hover:border-accent hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {addedSize === size ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Listo</span>
                      </>
                    ) : (
                      size
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAddClick}
              disabled={p.stock === 0}
              className="w-full rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-1.5 bg-accent text-black hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black active:scale-95 disabled:opacity-40"
            >
              {p.stock === 0 ? (
                "Agotado"
              ) : (
                <>
                  <span>+ Agregar Rápido</span>
                  <span className="text-[10px] opacity-75 font-mono">({availableSizes.length} talles)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Información del Producto */}
      <div className="mt-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
            <span>{p.brand}</span>
            <span className="capitalize">{p.category}</span>
          </div>

          <Link to={`/product/${p.id}`} className="hover:text-zinc-600 dark:hover:text-accent transition-colors">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug line-clamp-1">
              {p.name}
            </h3>
          </Link>

          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">{p.description}</p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/60 pt-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Precio</span>
            <span className="text-lg font-black text-zinc-950 dark:text-accent font-mono">{money(p.price)}</span>
          </div>

          <Link
            to={`/product/${p.id}`}
            className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-300 hover:border-black dark:hover:border-accent hover:text-black dark:hover:text-accent transition"
          >
            Detalles →
          </Link>
        </div>
      </div>
    </article>
  );
}
