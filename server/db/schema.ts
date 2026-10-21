import { relations } from "drizzle-orm";
import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  boolean,
  index,
  json,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "seller", "consumer"]);
export const categoryEnum = pgEnum("category", ["running", "basketball", "training", "lifestyle"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("consumer"),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url").notNull().default("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"),
  suspended: boolean("suspended").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().default(""),
  brand: text("brand").notNull().default("SportX"),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  images: json("images").$type<string[]>().notNull().default([]),
  category: text("category").notNull(),
  sizes: json("sizes").$type<string[]>().notNull().default(["US 8", "US 9", "US 10", "US 11"]),
  stock: integer("stock").notNull().default(0),
  rating: real("rating").notNull().default(4.8),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  sellerIdx: index("products_seller_idx").on(t.sellerId),
  categoryIdx: index("products_category_idx").on(t.category),
  brandIdx: index("products_brand_idx").on(t.brand),
}));

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  consumerId: integer("consumer_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({ consumerIdx: index("orders_consumer_idx").on(t.consumerId) }));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull().default("US 9"),
  priceAtPurchase: numeric("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});

export const inventoryLogs = pgTable("inventory_logs", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  actorId: integer("actor_id").references(() => users.id),
  change: integer("change").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({ productIdx: index("reviews_product_idx").on(t.productId) }));

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  inventoryLogs: many(inventoryLogs),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, { fields: [products.sellerId], references: [users.id] }),
  orderItems: many(orderItems),
  logs: many(inventoryLogs),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  consumer: one(users, { fields: [orders.consumerId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const inventoryLogsRelations = relations(inventoryLogs, ({ one }) => ({
  product: one(products, { fields: [inventoryLogs.productId], references: [products.id] }),
  actor: one(users, { fields: [inventoryLogs.actorId], references: [users.id] }),
}));

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("en_progreso"),
  targetDate: text("target_date").notNull().default(""),
  budget: numeric("budget", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  phase: text("phase").notNull().default("Fase 1: Inicio"),
  status: text("status").notNull().default("todo"),
  assignedTo: text("assigned_to").notNull().default("Equipo SportX"),
  priority: text("priority").notNull().default("media"),
  dueDate: text("due_date").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(projectTasks),
}));

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, { fields: [projectTasks.projectId], references: [projects.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));
