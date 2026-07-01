import runpod
import subprocess
import base64
import os
import uuid
import shutil

def handler(job):
    job_input = job['input']
    url = job_input.get('url')
    pitch = job_input.get('pitch', 0)
    
    if not url:
        return {"error": "Missing 'url' in input"}
    
    job_id = str(uuid.uuid4())
    job_dir = os.path.join("jobs", job_id)
    
    try:
        # Chama o nosso script original process.py
        subprocess.run([
            "python", "process.py",
            "--url", url,
            "--pitch", str(pitch),
            "--jobId", job_id
        ], check=True)
        
        vocals_path = os.path.join(job_dir, "vocals.wav")
        accomp_path = os.path.join(job_dir, "accompaniment.wav")
        
        # Lê os arquivos gerados e converte para base64 para enviar via rede
        with open(vocals_path, "rb") as f:
            vocals_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        with open(accomp_path, "rb") as f:
            accomp_b64 = base64.b64encode(f.read()).decode('utf-8')
            
        # Limpa o diretório local no container do RunPod para economizar espaço
        shutil.rmtree(job_dir, ignore_errors=True)
            
        return {
            "status": "success",
            "vocals_base64": vocals_b64,
            "accompaniment_base64": accomp_b64
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

runpod.serverless.start({"handler": handler})
