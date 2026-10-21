import React from "react";
import { Link } from "react-router-dom";
import { 
  RotateCcw, 
  ShieldCheck, 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  AlertTriangle,
  CreditCard,
  Sparkles
} from "lucide-react";

export default function ReturnsPage() {
  const steps = [
    {
      step: "01",
      title: "Inicia la Solicitud",
      desc: "Ve a tu cuenta en 'Mis Pedidos', selecciona el producto y el motivo de cambio (talle, color o devolución).",
    },
    {
      step: "02",
      title: "Empaca el Producto",
      desc: "Coloca el artículo en su caja original, sin signos de uso exterior y con todas las etiquetas adheridas.",
    },
    {
      step: "03",
      title: "Despacho Bonificado",
      desc: "Te enviaremos una etiqueta prepaga de Correo/Andreani. Solo déjalo en la sucursal más cercana sin pagar nada.",
    },
    {
      step: "04",
      title: "Reembolso o Nuevo Envío",
      desc: "Apenas arriba al centro de distribución, te enviamos el nuevo talle o acreditamos tu dinero inmediatamente.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la tienda</span>
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Garantía Oficial SportX</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          CAMBIOS & <span className="text-accent">DEVOLUCIONES</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl">
          Queremos que entrenes con la máxima comodidad. Si el producto no es perfecto para ti, lo resolvemos sin complicaciones.
        </p>
      </div>

      {/* Banner 30 días de Garantía */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-8 sm:p-12 mb-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-accent uppercase">
              <Sparkles className="h-4 w-4" /> 30 Días Corridos
            </span>
            <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white">
              GARANTÍA DE SATISFACCIÓN TOTAL
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Dispones de 30 días a partir del momento en que recibes tu paquete para probarte el calzado o indumentaria en interiores y decidir si es lo que buscabas. El primer cambio de talle tiene envío bonificado por SportX.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end">
            <Link to="/dashboard" className="btn-primary w-full sm:w-auto text-center">
              Iniciar Devolución Online →
            </Link>
          </div>
        </div>
      </div>

      {/* Paso a Paso */}
      <div className="mb-20">
        <h3 className="text-xs font-black uppercase tracking-widest text-accent mb-3">Paso a Paso</h3>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-8">
          ¿CÓMO FUNCIONA EL PROCESO?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black italic text-accent font-mono block mb-3">{s.step}</span>
                <h4 className="text-lg font-bold text-white mb-2">{s.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Políticas de Cambio y Reembolsos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Políticas (#politicas) */}
        <div id="politicas" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <span>Condiciones para Cambios</span>
          </div>

          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>El producto debe estar sin uso en la calle o exteriores y en condiciones impecables.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>Debe conservar todas sus etiquetas originales colocadas y la caja oficial intacta.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
              <span>En caso de indumentaria íntima o calcetines, por razones de higiene no admiten cambio una vez abierto el blister.</span>
            </li>
          </ul>
        </div>

        {/* Reembolsos (#reembolsos) */}
        <div id="reembolsos" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
            <CreditCard className="h-5 w-5 text-accent" />
            <span>Tiempos de Reembolso</span>
          </div>

          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
              <span><strong>Mercado Pago / Dinero en Cuenta:</strong> Acreditación en un plazo de 24 a 48 horas tras la inspección física.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
              <span><strong>Tarjetas de Crédito / Débito:</strong> El reintegro se verá reflejado en el siguiente o segundo resumen bancario según la entidad emisora (5 a 10 días hábiles).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
              <span><strong>Cupón de Crédito SportX:</strong> Disponible de manera instantánea con un bono extra del 5% para tu próxima compra.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
