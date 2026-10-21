import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, FileText, Lock, Cookie } from "lucide-react";

export default function LegalPage() {
  const [activeSection, setActiveSection] = useState<"terminos" | "privacidad" | "cookies">("terminos");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-32">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-accent transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a la tienda</span>
      </Link>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Marco Normativo & Protección</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          TÉRMINOS & <span className="text-accent">LEGALES</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl">
          Transparencia absoluta en todas tus compras y en la gestión de tus datos personales.
        </p>
      </div>

      {/* Navegación Rápida de Secciones */}
      <div className="flex flex-wrap gap-3 mb-12">
        <a
          href="#terminos"
          onClick={() => setActiveSection("terminos")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeSection === "terminos"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Términos de Venta</span>
        </a>

        <a
          href="#privacidad"
          onClick={() => setActiveSection("privacidad")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeSection === "privacidad"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Política de Privacidad</span>
        </a>

        <a
          href="#cookies"
          onClick={() => setActiveSection("cookies")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
            activeSection === "cookies"
              ? "bg-accent text-black"
              : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700"
          }`}
        >
          <Cookie className="h-4 w-4" />
          <span>Cookies</span>
        </a>
      </div>

      <div className="space-y-16">
        
        {/* Términos de Venta (#terminos) */}
        <section id="terminos" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-accent text-sm font-black uppercase tracking-wider">
            <FileText className="h-5 w-5" />
            <span>Condiciones Generales</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
            1. TÉRMINOS Y CONDICIONES DE VENTA
          </h2>
          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed pt-2">
            <p>
              <strong>1.1. Objeto y Alcance:</strong> Las presentes condiciones regulan la compraventa de calzado, indumentaria y equipamiento deportivo a través de la plataforma oficial SportX. Al procesar un pedido, el cliente declara ser mayor de 18 años y aceptar la totalidad de estos términos.
            </p>
            <p>
              <strong>1.2. Precios y Facturación:</strong> Todos los valores exhibidos se encuentran expresados en moneda de curso legal e incluyen el impuesto al valor agregado (IVA). Se emite factura electrónica automática por cada compra realizada.
            </p>
            <p>
              <strong>1.3. Disponibilidad y Stock:</strong> Los pedidos están sujetos a confirmación de stock al momento de la preparación en depósito. En el eventual caso de agotamiento temporal de alguna unidad, se notificará al usuario para coordinar la sustitución por un talle equivalente o el reintegro total inmediato de su dinero.
            </p>
          </div>
        </section>

        {/* Privacidad (#privacidad) */}
        <section id="privacidad" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-accent text-sm font-black uppercase tracking-wider">
            <Lock className="h-5 w-5" />
            <span>Seguridad de Datos</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
            2. POLÍTICA DE PRIVACIDAD
          </h2>
          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed pt-2">
            <p>
              <strong>2.1. Protección de Datos:</strong> SportX se compromete a resguardar la confidencialidad de la información personal recolectada (nombre, correo electrónico, dirección física y teléfono) bajo estrictos estándares de ciberseguridad. En ningún caso se comercializan ni ceden datos a terceras partes ajenas a la prestación del servicio logístico.
            </p>
            <p>
              <strong>2.2. Procesamiento de Pagos:</strong> Los datos sensibles de tarjetas de crédito o débito no son almacenados en nuestros servidores. Las transacciones son procesadas mediante canales tokenizados y encriptados con tecnología TLS/SSL de última generación.
            </p>
            <p>
              <strong>2.3. Derechos ARCO:</strong> El titular de los datos personales tiene la facultad de ejercer el derecho de acceso, rectificación y supresión de sus datos en cualquier momento enviando un correo a <code>soporte@sportx.com</code>.
            </p>
          </div>
        </section>

        {/* Cookies (#cookies) */}
        <section id="cookies" className="scroll-mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-accent text-sm font-black uppercase tracking-wider">
            <Cookie className="h-5 w-5" />
            <span>Experiencia de Usuario</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
            3. POLÍTICA DE COOKIES
          </h2>
          <div className="space-y-4 text-sm text-zinc-300 leading-relaxed pt-2">
            <p>
              <strong>3.1. ¿Qué son las cookies?:</strong> Empleamos cookies técnicas necesarias para recordar los artículos dentro de tu carrito de compras, mantener tu sesión de usuario activa y registrar tus preferencias de navegación en modo claro u oscuro.
            </p>
            <p>
              <strong>3.2. Gestión de Cookies:</strong> Puedes configurar o bloquear las cookies en cualquier momento a través del panel de ajustes de tu navegador web (Google Chrome, Firefox, Safari, Edge). Ten en cuenta que deshabilitar cookies esenciales puede afectar funciones clave como la finalización de tu compra.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
