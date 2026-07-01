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
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex: curl) e origens autorizadas
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);

app.use(express.json());
app.use('/api', healthRouter);
app.use('/api/audio', audioRouter);
app.use('/api/process', processRouter);
app.use('/api/download', downloadRouter);

export default app;
