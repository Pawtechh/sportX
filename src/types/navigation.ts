export interface SubCategoryItem {
  id: string;
  name: string;
  href: string;
  badge?: "Nuevo" | "Popular" | "Pro";
}

export interface CategoryGroup {
  title: string;
  items: SubCategoryItem[];
}

export interface FeaturedCollection {
  title: string;
  subtitle: string;
  imageUrl: string;
  href: string;
  ctaText: string;
}

export interface NavCategory {
  id: "zapatillas" | "ropa" | "pelotas" | "accesorios";
  name: string;
  href: string;
  groups: CategoryGroup[];
  featured: FeaturedCollection;
}
