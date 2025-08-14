
import React, { memo } from 'react';
import { BrainCircuitIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-nexus-dark/80 backdrop-blur-sm border-b border-nexus-surface p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <BrainCircuitIcon className="w-8 h-8 text-nexus-primary" />
        <h1 className="text-2xl font-bold text-nexus-text animate-text-focus-in">
          NexusAI <span className="text-nexus-secondary font-light text-xl">Cognitive Lab</span>
        </h1>
      </div>
    </header>
  );
};

export default memo(Header);