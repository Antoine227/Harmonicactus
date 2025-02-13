import type { NextFunction, Request, RequestHandler, Response } from "express";
import authMiddleware from "../../Middlewares/authMiddleware";
import projectRepository from "./projectRepository";

import type { ProjectDetails } from "./projectRepository"; // Importe le type ProjectDetails

interface RequestWithProject extends Request {
  project: ProjectDetails;
}

// browse a specific project
const getProject: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const projectId = Number(req.params.id);
    const project = await projectRepository.getProjectDetails(projectId);

    if (!project) {
      res.status(404).json({ message: "Projet non trouvé" });
    }

    if (project) {
      // Type assertion pour que TypeScript sache que req.project est de type ProjectDetails
      (req as RequestWithProject).project = project;
    }

    res.status(200).json(project);
    next();
    return;
  } catch (error) {
    console.error("Erreur lors de la récupération du projet :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du projet" });
    next(error);
    return;
  }
};

// Get step by id
const getStep: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stepId = Number(req.params.stepId);
    const step = await projectRepository.getStepDetails(stepId);

    if (!step) {
      res.status(404).json({ message: "Etape non trouvé" });
      return;
    }

    res.status(200).json(step);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'étape :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de l'étape" });
    next(error);
  }
};

// Get task by id
const getTask: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);
    const task = await projectRepository.getTaskDetails(taskId);

    if (!task) {
      res.status(404).json({ message: "Tâche non trouvé" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la tâche" });
    next(error);
  }
};

// Update step
const updateStep: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stepId = Number(req.params.stepId);
    const { name, type } = req.body;

    const success = await projectRepository.updateStep(stepId, name, type);

    if (success) {
      res.status(200).json({ message: "Etape mise à jour" });
    } else {
      res.status(404).json({ message: "Etape non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étape :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'étape" });
    next(error);
  }
};

// Update task
const updateTask: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);
    const { Description, type } = req.body;

    const success = await projectRepository.updateTask(
      taskId,
      Description,
      type,
    );

    if (success) {
      res.status(200).json({ message: "Tâche mise à jour" });
    } else {
      res.status(404).json({ message: "Tâche non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la tâche" });
    next(error);
  }
};

// Delete step
const deleteStep: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stepId = Number(req.params.stepId);

    const success = await projectRepository.deleteStep(stepId);

    if (success) {
      res.status(200).json({ message: "Etape supprimée" });
    } else {
      res.status(404).json({ message: "Etape non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étape :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'étape" });
    next(error);
  }
};

// Delete task
const deleteTask: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const taskId = Number(req.params.taskId);

    const success = await projectRepository.deleteTask(taskId);

    if (success) {
      res.status(200).json({ message: "Tâche supprimée" });
    } else {
      res.status(404).json({ message: "Tâche non trouvé" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la tâche" });
    next(error);
  }
};

// add a step to a project
const createStep: RequestHandler = async (req, res, next) => {
  try {
    const projectId = Number.parseInt(req.params.id);
    const { name, type } = req.body;

    const stepId = await projectRepository.createStep(name, type, projectId);
    res.status(201).json({ id: stepId, name, type, project_id: projectId });
  } catch (error) {
    console.error("Erreur lors de la création de l'étape :", error);
    res.status(500).json({ message: "Erreur lors de la création de l'étape" });
  }
};

// add a task to a project
const createTask: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number.parseInt(req.params.stepId);
    const { Description, type } = req.body;

    const taskId = await projectRepository.createTask(
      Description,
      type,
      stepId,
    );
    res.status(201).json({ id: taskId, Description, type, step_id: stepId });
  } catch (error) {
    console.error("Erreur lors de la création de la tâche :", error);
    res.status(500).json({ message: "Erreur lors de la création de la tâche" });
  }
};

//edit the type of a step
const updateStepType: RequestHandler = async (req, res, next) => {
  try {
    const stepId = Number.parseInt(req.params.stepId);
    const { type } = req.body;

    const success = await projectRepository.updateStepType(stepId, type);
    if (success) {
      res.status(200).json({ message: "Type de l'étape mis à jour" });
    } else {
      res.status(404).json({ message: "Étape non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type de l'étape :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du type de l'étape" });
  }
};

//edit the type of a task
const updateTaskType: RequestHandler = async (req, res, next) => {
  try {
    const taskId = Number.parseInt(req.params.taskId);
    const { type } = req.body;

    const success = await projectRepository.updateTaskType(taskId, type);
    if (success) {
      res.status(200).json({ message: "Type de la tâche mis à jour" });
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du type de la tâche :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du type de la tâche" });
  }
};

//assign a task to a user
const assignTask: RequestHandler = async (req, res, next) => {
  try {
    const taskId = Number.parseInt(req.params.taskId);
    const { userId } = req.body;
    const success = await projectRepository.assignTaskToUser(taskId, userId);
    if (success) {
      res.status(200).json({ message: "Tâche assignée à l'utilisateur" });
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'assignation de la tâche à l'utilisateur :",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de l'assignation de la tâche à l'utilisateur",
    });
  }
};

//unassing a task from a user
const unassignTask: RequestHandler = async (req, res, next) => {
  try {
    const taskId = Number.parseInt(req.params.taskId);
    const { userId } = req.body;
    const success = await projectRepository.removeTaskFromUser(taskId, userId);
    if (success) {
      res.status(200).json({ message: "Tâche désassignée à l'utilisateur" });
    } else {
      res.status(404).json({ message: "Tâche non trouvée" });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la désassignation de la tâche à l'utilisateur :",
      error,
    );
    res.status(500).json({
      message: "Erreur lors de la désassignation de la tâche à l'utilisateur",
    });
  }
};

export default {
  getProject,
  getStep,
  getTask,
  createStep,
  createTask,
  updateStepType,
  updateTaskType,
  assignTask,
  unassignTask,
  updateStep,
  updateTask,
  deleteStep,
  deleteTask,
};
