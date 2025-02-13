import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

export type ProjectDetails = {
  id: number;
  title: string;
  user_id: number;
  steps: Step[];
};

type Step = {
  id: number;
  name: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  project_id: number;
  tasks: Task[];
};

type Task = {
  id: number;
  Description: string;
  type: "To do" | "En cours" | "Bloqué" | "Fini";
  step_id: number;
  //user_id: number; // Supression de la clé, car la liaison many to many est gérée par la table task_assignment
  participants: { id: number; pseudo: string; color: string }[]; // Liste des IDs des participants
};

class ProjectRepository {
  // The Rs of CRUD - Read operations
  async getProjectDetails(
    projectId: number,
  ): Promise<ProjectDetails | undefined> {
    const [projectRows] = await databaseClient.query<Rows>(
      "SELECT * FROM project WHERE id = ?",
      [projectId],
    );

    if (projectRows.length === 0) {
      return undefined;
    }

    const project = projectRows[0] as ProjectDetails;

    // Récupérer les étapes du projet
    const [stepRows] = await databaseClient.query<Rows>(
      "SELECT * FROM step WHERE project_id = ?",
      [projectId],
    );

    const steps = stepRows as Step[];

    // Récupérer les tâches pour chaque étape
    for (const step of steps) {
      const [taskRows] = await databaseClient.query<Rows>(
        "SELECT * FROM task WHERE step_id = ?",
        [step.id],
      );

      const tasks = taskRows as Task[];

      //récupération des participants pour chaque tache :
      for (const task of tasks) {
        const [participantsRows] = await databaseClient.query<Rows>(
          `SELECT u.id, u.pseudo, pa.color
           FROM user u
           INNER JOIN task_assignment ta ON u.id = ta.user_id
           INNER JOIN project_assignment pa ON u.id = pa.user_id AND pa.project_id = ?
           WHERE ta.task_id = ?`,
          [projectId, task.id],
        );

        const participants = (
          participantsRows as { id: number; pseudo: string; color: string }[]
        ).map((row) => ({
          id: row.id,
          pseudo: row.pseudo,
          color: row.color,
        }));
        task.participants = participants;
      }

      step.tasks = tasks;
    }

    project.steps = steps;
    return project;
  }

  async getTaskDetails(taskId: number): Promise<Task | undefined> {
    const [taskRows] = await databaseClient.query<Rows>(
      "SELECT * FROM task WHERE id = ?",
      [taskId],
    );

    if (taskRows.length === 0) {
      return undefined;
    }

    return taskRows[0] as Task;
  }

  async getStepDetails(stepId: number): Promise<Step | undefined> {
    const [stepRows] = await databaseClient.query<Rows>(
      "SELECT * FROM step WHERE id = ?",
      [stepId],
    );

    if (stepRows.length === 0) {
      return undefined;
    }

    return stepRows[0] as Step;
  }

  // The C of CRUD - Create operation
  async createStep(
    name: string,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
    projectId: number,
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO step (name, type, project_id) VALUES (?, ?, ?)",
      [name, type, projectId],
    );
    return result.insertId;
  }

  async createTask(
    Description: string,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
    stepId: number,
  ): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO task (Description, type, step_id) VALUES (?, ?, ?)",
      [Description, type, stepId],
    );

    // Après l'insertion, récupérez l'étape nouvellement créée et initialisez tasks
    const [stepRows] = await databaseClient.query<Rows>(
      "SELECT * FROM step WHERE id = ?",
      [result.insertId],
    );

    if (stepRows.length > 0) {
      const newStep = stepRows[0] as Step;
      newStep.tasks = [];
      // Mettez à jour l'état du projet avec cette nouvelle étape
      // (Vous devrez adapter cette partie en fonction de la structure de votre état)
    }

    return result.insertId;
  }

  // The U of CRUD - Update operation
  async updateStepType(
    stepId: number,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "UPDATE step SET type = ? WHERE id = ?",
      [type, stepId],
    );
    return result.affectedRows > 0;
  }

  async updateTaskType(
    taskId: number,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "UPDATE task SET type = ? WHERE id = ?",
      [type, taskId],
    );
    return result.affectedRows > 0;
  }

  // pour assigner une tâche à un utilisateur
  async assignTaskToUser(taskId: number, userId: number): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO task_assignment (task_id, user_id) VALUES (?, ?)",
      [taskId, userId],
    );
    return result.affectedRows > 0;
  }

  // pour retirer une tâche à un utilisateur
  async removeTaskFromUser(taskId: number, userId: number): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM task_assignment WHERE task_id = ? AND user_id = ?",
      [taskId, userId],
    );
    return result.affectedRows > 0;
  }

  async updateStep(
    stepId: number,
    name: string,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "UPDATE step SET name = ?, type = ? WHERE id = ?",
      [name, type, stepId],
    );
    return result.affectedRows > 0;
  }

  async updateTask(
    taskId: number,
    Description: string,
    type: "To do" | "En cours" | "Bloqué" | "Fini",
  ): Promise<boolean> {
    const [result] = await databaseClient.query<Result>(
      "UPDATE task SET Description = ?, type = ? WHERE id = ?",
      [Description, type, taskId],
    );
    return result.affectedRows > 0;
  }

  async deleteStep(stepId: number): Promise<boolean> {
    try {
      await databaseClient.query("START TRANSACTION");

      // 1. Récupérer les IDs de toutes les tâches associées à l'étape
      const [taskRows] = await databaseClient.query<Rows>(
        "SELECT id FROM task WHERE step_id = ?",
        [stepId],
      );
      const taskIds = (taskRows as { id: number }[]).map((task) => task.id);

      // 2. Supprimer toutes les assignations de participants pour ces tâches
      if (taskIds.length > 0) {
        await databaseClient.query(
          "DELETE FROM task_assignment WHERE task_id IN (?)",
          [taskIds],
        );
      }

      // 3. Supprimer toutes les tâches associées à l'étape
      await databaseClient.query("DELETE FROM task WHERE step_id = ?", [
        stepId,
      ]);

      // 4. Supprimer l'étape
      const [result] = await databaseClient.query<Result>(
        "DELETE FROM step WHERE id = ?",
        [stepId],
      );

      await databaseClient.query("COMMIT");

      return result.affectedRows > 0;
    } catch (error) {
      await databaseClient.query("ROLLBACK");
      console.error("Erreur lors de la suppression de l'étape :", error);
      throw error;
    }
  }

  async deleteTask(taskId: number): Promise<boolean> {
    try {
      await databaseClient.query("START TRANSACTION");

      // Supprimer d'abord les assignations de tâches
      await databaseClient.query(
        "DELETE FROM task_assignment WHERE task_id = ?",
        [taskId],
      );

      // Ensuite, supprimer la tâche
      const [result] = await databaseClient.query<Result>(
        "DELETE FROM task WHERE id = ?",
        [taskId],
      );

      await databaseClient.query("COMMIT");

      return result.affectedRows > 0;
    } catch (error) {
      await databaseClient.query("ROLLBACK");
      console.error("Erreur lors de la suppression de la tâche :", error);
      throw error;
    }
  }
}

export default new ProjectRepository();
