import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

const PARTICIPANT_COLORS = [
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ff0000",
  "#ffff00",
  "#ff8000",
  "#80ff00",
  "#00ff80",
  "#0080ff",
  "#8000ff",
  "#ff0080",
];

class ParticipantRepository {
  async getParticipants(projectId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT u.id, u.pseudo, pa.color 
       FROM user u 
       JOIN project_assignment pa ON u.id = pa.user_id 
       WHERE pa.project_id = ?`,
      [projectId],
    );
    return rows;
  }

  async addParticipant(projectId: number, userId: number) {
    const participants = await this.getParticipants(projectId);
    const colorIndex = participants.length % PARTICIPANT_COLORS.length;
    const color = PARTICIPANT_COLORS[colorIndex];

    const [result] = await databaseClient.query<Result>(
      "INSERT INTO project_assignment (project_id, user_id, color) VALUES (?, ?, ?)",
      [projectId, userId, color],
    );
    return result.insertId;
  }

  async isParticipant(projectId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM project_assignment WHERE project_id = ? AND user_id = ?",
      [projectId, userId],
    );
    return rows.length > 0;
  }
}

export default new ParticipantRepository();
