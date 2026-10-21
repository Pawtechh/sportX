import type { NavCategory } from "../types/navigation";

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: "zapatillas",
    name: "Zapatos",
    href: "/products?category=zapatillas",
    groups: [
      {
        title: "Por Disciplina",
        items: [
          { id: "run", name: "Running & Maratón", href: "/products?category=zapatillas&brand=Nike", badge: "Pro" },
          { id: "bask", name: "Basketball & Court", href: "/products?category=zapatillas&brand=Jordan" },
          { id: "train", name: "Cross Training & Gym", href: "/products?category=zapatillas&brand=On+Running" },
          { id: "comp", name: "Competición Placa Carbono", href: "/products?category=zapatillas&brand=Adidas", badge: "Popular" },
        ],
      },
      {
        title: "Marcas Principales",
        items: [
          { id: "nike", name: "Nike Sportswear", href: "/products?brand=Nike" },
          { id: "on", name: "On Running Cloud", href: "/products?brand=On+Running" },
          { id: "adidas", name: "Adidas Adizero", href: "/products?brand=Adidas" },
          { id: "sportx", name: "SportX Pro Lab", href: "/products?brand=SportX+Pro", badge: "Nuevo" },
        ],
      },
    ],
    featured: {
      title: "AIR ZOOM PEGASUS 41",
      subtitle: "Amortiguación reactiva con espuma ZoomX para romper marcas.",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      href: "/products?category=zapatillas",
      ctaText: "Comprar Zapatillas",
    },
  },
  {
    id: "ropa",
    name: "Remeras",
    href: "/products?category=ropa",
    groups: [
      {
        title: "Partes de Arriba",
        items: [
          { id: "remeras", name: "Remeras Técnicas Dry-Fit", href: "/products?category=ropa", badge: "Popular" },
          { id: "musculosas", name: "Musculosas & Singlets", href: "/products?category=ropa" },
          { id: "camperas", name: "Camperas Cortaviento", href: "/products?category=ropa" },
          { id: "hoodies", name: "Buzos & Hoodies Térmicos", href: "/products?category=ropa" },
        ],
      },
      {
        title: "Partes de Abajo",
        items: [
          { id: "shorts", name: "Shorts 2-en-1 Compresión", href: "/products?category=ropa" },
          { id: "calzas", name: "Calzas Pro de Alta Densidad", href: "/products?category=ropa" },
          { id: "joggers", name: "Pantalones de Entrenamiento", href: "/products?category=ropa" },
        ],
      },
    ],
    featured: {
      title: "TECH FLEECE & AERO-WEAR",
      subtitle: "Tejidos termorreguladores diseñados para el movimiento sin fricción.",
      imageUrl: "https://images.unsplash.com/photo-1608138279038-8dd61d909bd0?auto=format&fit=crop&w=800&q=80",
      href: "/products?category=ropa",
      ctaText: "Ver Indumentaria",
    },
  },
  {
    id: "pelotas",
    name: "Pelotas",
    href: "/products?category=pelotas",
    groups: [
      {
        title: "Fútbol Profesional",
        items: [
          { id: "fifa-pro", name: "Balones Match FIFA Pro", href: "/products?category=pelotas", badge: "Pro" },
          { id: "futbol-train", name: "Balones de Entrenamiento Híbridos", href: "/products?category=pelotas" },
          { id: "futsal", name: "Balones de Futsal Medio Pique", href: "/products?category=pelotas" },
        ],
      },
      {
        title: "Duela & Cancha",
        items: [
          { id: "bask-ball", name: "Basketball Competición Indoor", href: "/products?category=pelotas", badge: "Popular" },
          { id: "voley", name: "Voley Profesional Soft-Touch", href: "/products?category=pelotas" },
          { id: "rugby", name: "Pelotas de Rugby Match Grip", href: "/products?category=pelotas" },
        ],
      },
    ],
    featured: {
      title: "BALONES OFICIALES MATCH",
      subtitle: "Construcción térmica sellada para trayectoria aerodinámica pura.",
      imageUrl: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=800&q=80",
      href: "/products?category=pelotas",
      ctaText: "Explorar Balones",
    },
  },
  {
    id: "accesorios",
    name: "Accesorios",
    href: "/products?category=accesorios",
    groups: [
      {
        title: "Equipamiento Personal",
        items: [
          { id: "mochilas", name: "Mochilas & Bolsos Deportivos", href: "/products?category=accesorios" },
          { id: "medias", name: "Medias Antideslizantes Grip", href: "/products?category=accesorios", badge: "Popular" },
          { id: "gorras", name: "Gorras Dry-Fit Ventiladas", href: "/products?category=accesorios" },
        ],
      },
      {
        title: "Protección & Rendimiento",
        items: [
          { id: "botellas", name: "Botellas Térmicas Hidratación", href: "/products?category=accesorios" },
          { id: "canilleras", name: "Canilleras de Fibra de Carbono", href: "/products?category=accesorios", badge: "Nuevo" },
          { id: "bandas", name: "Bandas de Resistencia & Tape", href: "/products?category=accesorios" },
        ],
      },
    ],
    featured: {
      title: "TRAINING ESSENTIALS",
      subtitle: "Detalles que marcan la diferencia en el día de la competencia.",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      href: "/products?category=accesorios",
      ctaText: "Ver Accesorios",
    },
  },
];
