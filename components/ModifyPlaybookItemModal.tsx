import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlaybookItem } from '../types';
import { WrenchScrewdriverIcon } from './Icons';

interface ModifyPlaybookItemModalProps {
    item: PlaybookItem;
    onClose: () => void;
    onSave: (itemId: string, updates: Partial<Pick<PlaybookItem, 'description' | 'tags'>>) => void;
}

const ModifyPlaybookItemModal: React.FC<ModifyPlaybookItemModalProps> = ({ item, onClose, onSave }) => {
    const { t } = useTranslation();
    const [description, setDescription] = useState(item.description);
    const [tags, setTags] = useState(item.tags.join(', '));

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(item.id, { description, tags: tagArray });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-lg border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-3 right-3 text-nexus-text-muted hover:text-white">&times;</button>
                 <form onSubmit={handleSave}>
                     <div className="flex items-center gap-3 mb-4">
                        <WrenchScrewdriverIcon className="w-8 h-8 text-nexus-secondary"/>
                        <h3 className="text-xl font-bold text-nexus-text">{t('behaviors.modifyTitle')}</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="item-description" className="block text-sm font-medium text-nexus-text-muted">{t('common.description')}</label>
                            <textarea
                                id="item-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full mt-1 h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="item-tags" className="block text-sm font-medium text-nexus-text-muted">{t('modifyTool.tagsCommaSeparated')}</label>
                            <input
                                type="text"
                                id="item-tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-nexus-text-muted">Content (Read-only)</label>
                            <p className="w-full mt-1 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl text-nexus-text-muted font-mono text-sm h-24 overflow-y-auto">
                                {item.content}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">{t('common.cancel')}</button>
                        <button type="submit" className="py-2 px-6 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">{t('common.saveChanges')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifyPlaybookItemModal;