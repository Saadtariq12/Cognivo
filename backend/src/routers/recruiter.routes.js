import { Router } from "express";
import { inviteCandidate } from "../controllers/recruiter.controller.js";
import {
  authenticateUser,
  requireRecruiter,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/invitations",
  authenticateUser, //middleware
  requireRecruiter, //middleware
  inviteCandidate, //controller function
);

export default router;
