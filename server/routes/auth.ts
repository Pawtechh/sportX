import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { loginSchema, registerSchema } from "../../shared/validators";
import { requireAuth, signToken, validate, wrap } from "../middleware";

const r = Router();
const publicUser = (u: typeof users.$inferSelect) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

r.post("/register", validate(registerSchema), wrap(async (req, res) => {
  const { email, password, name, role } = req.body;
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (exists) return res.status(409).json({ error: "Email ya registrado" });
  const [u] = await db.insert(users).values({ email, name, role, passwordHash: await bcrypt.hash(password, 10) }).returning();
  res.status(201).json({ token: signToken(u), user: publicUser(u) });
}));

r.post("/login", validate(loginSchema), wrap(async (req, res) => {
  const [u] = await db.select().from(users).where(eq(users.email, req.body.email));
  if (!u || !(await bcrypt.compare(req.body.password, u.passwordHash)))
    return res.status(401).json({ error: "Credenciales incorrectas" });
  if (u.suspended) return res.status(403).json({ error: "Cuenta suspendida" });
  res.json({ token: signToken(u), user: publicUser(u) });
}));

r.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

export default r;
