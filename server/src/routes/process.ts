import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

import axios from 'axios';

const router = Router();

// Simples armazém em memória para status dos jobs
const jobs = new Map<string, any>();

router.post('/', (req: Request, res: Response) => {
  const { url, pitch } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const numPitch = Number(pitch || 0);
  const jobId = crypto.createHash('md5').update(url).digest('hex');
  
  const pythonDir = path.join(__dirname, '../../python');
  const pythonExecutable = path.join(pythonDir, 'venv', 'Scripts', 'python.exe');
  
  if (jobs.has(jobId) && jobs.get(jobId).status === 'processing') {
    return res.json({ jobId, status: 'processing' });
  }

  jobs.set(jobId, { status: 'processing', progress: 0 });

  const originalVocalsPath = path.join(pythonDir, 'jobs', jobId, 'original_vocals.wav');
  const pitchedVocalsPath = path.join(pythonDir, 'jobs', jobId, `pitch_${numPitch}_vocals.wav`);

  const returnSuccess = (prefix: string) => {
    jobs.set(jobId, { 
      status: 'success', 
      result: {
        vocals: `/api/download/${jobId}/${prefix}_vocals.wav`,
        drums: `/api/download/${jobId}/${prefix}_drums.wav`,
        bass: `/api/download/${jobId}/${prefix}_bass.wav`,
        other: `/api/download/${jobId}/${prefix}_other.wav`,
        piano: `/api/download/${jobId}/${prefix}_piano.wav`,
        guitar: `/api/download/${jobId}/${prefix}_guitar.wav`
      }
    });
  };

  const runPitchStems = () => {
    console.log(`[Job ${jobId}] Iniciando pitch_stems.py para pitch ${numPitch}...`);
    const pyProcess = spawn(pythonExecutable, [
      path.join(pythonDir, 'pitch_stems.py'),
      '--jobId', jobId,
      '--pitch', String(numPitch)
    ], { cwd: pythonDir });

    let output = '';
    pyProcess.stdout.on('data', data => output += data.toString());
    pyProcess.stderr.on('data', data => console.error(`[Job ${jobId}] Pitch Erro:`, data.toString().trim()));

    pyProcess.on('close', (code) => {
      console.log(`[Job ${jobId}] pitch_stems.py finalizado com código ${code}`);
      if (code === 0) {
        returnSuccess(`pitch_${numPitch}`);
      } else {
        jobs.set(jobId, { status: 'error', error: 'Falha ao aplicar pitch nas faixas' });
      }
    });
  };

  const checkAndRun = () => {
    if (fs.existsSync(originalVocalsPath)) {
      console.log(`[Job ${jobId}] Cache encontrado! Stems originais já existem.`);
      if (numPitch === 0) {
        returnSuccess('original');
      } else {
        if (fs.existsSync(pitchedVocalsPath)) {
          console.log(`[Job ${jobId}] Cache do pitch ${numPitch} também existe! Retornando...`);
          returnSuccess(`pitch_${numPitch}`);
        } else {
          runPitchStems();
        }
      }
    } else {
      console.log(`[Job ${jobId}] Cache não encontrado. Iniciando Demucs (process.py)...`);
      const pyProcess = spawn(pythonExecutable, [
        path.join(pythonDir, 'process.py'),
        '--url', url,
        '--pitch', '0',
        '--jobId', jobId
      ], { cwd: pythonDir });

      let output = '';
      pyProcess.stdout.on('data', data => {
        output += data.toString();
        console.log(`[Job ${jobId}] Demucs:`, data.toString().trim());
      });
      pyProcess.stderr.on('data', data => console.error(`[Job ${jobId}] Demucs Erro:`, data.toString().trim()));

      pyProcess.on('close', (code) => {
        console.log(`[Job ${jobId}] process.py finalizado com código ${code}`);
        if (code === 0) {
          if (numPitch === 0) {
            returnSuccess('original');
          } else {
            runPitchStems();
          }
        } else {
          jobs.set(jobId, { status: 'error', error: 'Falha ao processar vídeo ou IA' });
        }
      });
    }
  };

  checkAndRun();

  return res.json({ jobId, status: 'processing' });
});

router.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  res.json(job);
});

export default router;
