import type { RequestHandler } from "express";

// Import access to data
import authRepository from "./authRepository";

// Gère l'inscription d'un nouvel utilisateur
const register: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.create(req.body);

    // Respond with the user in JSON format
    res.status(201).json(user);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    console.error("Erreur lors de l'inscription:", err);
    res.status(400).json({ message: "Email ou pseudo invalide" });
  }
};

// Gère la connexion d'un utilisateur
const login: RequestHandler = async (req, res, next) => {
  try {
    if (req.body.user) {
      // Exclut le mot de passe de la réponse pour des raisons de sécurité
      const { password, ...safeUser } = req.body.user;
      res.status(200).json(safeUser);
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  } catch (err) {
    next(err);
  }
};

// Récupère l'utilisateur actuellement connecté
const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    const userPseudo = req.user.pseudo;
    const user = await authRepository.read(userPseudo);
    if (user) {
      // Exclut le mot de passe de la réponse pour des raisons de sécurité
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  getCurrentUser,
};
