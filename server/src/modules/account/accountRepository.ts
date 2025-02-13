import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type Project = {
  id: number;
  title: string;
  user_id: number;
};

class AccountRepository {
  // The Rs of CRUD - Read operations
  async getProjectsByUserId(userId: number): Promise<Project[]> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM project WHERE user_id = ?",
      [userId],
    );
    return rows as Project[];
  }

  // The C of CRUD - Create operation
  async createProject(title: string, userId: number): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO project (title, user_id) VALUES (?, ?)",
      [title, userId],
    );
    return result.insertId;
  }

  // The D of Crud - Delete operation
  async deleteProject(projectId: number): Promise<boolean> {
    try {
      // Commencer une transaction
      await databaseClient.query("START TRANSACTION");

      // 1. Supprimer les tâches associées aux étapes du projet
      await databaseClient.query(
        "DELETE task FROM task INNER JOIN step ON task.step_id = step.id WHERE step.project_id = ?",
        [projectId],
      );

      // 2. Supprimer les étapes du projet
      await databaseClient.query("DELETE FROM step WHERE project_id = ?", [
        projectId,
      ]);

      // 3. Supprimer les enregistrements dans project_assignment
      await databaseClient.query(
        "DELETE FROM project_assignment WHERE project_id = ?",
        [projectId],
      );

      // 4. Supprimer le projet
      const [result] = await databaseClient.query<Result>(
        "DELETE FROM project WHERE id = ?",
        [projectId],
      );

      // Valider la transaction
      await databaseClient.query("COMMIT");

      return result.affectedRows > 0;
    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await databaseClient.query("ROLLBACK");
      console.error("Erreur lors de la suppression du projet :", error);
      throw error;
    }
  }
}

export default new AccountRepository();
