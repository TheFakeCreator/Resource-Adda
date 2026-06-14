import { Request, Response } from 'express';
import Roadmap from '../models/Roadmap';
import { ContributionStatus } from '../models/Contribution';

export const getApprovedRoadmaps = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, targetAudience } = req.query;
    
    // Build filter
    const filter: any = { status: ContributionStatus.APPROVED };
    
    if (category && typeof category === 'string' && category !== 'all') {
      filter.category = category;
    }
    
    if (targetAudience && typeof targetAudience === 'string') {
      filter.targetAudience = { $regex: targetAudience, $options: 'i' };
    }

    const roadmaps = await Roadmap.find(filter)
      .populate('author', 'name avatarUrl branch semester')
      .sort({ isOfficial: -1, upvotes: -1, createdAt: -1 }); // Official first, then highly upvoted

    // Handle anonymity
    const sanitizedRoadmaps = roadmaps.map(rmap => {
      const doc = rmap.toObject();
      if (doc.isAnonymous) {
        doc.author = {
          _id: doc.author._id,
          name: 'Anonymous Creator',
          branch: 'Confidential',
          avatarUrl: 'https://ui-avatars.com/api/?name=Anonymous&background=random',
          semester: 0
        } as any;
      }
      return doc;
    });

    res.status(200).json(sanitizedRoadmaps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
