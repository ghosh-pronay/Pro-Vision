import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Trash2, Check } from "lucide-react";

interface MatrixTask {
  id: string;
  title: string;
  completed: boolean;
  quadrant?: Quadrant;
}

interface EisenhowerMatrixProps {
  tasks: MatrixTask[];
  onTaskMove: (taskId: string, quadrant: Quadrant) => void;
  onTaskAdd: (quadrant: Quadrant, title: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

type Quadrant = "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important";

const QUADRANTS: Record<Quadrant, { title: string; subtitle: string; color: string; action: string }> = {
  "urgent-important": {
    title: "Do First",
    subtitle: "Urgent & Important",
    color: "#ef4444",
    action: "Focus on these tasks immediately",
  },
  "not-urgent-important": {
    title: "Schedule",
    subtitle: "Not Urgent & Important",
    color: "#3b82f6",
    action: "Plan time for these tasks",
  },
  "urgent-not-important": {
    title: "Delegate",
    subtitle: "Urgent & Not Important",
    color: "#f97316",
    action: "Consider delegating these tasks",
  },
  "not-urgent-not-important": {
    title: "Eliminate",
    subtitle: "Not Urgent & Not Important",
    color: "#6b7280",
    action: "Minimize or remove these tasks",
  },
};

export default function EisenhowerMatrix({
  tasks,
  onTaskMove,
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
}: EisenhowerMatrixProps) {
  const [addingTo, setAddingTo] = useState<Quadrant | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const getTasksForQuadrant = (quadrant: Quadrant) => {
    return tasks.filter((task) => task.quadrant === quadrant);
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, quadrant: Quadrant) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskMove(draggedTask, quadrant);
      setDraggedTask(null);
    }
  };

  const handleAddTask = (quadrant: Quadrant) => {
    if (!newTaskTitle.trim()) return;
    onTaskAdd(quadrant, newTaskTitle.trim());
    setNewTaskTitle("");
    setAddingTo(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {(Object.keys(QUADRANTS) as Quadrant[]).map((quadrant) => {
        const config = QUADRANTS[quadrant];
        const quadrantTasks = getTasksForQuadrant(quadrant);

        return (
          <div
            key={quadrant}
            className="glass-strong rounded-2xl p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, quadrant)}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <h3 className="font-semibold text-sm text-foreground">
                    {config.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">
                  {quadrantTasks.length}
                </span>
                <button
                  onClick={() => setAddingTo(quadrant)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3 italic">
              {config.action}
            </p>

            <div className="space-y-2 min-h-[80px]">
              <AnimatePresence>
                {quadrantTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing ${
                      task.completed ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <button
                      onClick={() => onTaskToggle(task.id)}
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground hover:border-primary"
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3 text-primary-foreground" />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        task.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="p-1.5 rounded hover:bg-white/10"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {addingTo === quadrant && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="flex-1 bg-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTask(quadrant);
                      if (e.key === "Escape") setAddingTo(null);
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddTask(quadrant)}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-lg"
                  >
                    Add
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
