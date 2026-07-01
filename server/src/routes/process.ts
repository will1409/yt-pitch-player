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

  const jobId = crypto.randomBytes(8).toString('hex');
  const pythonDir = path.join(__dirname, '../../python');
  const processScript = path.join(pythonDir, 'process.py');
  
  // Caminho absoluto para o executável do python no venv do windows
  const pythonExecutable = path.join(pythonDir, 'venv', 'Scripts', 'python.exe');

  jobs.set(jobId, { status: 'processing', progress: 0 });

  console.log(`[Job ${jobId}] Iniciando processamento de ${url} com pitch ${pitch}...`);

  if (process.env.RUNPOD_API_KEY && process.env.RUNPOD_ENDPOINT_ID) {
    console.log(`[Job ${jobId}] Enviando para o RunPod Serverless...`);
    
    axios.post(`https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/runsync`, {
        input: { url, pitch: pitch || 0 }
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
            'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutos
    }).then(response => {
        const result = response.data;
        if (result.status === 'COMPLETED' && result.output && result.output.status === 'success') {
            const jobDir = path.join(pythonDir, 'jobs', jobId);
            fs.mkdirSync(jobDir, { recursive: true });
            
            fs.writeFileSync(path.join(jobDir, 'vocals.wav'), Buffer.from(result.output.vocals_base64, 'base64'));
            fs.writeFileSync(path.join(jobDir, 'accompaniment.wav'), Buffer.from(result.output.accompaniment_base64, 'base64'));
            
            jobs.set(jobId, { status: 'success', result: {
                vocals: `/api/audio/jobs/${jobId}/vocals.wav`,
                accompaniment: `/api/audio/jobs/${jobId}/accompaniment.wav`
            }});
            console.log(`[Job ${jobId}] RunPod finalizou com sucesso!`);
        } else {
            jobs.set(jobId, { status: 'error', error: 'Falha no RunPod: ' + JSON.stringify(result) });
        }
    }).catch(err => {
        console.error(`[Job ${jobId}] Erro no RunPod:`, err.message);
        jobs.set(jobId, { status: 'error', error: 'Erro ao contatar GPU na nuvem.' });
    });

    return res.json({ jobId, status: 'processing' });
  }

  const pyProcess = spawn(pythonExecutable, [
    processScript,
    '--url', url,
    '--pitch', String(pitch || 0),
    '--jobId', jobId
  ], {
    cwd: pythonDir
  });

  let output = '';

  pyProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log(`[Job ${jobId}] Python:`, data.toString().trim());
  });

  pyProcess.stderr.on('data', (data) => {
    console.error(`[Job ${jobId}] Python Erro:`, data.toString().trim());
  });

  pyProcess.on('close', (code) => {
    console.log(`[Job ${jobId}] Processo finalizado com código ${code}`);
    if (code === 0) {
      try {
        // Tenta achar o json de sucesso no output
        const lines = output.split('\n').map(l => l.trim()).filter(Boolean);
        const lastLine = lines[lines.length - 1];
        if (lastLine.startsWith('{')) {
           const result = JSON.parse(lastLine);
           jobs.set(jobId, { status: 'success', result });
        } else {
           jobs.set(jobId, { status: 'success', result: {
             vocals: `/api/download/${jobId}/vocals.mp3`,
             accompaniment: `/api/download/${jobId}/accompaniment.mp3`
           }});
        }
      } catch(e) {
        jobs.set(jobId, { status: 'error', error: 'Falha ao ler output do python' });
      }
    } else {
      jobs.set(jobId, { status: 'error', error: 'O processamento falhou no servidor' });
    }
  });

  return res.json({ jobId, status: 'processing' });
});

router.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: 'Job não encontrado' });
  res.json(job);
});

export default router;
