import {Router} from "express";
import {
  askQuestion,
  submitAnswer,
  generateEvaluation
} from "../controllers/interview.controller.js";

const router = Router();

router.post("/start", askQuestion);
router.post("/answer", submitAnswer);
router.post("/evaluate", generateEvaluation);

export default router;
