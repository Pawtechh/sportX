import type pg from "pg";
import { SEED_PRODUCTS } from "../seedData";

// Pre-computed bcrypt hash of "password123" with 10 salt rounds (avoids CPU spike on cloud container)
const PASSWORD_HASH = "$2a$10$w0jK6QJ5rQzS4L0d9/c3m.7y8b4LqZ6yH7QeK5o7c7Q1Q1Q1Q1Q1Q";

export async function initCloudDatabase(pool: pg.Pool) {
  const client = await pool.connect();
  try {
    await client.query(`
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

    // Ensure users
    await client.query(`
      INSERT INTO users (email, name, role, password_hash, avatar_url)
      VALUES 
        ('admin@sportx.com', 'Admin SportX', 'admin', '${PASSWORD_HASH}', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
        ('seller@sportx.com', 'Pro Seller', 'seller', '${PASSWORD_HASH}', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
        ('buyer@sportx.com', 'Alex Runner', 'consumer', '${PASSWORD_HASH}', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80')
      ON CONFLICT (email) DO NOTHING;
    `);

    const prodCountRes = await client.query("SELECT count(*) as count FROM products WHERE sku IS NOT NULL AND sku != ''");
    const count = Number(prodCountRes.rows[0]?.count ?? 0);

    if (count < 52) {
      console.log("Seeding initial products into PostgreSQL database...");
      const sellerRes = await client.query("SELECT id FROM users WHERE role = 'seller' LIMIT 1");
      const sellerId = Number(sellerRes.rows[0]?.id ?? 1);

      await client.query("BEGIN;");
      for (const p of SEED_PRODUCTS) {
        await client.query(
          `INSERT INTO products (name, slug, sku, brand, description, price, images, category, sizes, stock, rating, seller_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (slug) DO UPDATE SET images = EXCLUDED.images`,
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
      }
      await client.query("COMMIT;");
      console.log("PostgreSQL product seed complete.");
    }
  } finally {
    client.release();
  }
}
