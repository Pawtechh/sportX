import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Headphones, 
  Mail, 
  MessageCircle, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Banknote
} from "lucide-react";
import { toast } from "sonner";
import { ShimmerButton } from "../components/magic";

export default function HelpCenter() {
  const [form, setForm] = useState({ name: "", email: "", topic: "general", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Mensaje enviado con éxito", {
        description: "Nuestro equipo de soporte responderá a tu email dentro de las próximas 24 horas hábiles.",
      });
      setForm({ name: "", email: "", topic: "general", message: "" });
    }, 800);
  };

  const faqs = [
    {
      q: "¿Cómo realizo el seguimiento de mi pedido?",
      a: "Puedes rastrear el estado en tiempo real ingresando a tu panel de usuario en 'Mi Cuenta > Pedidos' o utilizando el código de guía enviado a tu correo tras el despacho.",
    },
    {
      q: "¿Cuáles son los medios de pago aceptados?",
      a: "Aceptamos tarjetas de crédito (Visa, Mastercard, American Express) con hasta 6 cuotas sin interés, tarjetas de débito, Mercado Pago con transferencias automáticas y pagos directos con descuentos especiales.",
    },
    {
      q: "¿Cómo solicito un cambio de talle o modelo?",
      a: "Tenés 30 días corridos desde recibido el producto. Podés gestionar la solicitud directamente desde la sección de Devoluciones en tu panel o contactándonos.",
    },
    {
      q: "¿Los productos son 100% originales?",
      a: "Absolutamente. Todos los productos distribuidos por SportX son 100% auténticos, con garantía oficial de marca y control de calidad verificado.",
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
          <Headphones className="h-3.5 w-3.5" />
          <span>Soporte Oficial SportX</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          ATENCIÓN AL CLIENTE <span className="text-accent">& AYUDA</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl">
          ¿Tienes dudas sobre tu orden, envíos o medios de pago? Nuestro equipo de expertos en rendimiento deportivo está listo para asistirte.
        </p>
      </div>

      {/* Canales Directos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">WhatsApp Inmediato</h3>
            <p className="text-sm text-zinc-400">Atención personalizada y respuestas en minutos para compras y talles.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500 block">Lunes a Sábado · 09:00 a 20:00</span>
            <a 
              href="https://wa.me/" 
              target="_blank" 
              rel="noreferrer"
              className="mt-2 text-sm font-bold text-emerald-400 hover:underline inline-flex items-center gap-1.5"
            >
              Iniciar chat de WhatsApp →
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Email de Soporte</h3>
            <p className="text-sm text-zinc-400">Para consultas corporativas, facturación A/B y seguimiento de reclamos.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-500 block">Respuesta en menos de 24h</span>
            <a 
              href="mailto:soporte@sportx.com" 
              className="mt-2 text-sm font-bold text-accent hover:underline inline-flex items-center gap-1.5"
            >
              soporte@sportx.com →
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Horario de Operaciones</h3>
            <p className="text-sm text-zinc-400">Centro logístico y despachos activos de lunes a viernes en todo el país.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-semibold">Lun a Vie: 08:00 - 20:00</span>
            <span className="text-xs text-zinc-500 block">Sábados: 09:00 - 15:00</span>
          </div>
        </div>
      </div>

      {/* Formulario y Medios de Pago */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        
        {/* Formulario de Contacto */}
        <div className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">
            Envíanos un mensaje
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Completa tus datos y nos pondremos en contacto contigo a la brevedad.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Nombre Completo
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Martín Rodríguez"
                className="input"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Correo Electrónico
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="input"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Motivo de Consulta
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="input cursor-pointer"
              >
                <option value="general" className="bg-zinc-900 text-white">Consulta General</option>
                <option value="order" className="bg-zinc-900 text-white">Estado de un Pedido</option>
                <option value="payment" className="bg-zinc-900 text-white">Duda con Pago o Facturación</option>
                <option value="returns" className="bg-zinc-900 text-white">Cambio o Devolución</option>
                <option value="warranty" className="bg-zinc-900 text-white">Garantía de Producto</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Mensaje
              </label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Escribe aquí tu consulta en detalle..."
                className="input resize-none"
              />
            </div>

            <ShimmerButton type="submit" disabled={submitting} className="w-full mt-4">
              <span className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                <span>{submitting ? "Enviando..." : "Enviar Consulta"}</span>
              </span>
            </ShimmerButton>
          </form>
        </div>

        {/* Sección de Opciones de Pago (Ancla #pagos) */}
        <div id="pagos" className="lg:col-span-5 scroll-mt-28 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-accent text-sm font-black uppercase tracking-wider mb-2">
              <CreditCard className="h-5 w-5" />
              <span>Opciones de Pago Oficiales</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-4">
              PAGA CON TOTAL SEGURIDAD
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Todos los cobros son procesados con encriptación de grado bancario SSL 256-bit para garantizar la privacidad de tus finanzas.
            </p>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Tarjetas de Crédito</span>
                  <span className="text-xs font-bold text-accent">Hasta 6 Cuotas Sin Interés</span>
                </div>
                <p className="text-xs text-zinc-400">Visa, Mastercard, American Express y Cabal de todos los bancos nacionales.</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">Mercado Pago & Débito</span>
                  <span className="text-xs font-bold text-emerald-400">Acreditación Instantánea</span>
                </div>
                <p className="text-xs text-zinc-400">Pagá con dinero en cuenta, débito Visa/Mastercard o transferencia directa.</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">SportX Direct / Transferencia</span>
                  <span className="text-xs font-bold text-accent">10% OFF Adicional</span>
                </div>
                <p className="text-xs text-zinc-400">Descuento aplicado en el checkout al elegir transferencia electrónica.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-accent flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Compra Protegida</h4>
              <p className="text-xs text-zinc-400">Garantía directa de SportX con reembolso total si tu paquete sufre extravío.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Preguntas Frecuentes (FAQ) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10">
        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="h-4 w-4" />
          <span>Preguntas Frecuentes</span>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tight text-white mb-8">
          RESPUESTAS RÁPIDAS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-2">
              <h4 className="text-base font-bold text-white">{faq.q}</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
