import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, ShieldCheck } from "lucide-react";
import PosPanel from "../dashboards/PosPanel";
import { useAuth } from "../context/AuthContext";

export default function PosTerminalPage() {
  const { user } = useAuth();

  if (user?.role !== "admin" && user?.role !== "seller") {
    return (
      <div className="mx-auto max-w-md pt-40 px-5 text-center">
        <p className="text-zinc-400">Acceso restringido. Esta terminal de Punto de Venta es exclusiva para empleados y administradores.</p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">Iniciar Sesión</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-24 pb-20 w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Volver al Panel Principal</span>
        </Link>
      </div>

      <PosPanel />
    </div>
  );
}
