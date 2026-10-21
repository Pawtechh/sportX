import { Router } from "express";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { inventoryLogs, orderItems, orders, products, users } from "../db/schema";
import { checkoutSchema, orderStatusSchema, posOrderSchema, type PosOrderInput } from "../../shared/validators";
import { requireAuth, requireRole, validate, wrap } from "../middleware";

const r = Router();
r.use(requireAuth);

/** Adjunta items (con nombre de producto, SKU, marca y talle) a una lista de pedidos. */
async function withItems(list: (typeof orders.$inferSelect & { consumerName?: string })[], sellerId?: number) {
  if (!list.length) return [];
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      size: orderItems.size,
      price: orderItems.priceAtPurchase,
      name: products.name,
      sku: products.sku,
      brand: products.brand,
      images: products.images,
      sellerId: products.sellerId,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(inArray(orderItems.orderId, list.map((o) => o.id)));

  return list
    .map((o) => ({
      ...o,
      items: rows.filter((i) => i.orderId === o.id && (!sellerId || i.sellerId === sellerId)),
    }))
    .filter((o) => !sellerId || o.items.length > 0);
}

// Checkout Online (valida stock, descuenta, suma costo logístico real y registra auditoría)
r.post("/", requireRole("consumer", "seller", "admin"), validate(checkoutSchema), wrap(async (req, res) => {
  const { items, shippingAddress, shippingCost = 0, shippingMethod = "standard" } = req.body as {
    items: { productId: number; quantity: number; size: string }[];
    shippingAddress: string;
    shippingCost?: number;
    shippingMethod?: string;
  };

  try {
    const order = await db.transaction(async (tx) => {
      const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
      const prods = await tx
        .select()
        .from(products)
        .where(inArray(products.id, uniqueIds));

      let subtotal = 0;
      const [o] = await tx
        .insert(orders)
        .values({ consumerId: req.user!.id, total: "0", shippingAddress })
        .returning();

      for (const it of items) {
        const p = prods.find((x) => x.id === it.productId);
        if (!p) throw new Error(`Producto ${it.productId} no existe`);

        const [upd] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${it.quantity}` })
          .where(sql`${products.id} = ${p.id} AND ${products.stock} >= ${it.quantity}`)
          .returning();

        if (!upd) throw new Error(`Stock insuficiente para: ${p.name}`);

        subtotal += Number(p.price) * it.quantity;

        await tx.insert(orderItems).values({
          orderId: o.id,
          productId: p.id,
          quantity: it.quantity,
          size: it.size || "US 9",
          priceAtPurchase: p.price,
        });

        await tx.insert(inventoryLogs).values({
          productId: p.id,
          actorId: req.user!.id,
          change: -it.quantity,
          reason: `Pedido Online #${o.id} (${it.size} · Envío: ${shippingMethod.toUpperCase()})`,
        });
      }

      const finalTotal = subtotal + Number(shippingCost || 0);

      const [done] = await tx
        .update(orders)
        .set({ total: finalTotal.toFixed(2) })
        .where(eq(orders.id, o.id))
        .returning();

      return done;
    });

    res.status(201).json(order);
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
}));

// POS: Registrar Venta Física de Mostrador (Transacción atómica + Desglose Fiscal + CAE + Auditoría)
r.post("/pos", requireRole("seller", "admin"), validate(posOrderSchema), wrap(async (req, res) => {
  const {
    items,
    paymentMethod,
    installments = 1,
    discountPercent = 0,
    customerName = "Cliente Mostrador",
    customerDoc = "",
    invoiceType = "B",
    branch = "Flagship Palermo Soho",
    cashGiven = 0,
  } = req.body as PosOrderInput;

  try {
    const result = await db.transaction(async (tx) => {
      const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
      const prods = await tx
        .select()
        .from(products)
        .where(inArray(products.id, uniqueIds));

      const clientLabel = customerName.trim() || "Cliente Mostrador";
      const docLabel = customerDoc.trim() || "Sin DNI/CUIT";
      const payLabel =
        paymentMethod === "cash"
          ? "Efectivo"
          : paymentMethod === "qr"
          ? "QR Mercado Pago / MODO"
          : paymentMethod === "transfer"
          ? "Transferencia Bancaria"
          : `Tarjeta (${installments} ${installments === 1 ? "pago" : "cuotas"})`;

      const shippingAddress = `Venta Mostrador POS (${branch}) · Comp: Tipo ${invoiceType} · Pago: ${payLabel} · Cliente: ${clientLabel} (${docLabel})`;

      const [o] = await tx
        .insert(orders)
        .values({
          consumerId: req.user!.id,
          status: "paid",
          total: "0",
          shippingAddress,
        })
        .returning();

      const receiptNumber = `0004-${String(o.id + 18400).padStart(8, "0")}`;
      let subtotal = 0;
      const processedItems: Array<{
        productId: number;
        sku: string;
        brand: string;
        name: string;
        size: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        remainingStock: number;
      }> = [];

      for (const it of items) {
        const p = prods.find((x) => x.id === it.productId);
        if (!p) throw new Error(`Producto #${it.productId} no encontrado en almacén`);

        const [upd] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${it.quantity}` })
          .where(sql`${products.id} = ${p.id} AND ${products.stock} >= ${it.quantity}`)
          .returning();

        if (!upd) {
          throw new Error(`Stock insuficiente para "${p.name}" (Talle ${it.size}). Revisa existencias.`);
        }

        const unitPrice = Number(p.price);
        const lineTotal = Number((unitPrice * it.quantity).toFixed(2));
        subtotal += lineTotal;

        await tx.insert(orderItems).values({
          orderId: o.id,
          productId: p.id,
          quantity: it.quantity,
          size: it.size || "US 9",
          priceAtPurchase: p.price,
        });

        await tx.insert(inventoryLogs).values({
          productId: p.id,
          actorId: req.user!.id,
          change: -it.quantity,
          reason: `POS Ticket ${receiptNumber} · ${branch} · Talle ${it.size} (${payLabel})`,
        });

        processedItems.push({
          productId: p.id,
          sku: p.sku || `SPX-${p.id}`,
          brand: p.brand || "SportX",
          name: p.name,
          size: it.size || "US 9",
          quantity: it.quantity,
          unitPrice,
          lineTotal,
          remainingStock: upd.stock,
        });
      }

      subtotal = Number(subtotal.toFixed(2));
      const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
      const afterDiscount = Math.max(0, subtotal - discountAmount);

      // Interés por financiación en cuotas (1 y 3 cuotas 0% interés; 6 cuotas +8%; 12 cuotas +16%)
      const surchargePercent =
        paymentMethod === "card"
          ? installments === 6
            ? 8
            : installments === 12
            ? 16
            : 0
          : 0;
      const surchargeAmount = Number(((afterDiscount * surchargePercent) / 100).toFixed(2));
      const finalTotal = Number((afterDiscount + surchargeAmount).toFixed(2));

      // Discriminación impositiva IVA 21%
      const netTaxable = Number((finalTotal / 1.21).toFixed(2));
      const ivaAmount = Number((finalTotal - netTaxable).toFixed(2));

      const [done] = await tx
        .update(orders)
        .set({ total: finalTotal.toFixed(2) })
        .where(eq(orders.id, o.id))
        .returning();

      const now = new Date();
      const caeExpiryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
      const cae = `7442${String(o.id).padStart(4, "0")}${String(now.getTime()).slice(-6)}`;

      return {
        ...done,
        receipt: {
          orderId: o.id,
          receiptNumber,
          invoiceType,
          cae,
          caeExpiry: caeExpiryDate.toLocaleDateString("es-AR"),
          createdAt: now.toISOString(),
          formattedDate: now.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          formattedTime: now.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          branch,
          cashierName: req.user!.name,
          cashierId: req.user!.id,
          customerName: clientLabel,
          customerDoc: docLabel,
          paymentMethod,
          paymentLabel: payLabel,
          installments,
          subtotal,
          discountPercent,
          discountAmount,
          surchargePercent,
          surchargeAmount,
          netTaxable,
          ivaAmount,
          total: finalTotal,
          cashGiven: paymentMethod === "cash" && cashGiven > 0 ? cashGiven : finalTotal,
          changeDue:
            paymentMethod === "cash" && cashGiven > finalTotal
              ? Number((cashGiven - finalTotal).toFixed(2))
              : 0,
          items: processedItems,
        },
      };
    });

    res.status(201).json(result);
  } catch (e: any) {
    res.status(409).json({ error: e.message });
  }
}));

// POS: Últimas ventas físicas registradas en mostrador
r.get("/pos/recent", requireRole("seller", "admin"), wrap(async (_req, res) => {
  const rows = await db
    .select({ o: orders, cashierName: users.name })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.consumerId))
    .where(sql`${orders.shippingAddress} LIKE 'Venta Mostrador POS%'`)
    .orderBy(desc(orders.createdAt))
    .limit(12);

  const enriched = await withItems(
    rows.map((x) => ({ ...x.o, consumerName: x.cashierName }))
  );
  res.json(enriched);
}));

// Consumer: sus pedidos
r.get("/mine", requireRole("consumer", "seller", "admin"), wrap(async (req, res) => {
  const list = await db
    .select()
    .from(orders)
    .where(eq(orders.consumerId, req.user!.id))
    .orderBy(desc(orders.createdAt));

  res.json(await withItems(list));
}));

// Seller: pedidos que contienen sus productos
r.get("/seller", requireRole("seller", "admin"), wrap(async (req, res) => {
  const ids = await db
    .selectDistinct({ id: orderItems.orderId })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(products.sellerId, req.user!.id));

  if (!ids.length) return res.json([]);

  const list = await db
    .select()
    .from(orders)
    .where(inArray(orders.id, ids.map((i) => i.id)))
    .orderBy(desc(orders.createdAt));

  res.json(await withItems(list, req.user!.id));
}));

// Admin: todos
r.get("/", requireRole("admin"), wrap(async (_req, res) => {
  const rows = await db
    .select({ o: orders, consumerName: users.name })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.consumerId))
    .orderBy(desc(orders.createdAt));

  res.json(await withItems(rows.map((x) => ({ ...x.o, consumerName: x.consumerName }))));
}));

// Status update
r.patch("/:id/status", requireRole("seller", "admin"), validate(orderStatusSchema), wrap(async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (req.user!.role === "seller") {
    if (status !== "shipped") return res.status(403).json({ error: "El vendedor solo puede marcar como enviado" });
    const mine = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(sql`${orderItems.orderId} = ${id} AND ${products.sellerId} = ${req.user!.id}`)
      .limit(1);

    if (!mine.length) return res.status(403).json({ error: "Pedido sin productos de tu autoría" });
  }

  const [o] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
  o ? res.json(o) : res.status(404).json({ error: "No encontrado" });
}));

export default r;
