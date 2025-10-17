import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PerformanceDataPoint, LogEntry } from '../types';
import DashboardCard from './DashboardCard';
import LogStream from './LogStream';
import PerformanceCharts from './PerformanceCharts';
import SystemStatusControl from './SystemStatusControl';
import MemoryBreakdownChart from './MemoryBreakdownChart';
import { CpuChipIcon, BeakerIcon, CircleStackIcon, ChartPieIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from './Icons';
import { Tab } from '@headlessui/react';

type SystemStatus = 'Online' | 'Degraded' | 'Offline' | 'Initializing';

interface VitalsPanelProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    status: SystemStatus;
    onSetStatus: (status: SystemStatus) => void;
    isInteractionDisabled: boolean;
    replicaCount: number;
    toolCount: number;
    performanceData: PerformanceDataPoint[];
    logs: LogEntry[];
}

const VitalsPanel: React.FC<VitalsPanelProps> = ({ isOpen, setIsOpen, status, onSetStatus, isInteractionDisabled, replicaCount, toolCount, performanceData, logs }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const tabClasses = ({ selected }: { selected: boolean }) => `
        w-full py-2.5 text-sm font-medium leading-5 rounded-full
        ring-white/60 ring-offset-2 ring-offset-nexus-bg focus:outline-none focus:ring-2
        ${isRtl ? 'font-tahoma' : ''}
        ${selected
            ? 'bg-nexus-primary text-nexus-dark shadow'
            : 'text-nexus-text-muted hover:bg-nexus-dark/30 hover:text-white'
        }
    `;

    const OpenIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon;
    const CloseIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon;

    return (
        <aside 
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-96 bg-nexus-dark/90 backdrop-blur-lg border-s border-nexus-surface shadow-2xl z-20 flex flex-col p-4 gap-4 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}`}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-[-2.75rem]' : 'left-[-2.75rem]'} bg-nexus-surface/80 backdrop-blur-sm p-2 rounded-s-full border-s border-t border-b border-nexus-surface hover:bg-nexus-primary/20`}
                aria-label={isOpen ? t('vitals.closeVitalsPanel') : t('vitals.openVitalsPanel')}
            >
                {isOpen ? <OpenIcon className="w-6 h-6 text-nexus-primary" /> : <CloseIcon className="w-6 h-6 text-nexus-text-muted" />}
            </button>

            <DashboardCard title={t('vitals.systemStatus')} icon={<CpuChipIcon />} className="flex-shrink-0">
                <SystemStatusControl
                    status={status}
                    onSetStatus={onSetStatus}
                    isInteractionDisabled={isInteractionDisabled}
                />
            </DashboardCard>
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                <DashboardCard title={t('vitals.replicas')} icon={<CircleStackIcon />}>
                     <p className="text-3xl text-center font-bold text-nexus-primary">{replicaCount}</p>
                </DashboardCard>
                 <DashboardCard title={t('vitals.tools')} icon={<BeakerIcon />}>
                     <p className="text-3xl text-center font-bold text-nexus-primary">{toolCount}</p>
                </DashboardCard>
            </div>

            <div className="flex-grow min-h-0">
                <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-full bg-nexus-dark/50 p-1">
                        <Tab className={tabClasses}><div className="flex items-center justify-center gap-2"><ChartPieIcon className="w-5 h-5"/> {t('vitals.performance')}</div></Tab>
                        <Tab className={tabClasses}><div className="flex items-center justify-center gap-2"><DocumentTextIcon className="w-5 h-5"/> {t('vitals.logs')}</div></Tab>
                    </Tab.List>
                    <Tab.Panels className="mt-2 h-[calc(100%-44px)]">
                        <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 p-2 focus:outline-none flex flex-col">
                            <div className="flex-grow h-2/3">
                                <PerformanceCharts data={performanceData} />
                            </div>
                            <div className="flex-shrink-0 h-1/3 border-t border-nexus-surface/50 pt-2">
                                <h4 className="text-center text-sm font-semibold text-nexus-text-muted">{t('vitals.memoryBreakdown')}</h4>
                                <MemoryBreakdownChart data={performanceData[performanceData.length - 1]?.memoryBreakdown} />
                            </div>
                        </Tab.Panel>
                         <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 focus:outline-none">
                            <LogStream logs={logs} />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </aside>
    );
};

export default VitalsPanel;
