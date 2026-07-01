# 🎵 Youtube Pitch Player (Moises Clone) - Contexto Atual
**Data da última atualização:** 01/07/2026 (Transição para o Novo PC Gamer com Placa de 8GB)

## 🎯 Objetivo do Projeto
Criar uma plataforma (Estilo Moises) onde o usuário cola uma URL do YouTube, escolhe o tom (pitch), e a IA isola a voz dos instrumentos.

## 🏗️ A Grande Evolução de Arquitetura (O que fizemos até aqui)
Saímos do ambiente 100% local e distribuímos a arquitetura em 3 partes para escapar dos limites de Timeout e Memória dos servidores gratuitos:

1.  **Frontend na Nuvem (Vercel):** 
    * O site visual (React/Vite) já está **100% online na Vercel**!
    * Foi configurada a variável `VITE_API_URL` na Vercel apontando para o motor (atualmente apontando para o túnel do PC, via Cloudflare).
    * O código mais atual já foi "pushed" (commit: *fix: resolver erros de variaveis...*), e a Vercel já fez o *deploy* com sucesso.
2.  **Backend "Maestro" (Render.com / Local via Ngrok/Cloudflare):**
    * O código fonte (pasta `server`) foi adaptado para ser um proxy e gerenciar o processamento longo (2 minutos).
    * Existe um projeto criado no Render (`yt-pitch-player.onrender.com`), configurado com a pasta `server` e `Language: Docker`.
3.  **O "Motor" da Inteligência Artificial (Processamento Python pesado):**
    * *Plano Original:* Íamos alugar uma GPU no RunPod Serverless ($10 de saldo mínimo), integrando-a ao Backend via `RUNPOD_API_KEY` (isso já está programado no `process.ts`).
    * **NOVO PLANO (Atual):** Descobrimos que o usuário tem um "PC Gamer" com uma placa de vídeo de **8GB**. Como o Demucs é muito rápido na GPU local, transformamos esse PC no nosso Motor Principal e descartamos o custo do RunPod!

## 🔐 Capacidades da IA (Lembretes para a próxima sessão)
* A IA (eu) **tem** a chave de acesso da Vercel salva no terminal do usuário (`novoendwill-4613`). Posso rodar comandos `vercel` ou `npx vercel` via terminal para facilitar.
* O código fonte está sincronizado no GitHub (repositório `will1409/yt-pitch-player`). A Vercel atualiza automaticamente a cada `git push`.
* A IA **NÃO** tem acesso visual às páginas do Vercel Web ou Render, mas não precisamos mais delas.

## 🚀 Próximos Passos (NO NOVO PC)

O usuário vai abrir esta conversa de dentro do novo computador com a Placa de Vídeo de 8GB. 

**Exatamente o que vamos fazer lá (Passo a Passo Automático):**

1.  **Baixar o Código:** O usuário (ou eu, via terminal) vai clonar o repositório:
    `git clone https://github.com/will1409/yt-pitch-player.git`
2.  **Instalar Node:** Na pasta `server`, rodar `npm install`.
3.  **Preparar a Placa de Vídeo (O Pulo do Gato):**
    * Criar o ambiente virtual (`server/python/venv`).
    * **MUITO IMPORTANTE:** Instalar o PyTorch com suporte a **CUDA 11.8/12.1** para usar a placa de vídeo de 8GB:
      `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`
    * Instalar o resto (`demucs`, `pedalboard`, `yt-dlp`).
4.  **Ligar o Motor de Graça:**
    * Rodar `npm run dev` na pasta `server`.
    * Abrir o túnel (Cloudflare/Ngrok): `npx -y cloudflared tunnel --url http://localhost:3001`
5.  **Avisar a Vercel:**
    * Trocar a variável `VITE_API_URL` da Vercel para o novo link do túnel (eu posso fazer isso com o `npx vercel env add` no terminal, ou o usuário troca no site rapidinho).
6.  **Deitar e Curtir:** A plataforma do usuário (Moises de bolso) processará qualquer música em 15 segundos direto da GPU dele, com o site hospedado na nuvem para o mundo todo!
