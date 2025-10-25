import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainCircuitIcon, CpuChipIcon } from './Icons';
import type { AutonomousState } from '../types';

interface HeaderProps {
    autonomousState: AutonomousState;
    onToggleAutonomousMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ autonomousState, onToggleAutonomousMode }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <header className="bg-nexus-dark/80 backdrop-blur-sm border-b border-nexus-surface p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-3">
        <BrainCircuitIcon className="w-8 h-8 text-nexus-primary" />
        <h1 className={`text-2xl font-bold text-nexus-text animate-text-focus-in ${isRtl ? 'font-tahoma' : ''}`}>
          {t('header.title')} <span className="text-nexus-secondary font-light text-xl">{t('header.subtitle')}</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleAutonomousMode}
          title={autonomousState.isActive ? "Deactivate Autonomous AI" : "Activate Autonomous AI"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-300
            ${autonomousState.isActive
              ? 'bg-lime-500/10 text-lime-400 border-lime-500/50 animate-pulse'
              : 'bg-nexus-surface text-nexus-text-muted border-nexus-surface/50 hover:bg-nexus-primary/20 hover:text-nexus-primary'
            }`}
        >
          <CpuChipIcon className="w-5 h-5"/>
          Autonomous AI
        </button>
      </div>
    </header>
  );
};

export default memo(Header);