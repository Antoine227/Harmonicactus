export interface Step {
  id: number;
  name: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  project_id: number;
}
