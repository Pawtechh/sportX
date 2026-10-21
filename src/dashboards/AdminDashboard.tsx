import { useState } from "react";
import { api, money, useFetch } from "../api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";
import { DashLayout, InventoryPanel, LogsPanel, OrdersPanel, ProductsPanel, Stat, Table } from "./shared";
import ConfirmButton from "../components/ConfirmButton";
import PosPanel from "./PosPanel";
import ProjectsPanel from "./ProjectsPanel";

interface Stats { revenue: number; orders: number; users: number; products: number; lowStock: number; daily: { day: string; total: string }[] }

function Overview() {
  const { data: s } = useFetch<Stats>("/admin/stats");
  if (!s) return <p className="text-zinc-500">Cargando…</p>;
  const max = Math.max(1, ...s.daily.map((d) => Number(d.total)));
  return (
    <>
      <h2 className="mb-6 text-3xl font-black uppercase italic">Resumen</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Ingresos" value={money(s.revenue)} /><Stat label="Pedidos" value={s.orders} />
        <Stat label="Usuarios" value={s.users} /><Stat label="Stock bajo" value={s.lowStock} />
      </div>
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-500">Ventas últimos 7 días</p>
        {s.daily.length === 0 ? <p className="text-zinc-500">Sin ventas recientes.</p> : (
          <div className="flex h-48 items-end gap-3">
            {s.daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-zinc-400">{money(d.total)}</span>
                <div className="w-full origin-bottom animate-[grow_.8s_ease-out] rounded-t-lg bg-accent" style={{ height: `${(Number(d.total) / max) * 100}%` }} />
                <span className="text-xs text-zinc-500">{d.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>
    </>
  );
}

function UsersPanel() {
  const { user: me } = useAuth();
  const { data, loading, reload } = useFetch<User[]>("/admin/users");
  const [pendingRole, setPendingRole] = useState<{ u: User; role: string } | null>(null);

  const act = async (path: string, body: unknown) => {
    try {
      await api(path, { method: "PATCH", body });
      reload();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <>
      <h2 className="mb-6 text-3xl font-black uppercase italic">Usuarios</h2>
      {!data ? (
        <p className="text-zinc-500">{loading ? "Cargando…" : "Sin datos."}</p>
      ) : (
        <Table head={["Nombre", "Email", "Rol", "Estado", "Acciones"]}>
          {data.map((u) => (
            <tr key={u.id}>
              <td className="td font-bold">{u.name}</td>
              <td className="td">{u.email}</td>
              <td className="td">
                <select
                  disabled={u.id === me?.id}
                  className="input !w-32 !py-1"
                  value={u.role}
                  onChange={(e) => setPendingRole({ u, role: e.target.value })}
                >
                  {["admin", "seller", "consumer"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className={`td font-bold ${u.suspended ? "text-red-400" : "text-accent"}`}>
                {u.suspended ? "Suspendido" : "Activo"}
              </td>
              <td className="td">
                <ConfirmButton
                  title={u.suspended ? "Reactivar Usuario" : "Suspender Usuario"}
                  description={
                    u.suspended
                      ? `¿Estás seguro de reactivar la cuenta de ${u.name}? Podrá volver a operar en el sistema.`
                      : `¿Estás seguro de suspender a ${u.name}? El usuario perderá el acceso y no podrá iniciar sesión.`
                  }
                  confirmText={u.suspended ? "Reactivar Cuenta" : "Suspender Cuenta"}
                  variant={u.suspended ? "warning" : "danger"}
                  disabled={u.id === me?.id}
                  onConfirm={() => act(`/admin/users/${u.id}/suspend`, { suspended: !u.suspended })}
                >
                  <button
                    disabled={u.id === me?.id}
                    className={`btn-ghost !py-1 disabled:opacity-30 ${
                      u.suspended ? "hover:!border-emerald-500 hover:!text-emerald-400" : "hover:!border-red-500 hover:!text-red-400"
                    }`}
                  >
                    {u.suspended ? "Reactivar" : "Suspender"}
                  </button>
                </ConfirmButton>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Diálogo de confirmación para cambio de rol */}
      {pendingRole && (
        <ConfirmButton
          open={!!pendingRole}
          onOpenChange={(isOpen) => {
            if (!isOpen) setPendingRole(null);
          }}
          title="Confirmar Cambio de Rol"
          description={`¿Deseas cambiar el rol de ${pendingRole.u.name} a "${pendingRole.role}"? Esta acción alterará sus permisos en el sistema.`}
          confirmText="Confirmar Rol"
          variant="warning"
          onConfirm={async () => {
            await act(`/admin/users/${pendingRole.u.id}/role`, { role: pendingRole.role });
            setPendingRole(null);
          }}
        />
      )}
    </>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  return (
    <DashLayout title="Administración" tab={tab} setTab={setTab}
      tabs={[
        ["overview", "Resumen"],
        ["pos", "Punto de Venta (POS)"],
        ["projects", "Proyectos internos"],
        ["users", "Usuarios"],
        ["products", "Productos"],
        ["inventory", "Inventario global"],
        ["orders", "Pedidos"],
        ["logs", "Auditoría"],
      ]}>
      {tab === "overview" && <Overview />}
      {tab === "pos" && <PosPanel />}
      {tab === "projects" && <ProjectsPanel />}
      {tab === "users" && <UsersPanel />}
      {tab === "products" && <ProductsPanel admin />}
      {tab === "inventory" && <InventoryPanel />}
      {tab === "orders" && <OrdersPanel endpoint="/orders" admin />}
      {tab === "logs" && <LogsPanel />}
    </DashLayout>
  );
}
