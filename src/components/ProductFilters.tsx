import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export interface FilterState {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  size: string;
  sort: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "running", label: "Running" },
  { id: "basketball", label: "Basketball" },
  { id: "training", label: "Training" },
  { id: "lifestyle", label: "Lifestyle" },
];

const BRANDS = ["Todas", "Nike", "Adidas", "Jordan", "On Running", "Puma", "New Balance", "SportX Pro"];

const SIZES = ["Todos", "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12"];

const SORTS = [
  { id: "featured", label: "Destacados" },
  { id: "price_asc", label: "Precio: Menor a Mayor" },
  { id: "price_desc", label: "Precio: Mayor a Menor" },
  { id: "rating", label: "Mejor Calificados" },
  { id: "newest", label: "Novedades" },
];

export default function ProductFilters({ filters, onChange, onReset, totalResults }: ProductFiltersProps) {
  const update = (patch: Partial<FilterState>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-md">
      {/* Encabezado de Filtros */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Filtros Activos</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-accent transition"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Ordenar Por */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
          Ordenar Por
        </label>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-accent"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categorías */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
          Disciplina
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.id })}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                filters.category === cat.id
                  ? "bg-accent text-black shadow-[0_0_10px_#CCFF00]"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rango de Precio */}
      <div>
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
          <span>Rango de Precio</span>
          <span className="font-mono text-accent">${filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="50"
          max="300"
          step="10"
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          className="w-full accent-accent bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
          <span>$50</span>
          <span>$300</span>
        </div>
      </div>

      {/* Marca */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
          Marca
        </label>
        <select
          value={filters.brand}
          onChange={(e) => update({ brand: e.target.value })}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-accent"
        >
          {BRANDS.map((b) => (
            <option key={b} value={b === "Todas" ? "" : b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Talle disponible */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
          Talle
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => update({ size: s === "Todos" ? "" : s })}
              className={`rounded-xl py-1.5 text-[11px] font-mono font-bold transition-all ${
                (filters.size === "" && s === "Todos") || filters.size === s
                  ? "bg-accent text-black border border-accent shadow-[0_0_8px_#CCFF00]"
                  : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {s.replace("US ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="pt-4 border-t border-zinc-800/80 text-center">
        <span className="text-xs font-mono text-zinc-400">
          Mostrando <span className="text-accent font-bold">{totalResults}</span> siluetas
        </span>
      </div>
    </div>
  );
}
