import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../api";
import { X, Trash2, ArrowRight, ShieldCheck, Truck, Scale } from "lucide-react";
import { ShimmerButton } from "./magic";
import { ARGENTINE_PROVINCES, calculateShippingQuote } from "../data/provinces";

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, total } = useCart();
  const nav = useNavigate();
  const [selectedProv, setSelectedProv] = useState(ARGENTINE_PROVINCES[0].name);

  const FREE_SHIPPING_THRESHOLD = 200;
  const progressToFreeShipping = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);

  const quote = calculateShippingQuote({
    provinceName: selectedProv,
    method: "standard",
    subtotal: total,
    items: lines.map((l) => ({
      category: l.product.category,
      quantity: l.quantity,
    })),
  });

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden ${open ? "" : "pointer-events-none"}`}>
      {/* Fondo oscuro con fade */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer deslizante */}
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cabecera del Carrito */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 p-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Tu Bolsa</h2>
            <span className="rounded-full bg-neutral-900 border border-zinc-700 px-2.5 py-0.5 text-xs font-bold text-[#CCFF00]">
              {lines.reduce((s, l) => s + l.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Envío Gratis */}
        <div className="bg-zinc-900/60 px-6 py-3 border-b border-zinc-800/60">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Truck className="h-3.5 w-3.5 text-emerald-400" />
              {remainingForFreeShipping > 0
                ? `Faltan ${money(remainingForFreeShipping)} para Envío Bonificado`
                : "¡Calificas para Envío Estándar Bonificado!"}
            </span>
            <span className="font-mono text-emerald-400 text-xs">{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#CCFF00] transition-all duration-300 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Lista de Productos en el Carrito */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-4">
                👟
              </div>
              <p className="text-lg font-black uppercase italic text-zinc-300">Tu bolsa está vacía</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Explora las siluetas de élite y equipamiento de alta competencia.
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  nav("/#catalogo");
                }}
                className="mt-6 rounded-full bg-[#CCFF00] px-6 py-2.5 text-xs font-black uppercase text-black hover:brightness-95 transition"
              >
                Ver Colección
              </button>
            </div>
          ) : (
            lines.map(({ product: p, quantity, size }, idx) => (
              <div
                key={`${p.id}-${size}`}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="animate__animated animate__fadeInRight animate__faster flex gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 hover:border-zinc-700 transition"
              >
                <img
                  src={p.images?.[0] || (p as any).imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                  alt={p.name}
                  className="h-24 w-24 rounded-xl object-cover bg-zinc-800 shrink-0"
                />

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{p.brand}</p>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                      <p className="text-xs font-mono text-zinc-400 mt-0.5">
                        Talle: <span className="text-white font-bold">{size}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => remove(p.id, size)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Stepper de cantidad */}
                    <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs">
                      <button
                        onClick={() => (quantity === 1 ? remove(p.id, size) : setQty(p.id, size, quantity - 1))}
                        className="text-zinc-400 hover:text-white px-1 font-bold"
                      >
                        −
                      </button>
                      <span className="w-4 text-center font-mono font-bold text-white">{quantity}</span>
                      <button
                        onClick={() => setQty(p.id, size, quantity + 1)}
                        className="text-zinc-400 hover:text-white px-1 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="rounded-md bg-neutral-900 px-2 py-0.5 font-mono text-xs font-black text-[#CCFF00]">
                      {money(Number(p.price) * quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen, Simulador de Zona y Checkout */}
        {lines.length > 0 && (
          <div className="space-y-4 border-t border-zinc-800 bg-zinc-950 p-6">
            {/* Selector Rápido de Provincia para Cotizar Envío */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-emerald-400" />
                  Cotizar Envío por Destino:
                </span>
                <span className="font-mono text-xs text-zinc-400">{quote.totalWeightKg} kg</span>
              </div>
              <select
                value={selectedProv}
                onChange={(e) => setSelectedProv(e.target.value)}
                aria-label="Provincia para estimar envío"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white outline-none"
              >
                {ARGENTINE_PROVINCES.map((p) => (
                  <option key={p.id} value={p.name} className="bg-zinc-900 text-white">
                    {p.name} ({p.zone} · ~{p.distanceKm} km)
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-400">
                {quote.formulaSummary} · {quote.eta}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal Productos</span>
                <span className="font-mono text-white font-bold">{money(total)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Envío ({quote.zone})</span>
                <span className="font-mono font-bold text-emerald-400">
                  {quote.isFree ? "BONIFICADO ($0.00)" : money(quote.finalCost)}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                <span>Total Estimado</span>
                <span className="rounded-lg bg-neutral-900 px-2.5 py-1 font-mono text-[#CCFF00]">
                  {money(total + quote.finalCost)}
                </span>
              </div>
            </div>

            <ShimmerButton
              onClick={() => {
                setOpen(false);
                nav("/checkout");
              }}
              className="w-full !py-3.5 flex items-center justify-center gap-2"
            >
              <span>Continuar al Pago</span>
              <ArrowRight className="h-4 w-4" />
            </ShimmerButton>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tarifa calculada por distancia provincial y peso volumétrico</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
