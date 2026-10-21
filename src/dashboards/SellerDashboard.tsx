import { useState } from "react";
import { DashLayout, InventoryPanel, LogsPanel, OrdersPanel, ProductsPanel } from "./shared";
import PosPanel from "./PosPanel";
import ProjectsPanel from "./ProjectsPanel";

export default function SellerDashboard() {
  const [tab, setTab] = useState("pos");
  return (
    <DashLayout title="Panel de Empleado / Vendedor" tab={tab} setTab={setTab}
      tabs={[
        ["pos", "Punto de Venta (POS)"],
        ["projects", "Proyectos internos"],
        ["products", "Mis productos"],
        ["inventory", "Inventario"],
        ["orders", "Pedidos"],
        ["logs", "Historial de stock"]
      ]}>
      {tab === "pos" && <PosPanel />}
      {tab === "projects" && <ProjectsPanel />}
      {tab === "products" && <ProductsPanel />}
      {tab === "inventory" && <InventoryPanel />}
      {tab === "orders" && <OrdersPanel endpoint="/orders/seller" />}
      {tab === "logs" && <LogsPanel />}
    </DashLayout>
  );
}
