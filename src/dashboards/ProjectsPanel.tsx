import React, { useState } from "react";
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User, 
  DollarSign, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Trash2,
  Filter
} from "lucide-react";
import { api, money, useFetch } from "../api";
import { toast } from "sonner";
import { ShimmerButton } from "../components/magic";

interface Task {
  id: number;
  projectId: number;
  title: string;
  phase: string;
  status: "todo" | "in_progress" | "done";
  assignedTo: string;
  priority: "baja" | "media" | "alta" | "urgente";
  dueDate: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  targetDate: string;
  budget: string;
  progress: number;
  totalTasks: number;
  doneTasks: number;
  tasks: Task[];
}

export default function ProjectsPanel() {
  const { data: projectsList, reload, loading } = useFetch<Project[]>("/projects");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    targetDate: "",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    phase: "Fase 1: Inicio",
    priority: "media" as "baja" | "media" | "alta" | "urgente",
    assignedTo: "Equipo SportX",
    dueDate: "",
  });

  const projects = projectsList || [];
  const currentProject = projects.find((p) => p.id === (selectedProjectId || projects[0]?.id)) || projects[0];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/projects", {
        method: "POST",
        body: newProject,
      });
      toast.success("Proyecto creado con éxito");
      setShowNewProjectModal(false);
      setNewProject({ title: "", description: "", budget: "", targetDate: "" });
      reload();
    } catch (err: any) {
      toast.error(err.message || "Error al crear proyecto");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    try {
      await api(`/projects/${currentProject.id}/tasks`, {
        method: "POST",
        body: newTask,
      });
      toast.success("Tarea asignada al proyecto");
      setShowNewTaskModal(false);
      setNewTask({
        title: "",
        phase: "Fase 1: Inicio",
        priority: "media",
        assignedTo: "Equipo SportX",
        dueDate: "",
      });
      reload();
    } catch (err: any) {
      toast.error(err.message || "Error al crear tarea");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: "todo" | "in_progress" | "done") => {
    try {
      await api(`/projects/tasks/${taskId}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      reload();
    } catch (err: any) {
      toast.error("Error al actualizar tarea");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api(`/projects/tasks/${taskId}`, { method: "DELETE" });
      toast.success("Tarea eliminada");
      reload();
    } catch (err: any) {
      toast.error("Error al eliminar");
    }
  };

  const priorityColors = {
    baja: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    media: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    alta: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    urgente: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const phases = [
    "Fase 1: Inicio",
    "Fase 2: Planificación",
    "Fase 3: Ejecución",
    "Fase 4: Cierre",
  ];

  return (
    <div className="space-y-8">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-wider mb-1">
            <FolderKanban className="h-4 w-4" />
            <span>Ciclo de Vida & Operaciones Internas</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tight text-white">
            GESTIÓN DE <span className="text-accent">PROYECTOS</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Control de fases, tareas y metas estratégicas para empleados y administración de tienda.
          </p>
        </div>

        <button
          onClick={() => setShowNewProjectModal(true)}
          className="btn-primary self-start sm:self-auto text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Selector de Proyecto Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = currentProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? "border-accent bg-zinc-900/90 shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                    {proj.targetDate ? `Límite: ${proj.targetDate}` : "Sin fecha"}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-accent">
                    {proj.progress}% Completado
                  </span>
                </div>
                <h3 className="text-base font-bold text-white line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{proj.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-semibold">{proj.doneTasks}/{proj.totalTasks} tareas</span>
                <span className="text-accent font-mono font-bold">{money(Number(proj.budget))}</span>
              </div>
            </div>
          );
        })}
      </div>

      {currentProject ? (
        <div className="space-y-6">
          {/* Fases del Ciclo de Vida del Proyecto Seleccionado */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Proyecto Activo</span>
                <h3 className="text-xl font-black uppercase text-white">{currentProject.title}</h3>
              </div>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="btn-ghost text-xs self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Asignar Tarea</span>
              </button>
            </div>

            {/* Barra de Fases */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {phases.map((ph, idx) => {
                const phaseTasks = currentProject.tasks.filter((t) => t.phase === ph);
                const doneInPhase = phaseTasks.filter((t) => t.status === "done").length;
                return (
                  <div key={idx} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider block mb-1">
                      {ph}
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white font-bold">{doneInPhase}/{phaseTasks.length} Tareas</span>
                      <span className="text-[11px] text-zinc-500">
                        {phaseTasks.length > 0 ? Math.round((doneInPhase / phaseTasks.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className="bg-accent h-full transition-all duration-500" 
                        style={{ width: `${phaseTasks.length > 0 ? (doneInPhase / phaseTasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tablero Kanban de Tareas (3 Columnas) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Columna: Por Hacer */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">Por Hacer</span>
                </div>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  {currentProject.tasks.filter((t) => t.status === "todo").length}
                </span>
              </div>

              <div className="space-y-3">
                {currentProject.tasks
                  .filter((t) => t.status === "todo")
                  .map((task) => (
                    <div key={task.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 hover:border-zinc-700 transition">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-zinc-600 hover:text-red-400 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>

                      <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-accent" />
                          <span>{task.phase}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <User className="h-3 w-3" /> {task.assignedTo}
                          </span>
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                            className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                          >
                            Iniciar →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Columna: En Progreso */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">En Progreso</span>
                </div>
                <span className="text-xs font-mono font-bold text-accent">
                  {currentProject.tasks.filter((t) => t.status === "in_progress").length}
                </span>
              </div>

              <div className="space-y-3">
                {currentProject.tasks
                  .filter((t) => t.status === "in_progress")
                  .map((task) => (
                    <div key={task.id} className="rounded-2xl border border-accent/40 bg-zinc-900/80 p-4 space-y-3 shadow-[0_0_10px_rgba(204,255,0,0.05)]">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-zinc-600 hover:text-red-400 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>

                      <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-accent" />
                          <span>{task.phase}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <User className="h-3 w-3" /> {task.assignedTo}
                          </span>
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, "done")}
                            className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            Finalizar ✓
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Columna: Completadas */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">Completadas</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {currentProject.tasks.filter((t) => t.status === "done").length}
                </span>
              </div>

              <div className="space-y-3">
                {currentProject.tasks
                  .filter((t) => t.status === "done")
                  .map((task) => (
                    <div key={task.id} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3 opacity-80 hover:opacity-100 transition">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Listo
                        </span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-zinc-600 hover:text-red-400 transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-medium text-zinc-300 line-through leading-snug">{task.title}</h4>

                      <div className="text-[11px] text-zinc-500 space-y-1 pt-1 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {task.assignedTo}
                          </span>
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, "todo")}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                          >
                            Reabrir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-400">
          No hay proyectos registrados aún. Comienza creando uno nuevo.
        </div>
      )}

      {/* Modal: Crear Proyecto */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-black uppercase italic text-white">Nuevo Proyecto Interno</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Título</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Remodelación Vitrina Palermo"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Objetivos, alcance y metas del proyecto..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="input resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Presupuesto ($)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={newProject.targetDate}
                    onChange={(e) => setNewProject({ ...newProject, targetDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <ShimmerButton type="submit" className="flex-1">
                  Crear Proyecto
                </ShimmerButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Tarea */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-black uppercase italic text-white">Asignar Tarea</h3>
            <p className="text-xs text-zinc-400">Proyecto: {currentProject?.title}</p>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Título de Tarea</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Conteo físico de zapatillas running"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Fase del Ciclo</label>
                  <select
                    value={newTask.phase}
                    onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
                    className="input cursor-pointer"
                  >
                    {phases.map((ph) => (
                      <option key={ph} value={ph} className="bg-zinc-900 text-white">{ph}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Prioridad</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="input cursor-pointer"
                  >
                    <option value="baja" className="bg-zinc-900 text-white">Baja</option>
                    <option value="media" className="bg-zinc-900 text-white">Media</option>
                    <option value="alta" className="bg-zinc-900 text-white">Alta</option>
                    <option value="urgente" className="bg-zinc-900 text-white">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Responsable</label>
                  <input
                    type="text"
                    placeholder="Ej: Martín (Vendedor)"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <ShimmerButton type="submit" className="flex-1">
                  Guardar Tarea
                </ShimmerButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
