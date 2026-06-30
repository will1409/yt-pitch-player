import React from 'react';
import { SiYoutube } from 'react-icons/si';
import { MdMusicNote } from 'react-icons/md';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/40">
          <MdMusicNote className="text-white text-xl" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg tracking-tight">YouTube</span>
          <span className="text-violet-400 font-semibold text-sm tracking-widest uppercase">
            Pitch Player
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-white/30 text-xs">
        <SiYoutube className="text-red-500/60 text-lg" />
        <span>Powered by YouTube Iframe API</span>
      </div>
    </header>
  );
};
