import React from "react";
import { useLocation, Link } from "react-router-dom";
import { money, useFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types";
import { Table } from "./shared";
import { ShoppingBag, CheckCircle2, Package, MapPin, ArrowRight } from "lucide-react";

export default function ConsumerDashboard() {
  const { user } = useAuth();
  const ordered = (useLocation().state as { ordered?: boolean } | null)?.ordered;
  const { data, loading } = useFetch<Order[]>("/orders/mine");

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28">
      {/* Saludo y Avatar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-accent">ÁREA DE ATLETA</span>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white mt-1">
            HOLA, <span className="text-accent">{user?.name}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Cuenta: {user?.email} • Nivel Élite</p>
        </div>

        <Link to="/#catalogo" className="btn-primary !py-3 !px-6 text-xs inline-flex items-center gap-2">
          <span>Explorar Catálogo</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {ordered && (
        <div className="animate__animated animate__bounceIn mt-8 flex items-center gap-4 rounded-3xl border border-accent bg-accent/15 p-6 text-white backdrop-blur-md">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-black shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase italic text-accent">¡Orden Recibida con Éxito!</h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Hemos reservado tus siluetas y enviado la confirmación a tu correo. El almacén central está preparando el despacho.
            </p>
          </div>
        </div>
      )}

      {/* Historial de Pedidos */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tight">
            Mis Pedidos & Despachos
          </h2>
        </div>

        {!data?.length ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <p className="text-sm font-bold text-zinc-400">
              {loading ? "Cargando tus órdenes..." : "Aún no tienes pedidos registrados."}
            </p>
            <Link to="/#catalogo" className="mt-4 inline-block text-xs font-black text-accent hover:underline uppercase">
              Ver Lanzamientos Recientes →
            </Link>
          </div>
        ) : (
          <Table head={["# Orden", "Fecha", "Siluetas y Talles", "Dirección", "Total", "Estado"]}>
            {data.map((o) => (
              <tr key={o.id}>
                <td className="td font-mono font-bold text-accent">#{o.id}</td>
                <td className="td text-xs text-zinc-400">{new Date(o.createdAt).toLocaleDateString("es")}</td>
                <td className="td text-xs text-zinc-200">
                  <div className="space-y-1">
                    {o.items.map((i, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{i.name}</span>
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-accent">
                          {i.size}
                        </span>
                        <span className="text-zinc-500 font-mono">×{i.quantity}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="td text-xs text-zinc-400 max-w-xs truncate" title={o.shippingAddress}>
                  {o.shippingAddress || "Entrega estándar"}
                </td>
                <td className="td font-mono font-black text-accent">{money(o.total)}</td>
                <td className="td">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      o.status === "delivered" || o.status === "shipped"
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : o.status === "cancelled"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
