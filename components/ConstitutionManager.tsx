import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CognitiveConstitution } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, TrashIcon } from './Icons';

interface ConstitutionManagerProps {
    constitutions: CognitiveConstitution[];
    onDelete: (id: string) => void;
}

const ConstitutionCard: React.FC<{ constitution: CognitiveConstitution; onDelete: (id: string) => void; }> = ({ constitution, onDelete }) => {
    const { t } = useTranslation();
    const isDefault = ['const-balanced', 'const-creative', 'const-logical'].includes(constitution.id);

    return (
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-surface/50">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-nexus-text">{constitution.name}</h4>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{constitution.description}"</p>
                </div>
                {!isDefault && (
                    <button onClick={() => onDelete(constitution.id)} className="p-1 text-red-500 hover:text-white" title={t('settings.deleteConstitution') as string}>
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                )}
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
        </div>
    );
};

const ConstitutionManager: React.FC<ConstitutionManagerProps> = ({ constitutions, onDelete }) => {
    const { t } = useTranslation();

    return (
        <DashboardCard title={t('settings.constitutionManagement')} icon={<CogIcon />}>
            <div className="p-4 space-y-4">
                {constitutions.map(c => (
                    <ConstitutionCard key={c.id} constitution={c} onDelete={onDelete} />
                ))}
                {constitutions.length === 0 && <p className="text-nexus-text-muted text-center">{t('settings.noConstitutions')}</p>}
            </div>
        </DashboardCard>
    );
};

export default ConstitutionManager;