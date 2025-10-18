import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Transition } from '@headlessui/react';
import type { ActiveView, Replica, MentalTool, CognitiveProcess, AppSettings } from '../types';
// FIX: Add BookOpenIcon to the import list from ./Icons.
import { ReplicaIcon, ToolIcon, BrainCircuitIcon, LightBulbIcon, CircleStackIcon, UserGroupIcon, GlobeAltIcon, ArrowRightIcon, XCircleIcon, CpuChipIcon, BookOpenIcon } from './Icons';

export type DetailItemType = 'replica' | 'tool' | 'replicas_summary' | 'tools_summary' | 'core' | 'memory' | 'affective_core' | 'ui' | 'integrations';

export interface DetailItem {
  type: DetailItemType;
  data: any;
}

interface ArchitectureDetailModalProps {
  item: DetailItem | null;
  onClose: () => void;
  onNavigate: (view: ActiveView) => void;
}

const DetailRow: React.FC<{ label: string; value: string; valueClass?: string }> = ({ label, value, valueClass = 'text-nexus-text' }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-xs font-semibold text-nexus-text-muted">{label}</span>
        <span className={`text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
);

const DetailContent: React.FC<{ item: DetailItem }> = ({ item }) => {
    const { t } = useTranslation();

    switch (item.type) {
        case 'replica': {
            const replica = item.data as Replica;
            return (
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-nexus-primary">{replica.name}</h3>
                    <DetailRow label={t('replicas.status')} value={replica.status} valueClass="text-nexus-secondary" />
                    <p className="text-xs text-nexus-text-muted italic pt-1">"{replica.purpose}"</p>
                    <div className="pt-2 border-t border-nexus-surface/50 space-y-1">
                        <DetailRow label={t('replicas.cognitiveLoad')} value={`${replica.load.toFixed(0)}%`} />
                        <DetailRow label={t('replicas.learningRate')} value={`${replica.efficiency.toFixed(0)}%`} />
                    </div>
                </div>
            );
        }
        case 'tool': {
            const tool = item.data as MentalTool;
            return (
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-nexus-primary">{tool.name}</h3>
                    <DetailRow label={t('tools.status')} value={tool.status} valueClass="text-nexus-secondary" />
                     <p className="text-xs text-nexus-text-muted italic pt-1">"{tool.description}"</p>
                    <div className="pt-2 border-t border-nexus-surface/50 space-y-1">
                        <DetailRow label={t('tools.version')} value={tool.version.toFixed(1)} />
                        <DetailRow label={t('tools.complexity')} value={String(tool.complexity)} />
                    </div>
                </div>
            );
        }
        case 'replicas_summary':
            return <DetailRow label={t('vitals.replicas')} value={String(item.data.replicaCount)} valueClass="text-3xl text-nexus-primary" />;
        case 'tools_summary':
            return <DetailRow label={t('vitals.tools')} value={String(item.data.tools.length)} valueClass="text-3xl text-nexus-primary" />;
        case 'core': {
            const { cognitiveProcess, settings } = item.data as { cognitiveProcess: CognitiveProcess; settings: AppSettings };
            const personality = settings.coreAgentPersonality;
            const personalityCode = `${personality.energyFocus[0]}${personality.informationProcessing[0]}${personality.decisionMaking[0]}${personality.worldApproach[0]}`;
            return (
                 <div className="space-y-2">
                    <h3 className="text-lg font-bold text-nexus-primary">{t('architecture.nexusCoreEngine')}</h3>
                    <DetailRow label={t('replicas.status')} value={cognitiveProcess.state} />
                    <DetailRow label={t('settings.agentPersonality')} value={personalityCode} />
                </div>
            );
        }
        case 'memory':
            return <h3 className="text-lg font-bold text-nexus-primary">{t('architecture.longTermMemory')}</h3>
        case 'affective_core': {
             const { cognitiveProcess } = item.data as { cognitiveProcess: CognitiveProcess };
             return (
                 <div className="space-y-2">
                    <h3 className="text-lg font-bold text-nexus-primary">{t('architecture.affectiveCore')}</h3>
                    <DetailRow label={t('commandCenter.currentMood')} value={cognitiveProcess.activeAffectiveState?.mood || t('commandCenter.neutral')} />
                </div>
             )
        }
        case 'ui':
        case 'integrations':
            return <h3 className="text-lg font-bold text-nexus-primary">{item.type === 'ui' ? t('architecture.userInterfaceLayer') : t('architecture.externalIntegrations')}</h3>
        default:
            return <p>No details available.</p>;
    }
};

const getNavigationInfo = (type: DetailItemType, t: (key: string) => string): { view: ActiveView, label: string, icon: React.ReactNode } | null => {
    switch(type) {
        case 'replica':
        case 'replicas_summary':
            return { view: 'replicas', label: t('sidebar.replicas'), icon: <ReplicaIcon className="w-5 h-5"/> };
        case 'tool':
        case 'tools_summary':
            return { view: 'tools', label: t('sidebar.mentalTools'), icon: <ToolIcon className="w-5 h-5"/> };
        case 'memory':
            return { view: 'memory', label: t('sidebar.memoryExplorer'), icon: <BookOpenIcon className="w-5 h-5"/> };
        case 'core':
        case 'ui':
        case 'integrations':
             return { view: 'settings', label: t('sidebar.settings'), icon: <CpuChipIcon className="w-5 h-5"/> };
        case 'affective_core':
            return { view: 'dashboard', label: t('sidebar.controlCenter'), icon: <LightBulbIcon className="w-5 h-5"/> };
        default:
            return null;
    }
}


const ArchitectureDetailModal: React.FC<ArchitectureDetailModalProps> = ({ item, onClose, onNavigate }) => {
    const { t } = useTranslation();
    const show = !!item;
    const navInfo = item ? getNavigationInfo(item.type, t) : null;
    
    return (
        <Transition show={show} as={Fragment}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm" onClick={onClose} />
                </Transition.Child>

                {/* Modal Content */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <div className="relative bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-sm border border-nexus-primary/50">
                        <button onClick={onClose} className="absolute top-3 right-3 text-nexus-text-muted hover:text-white"><XCircleIcon className="w-6 h-6"/></button>
                        
                        {item && <DetailContent item={item} />}

                        {navInfo && (
                            <div className="mt-6 pt-4 border-t border-nexus-surface/50">
                                <button
                                    onClick={() => onNavigate(navInfo.view)}
                                    className="w-full flex items-center justify-center gap-2 bg-nexus-primary/20 text-nexus-primary font-bold py-2 px-4 rounded-full border border-nexus-primary/50 hover:bg-nexus-primary/40 hover:text-white transition-all duration-300"
                                >
                                    {navInfo.icon} Go to {navInfo.label} <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    );
};

export default ArchitectureDetailModal;
