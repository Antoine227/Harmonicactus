import type { RequestHandler } from "express";

import jwt from "../../Middlewares/jwtMiddleware";
// Import access to data
import authRepository from "./authRepository";

// Gère l'inscription d'un nouvel utilisateur
const register: RequestHandler = async (req, res, next) => {
  try {
    const userId = await authRepository.create(req.body);
    const user = await authRepository.readById(userId);

    // Créer un token JWT pour le nouvel utilisateur
    const token = jwt.createToken({ id: user.id, pseudo: user.pseudo });

    // Envoyer le token dans un cookie et la réponse JSON
    res
      .cookie("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(201)
      .json({
        user: { ...user, password: undefined },
        message: "Inscription et connexion réussies",
      });
  } catch (err) {
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
