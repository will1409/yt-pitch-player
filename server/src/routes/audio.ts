import { Router, Request, Response } from 'express';
import youtubedl from 'youtube-dl-exec';
import https from 'https';

const router = Router();

router.get('/:videoId', async (req: Request, res: Response): Promise<void> => {
  const { videoId } = req.params;
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const output = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      youtubeSkipDashManifest: true,
    });

    const audioFormats = (output as any).formats.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none');
    if (!audioFormats.length) {
      res.status(404).json({ error: 'Nenhum formato de áudio encontrado.' });
      return;
    }

    const bestAudio = audioFormats.sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
    const streamUrl = bestAudio.url;

    https.get(streamUrl, (audioRes) => {
      res.setHeader('Content-Type', 'audio/webm');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

      audioRes.pipe(res);
      
      req.on('close', () => {
        audioRes.destroy();
      });
    }).on('error', (err) => {
      console.error('[AudioRoute] Erro no proxy HTTPS:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Falha ao baixar áudio' });
    });

  } catch (err) {
    console.error('[AudioRoute] Erro:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Falha ao processar requisição de áudio.' });
    }
  }
});

export default router;
