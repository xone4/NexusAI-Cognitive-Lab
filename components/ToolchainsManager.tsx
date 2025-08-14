import React, { useState, useMemo } from 'react';
import type { Toolchain, MentalTool } from '../types';
import DashboardCard from './DashboardCard';
import ToolchainEditorModal from './ToolchainEditorModal';
import { LinkIcon, PlusCircleIcon, WrenchScrewdriverIcon, TrashIcon, ArrowRightIcon } from './Icons';

interface ToolchainsManagerProps {
    allTools: MentalTool[];
    toolchains: Toolchain[];
    isThinking: boolean;
    onCreate: (data: Omit<Toolchain, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<Toolchain>) => void;
    onDelete: (id: string) => void;
}

const ToolchainItem: React.FC<{
    toolchain: Toolchain;
    toolsMap: Map<string, MentalTool>;
    onEdit: (toolchain: Toolchain) => void;
    onDelete: (id: string) => void;
}> = ({ toolchain, toolsMap, onEdit, onDelete }) => {
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the toolchain "${toolchain.name}"?`)) {
            onDelete(toolchain.id);
        }
    }
    
    return (
        <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-nexus-text flex items-center gap-2">
                        <LinkIcon className="w-5 h-5 text-nexus-primary" />
                        {toolchain.name}
                    </h4>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{toolchain.description}"</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(toolchain)} className="p-1 text-purple-400 hover:text-white"><WrenchScrewdriverIcon className="w-5 h-5"/></button>
                    <button onClick={handleDelete} className="p-1 text-red-500 hover:text-white"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-nexus-surface/30">
                 <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-2">Sequence</h5>
                 <div className="flex flex-wrap items-center gap-2 text-sm">
                    {toolchain.toolIds.length > 0 ? toolchain.toolIds.map((tid, index) => {
                        const tool = toolsMap.get(tid);
                        return (
                            <React.Fragment key={tid}>
                                <span className="bg-nexus-surface px-2 py-1 rounded text-nexus-text font-mono">
                                    {tool?.name || 'Unknown Tool'}
                                </span>
                                {index < toolchain.toolIds.length - 1 && <ArrowRightIcon className="w-5 h-5 text-nexus-secondary" />}
                            </React.Fragment>
                        );
                    }) : <p className="text-xs text-nexus-text-muted">No tools in this chain.</p>}
                 </div>
            </div>
        </div>
    );
};


const ToolchainsManager: React.FC<ToolchainsManagerProps> = ({ allTools, toolchains, isThinking, onCreate, onUpdate, onDelete }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingToolchain, setEditingToolchain] = useState<Toolchain | null>(null);

    const toolsMap = useMemo(() => {
        return new Map(allTools.map(tool => [tool.id, tool]));
    }, [allTools]);
    
    const handleCreateNew = () => {
        setEditingToolchain(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (toolchain: Toolchain) => {
        setEditingToolchain(toolchain);
        setIsEditorOpen(true);
    }
    
    const handleSave = (data: Omit<Toolchain, 'id'>, id?: string) => {
        if (id) {
            onUpdate(id, data);
        } else {
            onCreate(data);
        }
        setIsEditorOpen(false);
    }

    return (
        <>
            {isEditorOpen && (
                <ToolchainEditorModal
                    allTools={allTools}
                    toolchainToEdit={editingToolchain}
                    onSave={handleSave}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}
            <DashboardCard title="Toolchain Management" icon={<LinkIcon />} className="md:col-span-2 xl:col-span-3">
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4 pb-4 border-b border-nexus-surface/50">
                    <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-nexus-text">Cognitive Workflows</h3>
                        <p className="text-sm text-nexus-text-muted">Create, modify, and deploy sequences of mental tools for complex, automated tasks.</p>
                    </div>
                     <button
                        onClick={handleCreateNew}
                        disabled={isThinking}
                        className="w-full md:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-purple-500/20 text-purple-400 font-bold py-2 px-4 rounded-md border border-purple-500/50
                                  hover:bg-purple-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PlusCircleIcon className="w-5 h-5"/>
                        Create New Toolchain
                    </button>
                </div>

                <div className="space-y-4">
                    {toolchains.length > 0 ? (
                        toolchains.map(tc => (
                            <ToolchainItem 
                                key={tc.id} 
                                toolchain={tc} 
                                toolsMap={toolsMap}
                                onEdit={handleEdit}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                         <div className="text-center py-8 text-nexus-text-muted">
                            <LinkIcon className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No Toolchains Created</h3>
                            <p className="text-sm">Click "Create New Toolchain" to build your first cognitive workflow.</p>
                        </div>
                    )}
                </div>
            </DashboardCard>
        </>
    );
};

export default ToolchainsManager;
