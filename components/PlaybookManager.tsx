import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaybookItem, PlaybookItemCategory } from '../types';
import DashboardCard from './DashboardCard';
import ModifyPlaybookItemModal from './ModifyPlaybookItemModal';
import { BrainCircuitIcon, WrenchScrewdriverIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, CodeBracketIcon, CubeTransparentIcon } from './Icons';
import TextActionOverlay from './TextActionOverlay';

interface PlaybookManagerProps {
    playbook: PlaybookItem[];
    onUpdate: (itemId: string, updates: Partial<Pick<PlaybookItem, 'description' | 'tags'>>) => void;
    onDelete: (itemId: string) => void;
}

const PlaybookItemCard: React.FC<{ item: PlaybookItem; onEdit: (item: PlaybookItem) => void; onDelete: (id: string) => void; }> = ({ item, onEdit, onDelete }) => {
    const { t } = useTranslation();
    const handleDelete = () => {
        if (window.confirm(t('behaviors.deleteConfirm', { name: item.description }))) {
            onDelete(item.id);
        }
    };

    const categoryMeta: Record<PlaybookItemCategory, { icon: React.ReactNode; color: string; }> = {
        STRATEGY: { icon: <SparklesIcon className="w-4 h-4" />, color: "text-yellow-400" },
        CODE_SNIPPET: { icon: <CodeBracketIcon className="w-4 h-4" />, color: "text-purple-400" },
        PITFALL: { icon: <XCircleIcon className="w-4 h-4" />, color: "text-red-400" },
        API_USAGE: { icon: <CubeTransparentIcon className="w-4 h-4" />, color: "text-blue-400" }
    };

    return (
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in">
            <div className="flex justify-between items-start">
                <div>
                    <div className={`font-semibold text-xs uppercase tracking-wider flex items-center gap-2 ${categoryMeta[item.category].color}`}>
                        {categoryMeta[item.category].icon}
                        {item.category.replace('_', ' ')}
                    </div>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{item.description}"</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(item)} className="p-1 text-purple-400 hover:text-white" title={t('behaviors.editBehavior')}><WrenchScrewdriverIcon className="w-5 h-5"/></button>
                    <button onClick={handleDelete} className="p-1 text-red-500 hover:text-white" title={t('behaviors.deleteBehavior')}><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-nexus-surface/30 space-y-2">
                <div>
                    <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-1">{t('behaviors.strategy')}</h5>
                    <div className="relative group">
                        <TextActionOverlay content={item.content} filename={`playbook-item-${item.id}.txt`} />
                        <p className="text-sm text-nexus-text-muted whitespace-pre-wrap font-mono bg-nexus-dark/50 p-2 rounded-xl max-h-24 overflow-y-auto">
                            {item.content}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-nexus-text-muted pt-2">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1" title="Helpful Count"><CheckCircleIcon className="w-4 h-4 text-green-500"/> <span className="font-bold text-nexus-text">{item.helpfulCount}</span></span>
                        <span className="flex items-center gap-1" title="Harmful Count"><XCircleIcon className="w-4 h-4 text-red-500"/> <span className="font-bold text-nexus-text">{item.harmfulCount}</span></span>
                    </div>
                    <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3"/> {t('behaviors.lastUsed')} {new Date(item.lastUsed).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

const PlaybookManager: React.FC<PlaybookManagerProps> = ({ playbook, onUpdate, onDelete }) => {
    const { t } = useTranslation();
    const [itemToModify, setItemToModify] = useState<PlaybookItem | null>(null);

    return (
        <>
            {itemToModify && (
                <ModifyPlaybookItemModal
                    item={itemToModify}
                    onSave={onUpdate}
                    onClose={() => setItemToModify(null)}
                />
            )}
            <DashboardCard title={t('behaviors.handbookTitle')} icon={<BrainCircuitIcon />} className="md:col-span-2 xl:col-span-3">
                <div className="mb-4 pb-4 border-b border-nexus-surface/50">
                    <h3 className="text-lg font-semibold text-nexus-text">{t('behaviors.strategiesTitle')}</h3>
                    <p className="text-sm text-nexus-text-muted">{t('behaviors.strategiesDesc')}</p>
                </div>
                <div className="space-y-4">
                    {playbook.length > 0 ? (
                        [...playbook].sort((a,b) => b.lastUsed - a.lastUsed).map(item => (
                            <PlaybookItemCard 
                                key={item.id} 
                                item={item} 
                                onEdit={setItemToModify}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                         <div className="text-center py-8 text-nexus-text-muted">
                            <BrainCircuitIcon className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">{t('behaviors.emptyHandbook')}</h3>
                            <p className="text-sm">{t('behaviors.emptyHandbookHint')}</p>
                        </div>
                    )}
                </div>
            </DashboardCard>
        </>
    );
};

export default PlaybookManager;
