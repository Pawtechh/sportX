import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronDown, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ProductCarousel from "../components/ProductCarousel";
import { Marquee } from "../components/magic";
import { money } from "../api";
import type { Product } from "../types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Showcase 3D del Hero
  const [heroIndex, setHeroIndex] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Refs de GSAP
  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const magneticBtnRef = useRef<HTMLAnchorElement>(null);

  // Cargar catálogo completo para repartir en los carruseles
  useEffect(() => {
    let isCancelled = false;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products?limit=50&page=1");
        const data = await res.json();
        if (!isCancelled) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Error al cargar productos del home:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Segmentación para carruseles temáticos
  const sneakers = products.filter((p) =>
    ["running", "basketball", "training", "lifestyle", "zapatillas"].includes(p.category)
  );
  const apparel = products.filter(
    (p) =>
      p.category === "ropa" ||
      p.name.toLowerCase().includes("remera") ||
      p.name.toLowerCase().includes("hoodie") ||
      p.name.toLowerCase().includes("short")
  );
  const balls = products.filter(
    (p) =>
      p.category === "pelotas" ||
      p.name.toLowerCase().includes("balón") ||
      p.name.toLowerCase().includes("pelota")
  );
  const accessories = products.filter(
    (p) =>
      p.category === "accesorios" ||
      p.name.toLowerCase().includes("mochila") ||
      p.name.toLowerCase().includes("botella") ||
      p.name.toLowerCase().includes("medias") ||
      p.name.toLowerCase().includes("canilleras")
  );

  // Productos para el Showcase 3D del Hero
  const featuredShowcase = sneakers.length > 0 ? sneakers.slice(0, 4) : products.slice(0, 4);
  const currentFeatured = featuredShowcase[heroIndex] || products[0];

  // Rotación automática del Showcase 3D del Hero cada 5 segundos (pausa con hover/focus y respeta reduced-motion)
  useEffect(() => {
    if (featuredShowcase.length <= 1 || isHeroHovered) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredShowcase.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredShowcase.length, isHeroHovered]);

  // Efecto 3D Tilt con el movimiento del ratón en el Hero
  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    setMouseTilt({
      rotateY: x * 24,
      rotateX: -y * 24,
    });
  };

  const handleHeroMouseLeave = () => {
    setMouseTilt({ rotateX: 0, rotateY: 0 });
  };

  // Botón Magnético en el Hero
  useEffect(() => {
    const btn = magneticBtnRef.current;
    if (!btn) return;

    const handleMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(x, y);

      if (distance < 90) {
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.2,
          ease: "power2.out",
        });
      } else {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: "elastic.out(1, 0.4)",
        });
      }
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Animaciones GSAP: Hero Reveal
  useGSAP(
    () => {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from(".hero-word", {
          yPercent: 120,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
        })
        .from(
          ".hero-badge",
          {
            scale: 0.6,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.6"
        )
        .from(
          ".hero-showcase-box",
          {
            x: 60,
            opacity: 0,
            duration: 1,
          },
          "-=0.8"
        );

      if (heroContentRef.current) {
        gsap.to(heroContentRef.current, {
          scale: 0.92,
          opacity: 0.75,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: heroRef, dependencies: [] }
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors w-full max-w-[100vw] overflow-x-hidden">
      {/* ================= SECCIÓN 1: HERO EXPOSITOR (100vh) ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 pt-24 pb-12 select-none"
      >
        <div
          ref={heroContentRef}
          className="mx-auto grid max-w-7xl w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 transition-transform duration-200"
        >
          {/* Lado Izquierdo: Tipografía Masiva & CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="hero-badge mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-zinc-900/10 dark:border-accent/40 bg-zinc-900/5 dark:bg-accent/10 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-accent backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              <span>TEMPORADA 2026 // EDICIÓN ÉLITE</span>
            </div>

            <div className="overflow-hidden">
              <h1 className="hero-word text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.88] text-zinc-900 dark:text-white">
                RUN <span className="text-zinc-950 dark:text-accent drop-shadow-none dark:drop-shadow-[0_0_35px_#CCFF00]">BEYOND</span>
              </h1>
            </div>
            <div className="overflow-hidden">
              <div className="hero-word text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.88] text-zinc-500 dark:text-zinc-400">
                LIMITS.
              </div>
            </div>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-zinc-700 dark:text-zinc-400 font-medium leading-relaxed">
              Zapatillas, indumentaria técnica, balones de competición y accesorios de alta precisión. Diseñado para quienes exigen rendimiento puro.
            </p>

            {/* Acciones Hero */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                ref={magneticBtnRef}
                to="/products"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-zinc-900 dark:bg-accent px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-white dark:text-black shadow-xl hover:shadow-2xl transition-all active:scale-95"
              >
                <span className="relative z-10">Explorar Catálogo</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#carruseles"
                className="rounded-full border border-zinc-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/60 px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 backdrop-blur-md hover:border-black dark:hover:border-accent transition"
              >
                Ver Colecciones
              </a>
            </div>
          </div>

          {/* Lado Derecho: Carrusel 3D Interactivo con Tilt */}
          <div className="hero-showcase-box lg:col-span-5 flex flex-col items-center">
            {currentFeatured && (
              <div
                style={{ perspective: "1000px" }}
                className="relative w-full max-w-md aspect-square"
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
                onFocus={() => setIsHeroHovered(true)}
                onBlur={() => setIsHeroHovered(false)}
              >
                <div
                  style={{
                    transform: `rotateX(${mouseTilt.rotateX}deg) rotateY(${mouseTilt.rotateY}deg)`,
                    transition: "transform 0.15s ease-out",
                  }}
                  className="relative h-full w-full rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-accent font-mono">
                        {currentFeatured.brand} // {currentFeatured.category}
                      </span>
                      <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
                        {currentFeatured.name}
                      </h3>
                    </div>
                    <span className="rounded-full bg-zinc-900 text-white dark:bg-accent dark:text-black font-black text-xs px-3 py-1 font-mono">
                      {money(currentFeatured.price)}
                    </span>
                  </div>

                  {/* Imagen Flotante */}
                  <div className="relative my-auto flex items-center justify-center py-4">
                    <img
                      key={currentFeatured.id}
                      src={currentFeatured.images?.[0] || (currentFeatured as any).imageUrl}
                      alt={currentFeatured.name}
                      width={224}
                      height={224}
                      className="animate__animated animate__fadeIn animate__faster h-56 w-auto object-contain drop-shadow-2xl filter hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Controles de Carrusel y Enlace a Detalle */}
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/60 pt-4 z-10">
                    <div className="flex items-center gap-1" role="tablist" aria-label="Productos destacados">
                      {featuredShowcase.map((item, i) => (
                        <button
                          key={item.id || i}
                          onClick={() => setHeroIndex(i)}
                          role="tab"
                          aria-selected={heroIndex === i}
                          aria-label={`Ver producto destacado ${i + 1}: ${item.name}`}
                          className="group relative flex h-10 w-6 items-center justify-center focus:outline-none"
                        >
                          <span
                            className={`h-2 rounded-full transition-all duration-300 ${
                              heroIndex === i
                                ? "w-8 bg-zinc-900 dark:bg-accent"
                                : "w-2 bg-zinc-300 dark:bg-zinc-700 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-500"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setHeroIndex(
                            (heroIndex - 1 + featuredShowcase.length) % featuredShowcase.length
                          )
                        }
                        aria-label="Producto anterior"
                        className="rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white hover:border-black dark:hover:border-accent transition"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setHeroIndex((heroIndex + 1) % featuredShowcase.length)
                        }
                        aria-label="Producto siguiente"
                        className="rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white hover:border-black dark:hover:border-accent transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/product/${currentFeatured.id}`}
                        className="rounded-full bg-zinc-900 text-white dark:bg-accent dark:text-black px-4 py-2 text-xs font-black uppercase hover:opacity-90 transition ml-2"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de Scroll Animado */}
        <a
          href="#carruseles"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-accent transition group"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase">SCROLL</span>
          <ChevronDown className="h-4 w-4 motion-safe:animate-pulse text-zinc-900 dark:text-accent" />
        </a>
      </section>

      {/* Marquee Promocional Deportivo */}
      <div id="carruseles">
        <Marquee
          items={[
            "ENERGY RETURN PEBA FOAM",
            "ZOOMX REACTIVITY",
            "CARBON PROPULSION PLATES",
            "AERODYNAMIC KNIT MESH",
            "CONTINENTAL GRIP TRACTION",
            "SPORTX PERFORMANCE LAB",
          ]}
        />
      </div>

      {/* ================= SECCIÓN 2: CARRUSELES TEMÁTICOS ================= */}
      
      {/* 1. Carrusel de ZAPATOS / ZAPATILLAS */}
      <ProductCarousel
        title="Zapatos & Calzado Deportivo"
        subtitle="COLECCIÓN RUNNING, BASKETBALL Y COMPETICIÓN"
        products={sneakers.slice(0, 10)}
        viewAllLink="/products?category=zapatillas"
      />

      {/* 2. Carrusel de REMERAS */}
      <ProductCarousel
        title="Remeras & Indumentaria"
        subtitle="TEJIDOS TRANSPIRABLES DRY-FIT Y RENDIMIENTO"
        products={apparel}
        viewAllLink="/products?category=ropa"
      />

      {/* 3. Carrusel de PELOTAS & BALONES */}
      <ProductCarousel
        title="Pelotas & Balones de Competición"
        subtitle="CALIDAD OFICIAL MATCH & ENTRENAMIENTO"
        products={balls}
        viewAllLink="/products?category=pelotas"
      />

      {/* 4. Carrusel de ACCESORIOS */}
      {accessories.length > 0 && (
        <ProductCarousel
          title="Accesorios Deportivos"
          subtitle="MOCHILAS, HIDRATACIÓN Y EQUIPAMIENTO"
          products={accessories}
          viewAllLink="/products?category=accesorios"
        />
      )}

      {/* ================= SECCIÓN 3: BANNER EDITORIAL CATÁLOGO ================= */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-10 sm:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
          <div className="max-w-xl z-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-accent font-mono">
              CATÁLOGO OFICIAL SPORTX
            </span>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mt-2 leading-[0.95]">
              ENCUENTRA TU <span className="text-accent">VENTAJA</span> COMPETITIVA
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explora nuestra colección completa con filtros por disciplina, talla, color y precio. Envíos express a todo el país y garantía de satisfacción 30 días.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-xs font-black uppercase tracking-wider text-black hover:bg-white transition shadow-lg active:scale-95"
              >
                <span>Ver Todos los Productos</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products?category=zapatillas"
                className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/80 px-6 py-4 text-xs font-bold uppercase tracking-wider text-white hover:border-accent transition"
              >
                Solo Zapatillas
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-sm aspect-square lg:aspect-auto lg:h-80 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
              alt="SportX Pro Silhouette"
              className="h-64 sm:h-72 w-auto object-contain drop-shadow-[0_20px_30px_rgba(204,255,0,0.3)] filter hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
