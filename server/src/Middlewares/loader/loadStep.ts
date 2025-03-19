import type { NextFunction, Request, RequestHandler, Response } from "express";
import projectRepository from "../../modules/project/projectRepository";
import type { Step } from "../../types/step";

interface RequestWithStep extends Request {
  step: Step;
}

const loadStep = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stepId = Number(req.params.stepId);
    const step = await projectRepository.getStepDetails(stepId);

    if (!step) {
      res.status(404).json({ message: "Step not found" });
      return;
    }

    (req as RequestWithStep).step = step;
    next();
  } catch (error) {
    console.error("Error loading step:", error);
    res.status(500).json({ message: "Failed to load step" });
  }
};

export default loadStep;
