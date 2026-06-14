import { Router } from 'express';
import { getApprovedRoadmaps } from '../controllers/roadmap.controller';

const router = Router();

// Public Routes
router.get('/', getApprovedRoadmaps);

export default router;
