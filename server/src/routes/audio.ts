import { Router, Request, Response } from 'express';
import ytdl from '@distube/ytdl-core';

const router = Router();

/**
 * GET /api/audio/:videoId
 * Faz proxy do stream de áudio do YouTube para o cliente.
 * Necessário porque o YouTube bloqueia acesso direto ao áudio via CORS no browser.
 */
router.get('/:videoId', async (req: Request, res: Response): Promise<void> => {
  const { videoId } = req.params;

  if (!ytdl.validateID(videoId)) {
    res.status(400).json({ error: 'ID de vídeo inválido.' });
    return;
  }

  try {
    const stream = ytdl(videoId, {
      filter: 'audioonly',
      quality: 'lowestaudio',
    });

    stream.on('info', (_info, format) => {
      const mimeType = format.mimeType?.split(';')[0] ?? 'audio/webm';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Transfer-Encoding', 'chunked');
    });

    stream.on('error', (err: Error) => {
      console.error('[AudioRoute] Erro no stream:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Falha ao carregar áudio do vídeo.' });
      }
    });

    // Cancela o stream se o cliente fechar a conexão
    req.on('close', () => stream.destroy());

    stream.pipe(res);
  } catch (err) {
    console.error('[AudioRoute] Erro:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Falha ao processar requisição de áudio.' });
    }
  }
});

export default router;
