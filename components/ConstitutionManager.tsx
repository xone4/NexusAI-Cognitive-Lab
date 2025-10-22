import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CognitiveConstitution } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, TrashIcon, CheckCircleIcon, XCircleIcon, ArchiveBoxIcon } from './Icons';

interface ConstitutionManagerProps {
    constitutions: CognitiveConstitution[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onArchive: (id: string) => void;
}

const ConstitutionCard: React.FC<{ 
    constitution: CognitiveConstitution; 
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onArchive: (id: string) => void;
}> = ({ constitution, onApprove, onReject, onArchive }) => {
    const { t } = useTranslation();
    const isPending = constitution.status === 'PENDING_APPROVAL';

    const statusStyles: Record<CognitiveConstitution['status'], { border: string, text: string, anim?: string }> = {
        ACTIVE: { border: 'border-nexus-secondary/50', text: 'text-nexus-secondary' },
        PENDING_APPROVAL: { border: 'border-yellow-400/50', text: 'text-yellow-400', anim: 'animate-pulse' },
        ARCHIVED: { border: 'border-gray-600/50', text: 'text-gray-500' },
    };
    const style = statusStyles[constitution.status];

    return (
        <div className={`bg-nexus-dark/50 p-4 rounded-xl border ${style.border} ${style.anim || ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-nexus-text">{constitution.name}</h4>
                        {constitution.isDefault && <span className="text-xs font-bold text-nexus-dark bg-nexus-primary px-2 rounded-full">{t('settings.defaultBadge')}</span>}
                    </div>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{constitution.description}"</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${style.text}`}>{t(`settings.status_${constitution.status}`)}</span>
                    <span className="text-xs font-mono text-nexus-text-muted">v{constitution.version.toFixed(1)}</span>
                </div>
            </div>

            {constitution.rules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-nexus-surface/30">
                    <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-2">Rules</h5>
                    <ul className="space-y-1 text-sm text-nexus-text-muted">
                        {constitution.rules.map((rule, index) => (
                            <li key={index}>- {rule.description} ({rule.type}: {JSON.stringify(rule.value)})</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {isPending ? (
                <div className="mt-3 pt-3 border-t border-nexus-surface/30 flex justify-end gap-3">
                    <button onClick={() => onReject(constitution.id)} className="flex items-center gap-2 text-sm bg-red-500/20 text-red-400 font-bold py-1.5 px-3 rounded-full border border-red-500/50 hover:bg-red-500/40 hover:text-white">
                        <XCircleIcon className="w-4 h-4" /> {t('settings.reject')}
                    </button>
                    <button onClick={() => onApprove(constitution.id)} className="flex items-center gap-2 text-sm bg-green-500/20 text-green-400 font-bold py-1.5 px-3 rounded-full border border-green-500/50 hover:bg-green-500/40 hover:text-white">
                        <CheckCircleIcon className="w-4 h-4" /> {t('settings.approve')}
                    </button>
                </div>
            ) : (
                 !constitution.isDefault && constitution.status === 'ACTIVE' && (
                    <div className="mt-3 pt-3 border-t border-nexus-surface/30 flex justify-end">
                        <button onClick={() => onArchive(constitution.id)} className="flex items-center gap-2 text-sm bg-gray-500/20 text-gray-400 font-bold py-1.5 px-3 rounded-full border border-gray-500/50 hover:bg-gray-500/40 hover:text-white" title={t('settings.archive') as string}>
                            <ArchiveBoxIcon className="w-4 h-4"/> {t('settings.archive')}
                        </button>
                    </div>
                 )
            )}
        </div>
    );
};

const ConstitutionManager: React.FC<ConstitutionManagerProps> = ({ constitutions, onApprove, onReject, onArchive }) => {
    const { t } = useTranslation();
    
    const sortedConstitutions = [...constitutions].sort((a, b) => {
        const statusOrder = { 'PENDING_APPROVAL': 0, 'ACTIVE': 1, 'ARCHIVED': 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <DashboardCard title={t('settings.constitutionManagement')} icon={<CogIcon />}>
            <div className="p-4 space-y-4">
                {sortedConstitutions.map(c => (
                    <ConstitutionCard 
                        key={c.id} 
                        constitution={c} 
                        onApprove={onApprove}
                        onReject={onReject}
                        onArchive={onArchive} 
                    />
                ))}
                {constitutions.length === 0 && <p className="text-nexus-text-muted text-center">{t('settings.noConstitutions')}</p>}
            </div>
        </DashboardCard>
    );
};

export default ConstitutionManager;
