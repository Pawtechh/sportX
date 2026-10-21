import bcrypt from "bcryptjs";
import { db, pool } from "./db";
import { inventoryLogs, products, users } from "./db/schema";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  const hash = await bcrypt.hash("password123", 10);
  const [admin, seller, , ] = await db.insert(users).values([
    { email: "admin@sportx.com", name: "Admin", role: "admin", passwordHash: hash },
    { email: "seller@sportx.com", name: "Pro Seller", role: "seller", passwordHash: hash },
    { email: "buyer@sportx.com", name: "Alex Runner", role: "consumer", passwordHash: hash },
  ]).onConflictDoNothing().returning();
  if (!seller) return console.log("Ya sembrado.");

  const items = [
    { name: "Velocity Pro Runner", category: "running", price: "149.99", stock: 40, image: "photo-1542291026-7eec264c27ff" },
    { name: "AirStride Marathon", category: "running", price: "129.00", stock: 25, image: "photo-1491553895911-0055eca6402d" },
    { name: "Court Dominator High", category: "basketball", price: "159.90", stock: 18, image: "photo-1552346154-21d32810aba3" },
    { name: "Hoop Elite Mid", category: "basketball", price: "139.00", stock: 30, image: "photo-1514989940723-e8e51635b782" },
    { name: "IronFlex Trainer", category: "training", price: "99.50", stock: 50, image: "photo-1460353581641-37baddab0fa2" },
    { name: "PowerLift Studio", category: "training", price: "89.00", stock: 8, image: "photo-1595950653106-6c9ebd614d3a" },
  ] as const;
  const rows = await db.insert(products).values(items.map((i) => ({
    name: i.name, category: i.category, price: i.price, stock: i.stock, sellerId: seller.id,
    imageUrl: img(i.image), description: `${i.name}: amortiguación reactiva y ajuste de alto rendimiento para superar tus límites.`,
  }))).returning();
  await db.insert(inventoryLogs).values(rows.map((p) => ({ productId: p.id, userId: admin.id, change: p.stock, reason: "Stock inicial" })));
  console.log("Seed OK. Usuarios: admin@/seller@/buyer@sportx.com — password123");
}
main().finally(() => pool?.end());
