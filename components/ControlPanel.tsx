import React, { memo } from 'react';
import { BrainCircuitIcon, BeakerIcon, DocumentMagnifyingGlassIcon } from './Icons';

interface ControlPanelProps {
  onSpawnReplica: () => void;
  onGoToForge: () => void;
  onOpenIntrospection: () => void;
  isThinking: boolean;
}

const ControlButton: React.FC<{onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string;}> = ({ onClick, children, disabled, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center gap-2 bg-nexus-primary/20 text-nexus-secondary py-2 px-3 rounded-md border border-nexus-primary/50
                   hover:bg-nexus-primary/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary
                   disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed text-sm ${className}`}
    >
        {children}
    </button>
);


const ControlPanel: React.FC<ControlPanelProps> = ({ onSpawnReplica, onGoToForge, onOpenIntrospection, isThinking }) => {
  return (
    <div className="flex flex-col space-y-2 h-full justify-center">
      {isThinking ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
            <BrainCircuitIcon className="w-10 h-10 text-nexus-accent animate-pulse" />
            <p className="mt-2 font-semibold text-nexus-accent">AI is Thinking</p>
            <p className="text-xs mt-1">Manual controls are disabled during autonomous cognitive processing.</p>
        </div>
      ) : (
        <>
          <ControlButton onClick={onSpawnReplica} disabled={isThinking}>Spawn Replica</ControlButton>
          <ControlButton onClick={onGoToForge} disabled={isThinking}>
             Go to Tool Forge
          </ControlButton>
          <ControlButton onClick={onOpenIntrospection} disabled={isThinking}>
             Inspect Core Directives
          </ControlButton>
        </>
      )}
    </div>
  );
};

export default memo(ControlPanel);