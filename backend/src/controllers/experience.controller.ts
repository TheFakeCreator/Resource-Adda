import { Request, Response } from 'express';
import InterviewExperience from '../models/InterviewExperience';
import { ContributionStatus } from '../models/Contribution';

export const getApprovedExperiences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company, role, type } = req.query;
    
    // Build filter
    const filter: any = { status: ContributionStatus.APPROVED };
    
    if (company && typeof company === 'string') {
      filter.company = { $regex: company, $options: 'i' };
    }
    
    if (role && typeof role === 'string') {
      filter.role = { $regex: role, $options: 'i' };
    }
    
    if (type && typeof type === 'string' && type !== 'all') {
      filter.type = type;
    }

    const experiences = await InterviewExperience.find(filter)
      .populate('author', 'name avatarUrl branch semester')
      .sort({ createdAt: -1 });

    // Handle anonymity
    const sanitizedExperiences = experiences.map(exp => {
      const doc = exp.toObject();
      if (doc.isAnonymous) {
        doc.author = {
          _id: doc.author._id,
          name: 'Anonymous Student',
          branch: 'Confidential',
          avatarUrl: 'https://ui-avatars.com/api/?name=Anonymous&background=random',
          semester: 0
        } as any;
      }
      return doc;
    });

    res.status(200).json(sanitizedExperiences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
