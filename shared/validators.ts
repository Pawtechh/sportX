import { z } from "zod";

export const roles = ["admin", "seller", "consumer"] as const;
export const categories = [
  "running",
  "basketball",
  "training",
  "lifestyle",
  "zapatillas",
  "ropa",
  "pelotas",
  "accesorios",
] as const;
export const orderStatuses = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
export const brands = ["Nike", "Adidas", "Jordan", "On Running", "Puma", "New Balance", "SportX Pro"] as const;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nombre demasiado corto").max(80),
  role: z.enum(["consumer", "seller"]).default("consumer"),
});

export const productSchema = z.object({
  sku: z.string().optional(),
  name: z.string().min(2, "Nombre muy corto").max(120),
  brand: z.string().min(2).max(60).default("SportX Pro"),
  description: z.string().min(10, "Mínimo 10 caracteres").max(2000),
  price: z.coerce.number().positive("Debe ser mayor a 0").max(100000),
  category: z.enum(categories),
  images: z.array(z.string().min(1, "URL de imagen inválida")).min(1, "Al menos una imagen es requerida"),
  sizes: z.array(z.string()).min(1, "Al menos un talle es requerido").default(["US 8", "US 9", "US 10", "US 11"]),
  stock: z.coerce.number().int().min(0).default(0),
});

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.enum([...categories, "all"]).optional().default("all"),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  sort: z.enum(["featured", "price_asc", "price_desc", "newest", "rating"]).optional().default("featured"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export const stockUpdateSchema = z.object({
  change: z.coerce.number().int().refine((n) => n !== 0, "El cambio no puede ser 0"),
  reason: z.string().min(3, "Indica un motivo").max(200),
});

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, "Dirección demasiado corta").max(450),
  shippingCost: z.coerce.number().min(0).optional().default(0),
  shippingMethod: z.enum(["standard", "express", "pickup"]).optional().default("standard"),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(20),
    size: z.string().default("US 9"),
  })).min(1, "Carrito vacío"),
});

export const posOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(50),
    size: z.string().default("US 9"),
  })).min(1, "El ticket debe incluir al menos un producto"),
  paymentMethod: z.enum(["cash", "card", "qr", "transfer"]).default("cash"),
  installments: z.coerce.number().int().min(1).max(12).optional().default(1),
  discountPercent: z.coerce.number().min(0).max(50).optional().default(0),
  customerName: z.string().max(120).optional().default("Cliente Mostrador"),
  customerDoc: z.string().max(40).optional().default(""),
  invoiceType: z.enum(["B", "A", "X"]).optional().default("B"),
  branch: z.string().max(80).optional().default("Flagship Palermo Soho"),
  cashGiven: z.coerce.number().min(0).optional().default(0),
});

export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(4, "Comentario muy corto").max(500),
});

export const orderStatusSchema = z.object({ status: z.enum(orderStatuses) });
export const roleUpdateSchema = z.object({ role: z.enum(roles) });
export const suspendSchema = z.object({ suspended: z.boolean() });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type StockUpdateInput = z.infer<typeof stockUpdateSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PosOrderInput = z.infer<typeof posOrderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
