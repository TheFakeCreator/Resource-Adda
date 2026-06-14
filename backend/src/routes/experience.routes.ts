import { Router } from 'express';
import { getApprovedExperiences } from '../controllers/experience.controller';

const router = Router();

// Public Routes
router.get('/', getApprovedExperiences);

export default router;
