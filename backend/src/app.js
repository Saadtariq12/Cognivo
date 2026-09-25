import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import interviewRouter, {
  candidateRouter,
} from "./routers/candidate.routes.js";
import authRouter from "./routers/auth.routes.js";
import recruiterRouter from "./routers/recruiter.routes.js";
app.use("/api/auth", authRouter);
app.use("/api/candidate", candidateRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/recruiter", recruiterRouter);

export { app };
