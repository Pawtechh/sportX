import React from "react";
import type { Product } from "../types";
import { money } from "../api";
import { getCategoryFallback } from "./ProductImage";
import ConfirmButton from "./ConfirmButton";

export interface ProductRowProps {
  product: Product;
  mode: "catalog" | "inventory";
  admin?: boolean;
  // Catalog actions
  onEdit?: (p: Product) => void;
  onDelete?: (p: Product) => void;
  // Inventory actions
  stockChange?: string;
  stockReason?: string;
  onStockChangeChange?: (val: string) => void;
  onStockReasonChange?: (val: string) => void;
  onStockSubmit?: (p: Product) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  mode,
  admin = false,
  onEdit,
  onDelete,
  stockChange = "",
  stockReason = "",
  onStockChangeChange,
  onStockReasonChange,
  onStockSubmit,
}) => {
  const fallbackImg = getCategoryFallback(product.category);
  const primaryImg = product.images?.[0] || (product as any).imageUrl || fallbackImg;
  const isLowStock = product.stock < 15;

  return (
    <tr className="border-b border-zinc-200/60 dark:border-zinc-800/80 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
      {/* 1. Silueta: Thumbnail 48x48 a la izquierda + Nombre + SKU */}
      <td className="td py-3">
        <div className="flex items-center gap-3">
          <img
            src={primaryImg}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImg;
            }}
            className="h-12 w-12 rounded-lg object-cover bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
              {product.sku ? `SKU: ${product.sku}` : `ID #${product.id}`}
            </p>
          </div>
        </div>
      </td>

      {/* 2. Categoría Badge */}
      <td className="td py-3">
        <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {product.category}
        </span>
      </td>

      {/* 3. Precio */}
      <td className="td py-3 font-mono font-bold text-xs text-zinc-900 dark:text-white">
        {money(product.price)}
      </td>

      {/* 4. Stock / Ajuste de Stock */}
      {mode === "catalog" ? (
        <td className="td py-3">
          <span
            className={`font-mono font-bold text-xs ${
              isLowStock ? "text-orange-600 dark:text-orange-400" : "text-zinc-900 dark:text-white"
            }`}
          >
            {product.stock}
          </span>
          {isLowStock && (
            <span className="ml-1.5 text-[9px] uppercase font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/50 px-1.5 py-0.5 rounded">
              Bajo
            </span>
          )}
        </td>
      ) : (
        <td className="td py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span
              className={`font-mono font-bold text-xs shrink-0 w-12 ${
                isLowStock ? "text-orange-600 dark:text-orange-400" : "text-zinc-900 dark:text-white"
              }`}
            >
              {product.stock} {isLowStock && <span className="text-[9px] block text-orange-500">Bajo</span>}
            </span>
            <input
              type="number"
              placeholder="± Cant."
              className="input !w-24 !py-1 text-xs font-mono"
              value={stockChange}
              onChange={(e) => onStockChangeChange?.(e.target.value)}
            />
            <input
              type="text"
              placeholder="Motivo auditoría..."
              className="input !w-44 !py-1 text-xs"
              value={stockReason}
              onChange={(e) => onStockReasonChange?.(e.target.value)}
            />
          </div>
        </td>
      )}

      {/* 5. Vendedor (solo catálogo admin) */}
      {mode === "catalog" && admin && (
        <td className="td py-3 text-xs text-zinc-500 dark:text-zinc-400">
          {(product as any).sellerName || "SportX Official"}
        </td>
      )}

      {/* 6. Acciones */}
      <td className="td py-3 text-right">
        {mode === "catalog" ? (
          <div className="flex items-center justify-end gap-2">
            {onEdit && (
              <button
                className="btn-ghost !py-1 !px-3 text-xs"
                onClick={() => onEdit(product)}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <ConfirmButton
                title="Eliminar Silueta"
                description={`¿Estás seguro de que deseas eliminar permanentemente la silueta "${product.name}"? Esta acción removerá el producto del catálogo y no se puede deshacer.`}
                confirmText="Eliminar Silueta"
                variant="danger"
                onConfirm={() => onDelete(product)}
              >
                <button className="btn-ghost !py-1 !px-3 text-xs hover:!border-red-500 hover:!text-red-500">
                  Borrar
                </button>
              </ConfirmButton>
            )}
          </div>
        ) : (
          <ConfirmButton
            title="Confirmar Ajuste de Stock"
            description={`¿Registrar cambio de stock (${
              stockChange ? (Number(stockChange) > 0 ? `+${stockChange}` : stockChange) : "0"
            }) para "${product.name}" con motivo: "${stockReason || 'Sin motivo'}"? Esta acción generará una entrada inmutable en auditoría.`}
            confirmText="Confirmar Ajuste"
            variant="warning"
            disabled={!stockChange || !stockReason}
            onConfirm={() => onStockSubmit?.(product)}
          >
            <button
              className="btn-ghost !py-1 !px-3 text-xs disabled:opacity-30"
              disabled={!stockChange || !stockReason}
            >
              Guardar Log
            </button>
          </ConfirmButton>
        )}
      </td>
    </tr>
  );
};

export default ProductRow;
