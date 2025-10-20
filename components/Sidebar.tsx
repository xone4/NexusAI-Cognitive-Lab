import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActiveView } from '../types';
import { DashboardIcon, ReplicaIcon, ToolIcon, ArchIcon, CogIcon, MagnifyingGlassIcon, DnaIcon, BookOpenIcon, SparklesIcon, DicesIcon, FilmIcon, FlaskConicalIcon } from './Icons';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
  view: ActiveView;
  label: string;
  icon: React.ReactNode;
  activeView: ActiveView;
  onClick: (view: ActiveView) => void;
}> = memo(({ view, label, icon, activeView, onClick }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const isActive = activeView === view;
  return (
    <li
      onClick={() => onClick(view)}
      className={`flex items-center p-2 my-1 cursor-pointer rounded-full transition-all duration-300
        ${isActive
          ? 'bg-nexus-primary/20 text-nexus-secondary shadow-lg'
          : 'text-nexus-text/[.65] hover:bg-nexus-surface hover:text-nexus-text'
        }`}
    >
      <div className="w-6 h-6 me-4">{icon}</div>
      <span className={`${isActive ? 'font-semibold' : ''} ${isRtl ? 'font-tahoma' : ''}`}>{label}</span>
    </li>
  );
});
NavItem.displayName = 'NavItem';

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const mainNavItems = [
    { view: 'dashboard' as ActiveView, label: t('sidebar.controlCenter'), icon: <DashboardIcon /> },
    { view: 'replicas' as ActiveView, label: t('sidebar.replicas'), icon: <ReplicaIcon /> },
    { view: 'tools' as ActiveView, label: t('sidebar.mentalTools'), icon: <ToolIcon /> },
    { view: 'world_model' as ActiveView, label: t('sidebar.worldModel'), icon: <DicesIcon /> },
    { view: 'memory' as ActiveView, label: t('sidebar.memoryExplorer'), icon: <BookOpenIcon /> },
    { view: 'evolution' as ActiveView, label: t('sidebar.evolutionChamber'), icon: <DnaIcon /> },
    { view: 'dreaming' as ActiveView, label: t('sidebar.dreamingChamber'), icon: <SparklesIcon /> },
    { view: 'modalities_lab' as ActiveView, label: t('sidebar.modalitiesLab'), icon: <FilmIcon /> },
    { view: 'simulation_lab' as ActiveView, label: t('sidebar.simulationLab'), icon: <FlaskConicalIcon /> },
    { view: 'analysis' as ActiveView, label: t('sidebar.analysisLab'), icon: <MagnifyingGlassIcon /> },
    { view: 'architecture' as ActiveView, label: t('sidebar.architecture'), icon: <ArchIcon /> },
  ];

  const settingsNavItem = { view: 'settings' as ActiveView, label: t('sidebar.settings'), icon: <CogIcon /> };

  return (
    <nav className="w-64 bg-nexus-dark p-4 flex flex-col border-e border-nexus-surface">
      <div className="text-center py-4 mb-2">
        <span className={`text-lg font-bold text-nexus-text tracking-widest ${isRtl ? 'font-tahoma' : ''}`}>{t('sidebar.nexus_ai')}</span>
      </div>
      <ul className="flex-grow">
        {mainNavItems.map(item => (
          <NavItem
            key={item.view}
            {...item}
            activeView={activeView}
            onClick={setActiveView}
          />
        ))}
      </ul>
      
      {/* Separated Settings Nav Item */}
      <div className="mt-auto">
         <div className="h-px bg-nexus-surface/50 my-2"></div>
         <ul>
           <NavItem
             key={settingsNavItem.view}
             {...settingsNavItem}
             activeView={activeView}
             onClick={setActiveView}
           />
         </ul>
      </div>

      <div className="text-center text-xs text-nexus-text-muted pt-4">
        <p>{t('sidebar.systemVer')}</p>
        <p>{t('sidebar.cognitiveCore')}</p>
      </div>
    </nav>
  );
};

export default memo(Sidebar);