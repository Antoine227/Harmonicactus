import jwt from "jsonwebtoken";
import "dotenv/config";

// Ici, je créer dans ma variable d'environnement un mdp pour mon encodage de mon token
const APP_SECRET = process.env.APP_SECRET as string;
/**
 * Je créer un token grâce au package jsonwebtoken.
 */
const createToken = (payload: { id: number; pseudo: string }) => {
  // Inclure uniquement l'ID et le pseudo dans le token
  return jwt.sign(payload, APP_SECRET, { expiresIn: "8h" });
};
/**
 * Je vais vérifier mon token
 */
const verifyToken = (token: string) => {
  return jwt.verify(token, APP_SECRET) as { id: number; pseudo: string };
};
export default { createToken, verifyToken };
