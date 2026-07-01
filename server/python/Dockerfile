# Usa uma imagem oficial do PyTorch com suporte a CUDA para habilitar GPU
FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

# Instala ffmpeg e dependências de áudio
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os requisitos e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código da IA
COPY . .

# Comando para iniciar o Worker do RunPod
CMD ["python", "-u", "handler.py"]
