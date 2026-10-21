import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Store,
  MapPin,
  Clock,
  ArrowLeft,
  Search,
  PackageCheck,
  Scale,
  Calculator,
  Zap,
} from "lucide-react";
import {
  ARGENTINE_PROVINCES,
  PICKUP_STORES,
  calculateShippingQuote,
  type ShippingMethodId,
} from "../data/provinces";
import { money } from "../api";

export default function ShippingPage() {
  const [simProvince, setSimProvince] = useState(ARGENTINE_PROVINCES[0].name);
  const [simMethod, setSimMethod] = useState<ShippingMethodId>("standard");
  const [simShoes, setSimShoes] = useState(1);
  const [simApparel, setSimApparel] = useState(1);
  const [simBalls, setSimBalls] = useState(0);
  const [simSubtotal, setSimSubtotal] = useState(145);

  const simQuote = calculateShippingQuote({
    provinceName: simProvince,
    method: simMethod,
    subtotal: simSubtotal,
    items: [
      { category: "running", quantity: simShoes },
      { category: "ropa", quantity: simApparel },
      { category: "pelotas", quantity: simBalls },
    ],
  });

  const shippingMethods = [
    {
      id: "standard",
      badge: "Cálculo Regional + Peso",
      badgeColor: "bg-zinc-800 text-zinc-200",
      title: "Envío Estándar Nacional",
      time: "24h (AMBA) a 6 días (Patagonia)",
      cost: "Tarifa Base Zona + ($/kg Volumétrico) · Gratis > $200",
      description:
        "Cotización dinámica según distancia en kilómetros desde el Centro Logístico Palermo y el peso volumétrico de los artículos en tu bolsa.",
    },
    {
      id: "express",
      badge: "Prioridad Aérea / Flash",
      badgeColor: "bg-neutral-900 text-[#CCFF00]",
      title: "SportX Express 24-48h",
      time: "Same-Day AMBA / 48h Aéreo Interior",
      cost: "+45% Prioridad sobre tarifa regional",
      description:
        "Despacho preferencial en flota dedicada para CABA/GBA y carga aérea prioritaria para capitales provinciales.",
    },
    {
      id: "retiro",
      badge: "100% Bonificado",
      badgeColor: "bg-emerald-950 text-emerald-300 border border-emerald-700/40",
      title: "Pick Up / Retiro en Tienda",
      time: "Listo en 2 horas hábiles",
      cost: "$0.00 Sin cargo logístico",
      description:
        "Reserva inmediata sobre el stock físico de nuestras Flagship Stores en Palermo Soho, Unicenter y Alto Palermo.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la tienda</span>
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-4">
          <Truck className="h-3.5 w-3.5" />
          <span>Motor Logístico por Distancia & Peso Volumétrico</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          ENVÍOS & <span className="px-3 py-0.5 rounded-xl bg-neutral-900 text-[#CCFF00]">TARIFAS REALES</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl">
          En SportX no usamos costos genéricos: cada envío se calcula en tiempo real según la distancia provincial desde nuestro Centro de Distribución, el peso volumétrico de cada producto y la modalidad elegida.
        </p>
      </div>

      {/* ================= Simulador Interactivo de Tarifas de Envío ================= */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-10 mb-16 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              <Calculator className="h-4 w-4" />
              <span>Simulador Logístico en Tiempo Real</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white">
              COTIZADOR DE ENVÍO POR ZONA Y PESO
            </h2>
          </div>
          <span className="rounded-xl bg-neutral-900 px-3 py-1.5 font-mono text-xs font-bold text-[#CCFF00]">
            Centro de Despacho: Palermo, CABA (KM 0)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controles del Simulador */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Provincia de Destino
                </label>
                <select
                  value={simProvince}
                  onChange={(e) => setSimProvince(e.target.value)}
                  className="input cursor-pointer text-xs sm:text-sm"
                >
                  {ARGENTINE_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name} className="bg-zinc-900 text-white">
                      {p.name} ({p.zone} · ~{p.distanceKm} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Modalidad de Despacho
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "standard" as const, label: "Estándar" },
                    { id: "express" as const, label: "Express" },
                    { id: "pickup" as const, label: "Pick-Up" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSimMethod(m.id)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                        simMethod === m.id
                          ? "bg-neutral-900 border-[#CCFF00] text-[#CCFF00] font-black"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulador de Peso por Tipo de Producto */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-emerald-400" />
                  Composición del Paquete (Peso Volumétrico)
                </span>
                <span className="font-mono text-emerald-400">{simQuote.totalWeightKg} kg totales</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <div className="text-xs font-bold text-white">Calzado (0.95 kg)</div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setSimShoes(Math.max(0, simShoes - 1))}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white text-xs">{simShoes}</span>
                    <button
                      type="button"
                      onClick={() => setSimShoes(simShoes + 1)}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <div className="text-xs font-bold text-white">Ropa (0.35 kg)</div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setSimApparel(Math.max(0, simApparel - 1))}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white text-xs">{simApparel}</span>
                    <button
                      type="button"
                      onClick={() => setSimApparel(simApparel + 1)}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <div className="text-xs font-bold text-white">Pelotas (0.65 kg)</div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button"
                      onClick={() => setSimBalls(Math.max(0, simBalls - 1))}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-white text-xs">{simBalls}</span>
                    <button
                      type="button"
                      onClick={() => setSimBalls(simBalls + 1)}
                      className="h-6 w-6 rounded bg-zinc-800 text-white font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-zinc-400">Valor declarado de la compra ($):</span>
                <div className="flex gap-2">
                  {[120, 180, 240].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimSubtotal(val)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${
                        simSubtotal === val
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-zinc-900 text-zinc-300 border-zinc-800"
                      }`}
                    >
                      ${val} {val >= 200 ? "(Bonifica)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resultado Desglosado */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-400 block">
                  Zona {simQuote.zone} · ~{simQuote.distanceKm} km
                </span>
                <h3 className="text-lg font-black uppercase text-white">{simQuote.province.name}</h3>
              </div>
              <span className="rounded-xl bg-neutral-900 px-3 py-1.5 font-mono text-xl font-black text-[#CCFF00]">
                {simQuote.isFree ? "GRATIS" : money(simQuote.finalCost)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Operador Logístico Asignado:</span>
                <span className="font-bold text-white">{simQuote.carrier}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tiempo Estimado (ETA):</span>
                <span className="font-bold text-emerald-400">{simQuote.eta}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tarifa Base Regional ({simQuote.zone}):</span>
                <span className="font-mono text-white">{money(simQuote.baseCost)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Adicional por Peso ({simQuote.totalWeightKg} kg):</span>
                <span className="font-mono text-white">+{money(simQuote.weightCost)}</span>
              </div>
              {simQuote.expressSurcharge > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Recargo Prioridad Express (+45%):</span>
                  <span className="font-mono">+{money(simQuote.expressSurcharge)}</span>
                </div>
              )}
              {simQuote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Bonificación por compra &gt; $200:</span>
                  <span className="font-mono">-{money(simQuote.discountAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Métodos de Envío */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {shippingMethods.map((m) => (
          <div
            key={m.id}
            id={m.id}
            className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition"
          >
            <div className="space-y-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${m.badgeColor}`}
              >
                {m.badge}
              </span>
              <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">
                {m.title}
              </h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-zinc-300 font-semibold">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>{m.time}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <PackageCheck className="h-4 w-4" />
                  <span>{m.cost}</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed pt-2">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Retiro en Tienda SportX */}
      <div
        id="retiro"
        className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10 mb-16"
      >
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Store className="h-4 w-4" />
          <span>Locales Habilitados para Pick-Up Inmediato</span>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-4">
          RETIRO EN TIENDAS SPORTX ($0)
        </h2>
        <p className="text-zinc-400 text-sm max-w-2xl mb-8">
          Selecciona retiro en tienda al momento de confirmar tu pedido o presenta tu número de orden en caja.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PICKUP_STORES.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-2"
            >
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>{s.name}</span>
              </div>
              <p className="text-xs text-zinc-400">{s.address}</p>
              <span className="text-xs text-zinc-500 block pt-2 border-t border-zinc-800">
                {s.hours} · {s.eta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Seguimiento de Guía */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Search className="h-4 w-4" />
            <span>Rastreo en Tiempo Real</span>
          </div>
          <h3 className="text-3xl font-black italic uppercase tracking-tight text-white">
            ¿YA TIENES UN PEDIDO EN CAMINO?
          </h3>
          <p className="text-sm text-zinc-300">
            Ingresa con tu cuenta en el panel para ver el estado de empaque, el desglose de peso/zona y la guía de seguimiento.
          </p>
        </div>

        <Link to="/dashboard" className="btn-primary flex-shrink-0">
          Ver Estado de mi Pedido →
        </Link>
      </div>
    </div>
  );
}
