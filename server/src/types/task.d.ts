export interface Task {
  id: number;
  Description: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  step_id: number;
}
