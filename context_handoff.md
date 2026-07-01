# 🎵 Youtube Pitch Player (Moises Clone) - Contexto Atual
**Data da última atualização:** 30/06/2026 (Pré-Reboot)

## 🎯 Objetivo do Projeto
Criar uma plataforma onde o usuário cola a URL de um vídeo do YouTube, escolhe um "pitch" (tom) desejado, e a aplicação extrai o áudio, muda o tom com alta qualidade e usa Inteligência Artificial para separar a voz dos instrumentos em multipistas (estilo Moises), permitindo mutar e ajustar o volume individualmente para estudos musicais.

## 🏗️ Arquitetura Atual (Pivot para Processamento Backend)
Inicialmente tentamos streaming em tempo real, mas pivotamos para **Processamento Assíncrono no Backend** para garantir qualidade de estúdio e não distorcer as vozes (esquilo).

*   **Frontend (Porta 5174):** React + Vite + TailwindCSS + Zustand + Tone.js.
    *   Painel que capta a URL e o Pitch (botão "Separar Faixas").
    *   Tela de loading pulsante enquanto a IA trabalha.
    *   `MultitrackPlayer`: Toca os arquivos processados (`vocals.wav` e `accompaniment.wav`) em perfeita sincronia.
*   **Backend (Porta 3001):** Node.js + Express.
    *   Recebe o pedido em `/api/process`, gera um `jobId` único, e cria um processo filho (`spawn`) que chama um script Python.
    *   Fica enviando o status pelo endpoint de polling (`/api/process/status/:jobId`).
    *   Hospeda os arquivos gerados estaticamente para o Frontend tocar (`/api/audio/jobs/:jobId/...`).
*   **Pipeline Python (`server/python/process.py`):**
    1.  `yt-dlp`: Baixa o áudio do YouTube na melhor qualidade e converte pra `.wav` via `ffmpeg`.
    2.  `pedalboard`: Aplica o Pitch Shift com algoritmo de alta qualidade.
    3.  `demucs` (Meta): Roda a Rede Neural para separar a voz dos instrumentos.

## 🐛 Bugs Resolvidos Nesta Sessão (Para não repetir)
1.  **CORS:** A porta do Frontend mudou de 5173 para 5174 e o Express bloqueou. *Resolvido atualizando o array de ALLOWED_ORIGINS no `app.ts`.*
2.  **yt-dlp falhando:** O YouTube bloqueava o download com erro 400. *Resolvido atualizando o pacote yt-dlp do Python da versão 2023 para a 2026.6.9 via pip.*
3.  **Crash da IA (PyTorch / Pedalboard):** O Python estava crashando com `ImportError: DLL load failed`. O motivo era a falta do **Microsoft Visual C++ Redistributable** na máquina host. *Resolvido instalando silenciosamente via link direto da Microsoft.*

## 🚀 Próximos Passos (PÓS-REBOOT)

**Onde paramos:** O usuário precisou **reiniciar o Windows** para que a instalação das DLLs do C++ entrem em vigor no sistema, permitindo que a IA carregue com sucesso no ambiente local.

**Passos assim que a conversa recomeçar:**
1.  **Levantar os servidores locais:**
    *   No terminal do Backend (`server`): `npm run dev`
    *   No terminal do Frontend (`client`): `npm run dev`
2.  **Teste Final Local:**
    *   Colar um link do YouTube, escolher um tom, e clicar em processar.
3.  **Migração VPS Linux:**
    *   Assim que o teste local validar a qualidade, vamos iniciar o deploy para o VPS do usuário, configurando lá os mesmos requisitos.
