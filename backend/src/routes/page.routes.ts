import { Router } from "express";
import {
  getPageBySlug,
  getAllPages,
  updatePage,
} from "../controllers/page.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);
router.put("/:slug", authenticate, updatePage);

export default router;
