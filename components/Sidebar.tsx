
import React, { memo } from 'react';
import type { ActiveView } from '../types';
import { DashboardIcon, ReplicaIcon, ToolIcon, ArchIcon, CogIcon, MagnifyingGlassIcon } from './Icons';

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
  const isActive = activeView === view;
  return (
    <li
      onClick={() => onClick(view)}
      className={`flex items-center p-3 my-2 cursor-pointer rounded-lg transition-all duration-300
        ${isActive
          ? 'bg-nexus-primary/20 text-nexus-secondary shadow-lg'
          : 'text-nexus-text-muted hover:bg-nexus-surface hover:text-nexus-text'
        }`}
    >
      <div className="w-6 h-6 mr-4">{icon}</div>
      <span className="font-semibold">{label}</span>
    </li>
  );
});
NavItem.displayName = 'NavItem';

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const mainNavItems = [
    { view: 'dashboard' as ActiveView, label: 'Control Center', icon: <DashboardIcon /> },
    { view: 'replicas' as ActiveView, label: 'Replicas', icon: <ReplicaIcon /> },
    { view: 'tools' as ActiveView, label: 'Mental Tools', icon: <ToolIcon /> },
    { view: 'analysis' as ActiveView, label: 'Analysis Lab', icon: <MagnifyingGlassIcon /> },
    { view: 'architecture' as ActiveView, label: 'Architecture', icon: <ArchIcon /> },
  ];

  const settingsNavItem = { view: 'settings' as ActiveView, label: 'Settings', icon: <CogIcon /> };

  return (
    <nav className="w-64 bg-nexus-dark p-4 flex flex-col border-r border-nexus-surface">
      <div className="text-center py-4 mb-4">
        <span className="text-lg font-bold text-nexus-text tracking-widest">NEXUS_AI</span>
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
        <p>System Ver. 2.718</p>
        <p>Cognitive Core: Synced</p>
      </div>
    </nav>
  );
};

export default memo(Sidebar);