import type { NextFunction, Request, RequestHandler, Response } from "express";
import authMiddleware from "../../Middlewares/authMiddleware";
import loadProject from "../../Middlewares/loader/loadProject";
import type { Project } from "../../types/project";
import projectRepository from "./projectRepository";

interface RequestWithProject extends Request {
  project: Project;
}

// browse a specific project
const getProject: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Le middleware loadProject a déjà chargé le projet dans req.project
    const projectReq = req as RequestWithProject;

    res.status(200).json(projectReq.project);
  } catch (error) {
    console.error("Erreur lors de la récupération du projet :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du projet" });
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
  createStep,
  createTask,
  updateStepType,
  updateTaskType,
  assignTask,
  unassignTask,
};
