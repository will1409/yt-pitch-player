# YouTube Pitch Player (Multitrack Studio)

Transforme vídeos do YouTube em um **estúdio de mixagem de 6 pistas** e altere o **Pitch/Transpose** em segundos, mantendo a mais alta qualidade de estúdio (sem distorção de fase).

![Interface do YouTube Pitch Player](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python) ![Demucs](https://img.shields.io/badge/IA-Demucs_6s-FF6F00?style=flat-square) ![Pedalboard](https://img.shields.io/badge/Audio-Pedalboard-000000?style=flat-square)

---

## ⚡ Arquitetura "Smart Cache" (O grande diferencial)

Processar áudio por Inteligência Artificial é pesado (uma música inteira pode levar 5 minutos usando a placa de vídeo). Para não ter que esperar 5 minutos toda vez que quiser testar um tom (pitch) diferente, desenvolvemos a **Arquitetura de Cache Inteligente**:

1. **Separação Pura**: O servidor baixa o áudio e a IA (`Demucs`) separa as 6 trilhas no tom original (mantendo 100% da fidelidade). Isso leva ~5 minutos e é feito **uma única vez**.
2. **Armazenamento (Cache)**: Os áudios gerados são cacheados localmente através de um Hash (MD5) da URL do YouTube.
3. **Pitch Dinâmico de Alta Qualidade**: Ao escolher um novo tom (`+2`, `-1`, etc) e clicar em "Aplicar Tom", a IA é ignorada. Um script de áudio profissional (`Pedalboard` rodando em **Multi-Threading** no Python) puxa o cache das 6 faixas e altera o tom matematicamente em **menos de 15 segundos**, exportando o áudio final em `WAV PCM 16-bit` compatível com qualquer navegador.

---

## 🎧 As 6 Faixas Separadas (Mixer)
O sistema usa o modelo avançado `htdemucs_6s` para isolar cirurgicamente:
- 🎤 **Vocais**
- 🥁 **Bateria**
- 🎸 **Baixo**
- 🎸 **Guitarra / Violão**
- 🎹 **Teclado / Piano**
- 🎷 **Outros** (Sopros, Sintetizadores extras)

---

## 🛠️ Como executar localmente

### Pré-requisitos
- **Placa de Vídeo (GPU)** com pelo menos 8GB VRAM (NVIDIA recomendada).
- Node.js **>= 18**
- Python **>= 3.11**

### 1. Backend (Motor Python & Node.js)
```bash
cd server
npm install

# Instalação do ambiente Python e dependências pesadas
cd python
python -m venv venv
.\venv\Scripts\activate

# MUITO IMPORTANTE: Instalar o PyTorch com suporte a CUDA para usar sua placa de vídeo!
# Acesse https://pytorch.org/get-started/locally/ para pegar o comando correto (Ex: CUDA 11.8 ou 12.1)
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Instalar IA e processadores de áudio
pip install demucs pedalboard soundfile yt-dlp numpy

cd ..
npm run dev
```
Servidor disponível em: **http://localhost:3001**

### 2. Frontend (React)
```bash
cd client
npm install
npm run dev
```
Acesse a Interface em: **http://localhost:5173**

---

## 🚀 Próximos Passos (Roadmap)

A base do aplicativo está sólida, funcional e extremamente veloz graças ao cache. Aqui estão as próximas etapas mapeadas para o projeto:

- [ ] **Mudança de Velocidade (BPM)**: Permitir alterar o tempo da música junto com o pitch (útil para estudo de instrumentos).
- [ ] **Exportação (Download)**: Botão para o usuário baixar a "Mix final" em MP3 ou as 6 pistas separadas em um arquivo ZIP.
- [ ] **Metrônomo Inteligente**: Detectar o BPM da música original e criar uma trilha "Click/Metrônomo" gerada automaticamente.
- [ ] **Looping**: Criar seções de Loop (A/B) para praticar refrões ou solos de guitarra.
- [ ] **Limpeza Periódica do Cache**: Implementar um cronjob (tarefa agendada) no servidor Node.js para deletar `jobs/` inativos há mais de 3 dias, evitando lotar o HD do servidor.
- [ ] **Melhorias de UI**: Permitir "Mute" e "Solo" nos canais individuais do mixer, além do controle de volume já existente.

---

## 📦 Stack Tecnológico

**Frontend**: React 18 · TypeScript 5 · Vite 6 · TailwindCSS 3 · Zustand · React Icons
**Backend Node**: Express · TypeScript · Axios
**Backend Audio (Python)**: Demucs (`htdemucs_6s`) · Pedalboard (Spotify) · yt-dlp · PyTorch (CUDA)
