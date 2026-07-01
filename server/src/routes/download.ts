import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/:jobId/:filename', (req: Request, res: Response) => {
  const { jobId, filename } = req.params;
  
  // O python salva em server/python/jobs/{jobId}/htdemucs/pitch_shifted/{vocals|no_vocals}.wav
  // Mas no nosso script process.py, vamos garantir que ele mova os arquivos para a raiz do job com nomes previsíveis (.mp3 ou .wav)
  const jobDir = path.join(__dirname, '../../python/jobs', jobId);
  const filePath = path.join(jobDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  res.sendFile(filePath);
});

export default router;
