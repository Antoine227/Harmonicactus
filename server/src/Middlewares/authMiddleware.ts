import * as argon2 from "argon2";
import type { RequestHandler } from "express";
import authRepository from "../modules/auth/authRepository";
import jwt from "./jwtMiddleware";

// Middleware pour hacher le mot de passe avant de l'enregistrer
const hashPwd: RequestHandler = async (req, res, next) => {
  try {
    // Utilise argon2 pour hacher le mot de passe de manière sécurisée
    const hash = await argon2.hash(req.body.password);
    req.body.password = hash;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware pour vérifier le mot de passe lors de la connexion
const verifyPwd: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.read(req.body.pseudo);

    if (!user) {
      res.status(401).json({ message: "Invalid pseudo or password" });
      return;
    }

    // Vérifie si le mot de passe fourni correspond au hash stocké
    if (await argon2.verify(user.password, req.body.password)) {
      console.info("Password is correct");

      // Crée un token JWT pour l'authentification
      const token = jwt.createToken(user);

      // Envoie le token dans un cookie sécurisé et la réponse JSON
      res
        .cookie("user_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .json({
          user: { ...user, password: undefined },
          message: "Login successful",
        });
    } else {
      res.status(401).json({ message: "Invalid pseudo or password" });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware pour vérifier la validité du token JWT
const checkToken: RequestHandler = async (req, res, next) => {
  if (!req.cookies.user_token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    // Décode et vérifie le token JWT
    const decoded = jwt.verifyToken(req.cookies.user_token) as {
      id: number;
      pseudo: string;
    };
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      decoded.id &&
      decoded.pseudo
    ) {
      req.user = decoded;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware pour gérer la déconnexion
const logout: RequestHandler = (req, res) => {
  // Supprime le cookie contenant le token JWT
  res.clearCookie("user_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.status(200).json({ message: "Déconnexion réussie" });
};

export default { hashPwd, verifyPwd, checkToken, logout };
