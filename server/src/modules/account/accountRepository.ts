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
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM project WHERE id = ?",
      [projectId],
    );
    return result.affectedRows > 0;
  }
}

export default new AccountRepository();
