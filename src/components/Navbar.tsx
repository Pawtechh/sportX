import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeProvider";
import { Search, ShoppingBag, User as UserIcon, Menu, X, ArrowRight, Sun, Moon, ChevronDown, Store } from "lucide-react";
import { money } from "../api";
import { NAVIGATION_CATEGORIES } from "../data/navigationData";
import type { NavCategory } from "../types/navigation";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setOpen, lastAddedKey } = useCart();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  // Estados de navegación y UI
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Estados del Mega Menú
  const [activeMegaCategory, setActiveMegaCategory] = useState<NavCategory | null>(null);
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMegaEnter = (cat: NavCategory) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMegaCategory(cat);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory(null);
    }, 180);
  };

  // Estados del Buscador Global
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Ocultar al scrollear hacia abajo, mostrar al scrollear hacia arriba
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
          setShowNavbar(false);
        } else if (lastScrollY - currentScrollY > 10) {
          setShowNavbar(true);
        }
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Debounce de 300ms para búsqueda global
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error buscando:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para resaltar el término buscado
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="text-accent font-black underline underline-offset-2">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const navLinks = [
    { to: "/", label: "Explorar" },
    { to: "/#catalogo", label: "Catálogo" },
    { to: "/#destacados", label: "Destacados" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-in-out border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/85 backdrop-blur-md ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 gap-6">
          {/* Logo SportX */}
          <Link
            to="/"
            className="flex items-center group py-1"
            aria-label="SportX Inicio"
          >
            <Logo size="md" />
          </Link>

          {/* Enlaces Desktop con Mega Menú */}
          <nav 
            className="hidden lg:flex items-center gap-6 h-full"
            onMouseLeave={handleMegaLeave}
          >
            <NavLink
              to="/"
              onMouseEnter={() => setActiveMegaCategory(null)}
              className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Inicio
            </NavLink>

            {NAVIGATION_CATEGORIES.map((cat) => {
              const isOpen = activeMegaCategory?.id === cat.id;
              return (
                <div key={cat.id} className="relative h-full flex items-center">
                  <Link
                    to={cat.href}
                    onMouseEnter={() => handleMegaEnter(cat)}
                    onFocus={() => setActiveMegaCategory(cat)}
                    className={`flex items-center gap-1 text-xs font-black uppercase tracking-wider transition-colors py-2 ${
                      isOpen ? "text-zinc-950 dark:text-accent font-extrabold" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180 text-accent" : ""}`} />
                  </Link>
                </div>
              );
            })}

            <NavLink
              to="/products"
              onMouseEnter={() => setActiveMegaCategory(null)}
              className="text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
            >
              Catálogo
            </NavLink>
          </nav>

          {/* Barra de Búsqueda Global (Desktop) */}
          <div ref={searchRef} className="relative hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar por zapatilla, silueta o marca..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                className="w-full rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-2 pl-10 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-xs text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown de Resultados en Vivo */}
            {searchOpen && searchQuery.length >= 2 && (
              <div className="absolute top-12 left-0 right-0 z-50 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-xl animate__animated animate__fadeIn animate__faster">
                {searchLoading ? (
                  <div className="py-6 text-center text-xs text-zinc-500 animate-pulse">
                    Buscando en el catálogo de SportX...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Resultados encontrados ({searchResults.length})
                    </div>
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-zinc-900 transition-colors group"
                      >
                        <img
                          src={p.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                          alt={p.name}
                          className="h-12 w-12 rounded-lg object-cover bg-zinc-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold uppercase text-zinc-500">{p.brand}</div>
                          <div className="text-xs font-bold text-white truncate group-hover:text-accent transition-colors">
                            {highlightMatch(p.name, searchQuery)}
                          </div>
                        </div>
                        <div className="text-xs font-black text-accent">{money(p.price)}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-zinc-400">No encontramos resultados para "{searchQuery}".</p>
                    <p className="text-[11px] text-zinc-600 mt-1">Prueba con "Running", "Jordan", o "Pegasus"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-3">
            {/* Botón de búsqueda móvil */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Selector de Tema */}
            <button
              onClick={toggle}
              className="p-2 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-accent hover:text-accent transition"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Carrito con rebote al agregar */}
            <button
              onClick={() => setOpen(true)}
              className="relative p-2.5 rounded-full border border-zinc-800 bg-zinc-900 text-white hover:border-accent transition group"
              aria-label="Carrito"
            >
              <ShoppingBag
                key={lastAddedKey || "cart-icon"}
                className={`h-5 w-5 transition-transform ${lastAddedKey ? "animate__animated animate__rubberBand text-accent" : ""}`}
              />
              {count > 0 && (
                <span className="animate__animated animate__bounceIn absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-black shadow-[0_0_10px_#CCFF00]">
                  {count}
                </span>
              )}
            </button>

            {/* Menú Usuario Desktop */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white hover:border-accent transition"
                >
                  <img
                    src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span>{user.name}</span>
                </button>

                {userDropdown && (
                  <div
                    onClick={() => setUserDropdown(false)}
                    className="animate__animated animate__fadeInDown animate__faster absolute right-0 mt-3 w-56 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    >
                      <span>Panel de control</span>
                      <ArrowRight className="h-3.5 w-3.5 text-accent" />
                    </Link>
                    {(user.role === "admin" || user.role === "seller") && (
                      <Link
                        to="/pos"
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-accent hover:bg-zinc-900"
                      >
                        <span className="flex items-center gap-1.5">
                          <Store className="h-3.5 w-3.5" />
                          <span>Punto de Venta (POS)</span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        nav("/");
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-zinc-900"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-black uppercase tracking-wider text-black transition hover:shadow-[0_0_15px_#CCFF00]"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Entrar</span>
              </Link>
            )}

            {/* Toggle Menú Móvil */}
            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown (Desktop) */}
        {activeMegaCategory && (
          <div
            onMouseEnter={() => {
              if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
            }}
            onMouseLeave={handleMegaLeave}
            className="hidden lg:block border-t border-zinc-200 dark:border-zinc-800 bg-white/98 dark:bg-zinc-950/98 shadow-2xl backdrop-blur-xl animate__animated animate__fadeIn animate__faster transition-colors"
          >
            <div className="mx-auto max-w-7xl px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Columnas de Subcategorías */}
                <div className="col-span-8 grid grid-cols-2 gap-8">
                  {activeMegaCategory.groups.map((group, idx) => (
                    <div key={idx}>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                        {group.title}
                      </h4>
                      <ul className="space-y-2.5">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={item.href}
                              onClick={() => setActiveMegaCategory(null)}
                              className="group flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-accent transition-colors"
                            >
                              <span className="group-hover:translate-x-1 transition-transform">
                                {item.name}
                              </span>
                              {item.badge && (
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  item.badge === "Pro" 
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                    : "bg-accent text-black"
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Card Editorial Destacada */}
                <div className="col-span-4 border-l border-zinc-200 dark:border-zinc-800 pl-8">
                  <div className="group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-5 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        DESTACADO SPORTX
                      </span>
                      <h3 className="text-base font-black uppercase italic tracking-tight text-zinc-900 dark:text-white mt-1">
                        {activeMegaCategory.featured.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {activeMegaCategory.featured.subtitle}
                      </p>
                    </div>

                    <div className="relative my-3 aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800">
                      <img
                        src={activeMegaCategory.featured.imageUrl}
                        alt={activeMegaCategory.featured.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <Link
                      to={activeMegaCategory.featured.href}
                      onClick={() => setActiveMegaCategory(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white hover:text-accent transition-colors"
                    >
                      <span>{activeMegaCategory.featured.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Búsqueda Desplegable en Móvil */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-5 py-3">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Buscar zapatillas, ropa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 pl-10 text-xs text-white placeholder-zinc-500 outline-none focus:border-accent"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 divide-y divide-zinc-900 rounded-xl bg-zinc-900/90 p-2 max-h-60 overflow-y-auto">
                {searchResults.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between py-2 text-xs text-white"
                  >
                    <span>{p.name}</span>
                    <span className="text-accent font-bold">{money(p.price)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Drawer Móvil Animado */}
      <div className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${mobileMenu ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setMobileMenu(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenu ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-zinc-800 bg-zinc-950 p-6 transition-transform duration-300 ease-out ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <span className="text-2xl font-black italic">SPORT<span className="text-accent">X</span></span>
            <button onClick={() => setMobileMenu(false)} className="p-1 text-zinc-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col gap-4 py-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Categorías</span>
            {NAVIGATION_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.href}
                onClick={() => setMobileMenu(false)}
                className="text-2xl font-black italic uppercase text-zinc-900 dark:text-zinc-200 hover:text-accent transition"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products"
              onClick={() => setMobileMenu(false)}
              className="text-2xl font-black italic uppercase text-zinc-900 dark:text-zinc-200 hover:text-accent transition"
            >
              Catálogo Completo
            </Link>

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenu(false)}
                  className="text-xl font-black italic uppercase text-accent transition"
                >
                  Mi Panel
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className="text-xl font-black italic uppercase text-accent transition"
                >
                  Entrar / Únete
                </Link>
              )}
            </div>
          </div>

          {user && (
            <div className="mt-auto border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenu(false);
                  nav("/");
                }}
                className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-red-400 hover:bg-zinc-800"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
