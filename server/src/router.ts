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

/** Middlewares pour charger les données */
import loadProject from "./Middlewares/loader/loadProject";
import loadStep from "./Middlewares/loader/loadStep";
import loadTask from "./Middlewares/loader/loadTask";

/** project */
import projectActions from "./modules/project/projectActions";

// Récupérer un projet spécifique
router.get(
  "/api/project/:id",
  authMiddleware.checkToken,
  loadProject,
  projectActions.getProject,
);

// Créer une nouvelle étape dans un projet
router.post(
  "/api/project/:id/steps",
  authMiddleware.checkToken,
  loadProject,
  projectActions.createStep,
);

// Créer une nouvelle tâche dans une étape
router.post(
  "/api/steps/:stepId/tasks",
  authMiddleware.checkToken,
  loadStep,
  projectActions.createTask,
);

// Mettre à jour le statut d'une étape
router.put(
  "/api/steps/:stepId",
  authMiddleware.checkToken,
  loadStep,
  projectActions.updateStepType,
);

// Mettre à jour le statut d'une tâche
router.put(
  "/api/tasks/:taskId",
  authMiddleware.checkToken,
  loadTask,
  projectActions.updateTaskType,
);

// Assigner une tâche à un utilisateur
router.post(
  "/api/tasks/:taskId/assign",
  authMiddleware.checkToken,
  loadTask,
  projectActions.assignTask,
);

// Désassigner une tâche à un utilisateur
router.post(
  "/api/tasks/:taskId/unassign",
  authMiddleware.checkToken,
  loadTask,
  projectActions.unassignTask,
);

/** account */
import accountActions from "./modules/account/accountActions";

// Récupérer la liste des projets de l'utilisateur connecté
router.get(
  "/api/account/projects",
  authMiddleware.checkToken,
  accountActions.getProjects,
);

// Créer un nouveau projet pour l'utilisateur connecté
router.post(
  "/api/account/projects",
  authMiddleware.checkToken,
  accountActions.createProject,
);

// Supprimer un projet
router.delete(
  "/api/account/projects/:id",
  authMiddleware.checkToken,
  accountActions.deleteProject,
);

/* ************************************************************************* */

/** Steps */
// Récupérer une étape spécifique
router.get(
  "/api/steps/:stepId",
  authMiddleware.checkToken,
  loadStep,
  projectActions.getStep,
);
// Mettre à jour une étape spécifique
router.put(
  "/api/steps/:stepId",
  authMiddleware.checkToken,
  loadStep,
  projectActions.updateStep,
);
// Supprimer une étape spécifique
router.delete(
  "/api/steps/:stepId",
  authMiddleware.checkToken,
  loadStep,
  projectActions.deleteStep,
);

/** Tasks */
// Récupérer une tâche spécifique
router.get(
  "/api/tasks/:taskId",
  authMiddleware.checkToken,
  loadTask,
  projectActions.getTask,
);
// Mettre à jour une tâche spécifique
router.put(
  "/api/tasks/:taskId",
  authMiddleware.checkToken,
  loadTask,
  projectActions.updateTask,
);
// Supprimer une tâche spécifique
router.delete(
  "/api/tasks/:taskId",
  authMiddleware.checkToken,
  loadTask,
  projectActions.deleteTask,
);

/* ************************************************************************* */

export default router;
