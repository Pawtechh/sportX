import { Router } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { orders, products, users } from "../db/schema";
import { roleUpdateSchema, suspendSchema } from "../../shared/validators";
import { requireAuth, requireRole, validate, wrap } from "../middleware";

const r = Router();
r.use(requireAuth, requireRole("admin"));

r.get("/users", wrap(async (_req, res) => {
  const rows = await db.select({
    id: users.id, email: users.email, name: users.name, role: users.role,
    suspended: users.suspended, createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.id));
  res.json(rows);
}));

r.patch("/users/:id/role", validate(roleUpdateSchema), wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) return res.status(400).json({ error: "No puedes cambiar tu propio rol" });
  const [u] = await db.update(users).set({ role: req.body.role }).where(eq(users.id, id)).returning({ id: users.id, role: users.role });
  u ? res.json(u) : res.status(404).json({ error: "No encontrado" });
}));

r.patch("/users/:id/suspend", validate(suspendSchema), wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) return res.status(400).json({ error: "No puedes suspenderte a ti mismo" });
  const [u] = await db.update(users).set({ suspended: req.body.suspended }).where(eq(users.id, id)).returning({ id: users.id, suspended: users.suspended });
  u ? res.json(u) : res.status(404).json({ error: "No encontrado" });
}));

r.get("/stats", wrap(async (_req, res) => {
  const [t] = await db.select({
    revenue: sql<string>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'cancelled'), 0)`,
    orders: sql<number>`count(*)::int`,
  }).from(orders);
  const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  const [p] = await db.select({ n: sql<number>`count(*)::int`, low: sql<number>`count(*) filter (where ${products.stock} < 10)::int` }).from(products);
  const daily = await db.select({
    day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'DD/MM')`,
    total: sql<string>`sum(${orders.total})`,
  }).from(orders).where(sql`${orders.createdAt} > now() - interval '7 days'`).groupBy(sql`date_trunc('day', ${orders.createdAt})`).orderBy(sql`date_trunc('day', ${orders.createdAt})`);
  res.json({ revenue: Number(t.revenue), orders: t.orders, users: u.n, products: p.n, lowStock: p.low, daily });
}));

export default r;
