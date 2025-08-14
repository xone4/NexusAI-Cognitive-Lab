import React, { memo } from 'react';
import { BrainCircuitIcon } from './Icons';

interface ControlPanelProps {
  onSpawnReplica: () => void;
  onGoToForge: () => void;
  onOpenIntrospection: () => void;
  isInteractionDisabled: boolean;
  isAutonomousMode: boolean;
  onToggleAutonomousMode: () => void;
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

const AutonomousModeToggle: React.FC<{ isOn: boolean; onToggle: () => void; disabled: boolean }> = ({ isOn, onToggle, disabled }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-nexus-primary focus:ring-offset-2 focus:ring-offset-nexus-surface disabled:cursor-not-allowed
    ${isOn ? 'bg-nexus-accent' : 'bg-nexus-bg'}`}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
      ${isOn ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);


const ControlPanel: React.FC<ControlPanelProps> = ({ onSpawnReplica, onGoToForge, onOpenIntrospection, isInteractionDisabled, isAutonomousMode, onToggleAutonomousMode }) => {
  const isThinking = isInteractionDisabled && !isAutonomousMode; // True only if cognitive process is running

  return (
    <div className="flex flex-col space-y-3 h-full justify-center">
      {isThinking ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
            <BrainCircuitIcon className="w-10 h-10 text-nexus-accent animate-pulse" />
            <p className="mt-2 font-semibold text-nexus-accent">AI is Thinking</p>
            <p className="text-xs mt-1">Manual controls are disabled during autonomous cognitive processing.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between bg-nexus-dark/50 p-2 rounded-md">
            <label htmlFor="autonomous-toggle" className="text-sm font-semibold text-nexus-text">Autonomous Mode</label>
            <AutonomousModeToggle isOn={isAutonomousMode} onToggle={onToggleAutonomousMode} disabled={isThinking} />
          </div>

          <ControlButton onClick={onSpawnReplica} disabled={isInteractionDisabled}>Spawn Replica</ControlButton>
          <ControlButton onClick={onGoToForge} disabled={isInteractionDisabled}>
             Go to Tool Forge
          </ControlButton>
          <ControlButton onClick={onOpenIntrospection} disabled={isInteractionDisabled}>
             Inspect Core Directives
          </ControlButton>

          {isAutonomousMode && (
              <p className="text-xs text-center text-nexus-accent p-2 bg-nexus-accent/10 rounded-md">
                  Autonomous mode is active. Manual controls and query submissions are disabled.
              </p>
          )}
        </>
      )}
    </div>
  );
};

export default memo(ControlPanel);