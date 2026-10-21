import { useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError, money, useFetch } from "../api";
import { categories, productSchema, stockUpdateSchema } from "../../shared/validators";
import type { LogRow, Order, Product } from "../types";
import ConfirmButton from "../components/ConfirmButton";
import ProductRow from "../components/ProductRow";

/** Layout de dos columnas: sidebar + contenido. */
export function DashLayout({
  title,
  tabs,
  tab,
  setTab,
  children,
}: {
  title: string;
  tabs: [string, string][];
  tab: string;
  setTab: (t: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-5 pt-28 md:flex-row w-full max-w-full overflow-x-hidden">
      <aside className="md:sticky md:top-28 md:h-fit md:w-64 md:shrink-0">
        <p className="mb-4 text-xs font-black uppercase tracking-widest text-accent">{title}</p>
        <nav className="flex gap-2 overflow-x-auto md:flex-col no-scrollbar">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`whitespace-nowrap rounded-2xl px-5 py-3 text-left text-xs font-black uppercase tracking-wider transition ${
                tab === k
                  ? "bg-accent text-black shadow-[0_0_15px_#CCFF00]"
                  : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main key={tab} className="animate__animated animate__fadeIn min-w-0 flex-1 pb-20 w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
    <table className="w-full">
      <thead className="border-b border-zinc-800">
        <tr>
          {head.map((h) => (
            <th key={h} className="th">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/80">{children}</tbody>
    </table>
  </div>
);

export const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
    <p className="mt-2 text-3xl font-black text-accent font-mono">{value}</p>
  </div>
);

const Empty = ({ loading }: { loading: boolean }) => (
  <p className="py-12 text-center text-xs text-zinc-500">{loading ? "Cargando datos..." : "Sin registros encontrados."}</p>
);

const fmtDate = (d: string) => new Date(d).toLocaleString("es");

// ---------- Productos (seller: propios / admin: todos) ----------
export function ProductsPanel({ admin }: { admin?: boolean }) {
  const { data, loading, reload } = useFetch<Product[]>("/products/manage/list");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  const del = async (p: Product) => {
    try {
      await api(`/products/${p.id}`, { method: "DELETE" });
      reload();
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-white">
            {admin ? "Catálogo Global" : "Mis Siluetas"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Gestión type-safe con validación Zod</p>
        </div>
        <button
          className="btn-primary !py-2.5 !px-5 text-xs"
          onClick={() =>
            setEditing({
              brand: "SportX Pro",
              category: "running",
              stock: 10,
              sizes: ["US 8", "US 9", "US 10", "US 11"],
              images: [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
              ],
            })
          }
        >
          + Nueva Silueta
        </button>
      </div>

      {!data?.length ? (
        <Empty loading={loading} />
      ) : (
        <Table head={["Silueta & SKU", "Categoría", "Precio", "Stock", ...(admin ? ["Vendedor"] : []), "Acciones"]}>
          {data.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              mode="catalog"
              admin={admin}
              onEdit={setEditing}
              onDelete={del}
            />
          ))}
        </Table>
      )}

      {editing && (
        <ProductForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Partial<Product>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial.id;
  const [f, setF] = useState({
    name: initial.name ?? "",
    brand: initial.brand ?? "SportX Pro",
    description: initial.description ?? "",
    price: initial.price ?? "",
    imagesText: (initial.images && initial.images.length > 0)
      ? initial.images.join("\n")
      : ((initial as any).imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"),
    category: initial.category ?? "running",
    sizesText: (initial.sizes && initial.sizes.length > 0)
      ? initial.sizes.join(", ")
      : "US 8, US 9, US 10, US 11",
    stock: initial.stock ?? 10,
  });

  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (k: string) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const images = f.imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const sizes = f.sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: f.name,
      brand: f.brand,
      description: f.description,
      price: Number(f.price),
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"],
      sizes: sizes.length > 0 ? sizes : ["US 9"],
      category: f.category,
      stock: Number(f.stock),
    };

    const r = productSchema.safeParse(payload);
    if (!r.success) {
      const m: Record<string, string> = {};
      r.error.issues.forEach((i) => (m[String(i.path[0])] ??= i.message));
      return setErrs(m);
    }

    try {
      await api(isEdit ? `/products/${initial.id}` : "/products", {
        method: isEdit ? "PUT" : "POST",
        body: r.data,
      });
      onSaved();
    } catch (err) {
      setErrs({ form: err instanceof ApiError ? err.message : "Error al guardar producto" });
    }
  }

  const inp = (k: keyof typeof f, label: string, type = "text") => (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
        {label}
      </label>
      <input
        className="input !py-2 text-xs"
        type={type}
        placeholder={label}
        value={f[k]}
        onChange={set(k)}
        disabled={k === "stock" && isEdit}
      />
      {errs[k] && <p className="mt-1 text-[11px] text-red-400">{errs[k]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="animate__animated animate__zoomIn animate__faster w-full max-w-lg space-y-3.5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-2xl font-black uppercase italic text-white">
          {isEdit ? "Editar" : "Crear"} Silueta
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {inp("name", "Nombre de Silueta")}
          {inp("brand", "Marca")}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Descripción Técnica
          </label>
          <textarea
            className="input h-20 text-xs"
            placeholder="Materiales, placa de carbono, tipo de amortiguación..."
            value={f.description}
            onChange={set("description")}
          />
          {errs.description && <p className="text-[11px] text-red-400">{errs.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {inp("price", "Precio ($ USD)", "number")}
          {inp("stock", isEdit ? "Stock (Modificar en Inventario)" : "Stock Inicial", "number")}
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Imágenes (Una URL por línea)
          </label>
          <textarea
            className="input h-16 text-xs font-mono"
            placeholder="https://..."
            value={f.imagesText}
            onChange={set("imagesText")}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Talles disponibles (separados por coma)
          </label>
          <input
            className="input !py-2 text-xs font-mono"
            value={f.sizesText}
            onChange={set("sizesText")}
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
            Disciplina / Categoría
          </label>
          <select className="input !py-2 text-xs" value={f.category} onChange={set("category")}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {errs.form && <p className="text-xs text-red-400 font-bold">{errs.form}</p>}

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button type="button" className="btn-ghost !py-2" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary !py-2 !px-6">Guardar Silueta</button>
        </div>
      </form>
    </div>
  );
}

// ---------- Inventario (con auditoría de actorId) ----------
export function InventoryPanel() {
  const { data, loading, reload } = useFetch<Product[]>("/products/manage/list");
  const [vals, setVals] = useState<Record<number, { change: string; reason: string }>>({});
  const [msg, setMsg] = useState("");

  async function apply(p: Product) {
    const v = vals[p.id] ?? { change: "", reason: "" };
    const r = stockUpdateSchema.safeParse(v);
    if (!r.success) return setMsg(`${p.name}: ${r.error.issues[0].message}`);

    try {
      await api(`/products/${p.id}/stock`, { method: "PATCH", body: r.data });
      setVals((x) => ({ ...x, [p.id]: { change: "", reason: "" } }));
      setMsg("");
      reload();
    } catch (e: any) {
      setMsg(`${p.name}: ${e.message}`);
    }
  }

  return (
    <>
      <h2 className="mb-2 text-3xl font-black uppercase italic text-white">Control de Stock</h2>
      <p className="text-xs text-zinc-400 mb-6">Cada ajuste genera una entrada inmutable en auditoría.</p>

      {msg && <p className="animate__animated animate__shakeX mb-4 text-xs font-bold text-red-400">{msg}</p>}

      {!data?.length ? (
        <Empty loading={loading} />
      ) : (
        <Table head={["Silueta & SKU", "Categoría", "Precio", "Stock Actual & Ajuste", "Acciones"]}>
          {data.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              mode="inventory"
              stockChange={vals[p.id]?.change ?? ""}
              stockReason={vals[p.id]?.reason ?? ""}
              onStockChangeChange={(val) =>
                setVals((x) => ({
                  ...x,
                  [p.id]: { reason: x[p.id]?.reason ?? "", change: val },
                }))
              }
              onStockReasonChange={(val) =>
                setVals((x) => ({
                  ...x,
                  [p.id]: { change: x[p.id]?.change ?? "", reason: val },
                }))
              }
              onStockSubmit={apply}
            />
          ))}
        </Table>
      )}
    </>
  );
}

// ---------- Pedidos con Talle ----------
export function OrdersPanel({ endpoint, admin }: { endpoint: string; admin?: boolean }) {
  const { data, loading, reload } = useFetch<Order[]>(endpoint);

  const setStatus = async (id: number, status: string) => {
    try {
      await api(`/orders/${id}/status`, { method: "PATCH", body: { status } });
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <>
      <h2 className="mb-2 text-3xl font-black uppercase italic text-white">
        {admin ? "Pedidos Globales" : "Mis Ventas & Pedidos"}
      </h2>
      <p className="text-xs text-zinc-400 mb-6">Seguimiento de órdenes y despachos.</p>

      {!data?.length ? (
        <Empty loading={loading} />
      ) : (
        <Table head={["# Orden", "Fecha", ...(admin ? ["Cliente"] : []), "Líneas de Compra", "Total", "Estado"]}>
          {data.map((o) => (
            <tr key={o.id}>
              <td className="td font-mono font-bold text-accent">#{o.id}</td>
              <td className="td text-xs text-zinc-400">{fmtDate(o.createdAt)}</td>
              {admin && <td className="td text-xs font-bold text-white">{o.consumerName}</td>}
              <td className="td text-xs text-zinc-300">
                {o.items.map((i) => `${i.name} [${i.size}] ×${i.quantity}`).join(", ")}
              </td>
              <td className="td font-mono font-black text-accent">{money(o.total)}</td>
              <td className="td">
                {admin ? (
                  <select
                    className="input !py-1 text-xs"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                ) : o.status === "shipped" || o.status === "delivered" ? (
                  <span className="font-bold text-accent text-xs uppercase">{o.status}</span>
                ) : (
                  <button className="btn-ghost !py-1 text-xs" onClick={() => setStatus(o.id, "shipped")}>
                    Marcar Enviado
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

// ---------- Auditoría ----------
export function LogsPanel() {
  const { data, loading } = useFetch<LogRow[]>("/inventory-logs");
  return (
    <>
      <h2 className="mb-2 text-3xl font-black uppercase italic text-white">Auditoría de Inventario</h2>
      <p className="text-xs text-zinc-400 mb-6">Registro detallado de cambios de stock por usuario y pedido.</p>

      {!data?.length ? (
        <Empty loading={loading} />
      ) : (
        <Table head={["Fecha y Hora", "Silueta", "Variación", "Motivo Registrado", "Actor"]}>
          {data.map((l) => (
            <tr key={l.id}>
              <td className="td text-xs text-zinc-400 font-mono">{fmtDate(l.createdAt)}</td>
              <td className="td text-xs font-bold text-white">{l.product}</td>
              <td className={`td font-mono font-black text-xs ${l.change > 0 ? "text-accent" : "text-red-400"}`}>
                {l.change > 0 ? `+${l.change}` : l.change}
              </td>
              <td className="td text-xs text-zinc-300">{l.reason}</td>
              <td className="td text-xs text-zinc-400 font-semibold">{l.user ?? "Sistema"}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
