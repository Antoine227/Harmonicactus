import type { RequestHandler } from "express";
import participantRepository from "./participantRepository";

const getParticipants: RequestHandler = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const participants = await participantRepository.getParticipants(projectId);
    res.json(participants);
  } catch (error) {
    console.error("Erreur lors de la récupération des participants :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const addParticipants: RequestHandler = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = req.user.id; // Assurez-vous que votre middleware d'authentification ajoute l'utilisateur à req

    const isAlreadyParticipant = await participantRepository.isParticipant(
      projectId,
      userId,
    );
    if (isAlreadyParticipant) {
      res.status(400).json({ message: "Vous participez déjà à ce projet" });
      return;
    }

    await participantRepository.addParticipant(projectId, userId);
    res.status(201).json({ message: "Vous participez maintenant au projet" });
  } catch (error) {
    console.error("Erreur lors de l'ajout du participant :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default {
  getParticipants,
  addParticipants,
};
