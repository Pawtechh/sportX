import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";
import type { User } from "../types";

interface AuthCtx {
  user: User | null; ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (d: { email: string; password: string; name: string; role: "consumer" | "seller" }) => Promise<void>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) return setReady(true);
    api<{ user: User }>("/auth/me").then((r) => setUser(r.user)).catch(() => localStorage.removeItem("token")).finally(() => setReady(true));
  }, []);

  const finish = (r: { token: string; user: User }) => { localStorage.setItem("token", r.token); setUser(r.user); };
  return (
    <Ctx.Provider value={{
      user, ready,
      login: async (email, password) => finish(await api("/auth/login", { method: "POST", body: { email, password } })),
      register: async (d) => finish(await api("/auth/register", { method: "POST", body: d })),
      logout: () => { localStorage.removeItem("token"); setUser(null); },
    }}>{children}</Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
