import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor(message: string, public issues?: Record<string, string[]>) { super(message); }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Error de red", data.issues);
  return data;
}

/** Hook de carga con refetch. */
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    if (!path) return;
    setLoading(true);
    api<T>(path).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [path]);
  useEffect(load, [load]);
  return { data, loading, reload: load };
}

export const money = (v: string | number) => `$${Number(v).toFixed(2)}`;
