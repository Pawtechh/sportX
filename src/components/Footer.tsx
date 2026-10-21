import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Logo from "./Logo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
      <polygon points="10 15 15 12 10 9 10 15"></polygon>
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMessage("Por favor ingresa un correo electrónico válido");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Error al conectar. Inténtalo más tarde.");
    }
  };

  const footerNavigation = {
    ayuda: [
      { label: "Estado del Pedido", href: "/dashboard" },
      { label: "Opciones de Pago", href: "/ayuda#pagos" },
      { label: "Guía de Talles Oficial", href: "/guia-talles" },
      { label: "Atención al Cliente", href: "/ayuda" },
    ],
    envios: [
      { label: "Tiempos y Tarifas", href: "/envios" },
      { label: "Envíos Express 24h", href: "/envios#express" },
      { label: "Seguimiento de Guía", href: "/dashboard" },
      { label: "Retiro en Tienda SportX", href: "/envios#retiro" },
    ],
    devoluciones: [
      { label: "Garantía de Satisfacción 30 Días", href: "/devoluciones" },
      { label: "Iniciar Devolución Online", href: "/dashboard" },
      { label: "Políticas de Cambio", href: "/devoluciones#politicas" },
      { label: "Reembolsos y Tiempos", href: "/devoluciones#reembolsos" },
    ],
    nosotros: [
      { label: "Filosofía & Laboratorio", href: "/nosotros" },
      { label: "Sostenibilidad Circular", href: "/nosotros#sostenibilidad" },
      { label: "Atletas SportX Pro", href: "/nosotros#atletas" },
      { label: "Canal Corporativo & Prensa", href: "/nosotros#prensa" },
    ],
  };

  return (
    <footer className="mt-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Columna Izquierda: Brand & Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-block" aria-label="SportX Inicio">
              <Logo size="lg" />
            </Link>
            
            <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Equipamiento deportivo de alta ingeniería para atletas que no negocian el rendimiento. Suscríbete para lanzamientos exclusivos y drops de edición limitada.
            </p>

            {/* Input Newsletter con Validación */}
            <form onSubmit={handleSubscribe} className="max-w-md space-y-2" noValidate>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  disabled={status === "loading" || status === "success"}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Tu correo electrónico..."
                  className={`w-full rounded-full border bg-zinc-50 dark:bg-zinc-900 px-5 py-3.5 pr-14 text-xs text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition focus:ring-2 ${
                    status === "error" 
                      ? "border-red-500 focus:ring-red-500/20" 
                      : "border-zinc-300 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-accent focus:ring-zinc-900/10"
                  }`}
                  aria-label="Correo para newsletter"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="absolute right-1.5 rounded-full bg-zinc-900 dark:bg-accent p-2.5 text-white dark:text-black transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                  aria-label="Suscribirse al newsletter"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Mensajes de Feedback de Validación */}
              <div aria-live="polite" className="min-h-[20px] text-xs">
                {status === "error" && (
                  <p className="flex items-center gap-1.5 text-red-600 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
                {status === "success" && (
                  <p className="flex items-center gap-1.5 text-success-safe font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>¡Te has suscrito con éxito! Recibirás los próximos drops.</span>
                  </p>
                )}
              </div>
            </form>

            {/* Redes Sociales con Enlaces Accesibles */}
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: InstagramIcon, href: "https://instagram.com", label: "Instagram oficial de SportX" },
                { icon: TwitterIcon, href: "https://twitter.com", label: "Twitter / X oficial de SportX" },
                { icon: YoutubeIcon, href: "https://youtube.com", label: "Canal de YouTube de SportX" },
              ].map(({ icon: Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition hover:border-zinc-900 dark:hover:border-accent hover:text-zinc-900 dark:hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Columnas de Navegación Funcionales */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">
                Ayuda
              </h4>
              <ul className="space-y-3 text-xs">
                {footerNavigation.ayuda.map((item, i) => (
                  <li key={i}>
                    <Link to={item.href} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">
                Envíos
              </h4>
              <ul className="space-y-3 text-xs">
                {footerNavigation.envios.map((item, i) => (
                  <li key={i}>
                    <Link to={item.href} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">
                Devoluciones
              </h4>
              <ul className="space-y-3 text-xs">
                {footerNavigation.devoluciones.map((item, i) => (
                  <li key={i}>
                    <Link to={item.href} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-4">
                Sobre Nosotros
              </h4>
              <ul className="space-y-3 text-xs">
                {footerNavigation.nosotros.map((item, i) => (
                  <li key={i}>
                    <Link to={item.href} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Barra de Copyright & Legales */}
        <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} SportX Inc. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/legales#privacidad" className="hover:text-zinc-900 dark:hover:text-white transition">Privacidad</Link>
            <Link to="/legales#terminos" className="hover:text-zinc-900 dark:hover:text-white transition">Términos de Venta</Link>
            <Link to="/legales#cookies" className="hover:text-zinc-900 dark:hover:text-white transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
