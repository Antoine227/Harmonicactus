import type { RequestHandler } from "express";
import authMiddleware from "../../Middlewares/authMiddleware";
import accountRepository from "./accountRepository";

const getProjects: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id; // Récupère l'ID de l'utilisateur authentifié
    const projects = await accountRepository.getProjectsByUserId(userId);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des projets" });
  }
};

const createProject: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id; // Récupère l'ID de l'utilisateur authentifié
    const title = req.body.title;
    const projectId = await accountRepository.createProject(title, userId);
    res.status(201).json({ id: projectId, title, userId }); // Renvoie l'ID du nouveau projet
  } catch (error) {
    console.error("Erreur lors de la création du projet :", error);
    res.status(500).json({ message: "Erreur lors de la création du projet" });
  }
};

export default { getProjects, createProject };
