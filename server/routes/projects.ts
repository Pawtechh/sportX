import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { projects, projectTasks } from "../db/schema";
import { requireAuth, requireRole, wrap } from "../middleware";

const r = Router();
r.use(requireAuth);
r.use(requireRole("seller", "admin"));

// Listar todos los proyectos con sus tareas
r.get("/", wrap(async (_req, res) => {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
  const allTasks = await db.select().from(projectTasks).orderBy(projectTasks.id);

  const result = allProjects.map((p) => {
    const tasks = allTasks.filter((t) => t.projectId === p.id);
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === "done").length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return {
      ...p,
      progress,
      totalTasks,
      doneTasks,
      tasks,
    };
  });

  res.json(result);
}));

// Crear nuevo proyecto
r.post("/", wrap(async (req, res) => {
  const { title, description, targetDate, budget, status } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Título y descripción son obligatorios" });
  }

  const [created] = await db
    .insert(projects)
    .values({
      title: title.trim(),
      description: description.trim(),
      targetDate: targetDate || "",
      budget: budget ? String(budget) : "0",
      status: status || "en_progreso",
    })
    .returning();

  res.status(201).json(created);
}));

// Modificar proyecto
r.patch("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, targetDate, budget, status } = req.body;

  const [updated] = await db
    .update(projects)
    .set({
      ...(title && { title: title.trim() }),
      ...(description && { description: description.trim() }),
      ...(targetDate !== undefined && { targetDate }),
      ...(budget !== undefined && { budget: String(budget) }),
      ...(status && { status }),
    })
    .where(eq(projects.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Proyecto no encontrado" });
  res.json(updated);
}));

// Eliminar proyecto
r.delete("/:id", wrap(async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectTasks).where(eq(projectTasks.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  res.json({ success: true });
}));

// Crear tarea en proyecto
r.post("/:id/tasks", wrap(async (req, res) => {
  const projectId = Number(req.params.id);
  const { title, phase, status, assignedTo, priority, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: "El título de la tarea es obligatorio" });
  }

  const [task] = await db
    .insert(projectTasks)
    .values({
      projectId,
      title: title.trim(),
      phase: phase || "Fase 1: Inicio",
      status: status || "todo",
      assignedTo: assignedTo || "Equipo SportX",
      priority: priority || "media",
      dueDate: dueDate || "",
    })
    .returning();

  res.status(201).json(task);
}));

// Actualizar estado de una tarea
r.patch("/tasks/:taskId", wrap(async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { status, priority, phase, assignedTo } = req.body;

  const [task] = await db
    .update(projectTasks)
    .set({
      ...(status && { status }),
      ...(priority && { priority }),
      ...(phase && { phase }),
      ...(assignedTo && { assignedTo }),
    })
    .where(eq(projectTasks.id, taskId))
    .returning();

  if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json(task);
}));

// Eliminar tarea
r.delete("/tasks/:taskId", wrap(async (req, res) => {
  const taskId = Number(req.params.taskId);
  await db.delete(projectTasks).where(eq(projectTasks.id, taskId));
  res.json({ success: true });
}));

export default r;
