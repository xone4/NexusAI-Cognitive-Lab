
import React, { memo } from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  fullHeight?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '', icon, fullHeight = false }) => {
  return (
    <div
      className={`bg-nexus-surface rounded-lg border border-nexus-surface/50 shadow-lg p-4 flex flex-col backdrop-blur-sm bg-opacity-50 ${fullHeight ? 'h-full' : ''} ${className}`}
    >
      <div className="flex items-center mb-4">
        {icon && <div className="w-6 h-6 mr-3 text-nexus-primary">{icon}</div>}
        <h3 className="text-lg font-semibold text-nexus-text">{title}</h3>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default memo(DashboardCard);
