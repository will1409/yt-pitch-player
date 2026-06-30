# YouTube Pitch Player

Reproduza vídeos do YouTube e altere o **Pitch/Transpose** em tempo real.

![Interface do YouTube Pitch Player](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)

---

## ⚡ Como executar localmente

### Pré-requisitos

- Node.js **>= 18**
- npm **>= 9**

### 1. Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Acesse em: **http://localhost:5173**

### 2. Backend (Server) — opcional para o MVP

```bash
cd server
npm install
npm run dev
```

API disponível em: **http://localhost:3001**

---

## 🏗️ Estrutura do Projeto

```
/
├── client/                    # Frontend React + Vite + TypeScript
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Header/        # Cabeçalho com logo
│       │   ├── Player/        # Player YouTube + container
│       │   ├── PitchControls/ # Controles de pitch + grid
│       │   ├── UrlInput/      # Campo de URL
│       │   └── ui/            # Componentes reutilizáveis (Button, Badge)
│       ├── hooks/
│       │   ├── useAudioEngine.ts   # Integração AudioEngine ↔ Store
│       │   └── useYoutubePlayer.ts # Controle do player YouTube
│       ├── pages/
│       │   └── Home.tsx       # Página única
│       ├── services/
│       │   ├── AudioEngine.ts     # Camada isolada de áudio (Web Audio API)
│       │   └── YoutubeService.ts  # Abstração do player YouTube
│       ├── store/
│       │   └── playerStore.ts # Zustand store global
│       ├── types/
│       │   └── index.ts       # Tipos TypeScript globais
│       └── utils/
│           └── youtube.ts     # Helpers de URL YouTube
│
└── server/                    # Backend Express + TypeScript
    └── src/
        ├── routes/
        │   └── health.ts      # GET /api/health
        └── index.ts
```

---

## 🎵 Funcionalidades do MVP

| Funcionalidade | Status |
|---|---|
| Carregar vídeo por URL | ✅ |
| Player YouTube embutido | ✅ |
| Controle de Pitch -12 a +12 | ✅ |
| Grid de seleção rápida | ✅ |
| Botões [-] [+] com limites | ✅ |
| Reset de pitch | ✅ |
| Tema escuro | ✅ |
| Responsivo | ✅ |
| TypeScript strict | ✅ |
| Arquitetura desacoplada | ✅ |

---

## 🔊 Nota sobre Processamento de Áudio

O YouTube Iframe API roda em **cross-origin**, impedindo captura direta do stream de áudio via Web Audio API (CORS + ToS do YouTube).

A arquitetura `AudioEngine` foi desenhada de forma **completamente desacoplada** do player YouTube. Para integrar pitch shifting real:

1. Substitua a fonte de áudio em `AudioEngine.connectMediaElement()` por qualquer `HTMLMediaElement` autorizado
2. Conecte um nó de processamento SoundTouch/RubberBand em `AudioEngine.setPitch()`

**Nenhum componente React precisará ser alterado.**

---

## 🚀 Roadmap (Futuro)

Arquitetura preparada para adicionar sem grandes refatorações:

- [ ] Mudança de velocidade (playback rate)
- [ ] Loop A/B
- [ ] Playlists
- [ ] Favoritos
- [ ] Login Firebase
- [ ] Assinatura SaaS
- [ ] App Android / iOS (React Native)

---

## 📦 Stack

**Frontend**: React 18 · TypeScript 5 · Vite 6 · TailwindCSS 3 · Zustand · React Icons · react-youtube

**Backend**: Node.js · Express · TypeScript
