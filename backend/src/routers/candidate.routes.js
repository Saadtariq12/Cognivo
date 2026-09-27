import { Router } from "express";
import { verifyInvitation } from "../controllers/candidate.controller.js";
import {
  askQuestion,
  submitAnswer,
} from "../controllers/interview.controller.js";
import { requireCandidateInterviewAccess } from "../middlewares/candidateInterview.middleware.js";

const candidateRouter = Router();
candidateRouter.post("/verify-invitation", verifyInvitation);

const router = Router();
// router.post("/start", requireCandidateInterviewAccess, askQuestion);
router.post("/start", askQuestion);
// router.post("/answer", requireCandidateInterviewAccess, submitAnswer);
router.post("/answer", submitAnswer);

export { candidateRouter };
export default router;
