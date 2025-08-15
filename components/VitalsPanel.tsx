import React, { useState } from 'react';
import type { PerformanceDataPoint, LogEntry } from '../types';
import DashboardCard from './DashboardCard';
import LogStream from './LogStream';
import PerformanceCharts from './PerformanceCharts';
import SystemStatusControl from './SystemStatusControl';
import { CpuChipIcon, BeakerIcon, CircleStackIcon, ChartPieIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from './Icons';
import { Tab } from '@headlessui/react';

type SystemStatus = 'Online' | 'Degraded' | 'Offline' | 'Initializing';

interface VitalsPanelProps {
    status: SystemStatus;
    onSetStatus: (status: SystemStatus) => void;
    isInteractionDisabled: boolean;
    replicaCount: number;
    toolCount: number;
    performanceData: PerformanceDataPoint[];
    logs: LogEntry[];
}

const VitalsPanel: React.FC<VitalsPanelProps> = ({ status, onSetStatus, isInteractionDisabled, replicaCount, toolCount, performanceData, logs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState('hidden');

    const handleToggle = () => {
        if (isOpen) {
            setAnimationClass('animate-slide-out-right');
        } else {
            setAnimationClass('animate-slide-in-right');
            setIsOpen(true);
        }
    };
    
    const onAnimationEnd = () => {
        if (animationClass === 'animate-slide-out-right') {
            setIsOpen(false);
        }
    };

    const tabClasses = ({ selected }: { selected: boolean }) => `
        w-full py-2.5 text-sm font-medium leading-5 rounded-lg
        ring-white/60 ring-offset-2 ring-offset-nexus-bg focus:outline-none focus:ring-2
        ${selected
            ? 'bg-nexus-primary text-nexus-dark shadow'
            : 'text-nexus-text-muted hover:bg-nexus-dark/30 hover:text-white'
        }
    `;

    return (
        <>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 z-30">
                <button 
                    onClick={handleToggle} 
                    className="bg-nexus-surface/80 backdrop-blur-sm p-2 rounded-l-md border-l border-t border-b border-nexus-surface hover:bg-nexus-primary/20"
                    aria-label={isOpen ? 'Close Vitals Panel' : 'Open Vitals Panel'}
                >
                    {isOpen ? <ChevronRightIcon className="w-6 h-6 text-nexus-primary" /> : <ChevronLeftIcon className="w-6 h-6 text-nexus-text-muted" />}
                </button>
            </div>

            {isOpen && (
                 <aside 
                    className={`absolute top-0 right-0 h-full w-96 bg-nexus-dark/90 backdrop-blur-lg border-l border-nexus-surface shadow-2xl z-20 flex flex-col p-4 gap-4 ${animationClass}`}
                    onAnimationEnd={onAnimationEnd}
                >
                    <DashboardCard title="System Status" icon={<CpuChipIcon />} className="flex-shrink-0">
                        <SystemStatusControl
                            status={status}
                            onSetStatus={onSetStatus}
                            isInteractionDisabled={isInteractionDisabled}
                        />
                    </DashboardCard>
                    <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                        <DashboardCard title="Replicas" icon={<CircleStackIcon />}>
                             <p className="text-3xl text-center font-bold text-nexus-primary">{replicaCount}</p>
                        </DashboardCard>
                         <DashboardCard title="Tools" icon={<BeakerIcon />}>
                             <p className="text-3xl text-center font-bold text-nexus-primary">{toolCount}</p>
                        </DashboardCard>
                    </div>

                    <div className="flex-grow min-h-0">
                        <Tab.Group>
                            <Tab.List className="flex space-x-1 rounded-xl bg-nexus-dark/50 p-1">
                                <Tab className={tabClasses}><div className="flex items-center justify-center gap-2"><ChartPieIcon className="w-5 h-5"/> Performance</div></Tab>
                                <Tab className={tabClasses}><div className="flex items-center justify-center gap-2"><DocumentTextIcon className="w-5 h-5"/> Logs</div></Tab>
                            </Tab.List>
                            <Tab.Panels className="mt-2 h-[calc(100%-44px)]">
                                <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 p-2 focus:outline-none">
                                    <PerformanceCharts data={performanceData} />
                                </Tab.Panel>
                                 <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 focus:outline-none">
                                    <LogStream logs={logs} />
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                 </aside>
            )}
        </>
    );
};

export default VitalsPanel;
