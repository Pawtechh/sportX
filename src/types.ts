export type Role = "admin" | "seller" | "consumer";
export type Category = 
  | "running" 
  | "basketball" 
  | "training" 
  | "lifestyle" 
  | "zapatillas" 
  | "ropa" 
  | "pelotas" 
  | "accesorios";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  suspended?: boolean;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  userAvatar?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  brand: string;
  description: string;
  price: string;
  images: string[];
  category: Category;
  sizes: string[];
  stock: number;
  rating: number;
  sellerId: number;
  sellerName?: string;
  reviews?: Review[];
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  size: string;
  price: string;
  images?: string[];
}

export interface Order {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  shippingAddress: string;
  consumerName?: string;
  items: OrderItem[];
}

export interface LogRow {
  id: number;
  change: number;
  reason: string;
  createdAt: string;
  product: string;
  user: string | null;
}
