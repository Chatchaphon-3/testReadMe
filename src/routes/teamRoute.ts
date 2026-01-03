import { Router } from "express";
import {
  createTeam,
  getTeam,
  editTeam,
  getTeams,
  deleteTeam,
} from "../controllers/teamController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// /teams
export const teamRouter = Router();

teamRouter.get("/", getTeams);
teamRouter.post("/", requireAuth, requireRole(["ADMIN"]), createTeam);
teamRouter.get("/:id", getTeam); // get single team
teamRouter.patch("/:id", requireAuth, requireRole(["ADMIN"]), editTeam);
teamRouter.delete("/:id", requireAuth, requireRole(["ADMIN"]), deleteTeam);
