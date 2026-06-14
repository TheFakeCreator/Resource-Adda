import { Request, Response } from 'express';
import Page from '../models/Page';
import { AuthRequest } from '../middlewares/auth';
import { UserRole } from '../models/User';

const RESTRICTED_SLUGS = ['login', 'register', 'dashboard', 'admin', 'api', 'setup', 'documents', 'unauthorized', 'resources'];

export const getPageBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const page = await Page.findOne({ slug: slug.toLowerCase() });
    
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    
    res.status(200).json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllPages = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only return metadata, not the full markdown content to save bandwidth
    const pages = await Page.find({}, 'slug title updatedAt').sort({ title: 1 });
    res.status(200).json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const slug = req.params.slug as string;
    const { title, content } = req.body;
    const normalizedSlug = slug.toLowerCase().trim();

    if (RESTRICTED_SLUGS.includes(normalizedSlug)) {
      res.status(400).json({ error: 'Cannot use a restricted system slug.' });
      return;
    }

    let page = await Page.findOne({ slug: normalizedSlug });
    
    if (page) {
      page.title = title || page.title;
      page.content = content !== undefined ? content : page.content;
      page.lastUpdatedBy = req.user._id;
    } else {
      if (!title) {
        res.status(400).json({ error: 'Title is required for a new page' });
        return;
      }
      page = new Page({
        slug: normalizedSlug,
        title,
        content: content || '',
        lastUpdatedBy: req.user._id
      });
    }

    await page.save();
    res.status(200).json({ message: 'Page saved successfully', page });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
