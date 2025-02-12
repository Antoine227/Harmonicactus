import type { NextFunction, Request, RequestHandler, Response } from "express";
import projectRepository from "../../modules/project/projectRepository";
import type { Step } from "../../types/step";

interface RequestWithStep extends Request {
  step?: Step;
}

const loadStep: RequestHandler = async (
  req: RequestWithStep,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stepId = Number.parseInt(req.params.stepId); // Utilise req.params.stepId
    if (Number.isNaN(stepId)) {
      res.status(400).json({ message: "ID d'étape invalide" });
      return;
    }
    const step = await projectRepository.getStepDetails(stepId); // Utilise une nouvelle fonction getStepDetails

    if (!step) {
      res.status(404).json({ message: "Étape non trouvée" }); // Message corrigé
      return;
    }

    req.step = step; // Ajoute l'étape à l'objet req
    next();
  } catch (error) {
    console.error("Erreur lors du chargement de l'étape :", error);
    res.status(500).json({ message: "Erreur lors du chargement de l'étape" });
    next(error);
  }
};

export default loadStep;
