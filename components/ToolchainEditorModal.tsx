import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MentalTool, Toolchain } from '../types';
import { LinkIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon, ArrowUturnLeftIcon } from './Icons';

interface ToolchainEditorModalProps {
    allTools: MentalTool[];
    toolchainToEdit: Toolchain | null;
    onSave: (data: Omit<Toolchain, 'id'>, id?: string) => void;
    onClose: () => void;
}

const ToolchainEditorModal: React.FC<ToolchainEditorModalProps> = ({ allTools, toolchainToEdit, onSave, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState(toolchainToEdit?.name || '');
    const [description, setDescription] = useState(toolchainToEdit?.description || '');
    const [chainedToolIds, setChainedToolIds] = useState<string[]>(toolchainToEdit?.toolIds || []);

    const availableTools = useMemo(() => {
        const chainedIds = new Set(chainedToolIds);
        return allTools.filter(tool => !chainedIds.has(tool.id) && (tool.status === 'Active' || tool.status === 'Idle'));
    }, [allTools, chainedToolIds]);

    const chainedTools = useMemo(() => {
        const toolMap = new Map(allTools.map(t => [t.id, t]));
        return chainedToolIds.map(id => toolMap.get(id)).filter((t): t is MentalTool => !!t);
    }, [allTools, chainedToolIds]);

    const handleAddTool = (toolId: string) => {
        setChainedToolIds(prev => [...prev, toolId]);
    };

    const handleRemoveTool = (toolId: string) => {
        setChainedToolIds(prev => prev.filter(id => id !== toolId));
    };

    const handleMoveTool = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === chainedToolIds.length - 1) return;
        
        const newOrder = [...chainedToolIds];
        const item = newOrder.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newOrder.splice(newIndex, 0, item);
        setChainedToolIds(newOrder);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, description, toolIds: chainedToolIds }, toolchainToEdit?.id);
    };

    const renderToolItem = (tool: MentalTool, actions: React.ReactNode) => (
         <div key={tool.id} className="flex items-center justify-between p-2 bg-nexus-dark/70 rounded-xl hover:bg-nexus-surface/50">
            <span className="text-sm font-mono text-nexus-text">{tool.name}</span>
            <div className="flex gap-1">{actions}</div>
        </div>
    );

    return (
         <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-4xl border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-nexus-text-muted hover:text-white text-2xl">&times;</button>
                 <form onSubmit={handleFormSubmit}>
                    <div className="flex items-center gap-3 mb-4">
                        <LinkIcon className="w-8 h-8 text-nexus-primary"/>
                        <h3 className="text-xl font-bold text-nexus-text">
                            {toolchainToEdit ? t('toolchains.editorTitleEdit') : t('toolchains.editorTitleCreate')}
                        </h3>
                    </div>
                    
                    {/* --- Metadata Inputs --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="tc-name" className="block text-sm font-medium text-nexus-text-muted">{t('common.name')}</label>
                            <input
                                id="tc-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder={t('toolchains.namePlaceholder')}
                                required
                                className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="tc-desc" className="block text-sm font-medium text-nexus-text-muted">{t('common.description')}</label>
                            <input
                                id="tc-desc"
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder={t('toolchains.descPlaceholder')}
                                required
                                className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* --- Tool Selector --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Available Tools */}
                        <div className="bg-nexus-dark/30 p-4 rounded-xl">
                            <h4 className="font-semibold text-nexus-text mb-2">{t('toolchains.availableTools')}</h4>
                            <div className="space-y-2 h-64 overflow-y-auto pr-2">
                                {availableTools.length > 0 ? availableTools.map(tool => renderToolItem(tool, 
                                    <button type="button" onClick={() => handleAddTool(tool.id)} className="p-1 text-green-400 hover:text-white"><ArrowRightIcon className="w-4 h-4" /></button>
                                )) : <p className="text-sm text-center py-4 text-nexus-text-muted">{t('toolchains.noMoreTools')}</p>}
                            </div>
                        </div>

                        {/* Chained Tools */}
                        <div className="bg-nexus-dark/30 p-4 rounded-xl">
                            <h4 className="font-semibold text-nexus-text mb-2">{t('toolchains.chainSequence')}</h4>
                             <div className="space-y-2 h-64 overflow-y-auto pr-2">
                                {chainedTools.length > 0 ? chainedTools.map((tool, index) => renderToolItem(tool,
                                    <>
                                        <button type="button" onClick={() => handleMoveTool(index, 'up')} disabled={index === 0} className="p-1 text-nexus-secondary hover:text-white disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => handleMoveTool(index, 'down')} disabled={index === chainedTools.length - 1} className="p-1 text-nexus-secondary hover:text-white disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                        <button type="button" onClick={() => handleRemoveTool(tool.id)} className="p-1 text-red-500 hover:text-white"><ArrowUturnLeftIcon className="w-4 h-4" /></button>
                                    </>
                                )) : <p className="text-sm text-center py-4 text-nexus-text-muted">{t('toolchains.addToolsHint')}</p>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">{t('common.cancel')}</button>
                        <button type="submit" className="py-2 px-6 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">
                            {toolchainToEdit ? t('common.saveChanges') : t('toolchains.create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ToolchainEditorModal;