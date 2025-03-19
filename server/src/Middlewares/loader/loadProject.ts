import type { NextFunction, Request, RequestHandler, Response } from "express";
import projectRepository from "../../modules/project/projectRepository";
import type { Project } from "../../types/project";

interface RequestWithProject extends Request {
  project?: Project;
}

const loadProject: RequestHandler = async (
  req: RequestWithProject,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const projectId = Number.parseInt(req.params.id);
    const project = await projectRepository.getProjectDetails(projectId);

    if (!project) {
      res.status(404).json({ message: "Projet non trouvé" });
      return;
    }

    req.project = project; // Ajoute le projet à l'objet req
    next();
  } catch (error) {
    console.error("Erreur lors du chargement du projet :", error);
    res.status(500).json({ message: "Erreur lors du chargement du projet" });
  }
};

export default loadProject;
