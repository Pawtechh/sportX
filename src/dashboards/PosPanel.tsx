import React, { useState } from "react";
import {
  Store,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  RotateCcw,
  ShoppingBag,
  Receipt,
  Building2,
  Percent,
  UserCheck,
  Barcode,
  History,
  Download,
  X,
} from "lucide-react";
import { api, money, useFetch } from "../api";
import { toast } from "sonner";
import { ShimmerButton } from "../components/magic";
import type { Product } from "../types";
import { ProductImage } from "../components/ProductImage";

interface PosLine {
  lineKey: string;
  product: Product;
  quantity: number;
  size: string;
}

interface PosReceiptData {
  orderId: number;
  receiptNumber: string;
  invoiceType: "B" | "A" | "X";
  cae: string;
  caeExpiry: string;
  createdAt: string;
  formattedDate: string;
  formattedTime: string;
  branch: string;
  cashierName: string;
  customerName: string;
  customerDoc: string;
  paymentMethod: "cash" | "card" | "qr" | "transfer";
  paymentLabel: string;
  installments: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  surchargePercent: number;
  surchargeAmount: number;
  netTaxable: number;
  ivaAmount: number;
  total: number;
  cashGiven: number;
  changeDue: number;
  items: Array<{
    productId: number;
    sku: string;
    brand: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    remainingStock?: number;
  }>;
}

const BRANCHES = [
  { id: "Flagship Palermo Soho", address: "Honduras 4900, CABA", pv: "0004" },
  { id: "Unicenter Shopping", address: "Paraná 3745, Martínez", pv: "0005" },
  { id: "Alto Palermo Mall", address: "Av. Santa Fe 3253, CABA", pv: "0006" },
];

/** Genera barras determinísticas para el código de barras visual del ticket */
function generateBarcodeBars(code: string): number[] {
  const clean = code.replace(/\D/g, "") || "7798142000184";
  const bars: number[] = [2, 1, 2, 1];
  for (let i = 0; i < clean.length; i++) {
    const d = Number(clean[i]) || 3;
    bars.push((d % 3) + 1, ((d + 1) % 2) + 1, ((d + 2) % 3) + 1, 1);
  }
  bars.push(1, 2, 1, 2);
  return bars;
}

/** Abre una ventana / frame limpio con formato papel térmico 80mm / A4 y dispara la impresión nativa */
function printReceiptClean(receipt: PosReceiptData) {
  const branchInfo = BRANCHES.find((b) => b.id === receipt.branch) || BRANCHES[0];
  const bars = generateBarcodeBars(receipt.cae + receipt.receiptNumber);
  const barcodeSvgBars = bars
    .map((w, idx) => {
      const isBlack = idx % 2 === 0;
      return `<span style="display:inline-block;height:44px;width:${w * 1.6}px;background:${
        isBlack ? "#000" : "transparent"
      };"></span>`;
    })
    .join("");

  const itemsHtml = receipt.items
    .map(
      (it) => `
      <tr>
        <td style="padding:5px 0;vertical-align:top;">
          <div style="font-weight:700;font-size:12px;color:#000;">${it.name}</div>
          <div style="font-size:11px;color:#444;">SKU: ${it.sku} · Talle: ${it.size} · ${it.quantity} x $${it.unitPrice.toFixed(2)}</div>
        </td>
        <td style="padding:5px 0;text-align:right;vertical-align:top;font-weight:700;font-size:12px;color:#000;white-space:nowrap;">
          $${it.lineTotal.toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ticket Fiscal SportX ${receipt.receiptNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 4mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #f4f4f5;
      color: #000;
      padding: 20px;
      display: flex;
      justify-content: center;
    }
    .ticket {
      width: 320px;
      max-width: 100%;
      background: #ffffff;
      color: #000000;
      padding: 18px 16px;
      border: 1px solid #d4d4d8;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }
    .center { text-align: center; }
    .brand {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 22px;
      font-weight: 900;
      font-style: italic;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .meta {
      font-size: 11px;
      line-height: 1.4;
      color: #222;
      margin-top: 6px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 10px 0;
    }
    .divider-solid {
      border-top: 2px solid #000;
      margin: 10px 0;
    }
    .fiscal-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1.5px solid #000;
      padding: 6px 10px;
      margin: 10px 0;
    }
    .fiscal-letter {
      font-family: system-ui, sans-serif;
      font-size: 24px;
      font-weight: 900;
      border: 2px solid #000;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      line-height: 1.5;
    }
    .row-sm {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: system-ui, sans-serif;
      font-size: 18px;
      font-weight: 900;
      padding: 6px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .footer-note {
      font-size: 10px;
      text-align: center;
      line-height: 1.4;
      margin-top: 10px;
      color: #333;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .ticket {
        width: 100%;
        border: none;
        box-shadow: none;
        padding: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="center">
      <div class="brand">SPORTX LAB S.A.</div>
      <div class="subtitle">HIGH PERFORMANCE RETAIL</div>
      <div class="meta">
        CUIT: 30-71849201-9 · IIBB: 901-284910-2<br/>
        Sucursal: ${receipt.branch}<br/>
        ${branchInfo.address}<br/>
        IVA RESPONSABLE INSCRIPTO
      </div>
    </div>

    <div class="fiscal-box">
      <div class="fiscal-letter">${receipt.invoiceType}</div>
      <div style="text-align:right;font-size:11px;line-height:1.35;">
        <div style="font-weight:800;font-size:12px;">TIQUE FACTURA "${receipt.invoiceType}"</div>
        <div>N° ${receipt.receiptNumber}</div>
        <div>Fecha: ${receipt.formattedDate} ${receipt.formattedTime}</div>
      </div>
    </div>

    <div class="row-sm"><span>CLIENTE:</span><strong style="color:#000;">${receipt.customerName}</strong></div>
    <div class="row-sm"><span>DNI / CUIT:</span><span>${receipt.customerDoc || "Consumidor Final"}</span></div>
    <div class="row-sm"><span>CAJERO:</span><span>${receipt.cashierName}</span></div>

    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:4px;">
      <span>DESCRIPCIÓN / SKU</span>
      <span>IMPORTE</span>
    </div>
    <table>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="divider"></div>
    <div class="row">
      <span>SUBTOTAL BRUTO:</span>
      <span>$${receipt.subtotal.toFixed(2)}</span>
    </div>
    ${
      receipt.discountAmount > 0
        ? `<div class="row">
            <span>BONIF. (${receipt.discountPercent}%):</span>
            <span>-$${receipt.discountAmount.toFixed(2)}</span>
          </div>`
        : ""
    }
    ${
      receipt.surchargeAmount > 0
        ? `<div class="row">
            <span>COSTO FINANC. (${receipt.surchargePercent}%):</span>
            <span>+$${receipt.surchargeAmount.toFixed(2)}</span>
          </div>`
        : ""
    }

    <div class="divider-solid"></div>
    <div class="total-row">
      <span>TOTAL</span>
      <span>$${receipt.total.toFixed(2)}</span>
    </div>
    <div class="divider"></div>

    <div class="row-sm">
      <span>Régimen de Transparencia Fiscal (Ley 27.743)</span>
      <span></span>
    </div>
    <div class="row-sm">
      <span>Neto Sin Impuestos Nacionales:</span>
      <span>$${receipt.netTaxable.toFixed(2)}</span>
    </div>
    <div class="row-sm">
      <span>IVA Contenido (21%):</span>
      <span>$${receipt.ivaAmount.toFixed(2)}</span>
    </div>

    <div class="divider"></div>
    <div class="row">
      <span>MEDIO DE PAGO:</span>
      <strong>${receipt.paymentLabel}</strong>
    </div>
    ${
      receipt.paymentMethod === "cash"
        ? `<div class="row-sm"><span>Efectivo Recibido:</span><span>$${receipt.cashGiven.toFixed(2)}</span></div>
           <div class="row-sm"><span>Su Vuelto:</span><strong>$${receipt.changeDue.toFixed(2)}</strong></div>`
        : ""
    }

    <div class="divider"></div>
    <div class="center" style="margin-top:8px;">
      <div style="font-size:11px;font-weight:700;">CAE N°: ${receipt.cae}</div>
      <div style="font-size:11px;">Vto. CAE: ${receipt.caeExpiry}</div>
      <div style="margin:10px auto 4px;display:inline-block;">
        ${barcodeSvgBars}
      </div>
      <div style="font-size:10px;letter-spacing:2px;">*${receipt.receiptNumber.replace("-", "")}*</div>
    </div>

    <div class="footer-note">
      Cambios dentro de los 30 días presentando este ticket y etiqueta original.<br/>
      <strong>¡GRACIAS POR ELEGIR SPORTX!</strong><br/>
      sportx.com.ar
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 180);
    };
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=460,height=760,scrollbars=yes");
  if (printWin) {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  } else {
    window.print();
  }
}

export default function PosPanel() {
  const { data: catalogData, reload: reloadCatalog } = useFetch<{ products: Product[] }>("/products?limit=60");
  const { data: recentSales, reload: reloadRecent } = useFetch<any[]>("/orders/pos/recent");
  const products = catalogData?.products || [];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [cart, setCart] = useState<PosLine[]>([]);
  const [customerName, setCustomerName] = useState("Cliente Mostrador");
  const [customerDoc, setCustomerDoc] = useState("");
  const [invoiceType, setInvoiceType] = useState<"B" | "A" | "X">("B");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "qr" | "transfer">("cash");
  const [installments, setInstallments] = useState<number>(1);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PosReceiptData | null>(null);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "running", label: "Running" },
    { id: "basketball", label: "Básquet" },
    { id: "training", label: "Training" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "ropa", label: "Ropa" },
    { id: "pelotas", label: "Pelotas" },
    { id: "accesorios", label: "Accesorios" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      p.brand.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  // Cantidad total de un mismo producto en el carrito (sumando todos los talles)
  const getProductQtyInCart = (productId: number) =>
    cart.filter((item) => item.product.id === productId).reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product, preferredSize?: string) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" sin stock disponible en almacén`);
      return;
    }

    const totalInCart = getProductQtyInCart(product.id);
    if (totalInCart >= product.stock) {
      toast.warning(`Límite de stock alcanzado para "${product.name}" (${product.stock} u.)`);
      return;
    }

    const targetSize = preferredSize || product.sizes[0] || "US 9";
    const lineKey = `${product.id}-${targetSize}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      if (existing) {
        return prev.map((item) =>
          item.lineKey === lineKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { lineKey, product, quantity: 1, size: targetSize }];
    });
  };

  // Escaneo rápido por SKU / Enter en el buscador
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() && filteredProducts.length > 0) {
      e.preventDefault();
      const first = filteredProducts[0];
      addToCart(first);
      toast.success(`Agregado por escáner: ${first.name}`);
      setSearch("");
    }
  };

  const updateQuantity = (lineKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.lineKey === lineKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const otherSizesQty = prev
              .filter((x) => x.product.id === item.product.id && x.lineKey !== lineKey)
              .reduce((a, b) => a + b.quantity, 0);
            if (newQty + otherSizesQty > item.product.stock) {
              toast.warning(`Stock máximo en almacén: ${item.product.stock} unidades`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as PosLine[]
    );
  };

  const updateSize = (oldLineKey: string, newSize: string) => {
    setCart((prev) => {
      const target = prev.find((i) => i.lineKey === oldLineKey);
      if (!target) return prev;
      const newLineKey = `${target.product.id}-${newSize}`;
      const existingSameSize = prev.find((i) => i.lineKey === newLineKey && i.lineKey !== oldLineKey);

      if (existingSameSize) {
        return prev
          .map((i) =>
            i.lineKey === newLineKey ? { ...i, quantity: i.quantity + target.quantity } : i
          )
          .filter((i) => i.lineKey !== oldLineKey);
      }

      return prev.map((i) =>
        i.lineKey === oldLineKey ? { ...i, size: newSize, lineKey: newLineKey } : i
      );
    });
  };

  const removeFromCart = (lineKey: string) => {
    setCart((prev) => prev.filter((item) => item.lineKey !== lineKey));
  };

  // Cálculos financieros en vivo
  const subtotal = Number(
    cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0).toFixed(2)
  );
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const surchargePercent =
    paymentMethod === "card" ? (installments === 6 ? 8 : installments === 12 ? 16 : 0) : 0;
  const surchargeAmount = Number(((afterDiscount * surchargePercent) / 100).toFixed(2));
  const total = Number((afterDiscount + surchargeAmount).toFixed(2));
  const netTaxable = Number((total / 1.21).toFixed(2));
  const ivaAmount = Number((total - netTaxable).toFixed(2));

  const cashGiven = Number(cashAmount) || 0;
  const changeDue = Math.max(0, Number((cashGiven - total).toFixed(2)));

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return toast.error("El ticket está vacío. Selecciona al menos un producto.");
    }

    if (invoiceType === "A" && customerDoc.trim().length < 8) {
      return toast.error("Para emitir Factura A debes ingresar un CUIT válido.");
    }

    if (paymentMethod === "cash" && cashGiven > 0 && cashGiven < total) {
      return toast.error(
        `El efectivo recibido (${money(cashGiven)}) es menor al total a cobrar (${money(total)})`
      );
    }

    setBusy(true);
    try {
      const payload = {
        items: cart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
          size: c.size,
        })),
        paymentMethod,
        installments: paymentMethod === "card" ? installments : 1,
        discountPercent,
        customerName: customerName.trim() || "Cliente Mostrador",
        customerDoc: customerDoc.trim(),
        invoiceType,
        branch,
        cashGiven: paymentMethod === "cash" && cashGiven > 0 ? cashGiven : total,
      };

      const res = await api<{ receipt: PosReceiptData }>("/orders/pos", {
        method: "POST",
        body: payload,
      });

      toast.success(`Venta registrada · Ticket ${res.receipt.receiptNumber}`);
      setActiveReceipt(res.receipt);
      setCart([]);
      setCashAmount("");
      setDiscountPercent(0);
      reloadCatalog();
      reloadRecent();
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la venta en mostrador");
    } finally {
      setBusy(false);
    }
  };

  // Reconstruir un ticket desde una orden histórica para reimpresión
  const reopenPastOrder = (order: any) => {
    const orderTotal = Number(order.total || 0);
    const net = Number((orderTotal / 1.21).toFixed(2));
    const iva = Number((orderTotal - net).toFixed(2));
    const createdDate = new Date(order.createdAt || Date.now());
    const receiptNum = `0004-${String(order.id + 18400).padStart(8, "0")}`;

    setActiveReceipt({
      orderId: order.id,
      receiptNumber: receiptNum,
      invoiceType: "B",
      cae: `7442${String(order.id).padStart(4, "0")}918240`,
      caeExpiry: new Date(createdDate.getTime() + 10 * 86400000).toLocaleDateString("es-AR"),
      createdAt: createdDate.toISOString(),
      formattedDate: createdDate.toLocaleDateString("es-AR"),
      formattedTime: createdDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
      branch,
      cashierName: order.consumerName || "Operador POS",
      customerName: "Cliente Mostrador",
      customerDoc: "Consumidor Final",
      paymentMethod: "cash",
      paymentLabel: "Registrado en Caja",
      installments: 1,
      subtotal: orderTotal,
      discountPercent: 0,
      discountAmount: 0,
      surchargePercent: 0,
      surchargeAmount: 0,
      netTaxable: net,
      ivaAmount: iva,
      total: orderTotal,
      cashGiven: orderTotal,
      changeDue: 0,
      items: (order.items || []).map((it: any) => ({
        productId: it.productId,
        sku: it.sku || `SPX-${it.productId}`,
        brand: it.brand || "SportX",
        name: it.name,
        size: it.size || "US 9",
        quantity: it.quantity,
        unitPrice: Number(it.price),
        lineTotal: Number((Number(it.price) * it.quantity).toFixed(2)),
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Operativa POS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#CCFF00] mb-2">
            <Store className="h-3.5 w-3.5" />
            <span>Terminal de Facturación & Almacén Físico</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
            PUNTO DE VENTA <span className="px-2 py-0.5 rounded bg-neutral-900 text-[#CCFF00]">POS</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Facturación instantánea con descuento atómico de stock, cálculo de IVA (Ley 27.743) e impresión térmica 80mm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
            <Building2 className="h-4 w-4 text-zinc-400" />
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              aria-label="Seleccionar sucursal"
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id} className="bg-zinc-900 text-white">
                  {b.id} (PV {b.pv})
                </option>
              ))}
            </select>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Fiscal Online
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= Columna Izquierda: Catálogo & Escáner (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Buscador con soporte de lector de código de barras (Enter) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Barcode className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Escanear SKU o buscar producto (Presiona Enter para carga rápida)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="input pl-10 text-xs sm:text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                  selectedCategory === c.id
                    ? "bg-neutral-900 text-[#CCFF00] border border-[#CCFF00]/50 shadow-sm"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grilla de Productos con Stock en Tiempo Real */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const qtyInCart = getProductQtyInCart(p.id);
              const remaining = p.stock - qtyInCart;
              const isOutOfStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`group rounded-2xl border p-3 flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? "border-zinc-800/40 bg-zinc-950/40 opacity-45 cursor-not-allowed"
                      : qtyInCart > 0
                      ? "border-emerald-500/70 bg-zinc-900 shadow-md cursor-pointer"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900 cursor-pointer"
                  }`}
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-950 mb-2.5">
                      <ProductImage
                        src={p.images[0]}
                        alt={p.name}
                        category={p.category}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-neutral-900/90 px-2 py-0.5 font-mono text-xs font-black text-[#CCFF00]">
                        {money(Number(p.price))}
                      </span>
                      {qtyInCart > 0 && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-md">
                          En ticket: {qtyInCart}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-xs font-mono text-zinc-400 mb-0.5">
                      <span className="truncate font-semibold">{p.sku || p.brand}</span>
                      <span className="uppercase text-zinc-500">{p.brand}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">{p.name}</h4>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span
                      className={`font-bold ${
                        isOutOfStock
                          ? "text-red-500"
                          : remaining <= 5
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {isOutOfStock ? "Agotado" : `Disp: ${remaining} u.`}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-zinc-300 group-hover:text-white">
                      <Plus className="h-3.5 w-3.5" /> Sumar
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historial Rápido de Ventas Físicas de la Caja */}
          {recentSales && recentSales.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                  <History className="h-4 w-4 text-emerald-400" />
                  <span>Últimos Tickets Emitidos en Mostrador ({recentSales.length})</span>
                </div>
                <span className="text-xs text-zinc-400">Haz clic para reimprimir</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {recentSales.slice(0, 6).map((sale: any) => {
                  const ticketCode = `0004-${String(sale.id + 18400).padStart(8, "0")}`;
                  return (
                    <button
                      key={sale.id}
                      type="button"
                      onClick={() => reopenPastOrder(sale)}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-left hover:border-zinc-600 transition"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-white">#{ticketCode}</div>
                        <div className="text-xs text-zinc-400 truncate">
                          {new Date(sale.createdAt).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {(sale.items || []).reduce((a: number, b: any) => a + b.quantity, 0)} art.
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-lg bg-neutral-900 px-2 py-1 font-mono text-xs font-black text-[#CCFF00]">
                          {money(Number(sale.total))}
                        </span>
                        <Printer className="h-4 w-4 text-zinc-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= Columna Derecha: Registradora Fiscal & Cobro (5 cols) ================= */}
        <div className="lg:col-span-5 rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 sm:p-6 space-y-5 shadow-xl">
          {/* Encabezado de Ticket */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Caja Registradora POS
                </h3>
                <p className="text-xs text-zinc-400">
                  {cart.reduce((a, b) => a + b.quantity, 0)} unidades cargadas
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs font-bold text-red-400 hover:text-red-300 transition px-2.5 py-1 rounded-lg bg-red-500/10"
              >
                Vaciar Caja
              </button>
            )}
          </div>

          {/* Tipo de Comprobante y Datos del Cliente */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "B", label: "Factura B", sub: "Cons. Final" },
                { id: "A", label: "Factura A", sub: "Resp. Insc." },
                { id: "X", label: "Ticket Cambio", sub: "Regalo" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setInvoiceType(t.id as any)}
                  className={`rounded-xl p-2 text-left border transition ${
                    invoiceType === t.id
                      ? "bg-neutral-900 border-emerald-500 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-black uppercase text-white">{t.label}</div>
                  <div className="text-xs text-zinc-400">{t.sub}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Nombre / Razón Social
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input !py-2 !pl-9 text-xs"
                    placeholder="Cliente Mostrador"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  {invoiceType === "A" ? "CUIT Obligatorio *" : "DNI / CUIT (Opcional)"}
                </label>
                <input
                  type="text"
                  value={customerDoc}
                  onChange={(e) => setCustomerDoc(e.target.value)}
                  className="input !py-2 text-xs font-mono"
                  placeholder={invoiceType === "A" ? "30-71234567-9" : "Ej: 40123456"}
                />
              </div>
            </div>
          </div>

          {/* Líneas de Productos en el Ticket */}
          <div className="space-y-2 max-h-[230px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 py-8 px-4 text-center space-y-1">
                <ShoppingBag className="h-6 w-6 text-zinc-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-zinc-300">No hay productos en el ticket actual</p>
                <p className="text-xs text-zinc-500">
                  Haz clic en cualquier producto del catálogo o escanea el código SKU.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.lineKey}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {item.product.sku || item.product.brand}
                      </span>
                      <h5 className="font-bold text-white truncate">{item.product.name}</h5>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className="text-xs text-zinc-400">Talle:</label>
                      <select
                        value={item.size}
                        onChange={(e) => updateSize(item.lineKey, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-md px-2 py-0.5 text-xs font-bold text-white"
                      >
                        {item.product.sizes.map((s) => (
                          <option key={s} value={s} className="bg-zinc-900 text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="font-mono text-xs text-zinc-400">
                        {money(Number(item.product.price))} c/u
                      </span>
                    </div>
                  </div>

                  {/* Controles de Cantidad y Subtotal de Línea */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineKey, -1)}
                      className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono font-black text-white w-5 text-center text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineKey, 1)}
                      className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <span className="rounded-md bg-neutral-900 px-2 py-1 font-mono font-bold text-[#CCFF00] min-w-[64px] text-right text-xs">
                      {money(Number(item.product.price) * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.lineKey)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                      title="Quitar ítem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Descuentos / Promociones de Caja */}
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <Percent className="h-3.5 w-3.5 text-emerald-400" />
                Bonificación / Descuento Comercial
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {discountPercent > 0 ? `-${discountPercent}% (${money(discountAmount)})` : "Sin descuento"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { pct: 0, label: "0% Normal" },
                { pct: 10, label: "10% Efec." },
                { pct: 15, label: "15% Club" },
                { pct: 20, label: "20% Staff" },
              ].map((d) => (
                <button
                  key={d.pct}
                  type="button"
                  onClick={() => setDiscountPercent(d.pct)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                    discountPercent === d.pct
                      ? "bg-emerald-500 text-black font-black"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Forma de Cobro */}
          <div className="border-t border-zinc-800 pt-3 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Medio de Cobro en Terminal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "cash", label: "Efectivo", icon: Banknote },
                { id: "card", label: "Tarjeta", icon: CreditCard },
                { id: "qr", label: "QR / MP", icon: QrCode },
                { id: "transfer", label: "Transf.", icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition ${
                      paymentMethod === m.id
                        ? "bg-neutral-900 border-[#CCFF00] text-[#CCFF00] font-black shadow-sm"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Opciones de Cuotas para Tarjeta */}
            {paymentMethod === "card" && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                <span className="text-xs font-bold text-zinc-400 block">Plan de Cuotas Posnet:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { c: 1, label: "1 Pago (0%)" },
                    { c: 3, label: "3 CSI (0%)" },
                    { c: 6, label: "6 Cuot (+8%)" },
                    { c: 12, label: "12 Cuot (+16%)" },
                  ].map((plan) => (
                    <button
                      key={plan.c}
                      type="button"
                      onClick={() => setInstallments(plan.c)}
                      className={`py-1.5 px-1.5 rounded-lg text-xs font-bold transition ${
                        installments === plan.c
                          ? "bg-neutral-900 text-[#CCFF00] border border-[#CCFF00]"
                          : "bg-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {plan.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculadora de Vuelto con Botones Rápidos de Billetes */}
            {paymentMethod === "cash" && total > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-zinc-300 font-semibold">Efectivo recibido ($):</span>
                  <input
                    type="number"
                    placeholder={`Exacto: ${total.toFixed(2)}`}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="input !w-32 !py-1 text-right font-mono text-xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Exacto", val: total },
                    { label: "$100", val: 100 },
                    { label: "$200", val: 200 },
                    { label: "$500", val: 500 },
                    { label: "$1000", val: 1000 },
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setCashAmount(String(b.val))}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:border-zinc-600"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
                {cashGiven >= total && (
                  <div className="flex items-center justify-between text-xs font-bold pt-1.5 border-t border-zinc-800">
                    <span className="text-emerald-400">Vuelto a entregar en caja:</span>
                    <span className="font-mono text-emerald-400 text-sm">{money(changeDue)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumen Fiscal (Subtotal + IVA discriminado + Total) */}
          <div className="border-t border-zinc-800 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal Bruto</span>
              <span className="font-mono text-white">{money(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Bonificación ({discountPercent}%)</span>
                <span className="font-mono">-{money(discountAmount)}</span>
              </div>
            )}
            {surchargeAmount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Costo Financiación ({surchargePercent}%)</span>
                <span className="font-mono">+{money(surchargeAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Neto Gravado (sin IVA) · IVA 21%</span>
              <span className="font-mono text-zinc-300">
                {money(netTaxable)} + {money(ivaAmount)}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Total Fiscal a Cobrar
              </span>
              <span className="rounded-xl bg-neutral-900 px-3 py-1 text-2xl font-black italic font-mono text-[#CCFF00]">
                {money(total)}
              </span>
            </div>

            <div className="pt-2">
              <ShimmerButton
                onClick={handleCheckout}
                disabled={busy || cart.length === 0}
                className="w-full !py-3.5 text-sm font-black"
              >
                {busy ? "Emitiendo Comprobante Fiscal..." : `Facturar y Emitir Ticket • ${money(total)}`}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Modal de Ticket Fiscal Térmico Realista ================= */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-md space-y-4">
            {/* Barra de Acciones Superior */}
            <div className="flex items-center justify-between rounded-2xl bg-neutral-900 border border-zinc-700 px-4 py-3 text-white shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Comprobante Fiscal Emitido
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Papel Térmico Blanco Realista (Siempre Blanco con Tinta Negra para Lectura e Impresión Perfecta) */}
            <div
              id="pos-thermal-ticket"
              style={{ backgroundColor: "#ffffff", color: "#111111" }}
              className="mx-auto w-full max-w-[360px] rounded-sm border border-zinc-300 p-6 shadow-2xl font-mono text-xs leading-relaxed"
            >
              {/* Cabecera Empresa */}
              <div className="text-center border-b border-dashed border-neutral-400 pb-3">
                <div
                  style={{ color: "#000000" }}
                  className="font-sans text-2xl font-black italic tracking-tighter uppercase"
                >
                  SPORTX LAB S.A.
                </div>
                <div style={{ color: "#333333" }} className="text-xs font-bold tracking-widest uppercase">
                  HIGH PERFORMANCE RETAIL
                </div>
                <div style={{ color: "#444444" }} className="mt-1.5 text-xs leading-snug">
                  CUIT: 30-71849201-9 · IIBB: 901-284910-2
                  <br />
                  Sucursal: {activeReceipt.branch}
                  <br />
                  IVA RESPONSABLE INSCRIPTO
                </div>
              </div>

              {/* Recuadro Fiscal Letra B / A */}
              <div className="my-3 flex items-center justify-between border-2 border-black p-2.5">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black font-sans text-2xl font-black text-black">
                  {activeReceipt.invoiceType}
                </div>
                <div className="text-right text-xs leading-tight text-black">
                  <div className="font-bold">TIQUE FACTURA &ldquo;{activeReceipt.invoiceType}&rdquo;</div>
                  <div className="font-bold">N° {activeReceipt.receiptNumber}</div>
                  <div>
                    {activeReceipt.formattedDate} · {activeReceipt.formattedTime}
                  </div>
                </div>
              </div>

              {/* Datos Receptor y Operador */}
              <div className="space-y-0.5 border-b border-dashed border-neutral-400 pb-2.5 text-xs text-black">
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>CLIENTE:</span>
                  <span className="font-bold">{activeReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>DOC / CUIT:</span>
                  <span>{activeReceipt.customerDoc || "Consumidor Final"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#555555" }}>CAJERO:</span>
                  <span>{activeReceipt.cashierName}</span>
                </div>
              </div>

              {/* Detalle de Artículos */}
              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-2 text-black">
                <div className="flex justify-between font-bold text-xs border-b border-neutral-300 pb-1">
                  <span>CANT x PRECIO / DESCRIPCIÓN</span>
                  <span>IMPORTE</span>
                </div>
                {activeReceipt.items.map((it, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-black">
                      <span className="pr-2">
                        {it.name} ({it.size})
                      </span>
                      <span className="shrink-0">${it.lineTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ color: "#555555" }} className="text-xs">
                      {it.quantity} u. × ${it.unitPrice.toFixed(2)} · SKU: {it.sku}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotales y Descuentos */}
              <div className="py-2.5 border-b-2 border-black space-y-1 text-xs text-black">
                <div className="flex justify-between">
                  <span>SUBTOTAL BRUTO:</span>
                  <span>${activeReceipt.subtotal.toFixed(2)}</span>
                </div>
                {activeReceipt.discountAmount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>BONIFICACIÓN ({activeReceipt.discountPercent}%):</span>
                    <span>-${activeReceipt.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {activeReceipt.surchargeAmount > 0 && (
                  <div className="flex justify-between">
                    <span>CARGO FINANC. ({activeReceipt.surchargePercent}%):</span>
                    <span>+${activeReceipt.surchargeAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1 font-sans text-lg font-black text-black">
                  <span>TOTAL</span>
                  <span>${activeReceipt.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Transparencia Fiscal Ley 27.743 + Pago */}
              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-xs text-black">
                <div className="font-bold">Régimen de Transparencia Fiscal (Ley 27.743)</div>
                <div className="flex justify-between" style={{ color: "#444444" }}>
                  <span>Neto Gravado (sin impuestos):</span>
                  <span>${activeReceipt.netTaxable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "#444444" }}>
                  <span>IVA Contenido (21%):</span>
                  <span>${activeReceipt.ivaAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-black">
                  <span>MEDIO DE PAGO:</span>
                  <span>{activeReceipt.paymentLabel}</span>
                </div>
                {activeReceipt.paymentMethod === "cash" && (
                  <div className="flex justify-between" style={{ color: "#444444" }}>
                    <span>Recibido: ${activeReceipt.cashGiven.toFixed(2)}</span>
                    <span className="font-bold text-black">
                      Vuelto: ${activeReceipt.changeDue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* CAE + Código de Barras Vectorial */}
              <div className="pt-3 text-center space-y-1 text-black">
                <div className="text-xs font-bold">CAE N°: {activeReceipt.cae}</div>
                <div className="text-xs" style={{ color: "#444444" }}>
                  Vto. CAE: {activeReceipt.caeExpiry}
                </div>

                {/* Barcode Visual */}
                <div className="py-2 flex items-center justify-center overflow-hidden">
                  {generateBarcodeBars(activeReceipt.cae + activeReceipt.receiptNumber).map((w, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        height: "38px",
                        width: `${w * 1.5}px`,
                        backgroundColor: i % 2 === 0 ? "#000000" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <div className="text-xs tracking-widest font-bold">
                  *{activeReceipt.receiptNumber.replace("-", "")}*
                </div>
                <p style={{ color: "#555555" }} className="text-xs pt-2 leading-snug">
                  Cambios dentro de los 30 días con etiqueta original.
                  <br />
                  <strong className="text-black">¡GRACIAS POR ENTRENAR CON SPORTX!</strong>
                </p>
              </div>
            </div>

            {/* Botones de Impresión Térmica y Nueva Venta */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => printReceiptClean(activeReceipt)}
                className="flex-1 rounded-2xl bg-[#CCFF00] px-5 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg hover:brightness-95 transition flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Ticket / PDF (80mm)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="rounded-2xl border border-zinc-700 bg-neutral-900 px-5 py-3.5 text-xs font-bold uppercase text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
