export type TaskStatus = "todo" | "in-progress" | "done";

export type ExpenseCategory =
  | "food"
  | "utilities"
  | "entertainment"
  | "education"
  | "healthcare"
  | "transport"
  | "others";

export type MemberRole = "parent" | "child" | "grandparent" | "sibling";

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  birthday?: number;
}

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  assignedTo?: string;
  deadline?: number;
}

export interface FamilyExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: number;
  paidBy: string;
  splitWith: string[];
}

export interface FamilyTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate?: number;
}

export interface FamilyMessage {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: number;
  type: "birthday" | "anniversary" | "vaccination" | "checkup" | "other";
  description?: string;
}

export type ModalType =
  | "member"
  | "goal"
  | "expense"
  | "task"
  | "event"
  | "message"
  | null;

export type ActiveSection =
  | "members"
  | "goals"
  | "expenses"
  | "meals"
  | "calendar"
  | "tasks"
  | "messages"
  | "health"
  | "celebrations";

export interface ModalForm {
  name: string;
  role: MemberRole;
  avatar: string;
  title: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  assignedTo: string;
  status: TaskStatus;
  eventType: FamilyEvent["type"];
  date: string;
  messageText: string;
  progress: number;
  target: number;
  deadline: string;
  paidBy: string;
}
