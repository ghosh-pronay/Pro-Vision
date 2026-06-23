import { ListChecks, Plus, Trash2, Clock } from "lucide-react";
import type { FamilyMember, FamilyTask, TaskStatus } from "./FamilyTypes";

interface TasksTabProps {
  tasks: FamilyTask[];
  members: FamilyMember[];
  lang: string;
  onAddClick: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  tasksByStatus: {
    todo: FamilyTask[];
    "in-progress": FamilyTask[];
    done: FamilyTask[];
  };
}

function getMemberName(members: FamilyMember[], id: string) {
  return members.find((m) => m.id === id)?.name || "Unknown";
}

function getMemberAvatar(members: FamilyMember[], id: string) {
  return members.find((m) => m.id === id)?.avatar || "🧑";
}

export default function TasksTab({
  members,
  lang,
  onAddClick,
  onDelete,
  onUpdateStatus,
  tasksByStatus,
}: TasksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ListChecks className="size-5 text-cyan-500" />
          {lang === "bn" ? "কাজের বোর্ড" : "Task Board"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          {lang === "bn" ? "কাজ যোগ করুন" : "Add Task"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <h3 className="font-medium text-sm">
              {lang === "bn" ? "করতে হবে" : "To Do"}
            </h3>
            <span className="text-xs text-muted-foreground">
              ({tasksByStatus.todo.length})
            </span>
          </div>
          <div className="space-y-2">
            {tasksByStatus.todo.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === "bn" ? "সব আপ টু ডেট!" : "All caught up!"}
              </p>
            ) : (
              tasksByStatus.todo.map((task) => (
                <div key={task.id} className="bg-white/5 rounded-xl p-3 group">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {getMemberAvatar(members, task.assignedTo)}{" "}
                      {getMemberName(members, task.assignedTo)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateStatus(task.id, "in-progress")}
                        className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      >
                        →
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(task.dueDate).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h3 className="font-medium text-sm">
              {lang === "bn" ? "চলমান" : "In Progress"}
            </h3>
            <span className="text-xs text-muted-foreground">
              ({tasksByStatus["in-progress"].length})
            </span>
          </div>
          <div className="space-y-2">
            {tasksByStatus["in-progress"].length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === "bn" ? "কোনো কাজ নেই" : "No tasks"}
              </p>
            ) : (
              tasksByStatus["in-progress"].map((task) => (
                <div key={task.id} className="bg-white/5 rounded-xl p-3 group">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {getMemberAvatar(members, task.assignedTo)}{" "}
                      {getMemberName(members, task.assignedTo)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onUpdateStatus(task.id, "done")}
                        className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => onUpdateStatus(task.id, "todo")}
                        className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Done */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <h3 className="font-medium text-sm">
              {lang === "bn" ? "সম্পন্ন" : "Done"}
            </h3>
            <span className="text-xs text-muted-foreground">
              ({tasksByStatus.done.length})
            </span>
          </div>
          <div className="space-y-2">
            {tasksByStatus.done.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === "bn" ? "কোনো কাজ নেই" : "No tasks"}
              </p>
            ) : (
              tasksByStatus.done.map((task) => (
                <div
                  key={task.id}
                  className="bg-white/5 rounded-xl p-3 opacity-60 group"
                >
                  <p className="text-sm font-medium line-through">
                    {task.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {getMemberAvatar(members, task.assignedTo)}{" "}
                      {getMemberName(members, task.assignedTo)}
                    </span>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
