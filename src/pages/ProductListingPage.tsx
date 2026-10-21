import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, ArrowUpDown } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parámetros de la URL
  const currentCategory = searchParams.get("category") || "all";
  const currentBrand = searchParams.get("brand") || "all";
  const currentSize = searchParams.get("size") || "all";
  const currentColor = searchParams.get("color") || "all";
  const currentSort = searchParams.get("sort") || "featured";
  const maxPriceParam = Number(searchParams.get("maxPrice") || 300);

  // Carga de productos
  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        q.set("limit", "36");
        q.set("page", "1");
        
        // Mapear categorías si aplica
        if (currentCategory !== "all") q.set("category", currentCategory);
        if (currentBrand !== "all") q.set("brand", currentBrand);
        if (currentSize !== "all") q.set("size", currentSize);
        if (maxPriceParam < 300) q.set("maxPrice", maxPriceParam.toString());
        if (currentSort !== "featured") q.set("sort", currentSort);

        const res = await fetch(`/api/products?${q.toString()}`);
        const data = await res.json();
        if (active) {
          let list: Product[] = data.products || [];
          
          // Filtro local adicional de color si se selecciona
          if (currentColor !== "all") {
            const cLower = currentColor.toLowerCase();
            list = list.filter((p) => 
              p.name.toLowerCase().includes(cLower) || 
              p.description.toLowerCase().includes(cLower)
            );
          }
          
          setProducts(list);
          setTotalCount(data.total || list.length);
        }
      } catch (err) {
        console.error("Error cargando PLP:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCatalog();
    return () => { active = false; };
  }, [searchParams, currentCategory, currentBrand, currentSize, currentColor, currentSort, maxPriceParam]);

  // Manejador genérico de filtros en URL
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all" || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const SIZES = ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "S", "M", "L", "XL"];
  const COLORS = [
    { name: "Negro", hex: "#111111" },
    { name: "Blanco", hex: "#ffffff" },
    { name: "Rojo", hex: "#ef4444" },
    { name: "Azul", hex: "#3b82f6" },
    { name: "Volt Neón", hex: "#CCFF00" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-5">
        
        {/* Cabecera PLP y Barra Superior */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
              {currentCategory !== "all" ? currentCategory : "TODOS LOS PRODUCTOS"}
            </h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
              Mostrando {products.length} artículos de alto rendimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Orden */}
            <div className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 shadow-sm">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={currentSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="bg-transparent text-xs font-bold uppercase text-zinc-900 dark:text-white outline-none cursor-pointer"
                aria-label="Ordenar productos"
              >
                <option value="featured" className="dark:bg-zinc-900">Más Destacados</option>
                <option value="price_asc" className="dark:bg-zinc-900">Precio: Menor a Mayor</option>
                <option value="price_desc" className="dark:bg-zinc-900">Precio: Mayor a Menor</option>
                <option value="rating" className="dark:bg-zinc-900">Mejor Calificados</option>
              </select>
            </div>

            {/* Toggle de Filtros en Móvil */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-accent px-4 py-2 text-xs font-bold uppercase text-white dark:text-black shadow-sm"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Grid Principal: Sidebar de Filtros + Grid de Productos */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-4">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block lg:col-span-1 space-y-8 sticky top-28 h-fit">
            
            {/* Categorías Principales */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Categoría
              </h3>
              <div className="flex flex-col space-y-1.5">
                {[
                  { id: "all", label: "Todas las Categorías" },
                  { id: "zapatillas", label: "Zapatos / Zapatillas" },
                  { id: "ropa", label: "Remeras & Indumentaria" },
                  { id: "pelotas", label: "Pelotas & Balones" },
                  { id: "accesorios", label: "Accesorios" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter("category", c.id)}
                    className={`text-left text-xs font-semibold py-2 px-3 rounded-xl transition-colors ${
                      currentCategory === c.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tallas */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Talla
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => updateFilter("size", currentSize === sz ? "all" : sz)}
                    className={`h-9 rounded-lg border text-xs font-bold transition ${
                      currentSize === sz
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colores */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-3">
                Color
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => updateFilter("color", currentColor === col.name ? "all" : col.name)}
                    style={{ backgroundColor: col.hex }}
                    className={`h-7 w-7 rounded-full border border-zinc-400 dark:border-zinc-700 transition-transform ${
                      currentColor === col.name ? "ring-2 ring-black dark:ring-white scale-110" : "hover:scale-105"
                    }`}
                    title={col.name}
                    aria-label={`Filtrar por color ${col.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Rango de Precio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Precio Máximo
                </h3>
                <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
                  ${maxPriceParam}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={maxPriceParam}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                className="w-full accent-zinc-900 dark:accent-accent cursor-pointer"
              />
            </div>

            <button
              onClick={clearAllFilters}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 py-2.5 text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition"
            >
              Restablecer Filtros
            </button>
          </aside>

          {/* Grid de Productos (3 a 4 Columnas Responsivo) */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] rounded-3xl bg-zinc-200 dark:bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-12 text-center shadow-sm">
                <p className="text-xl font-black uppercase text-zinc-900 dark:text-white">
                  No se encontraron productos
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Prueba cambiando el rango de precio, talle o seleccionando otra categoría.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 rounded-full bg-zinc-900 dark:bg-accent px-6 py-2.5 text-xs font-black uppercase text-white dark:text-black hover:opacity-90 transition"
                >
                  Ver todo el catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal / Drawer Móvil de Filtros */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="ml-auto w-full max-w-xs h-full bg-white dark:bg-zinc-950 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Filtros
                </h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white mb-2">Categoría</h3>
                <div className="flex flex-col space-y-1">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "zapatillas", label: "Zapatillas" },
                    { id: "ropa", label: "Ropa" },
                    { id: "pelotas", label: "Pelotas" },
                    { id: "accesorios", label: "Accesorios" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilter("category", c.id);
                        setMobileFiltersOpen(false);
                      }}
                      className={`text-left text-xs py-2 px-3 rounded-lg ${
                        currentCategory === c.id
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tallas */}
              <div>
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white mb-2">Talla</h3>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateFilter("size", currentSize === sz ? "all" : sz)}
                      className={`h-8 rounded border text-xs font-bold ${
                        currentSize === sz
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-full bg-zinc-900 dark:bg-accent py-3 text-xs font-black uppercase text-white dark:text-black"
            >
              Aplicar y Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
