import { Router } from "express";
import { and, desc, asc, eq, gte, lte, ilike, sql, or } from "drizzle-orm";
import { db } from "../db";
import { inventoryLogs, products, reviews, users } from "../db/schema";
import { productFilterSchema, productSchema, stockUpdateSchema } from "../../shared/validators";
import { requireAuth, requireRole, validate, wrap } from "../middleware";

const r = Router();

// ---- Catálogo público con filtros, búsqueda y paginación ----
r.get("/", wrap(async (req, res) => {
  const query = productFilterSchema.parse(req.query);
  const conditions: any[] = [];

  if (query.category && query.category !== "all") {
    if (query.category === "zapatillas") {
      conditions.push(
        or(
          eq(products.category, "zapatillas"),
          eq(products.category, "running"),
          eq(products.category, "basketball"),
          eq(products.category, "training"),
          eq(products.category, "lifestyle")
        )
      );
    } else {
      conditions.push(eq(products.category, query.category as any));
    }
  }
  if (query.brand && query.brand !== "all") {
    conditions.push(eq(products.brand, query.brand));
  }
  if (query.minPrice !== undefined && query.minPrice > 0) {
    conditions.push(gte(products.price, query.minPrice.toString()));
  }
  if (query.maxPrice !== undefined && query.maxPrice > 0) {
    conditions.push(lte(products.price, query.maxPrice.toString()));
  }
  if (query.q && query.q.trim().length > 0) {
    const term = `%${query.q.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.description, term),
        ilike(products.brand, term)
      )
    );
  }

  let orderBy = desc(products.createdAt);
  if (query.sort === "price_asc") orderBy = asc(products.price);
  if (query.sort === "price_desc") orderBy = desc(products.price);
  if (query.sort === "rating") orderBy = desc(products.rating);
  if (query.sort === "newest") orderBy = desc(products.createdAt);

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const offset = (query.page - 1) * query.limit;

  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(query.limit)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);

  res.json({
    products: rows,
    total: totalResult?.count ?? rows.length,
    page: query.page,
    totalPages: Math.ceil((totalResult?.count ?? rows.length) / query.limit),
  });
}));

// ---- Búsqueda rápida en vivo para dropdown del navbar ----
r.get("/search", wrap(async (req, res) => {
  const q = (req.query.q as string)?.trim() ?? "";
  if (!q || q.length < 2) return res.json([]);

  const term = `%${q}%`;
  const results = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      price: products.price,
      category: products.category,
      images: products.images,
      rating: products.rating,
      stock: products.stock,
    })
    .from(products)
    .where(
      or(
        ilike(products.name, term),
        ilike(products.brand, term),
        ilike(products.category, term)
      )
    )
    .limit(8);

  res.json(results);
}));

// ---- Seller/Admin: listado para gestión ----
r.get("/manage/list", requireAuth, requireRole("seller", "admin"), wrap(async (req, res) => {
  const where = req.user!.role === "seller" ? eq(products.sellerId, req.user!.id) : undefined;
  const rows = await db
    .select({ p: products, sellerName: users.name })
    .from(products)
    .innerJoin(users, eq(users.id, products.sellerId))
    .where(where)
    .orderBy(desc(products.id));

  res.json(rows.map((x) => ({ ...x.p, sellerName: x.sellerName })));
}));

// ---- Detalle de producto con vendedor y reseñas ----
r.get("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  const [p] = await db.select().from(products).where(eq(products.id, id));
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });

  const revs = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.productId, p.id))
    .orderBy(desc(reviews.createdAt));

  res.json({ ...p, reviews: revs });
}));

// ---- Productos relacionados ----
r.get("/:id/related", wrap(async (req, res) => {
  const id = Number(req.params.id);
  const [target] = await db.select().from(products).where(eq(products.id, id));
  if (!target) return res.json([]);

  const related = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, target.category),
        sql`${products.id} <> ${id}`
      )
    )
    .limit(8);

  res.json(related);
}));

// ---- Crear producto ----
r.post("/", requireAuth, requireRole("seller", "admin"), validate(productSchema), wrap(async (req, res) => {
  const slug = `${req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
  const [p] = await db
    .insert(products)
    .values({
      name: req.body.name,
      slug,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price.toFixed(2),
      images: req.body.images,
      sizes: req.body.sizes,
      category: req.body.category,
      stock: req.body.stock,
      sellerId: req.user!.id,
    })
    .returning();

  if (p.stock > 0) {
    await db.insert(inventoryLogs).values({
      productId: p.id,
      actorId: req.user!.id,
      change: p.stock,
      reason: "Stock inicial de producto",
    });
  }

  res.status(201).json(p);
}));

async function checkOwnership(req: any, res: any) {
  const [p] = await db.select().from(products).where(eq(products.id, Number(req.params.id)));
  if (!p) {
    res.status(404).json({ error: "Producto no encontrado" });
    return null;
  }
  if (req.user.role === "seller" && p.sellerId !== req.user.id) {
    res.status(403).json({ error: "No tienes permiso sobre este producto" });
    return null;
  }
  return p;
}

// ---- Editar producto ----
r.put("/:id", requireAuth, requireRole("seller", "admin"), validate(productSchema), wrap(async (req, res) => {
  const p = await checkOwnership(req, res);
  if (!p) return;

  const { stock: _ignored, ...rest } = req.body;
  const [updated] = await db
    .update(products)
    .set({
      name: rest.name,
      brand: rest.brand,
      description: rest.description,
      price: rest.price.toFixed(2),
      images: rest.images,
      sizes: rest.sizes,
      category: rest.category,
    })
    .where(eq(products.id, p.id))
    .returning();

  res.json(updated);
}));

// ---- Eliminar producto ----
r.delete("/:id", requireAuth, requireRole("seller", "admin"), wrap(async (req, res) => {
  const p = await checkOwnership(req, res);
  if (!p) return;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(inventoryLogs).where(eq(inventoryLogs.productId, p.id));
      await tx.delete(reviews).where(eq(reviews.productId, p.id));
      await tx.delete(products).where(eq(products.id, p.id));
    });
    res.status(204).end();
  } catch {
    res.status(409).json({ error: "El producto tiene órdenes asociadas. En su lugar, reduce su stock a 0." });
  }
}));

// ---- Actualizar stock auditado ----
r.patch("/:id/stock", requireAuth, requireRole("seller", "admin"), validate(stockUpdateSchema), wrap(async (req, res) => {
  const p = await checkOwnership(req, res);
  if (!p) return;

  const { change, reason } = req.body;
  const updated = await db.transaction(async (tx) => {
    const [u] = await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${change}` })
      .where(and(eq(products.id, p.id), sql`${products.stock} + ${change} >= 0`))
      .returning();

    if (!u) return null;

    await tx.insert(inventoryLogs).values({
      productId: p.id,
      actorId: req.user!.id,
      change,
      reason,
    });
    return u;
  });

  updated
    ? res.json(updated)
    : res.status(409).json({ error: "El stock no puede ser negativo" });
}));

// ---- Logs de inventario ----
export const logsRouter = Router();
logsRouter.get("/", requireAuth, requireRole("seller", "admin"), wrap(async (req, res) => {
  const where = req.user!.role === "seller" ? eq(products.sellerId, req.user!.id) : undefined;
  const rows = await db
    .select({
      id: inventoryLogs.id,
      change: inventoryLogs.change,
      reason: inventoryLogs.reason,
      createdAt: inventoryLogs.createdAt,
      product: products.name,
      user: users.name,
    })
    .from(inventoryLogs)
    .innerJoin(products, eq(products.id, inventoryLogs.productId))
    .leftJoin(users, eq(users.id, inventoryLogs.actorId))
    .where(where)
    .orderBy(desc(inventoryLogs.createdAt))
    .limit(200);

  res.json(rows);
}));

export default r;
