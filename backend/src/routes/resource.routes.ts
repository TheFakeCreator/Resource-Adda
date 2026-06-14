import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import {
  uploadResource,
  getPendingContributions,
  reviewContribution,
  getApprovedDocuments,
  getDocumentById,
  incrementDownload,
  getReviews,
  addReview,
  voteReview,
  getFeaturedDocuments
} from '../controllers/resource.controller';
import { UserRole } from '../models/User';

const router = Router();

// Public / Student Routes
router.get('/featured', getFeaturedDocuments);
router.get('/documents', getApprovedDocuments);
router.get('/documents/:id', getDocumentById);
router.post('/documents/:id/download', incrementDownload);
router.get('/documents/:id/reviews', getReviews);

// Protected routes
router.post('/documents/:id/reviews', authenticate, addReview);
router.post('/reviews/:reviewId/vote', authenticate, voteReview);
router.post(
  '/upload',
  authenticate,
  authorizeRoles(UserRole.STUDENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.single('file'),
  uploadResource
);

// Admin Routes
router.get(
  '/contributions/pending',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getPendingContributions
);
router.put(
  '/contributions/:id/review',
  authenticate,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  reviewContribution
);

export default router;
