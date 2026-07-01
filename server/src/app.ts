import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import audioRouter from './routes/audio';
import processRouter from './routes/process';
import downloadRouter from './routes/download';

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://yt-pitch-player.web.app',
  'https://yt-pitch-player.firebaseapp.com',
];

app.use(
  cors({
    origin: '*', // Permite Vercel e outros domínios
  })
);

app.use(express.json());
app.use('/api', healthRouter);
app.use('/api/audio', audioRouter);
app.use('/api/process', processRouter);
app.use('/api/download', downloadRouter);

export default app;
