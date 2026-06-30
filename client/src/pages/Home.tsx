import React from 'react';
import { Header } from '../components/Header/Header';
import { UrlInput } from '../components/UrlInput/UrlInput';
import { PlayerContainer } from '../components/Player/PlayerContainer';
import { PitchControls } from '../components/PitchControls/PitchControls';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center gap-8 px-4 py-8 max-w-4xl w-full mx-auto">
        {/* URL Input */}
        <section className="w-full">
          <UrlInput />
        </section>

        {/* Player */}
        <section className="w-full">
          <PlayerContainer />
        </section>

        {/* Controles de Pitch */}
        <section className="w-full">
          <PitchControls />
        </section>
      </main>

      <footer className="text-center py-4 text-white/15 text-xs border-t border-white/5">
        YouTube Pitch Player — MVP v1.0
      </footer>
    </div>
  );
};
