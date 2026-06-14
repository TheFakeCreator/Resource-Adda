import { Router } from "express";
import {
  getSetupStatus,
  configureSystem,
  getPublicSettings,
} from "../controllers/setup.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/status", getSetupStatus);
router.get("/settings/public", getPublicSettings);
router.post("/configure", authenticate, configureSystem);

export default router;
