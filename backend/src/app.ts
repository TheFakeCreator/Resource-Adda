import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import setupRoutes from './routes/setup.routes';
import resourceRoutes from './routes/resource.routes';
import experienceRoutes from './routes/experience.routes';
import roadmapRoutes from './routes/roadmap.routes';
import pageRoutes from './routes/page.routes';

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/placements', experienceRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/pages', pageRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

export default app;
