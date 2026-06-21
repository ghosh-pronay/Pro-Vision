import { useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Plus, Trash2, Edit3 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: number;
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  onTaskMove?: (taskId: string, fromColumn: string, toColumn: string) => void;
  onTaskAdd?: (columnId: string, task: Omit<Task, "id">) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
}

export default function KanbanBoard({
  columns,
  onColumnsChange,
  onTaskMove,
  onTaskAdd,
  onTaskUpdate,
  onTaskDelete,
}: KanbanBoardProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedTask, setDraggedTask] = useState<{ task: Task; columnId: string } | null>(null);

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, columnId });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, columnId: sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) return;

    const updatedColumns = columns.map((col) => {
      if (col.id === sourceColumnId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    });

    onColumnsChange(updatedColumns);
    onTaskMove?.(task.id, sourceColumnId, targetColumnId);
    setDraggedTask(null);
  };

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: "medium",
    };

    const updatedColumns = columns.map((col) => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    });

    onColumnsChange(updatedColumns);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...taskWithoutId } = newTask;
    onTaskAdd?.(columnId, taskWithoutId);
    setNewTaskTitle("");
    setAddingToColumn(null);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));

    onColumnsChange(updatedColumns);
    onTaskUpdate?.(taskId, updates);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => task.id !== taskId),
    }));

    onColumnsChange(updatedColumns);
    onTaskDelete?.(taskId);
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72 glass-strong rounded-2xl p-4"
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <button
              onClick={() => setAddingToColumn(column.id)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3 min-h-[100px]">
            {column.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                draggable
                onDragStart={() => handleDragStart(task, column.id)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
              >
                {editingTask === task.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      defaultValue={task.title}
                      className="w-full bg-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary"
                      onBlur={(e) =>
                        handleUpdateTask(task.id, { title: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateTask(task.id, {
                            title: (e.target as HTMLInputElement).value,
                          });
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleUpdateTask(task.id, { priority: p })}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            task.priority === p
                              ? "bg-primary text-primary-foreground"
                              : "bg-white/10 text-muted-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}
                          />
                          <span className="text-sm font-medium text-foreground">
                            {task.title}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingTask(task.id)}
                          className="p-1.5 rounded hover:bg-white/10"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded hover:bg-white/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}

            {addingToColumn === column.id && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask(column.id);
                    if (e.key === "Escape") setAddingToColumn(null);
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddTask(column.id)}
                    className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingToColumn(null)}
                    className="px-3 py-1 text-xs text-muted-foreground hover:bg-white/10 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
