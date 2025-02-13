import type { NextFunction, Request, RequestHandler, Response } from "express";
import projectRepository from "../../modules/project/projectRepository";
import type { Task } from "../../types/task";

interface RequestWithTask extends Request {
  task: Task;
}

const loadTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);
    const task = await projectRepository.getTaskDetails(taskId);

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    (req as RequestWithTask).task = task;
    next();
  } catch (error) {
    console.error("Error loading task:", error);
    res.status(500).json({ message: "Failed to load task" });
  }
};

export default loadTask;
