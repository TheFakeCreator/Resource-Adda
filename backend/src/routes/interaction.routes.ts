import { Router } from "express";
import {
  toggleUpvote,
  submitReview,
} from "../controllers/interaction.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All interaction routes require authentication
router.use(authenticate);

router.post("/:type/:id/upvote", toggleUpvote);
router.post("/resources/:id/review", submitReview);

export default router;
