import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { loginSchema, registerSchema } from "../../shared/validators";
import { ShimmerButton } from "../components/magic";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { user, login, register } = useAuth();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/dashboard";
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "consumer" as "consumer" | "seller" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = (mode === "login" ? loginSchema : registerSchema).safeParse(form);
    if (!r.success) {
      const errs: Record<string, string> = {};
      r.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      return setErrors(errs);
    }
    setErrors({}); setBusy(true);
    try {
      mode === "login" ? await login(form.email, form.password) : await register({ ...form });
      nav(from, { replace: true });
    } catch (err) { setErrors({ form: err instanceof ApiError ? err.message : "Error" }); }
    finally { setBusy(false); }
  }

  const field = (k: "name" | "email" | "password", label: string, type = "text") => (
    <div>
      <input className="input" type={type} placeholder={label} value={form[k]} onChange={set(k)} />
      {errors[k] && <p className="mt-1 text-xs text-red-400">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-5 pt-16">
      <form onSubmit={submit} className="animate__animated animate__fadeInUp w-full max-w-md space-y-4">
        <h1 className="mb-6 text-5xl font-black uppercase italic tracking-tighter">{mode === "login" ? "Entrar" : "Únete"}</h1>
        {mode === "register" && field("name", "Nombre")}
        {field("email", "Email", "email")}
        {field("password", "Contraseña", "password")}
        {errors.form && <p className="animate__animated animate__shakeX text-sm text-red-400">{errors.form}</p>}
        <ShimmerButton type="submit" disabled={busy} className="w-full">{busy ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}</ShimmerButton>
        <p className="text-center text-sm text-zinc-500">
          {mode === "login" ? <>¿Sin cuenta? <Link to="/register" className="text-accent">Regístrate</Link></> : <>¿Ya tienes cuenta? <Link to="/login" className="text-accent">Entra</Link></>}
        </p>
      </form>
    </div>
  );
}
