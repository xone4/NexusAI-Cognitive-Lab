import React, { memo } from 'react';
import type { AutonomousState } from '../types';
import { CpuChipIcon } from './Icons';

interface AutonomousModeOverlayProps {
  autonomousState: AutonomousState;
}

const AutonomousModeOverlay: React.FC<AutonomousModeOverlayProps> = ({ autonomousState }) => {
  if (!autonomousState.isActive) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 w-80 bg-nexus-surface/80 backdrop-blur-md rounded-xl shadow-2xl border border-lime-500/30 z-40 p-4 animate-spawn-in pointer-events-none">
      <div className="flex items-center gap-3 mb-2">
        <CpuChipIcon className="w-6 h-6 text-lime-400 animate-pulse" />
        <h3 className="text-lg font-bold text-lime-400">AUTONOMOUS AI ACTIVE</h3>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-nexus-text-muted uppercase">Current Goal</p>
          <p className="text-sm text-nexus-text italic">"{autonomousState.goal}"</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-nexus-text-muted uppercase">Executing Action</p>
          <p className="text-sm text-nexus-text font-mono animate-pulse">{autonomousState.action}</p>
        </div>
      </div>
    </div>
  );
};

export default memo(AutonomousModeOverlay);