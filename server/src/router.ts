import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

/** login / register /logout */
import authMiddleware from "./Middlewares/authMiddleware";
import authActions from "./modules/auth/authActions";

router.post("/api/register", authMiddleware.hashPwd, authActions.register);
router.post("/api/login", authMiddleware.verifyPwd, authActions.login);
router.get("/api/logout", authMiddleware.logout);
router.get("/api/me", authMiddleware.checkToken); // pour vérifier le token

/* ************************************************************************* */

export default router;
