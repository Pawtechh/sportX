import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Product } from "../types";
import { useAuth } from "./AuthContext";

export interface CartLine {
  product: Product;
  quantity: number;
  size: string;
}

interface CartCtx {
  lines: CartLine[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (p: Product, size?: string) => void;
  setQty: (id: number, size: string, q: number) => void;
  remove: (id: number, size: string) => void;
  clear: () => void;
  count: number;
  total: number;
  lastAddedKey: string | null;
}

const Ctx = createContext<CartCtx>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Clave de almacenamiento aislada por usuario para evitar que se comparta el carrito entre cuentas
  const storageKey = user ? `sportx_cart_user_${user.id}` : "sportx_cart_guest";

  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      // Limpiar clave legada global compartida
      localStorage.removeItem("sportx_cart");
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    } catch {
      return [];
    }
  });

  const [open, setOpen] = useState(false);
  const [lastAddedKey, setLastAddedKey] = useState<string | null>(null);

  // Referencia a la clave anterior para detectar cambios de usuario
  const prevKeyRef = useRef(storageKey);

  // Cuando cambia el usuario (login, logout o cambio de cuenta), cargar exclusivamente el carrito de ese usuario
  useEffect(() => {
    if (prevKeyRef.current !== storageKey) {
      prevKeyRef.current = storageKey;
      try {
        const saved = localStorage.getItem(storageKey);
        setLines(saved ? JSON.parse(saved) : []);
      } catch {
        setLines([]);
      }
    }
  }, [storageKey]);

  // Persistir las líneas en la clave privada del usuario activo
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines, storageKey]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      open,
      setOpen,
      lastAddedKey,
      add: (p, customSize) => {
        const size = customSize || (p.sizes && p.sizes[0]) || "US 9";
        setLines((ls) => {
          const existing = ls.find((x) => x.product.id === p.id && x.size === size);
          if (existing) {
            return ls.map((x) =>
              x === existing
                ? { ...x, quantity: Math.min(x.quantity + 1, p.stock, 20) }
                : x
            );
          }
          return [...ls, { product: p, quantity: 1, size }];
        });
        setLastAddedKey(`${p.id}-${size}-${Date.now()}`);
      },
      setQty: (id, size, q) =>
        setLines((ls) =>
          ls.map((l) =>
            l.product.id === id && l.size === size
              ? { ...l, quantity: Math.max(1, Math.min(q, l.product.stock, 20)) }
              : l
          )
        ),
      remove: (id, size) =>
        setLines((ls) => ls.filter((l) => !(l.product.id === id && l.size === size))),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.quantity, 0),
      total: lines.reduce((s, l) => s + l.quantity * Number(l.product.price), 0),
    }),
    [lines, open, lastAddedKey]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => useContext(Ctx);
