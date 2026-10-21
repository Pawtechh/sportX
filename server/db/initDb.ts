import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs";
import { SEED_PRODUCTS } from "../seedData";

const dataDir = path.resolve(process.cwd(), "data", "sportx-db");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const pidFile = path.join(dataDir, "postmaster.pid");
if (fs.existsSync(pidFile)) {
  try {
    fs.unlinkSync(pidFile);
  } catch {}
}

export const pgliteClient = new PGlite(dataDir);
export const pgliteDb = drizzle(pgliteClient, { schema });

export async function initDatabase() {
  await pgliteClient.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'consumer',
      name TEXT NOT NULL,
      avatar_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      suspended BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL DEFAULT '',
      brand TEXT NOT NULL DEFAULT 'SportX',
      description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      images JSON NOT NULL DEFAULT '[]',
      category TEXT NOT NULL,
      sizes JSON NOT NULL DEFAULT '["US 8", "US 9", "US 10", "US 11"]',
      stock INTEGER NOT NULL DEFAULT 0,
      rating REAL NOT NULL DEFAULT 4.8,
      seller_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT NOT NULL DEFAULT '';

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      consumer_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC(10, 2) NOT NULL,
      shipping_address TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      size TEXT NOT NULL DEFAULT 'US 9',
      price_at_purchase NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      actor_id INTEGER REFERENCES users(id),
      change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'en_progreso',
      target_date TEXT NOT NULL DEFAULT '',
      budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS project_tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      phase TEXT NOT NULL DEFAULT 'Fase 1: Inicio',
      status TEXT NOT NULL DEFAULT 'todo',
      assigned_to TEXT NOT NULL DEFAULT 'Equipo SportX',
      priority TEXT NOT NULL DEFAULT 'media',
      due_date TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Verificar cuántos productos con SKU válido hay en la base de datos
  const prodCount = await pgliteClient.query("SELECT count(*) as count FROM products WHERE sku IS NOT NULL AND sku != ''");
  const count = Number((prodCount.rows[0] as any)?.count ?? 0);

  // Sembrar proyectos internos si la tabla está vacía
  try {
    const projCheck = await pgliteClient.query("SELECT count(*) as count FROM projects");
    const projCount = Number((projCheck.rows[0] as any)?.count ?? 0);
    if (projCount === 0) {
      await pgliteClient.exec(`
        INSERT INTO projects (title, description, status, target_date, budget) VALUES
          ('Lanzamiento Colección Maratón 2027', 'Preparación logística, vitrinas y campaña para calzado élite de running.', 'en_progreso', '2027-04-15', 18500),
          ('Remodelación Sector Calzado Unicenter', 'Renovación de exhibidores y terminales de escaneo en la sucursal.', 'en_progreso', '2026-12-01', 32000),
          ('Auditoría General de Inventario & POS', 'Cierre de ciclo, conteo físico vs stock digital y calibración de caja.', 'completado', '2026-10-31', 6500);

        INSERT INTO project_tasks (project_id, title, phase, status, assigned_to, priority, due_date) VALUES
          (1, 'Definir siluetas prioritarias Nike Vaporfly y On Cloudboom', 'Fase 1: Inicio', 'done', 'Admin SportX', 'alta', '2026-11-10'),
          (1, 'Aprobar presupuesto publicitario y packaging compostable', 'Fase 2: Planificación', 'done', 'Admin SportX', 'media', '2026-11-25'),
          (1, 'Montaje de vidriera principal en Flagship Palermo', 'Fase 3: Ejecución', 'in_progress', 'Pro Seller', 'urgente', '2026-12-05'),
          (1, 'Capacitación al equipo de vendedores en espumas reactivas', 'Fase 3: Ejecución', 'todo', 'Pro Seller', 'alta', '2026-12-12'),
          (1, 'Lanzamiento digital en tienda online y newsletter', 'Fase 4: Cierre', 'todo', 'Equipo Marketing', 'media', '2027-01-05'),
          (2, 'Aprobación de planos arquitectónicos de exhibidores', 'Fase 1: Inicio', 'done', 'Admin SportX', 'alta', '2026-11-01'),
          (2, 'Adquisición de nuevos escáneres POS inalámbricos', 'Fase 2: Planificación', 'in_progress', 'Pro Seller', 'alta', '2026-11-15'),
          (2, 'Instalación de iluminación LED focal en góndolas', 'Fase 3: Ejecución', 'todo', 'Contratista LED', 'media', '2026-11-28'),
          (3, 'Conteo físico por categorías (Zapatillas, Ropa, Balones)', 'Fase 1: Inicio', 'done', 'Pro Seller', 'alta', '2026-10-25'),
          (3, 'Conciliación de arqueo de caja POS vs facturación', 'Fase 2: Planificación', 'done', 'Admin SportX', 'urgente', '2026-10-28'),
          (3, 'Generación de informe de mermas y ajustes en sistema', 'Fase 4: Cierre', 'done', 'Admin SportX', 'media', '2026-10-30');
      `);
    }
  } catch (err) {
    console.error("Warning seeding projects:", err);
  }

  if (count < 52) {
    console.log("Sincronizando catálogo completo con SKU para Zapatillas, Ropa, Pelotas y Accesorios...");

    // Asegurar usuarios
    const hash = await bcrypt.hash("password123", 10);
    await pgliteClient.exec(`
      INSERT INTO users (email, name, role, password_hash, avatar_url)
      VALUES 
        ('admin@sportx.com', 'Admin SportX', 'admin', '${hash}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
        ('seller@sportx.com', 'Pro Seller', 'seller', '${hash}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
        ('buyer@sportx.com', 'Alex Runner', 'consumer', '${hash}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80')
      ON CONFLICT (email) DO NOTHING;
    `);

    const sellerRes = await pgliteClient.query("SELECT id FROM users WHERE role = 'seller' LIMIT 1");
    const sellerId = Number((sellerRes.rows[0] as any)?.id ?? 1);
    const adminRes = await pgliteClient.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const adminId = Number((adminRes.rows[0] as any)?.id ?? 1);
    const buyerRes = await pgliteClient.query("SELECT id FROM users WHERE role = 'consumer' LIMIT 1");
    const buyerId = Number((buyerRes.rows[0] as any)?.id ?? 1);

    // Limpiar productos viejos para sembrar los 52 productos con el esquema nuevo
    await pgliteClient.exec(`
      DELETE FROM reviews;
      DELETE FROM inventory_logs;
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM products;
    `);

    for (const p of SEED_PRODUCTS) {
      const inserted = await pgliteClient.query(
        `INSERT INTO products (name, slug, sku, brand, description, price, images, category, sizes, stock, rating, seller_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          p.name,
          p.slug,
          p.sku,
          p.brand,
          p.description,
          p.price,
          JSON.stringify(p.images),
          p.category,
          JSON.stringify(p.sizes),
          p.stock,
          p.rating,
          sellerId,
        ]
      );
      const prodId = Number((inserted.rows[0] as any)?.id);

      // Audit log
      await pgliteClient.query(
        `INSERT INTO inventory_logs (product_id, actor_id, change, reason) VALUES ($1, $2, $3, $4)`,
        [prodId, adminId, p.stock, `Stock inicial de catálogo SKU ${p.sku}`]
      );

      // 2 reseñas por producto
      await pgliteClient.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
        [prodId, buyerId, 5, "Increíble amortiguación y respuesta. Los acabados son dignos de la élite deportiva."]
      );
      await pgliteClient.query(
        `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4)`,
        [prodId, sellerId, 5, "Calidad garantizada. Materiales de alto rendimiento aprobados por atletas."]
      );
    }

    console.log(`¡52 productos reales sembrados con éxito con SKU, reseñas y auditoría!`);
  }

  for (const p of SEED_PRODUCTS) {
    await pgliteClient.query(
      "UPDATE products SET images = $1 WHERE sku = $2",
      [JSON.stringify(p.images), p.sku]
    );
  }
}
