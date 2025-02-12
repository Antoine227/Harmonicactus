import type { NextFunction, Request, RequestHandler, Response } from "express";
import projectRepository from "../../modules/project/projectRepository";
import type { Task } from "../../types/task";

interface RequestWithTask extends Request {
  task?: Task;
}

const loadTask: RequestHandler = async (
  req: RequestWithTask,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = Number.parseInt(req.params.taskId);
    if (Number.isNaN(taskId)) {
      res.status(400).json({ message: "ID de tâche invalide" });
      return;
    }
    const task = await projectRepository.getTaskDetails(taskId);

    if (!task) {
      res.status(404).json({ message: "Tâche non trouvée" });
      return;
    }

    req.task = task; // Ajoute la tâche à l'objet req
    next();
  } catch (error) {
    console.error("Erreur lors du chargement de la tâche :", error);
    res.status(500).json({ message: "Erreur lors du chargement de la tâche" });
    next(error);
  }
};

export default loadTask;
