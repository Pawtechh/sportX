import React, { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, ApiError, money } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { checkoutSchema } from "../../shared/validators";
import { ShimmerButton } from "../components/magic";
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Lock,
  Scale,
  MapPin,
  Clock,
  Store,
  Zap,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  ARGENTINE_PROVINCES,
  PICKUP_STORES,
  calculateShippingQuote,
  getCategoryWeightKg,
  type ShippingMethodId,
} from "../data/provinces";

export default function Checkout() {
  const { user } = useAuth();
  const { lines, total, clear } = useCart();
  const nav = useNavigate();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>("standard");
  const [pickupStoreId, setPickupStoreId] = useState(PICKUP_STORES[0].id);
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(ARGENTINE_PROVINCES[0].name);
  const [city, setCity] = useState("Palermo");
  const [postalCode, setPostalCode] = useState(ARGENTINE_PROVINCES[0].defaultPostalCode);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "sportx">("card");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setProvince(selected);
    const found = ARGENTINE_PROVINCES.find((p) => p.name === selected);
    if (found) {
      setPostalCode(found.defaultPostalCode);
      if (found.id === "caba") setCity("CABA");
      else if (city === "Palermo" || city === "CABA") setCity("");
    }
  };

  if (!user) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;

  const quote = calculateShippingQuote({
    provinceName: province,
    postalCode,
    method: shippingMethod,
    subtotal: total,
    items: lines.map((l) => ({
      category: l.product.category,
      quantity: l.quantity,
    })),
  });

  const finalTotal = Number((total + quote.finalCost).toFixed(2));
  const selectedStore = PICKUP_STORES.find((s) => s.id === pickupStoreId) || PICKUP_STORES[0];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (shippingMethod !== "pickup" && !province) {
      return setError("Por favor selecciona tu provincia de entrega");
    }

    const fullAddress =
      shippingMethod === "pickup"
        ? `RETIRO EN SUCURSAL: ${selectedStore.name} (${selectedStore.address})`
        : `${address.trim()}, ${city.trim() ? city.trim() + ", " : ""}${province} (CP: ${postalCode.trim()}) · Zona ${quote.zone} · Operador: ${quote.carrier} · Peso: ${quote.totalWeightKg}kg`;

    const parsed = checkoutSchema.safeParse({
      shippingAddress: fullAddress,
      shippingCost: quote.finalCost,
      shippingMethod,
      items: lines.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
        size: l.size,
      })),
    });

    if (!parsed.success) {
      return setError(parsed.error.issues[0]?.message || "Datos incompletos");
    }

    setBusy(true);
    setError("");

    try {
      await api("/orders", { method: "POST", body: parsed.data });
      clear();
      nav("/dashboard", { state: { ordered: true } });
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err.message || "Error procesando el pedido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Seguir explorando</span>
      </Link>

      <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white mb-10">
        FINALIZAR <span className="px-3 py-0.5 rounded-xl bg-neutral-900 text-[#CCFF00]">ORDEN</span>
      </h1>

      {lines.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-16 text-center">
          <p className="text-xl font-black uppercase italic text-zinc-300">
            Tu bolsa de compra está vacía
          </p>
          <Link to="/#catalogo" className="btn-primary mt-6 inline-flex">
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ================= Formulario de Logística, Destino y Pago ================= */}
          <form onSubmit={submit} className="lg:col-span-7 space-y-8">
            {/* Paso 1: Modalidad Logística */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white">
                  <Truck className="h-4 w-4 text-emerald-400" />
                  <span>1. Modalidad de Envío & Cotización por Zona/Peso</span>
                </div>
                <span className="rounded-full bg-neutral-900 px-2.5 py-1 font-mono text-xs font-bold text-[#CCFF00]">
                  Peso Bolsa: {quote.totalWeightKg} kg
                </span>
              </div>

              {/* Selector de Modalidad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "standard" as const,
                    title: "Estándar Regional",
                    sub: "Por distancia + peso",
                    icon: Truck,
                  },
                  {
                    id: "express" as const,
                    title: "SportX Express",
                    sub: "Prioridad Aérea / Flash",
                    icon: Zap,
                  },
                  {
                    id: "pickup" as const,
                    title: "Retiro en Tienda",
                    sub: "Gratis en 2 horas",
                    icon: Store,
                  },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = shippingMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setShippingMethod(m.id)}
                      className={`rounded-2xl p-3.5 text-left border transition-all flex flex-col justify-between ${
                        active
                          ? "bg-neutral-900 border-[#CCFF00] text-white shadow-md"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`h-4 w-4 ${active ? "text-[#CCFF00]" : "text-zinc-500"}`} />
                        {active && <CheckCircle2 className="h-4 w-4 text-[#CCFF00]" />}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-white">{m.title}</div>
                        <div className="text-xs text-zinc-400 mt-0.5">{m.sub}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Si elige Retiro en Sucursal */}
              {shippingMethod === "pickup" ? (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Selecciona la Flagship Store para retirar sin cargo:
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {PICKUP_STORES.map((st) => (
                      <label
                        key={st.id}
                        onClick={() => setPickupStoreId(st.id)}
                        className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                          pickupStoreId === st.id
                            ? "border-emerald-500 bg-zinc-950"
                            : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-black uppercase text-white flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{st.name}</span>
                          </div>
                          <p className="text-xs text-zinc-400">{st.address}</p>
                          <p className="text-xs text-emerald-400 font-semibold">
                            {st.eta} · {st.hours}
                          </p>
                        </div>
                        <span className="rounded-lg bg-emerald-950 border border-emerald-700/50 px-2.5 py-1 font-mono text-xs font-black text-emerald-300">
                          GRATIS
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                /* Formulario de Provincia, CP y Calle con Cálculo de Tarifa Real */
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Provincia de Destino *
                      </label>
                      <select
                        required
                        value={province}
                        onChange={handleProvinceChange}
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                          Código Postal (CPA)
                        </label>
                        <span className="text-xs font-mono text-emerald-400">
                          Zona {quote.zone}
                        </span>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder="Ej: 1425"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="input font-mono text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Ciudad / Localidad
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: Palermo / Rosario / Córdoba Capital"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="input text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                        Calle, Altura y Piso/Depto
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Ej: Av. del Libertador 4500, 4B"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Tarjeta Técnica de Desglose Logístico */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-emerald-400" />
                        Cálculo Técnico de Tarifa Logística
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{quote.carrier}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-zinc-400">
                      <div>
                        Distancia desde CD CABA:{" "}
                        <strong className="text-white font-mono">~{quote.distanceKm} km</strong>
                      </div>
                      <div>
                        Tiempo estimado:{" "}
                        <strong className="text-white">{quote.eta}</strong>
                      </div>
                      <div>
                        Tarifa Base ({quote.zone}):{" "}
                        <strong className="text-white font-mono">{money(quote.baseCost)}</strong>
                      </div>
                      <div>
                        Cargo por Peso ({quote.totalWeightKg} kg):{" "}
                        <strong className="text-white font-mono">+{money(quote.weightCost)}</strong>
                      </div>
                    </div>

                    {quote.postalAdjustment > 0 && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Adicional distribución localidad interior (CP {postalCode}):</span>
                        <span className="font-mono text-white">+{money(quote.postalAdjustment)}</span>
                      </div>
                    )}

                    {quote.expressSurcharge > 0 && (
                      <div className="flex justify-between text-amber-400">
                        <span>Prioridad Aérea / Despacho Express (+45%):</span>
                        <span className="font-mono">+{money(quote.expressSurcharge)}</span>
                      </div>
                    )}

                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Bonificación por compra superior a {money(quote.freeThreshold)}:</span>
                        <span className="font-mono">-{money(quote.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Paso 2: Método de Pago */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>2. Método de Pago</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "card", label: "Tarjeta de Crédito / Débito" },
                  { id: "apple", label: "Apple / Google Pay" },
                  { id: "sportx", label: "Transferencia / QR" },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`rounded-2xl p-3 text-xs font-bold text-center transition-all border ${
                      paymentMethod === m.id
                        ? "bg-neutral-900 text-[#CCFF00] border-[#CCFF00] shadow-md font-black"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Procesamiento SSL 256-bit y reserva inmediata de stock en almacén</span>
                </div>
                <span className="font-mono text-emerald-400 text-xs font-bold">VERIFICADO</span>
              </div>
            </div>

            {error && (
              <div className="animate__animated animate__shakeX rounded-2xl bg-red-500/10 border border-red-500/40 p-4 text-xs font-bold text-red-400">
                {error}
              </div>
            )}

            <ShimmerButton
              type="submit"
              disabled={busy}
              className="w-full !py-4 text-sm font-black"
            >
              {busy
                ? "Confirmando Stock y Despacho..."
                : `Pagar y Confirmar Pedido • ${money(finalTotal)}`}
            </ShimmerButton>
          </form>

          {/* ================= Resumen de Orden y Desglose de Peso/Envío ================= */}
          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 space-y-6 sticky top-28">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Resumen de la Bolsa ({quote.totalItems})
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  Peso total: {quote.totalWeightKg} kg
                </span>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {lines.map(({ product: p, quantity, size }) => {
                  const itemWeight = Number((getCategoryWeightKg(p.category) * quantity).toFixed(2));
                  return (
                    <div key={`${p.id}-${size}`} className="flex items-center gap-4">
                      <img
                        src={
                          p.images?.[0] ||
                          (p as any).imageUrl ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                        }
                        alt={p.name}
                        className="h-16 w-16 rounded-xl object-cover bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                        <p className="text-xs text-zinc-400">
                          Talle: <span className="text-white font-bold">{size}</span> × {quantity} u.
                        </p>
                        <p className="text-xs font-mono text-zinc-500">Peso est.: {itemWeight} kg</p>
                      </div>
                      <span className="rounded-lg bg-neutral-900 px-2.5 py-1 font-mono text-xs font-black text-[#CCFF00]">
                        {money(Number(p.price) * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 border-t border-zinc-800 pt-4 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal Productos</span>
                  <span className="font-mono text-white font-bold">{money(total)}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>
                    Costo Logístico ({shippingMethod === "pickup" ? "Pick-Up" : quote.zone})
                  </span>
                  <span className="font-mono text-white">
                    {quote.rawCost === 0 ? "$0.00" : money(quote.rawCost)}
                  </span>
                </div>

                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Bonificación Envío (&gt; {money(quote.freeThreshold)})</span>
                    <span className="font-mono">-{money(quote.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-300 font-semibold pt-1 border-t border-zinc-800/60">
                  <span>Envío Final a Pagar</span>
                  <span className="font-mono font-black text-emerald-400">
                    {quote.isFree ? "GRATIS ($0.00)" : money(quote.finalCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-base font-black text-white pt-3 border-t border-zinc-800">
                  <span>Total Final</span>
                  <span className="rounded-xl bg-neutral-900 px-3.5 py-1.5 font-mono text-[#CCFF00] text-xl">
                    {money(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3.5 text-xs text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Plazo de Entrega Estimado: {quote.eta}</span>
                </div>
                <p className="text-xs text-zinc-500">{quote.formulaSummary}</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
