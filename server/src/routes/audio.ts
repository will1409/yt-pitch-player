import { Router, Request, Response } from 'express';
import youtubedl from 'youtube-dl-exec';

const router = Router();

router.get('/:videoId', async (req: Request, res: Response): Promise<void> => {
  const { videoId } = req.params;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const subprocess = youtubedl.exec(url, {
      output: '-',
      format: 'bestaudio',
      noWarnings: true,
      callHome: false,
      noCheckCertificate: true,
      youtubeSkipDashManifest: true,
    });

    res.setHeader('Content-Type', 'audio/webm');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    subprocess.stdout?.on('error', (err: Error) => {
      console.error('[AudioRoute] Erro no stream do yt-dlp:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Falha ao carregar áudio.' });
      }
    });

    req.on('close', () => {
      if (subprocess.pid) {
        process.kill(subprocess.pid);
      }
    });

    subprocess.stdout?.pipe(res);
  } catch (err) {
    console.error('[AudioRoute] Erro:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Falha ao processar requisição de áudio.' });
    }
  }
});

export default router;
