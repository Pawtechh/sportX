import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import type { ZodSchema } from "zod";
import { db } from "./db";
import { users } from "./db/schema";

export const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
export type Role = "admin" | "seller" | "consumer";
export interface AuthUser { id: number; role: Role; name: string; email: string }

declare global {
  namespace Express { interface Request { user?: AuthUser } }
}

export const signToken = (u: { id: number }) =>
  jwt.sign({ sub: u.id }, JWT_SECRET, { expiresIn: "7d" });

/** Verifica el JWT y recarga el usuario desde la BD (así el suspendido pierde acceso al instante). */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "No autenticado" });
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET) as unknown as { sub: number };
    const [u] = await db.select().from(users).where(eq(users.id, Number(payload.sub)));
    if (!u) return res.status(401).json({ error: "Usuario no existe" });
    if (u.suspended) return res.status(403).json({ error: "Cuenta suspendida" });
    req.user = { id: u.id, role: u.role, name: u.name, email: u.email };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

export const requireRole = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) =>
  req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: "Sin permisos" });

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ error: "Datos inválidos", issues: r.error.flatten().fieldErrors });
  req.body = r.data;
  next();
};

/** Envuelve handlers async para propagar errores a Express. */
export const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
