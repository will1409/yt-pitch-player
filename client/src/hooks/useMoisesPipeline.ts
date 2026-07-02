import { usePlayerStore } from '../store/playerStore';

export const useMoisesPipeline = () => {
  const { 
    videoUrl, pitch, 
    setJobId, setJobStatus, setStems, setError,
    jobId, jobStatus
  } = usePlayerStore();

  const startPipeline = async () => {
    if (!videoUrl) return;
    
    try {
      setJobStatus('processing');
      setError(null);
      setStems(null);

      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, pitch })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao iniciar processamento');

      setJobId(data.jobId);
      pollStatus(data.jobId);
    } catch (err: any) {
      setError(err.message);
      setJobStatus('error');
    }
  };

  const pollStatus = async (currentJobId: string) => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/process/status/${currentJobId}`);
        const data = await res.json();
        
        if (data.status === 'success') {
          clearInterval(interval);
          setJobStatus('success');
          // A API retorna URLs relativas, precisamos montar a URL completa se o VITE_API_URL estiver apontando pra fora
          const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/audio', '') : '';
          setStems({
            vocals: baseUrl + data.result.vocals,
            drums: baseUrl + data.result.drums,
            bass: baseUrl + data.result.bass,
            other: baseUrl + data.result.other,
            piano: baseUrl + data.result.piano,
            guitar: baseUrl + data.result.guitar
          });
        } else if (data.status === 'error') {
          clearInterval(interval);
          setJobStatus('error');
          setError(data.error || 'Erro no processamento da IA');
        }
      } catch (err) {
        // Ignora erros de polling temporários
      }
    }, 3000); // Polling a cada 3 segundos
  };

  return { startPipeline, jobStatus, jobId };
};
