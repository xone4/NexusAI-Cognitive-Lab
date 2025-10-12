import React, { useState } from 'react';
import type { Behavior } from '../types';
import DashboardCard from './DashboardCard';
import ModifyBehaviorModal from './ModifyBehaviorModal';
import { BrainCircuitIcon, WrenchScrewdriverIcon, TrashIcon, ClockIcon } from './Icons';

interface BehaviorManagerProps {
    behaviors: Behavior[];
    onUpdate: (behaviorId: string, updates: Partial<Pick<Behavior, 'name' | 'description' | 'tags'>>) => void;
    onDelete: (behaviorId: string) => void;
}

const BehaviorCard: React.FC<{ behavior: Behavior; onEdit: (behavior: Behavior) => void; onDelete: (id: string) => void; }> = ({ behavior, onEdit, onDelete }) => {
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the behavior "${behavior.name}"?`)) {
            onDelete(behavior.id);
        }
    };

    return (
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-nexus-text flex items-center gap-2">
                        {behavior.name}
                    </h4>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{behavior.description}"</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button onClick={() => onEdit(behavior)} className="p-1 text-purple-400 hover:text-white" title="Edit Behavior"><WrenchScrewdriverIcon className="w-5 h-5"/></button>
                    <button onClick={handleDelete} className="p-1 text-red-500 hover:text-white" title="Delete Behavior"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-nexus-surface/30 space-y-2">
                <div>
                    <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-1">Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {behavior.tags.map(tag => (
                            <span key={tag} className="text-xs bg-nexus-surface px-2 py-0.5 rounded-full text-nexus-secondary font-mono">{tag}</span>
                        ))}
                    </div>
                </div>
                <div>
                    <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-1">Strategy</h5>
                    <p className="text-sm text-nexus-text-muted whitespace-pre-wrap font-mono bg-nexus-dark/50 p-2 rounded-xl max-h-24 overflow-y-auto">
                        {behavior.strategy}
                    </p>
                </div>
                <div className="flex items-center justify-between text-xs text-nexus-text-muted pt-2">
                    <span>Usage Count: <span className="font-bold text-nexus-text">{behavior.usageCount}</span></span>
                    <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3"/> Last used: {new Date(behavior.lastUsed).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

const BehaviorManager: React.FC<BehaviorManagerProps> = ({ behaviors, onUpdate, onDelete }) => {
    const [behaviorToModify, setBehaviorToModify] = useState<Behavior | null>(null);

    return (
        <>
            {behaviorToModify && (
                <ModifyBehaviorModal
                    behavior={behaviorToModify}
                    onSave={onUpdate}
                    onClose={() => setBehaviorToModify(null)}
                />
            )}
            <DashboardCard title="Metacognitive Behavior Handbook" icon={<BrainCircuitIcon />} className="md:col-span-2 xl:col-span-3">
                <div className="mb-4 pb-4 border-b border-nexus-surface/50">
                    <h3 className="text-lg font-semibold text-nexus-text">Learned Strategies</h3>
                    <p className="text-sm text-nexus-text-muted">A library of reusable problem-solving strategies extracted by the AI from its own successful operations.</p>
                </div>
                <div className="space-y-4">
                    {behaviors.length > 0 ? (
                        behaviors.map(b => (
                            <BehaviorCard 
                                key={b.id} 
                                behavior={b} 
                                onEdit={setBehaviorToModify}
                                onDelete={onDelete}
                            />
                        ))
                    ) : (
                         <div className="text-center py-8 text-nexus-text-muted">
                            <BrainCircuitIcon className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">The Handbook is Empty</h3>
                            <p className="text-sm">Complete a cognitive task and use the "Extract Behavior" action to start building this library.</p>
                        </div>
                    )}
                </div>
            </DashboardCard>
        </>
    );
};

export default BehaviorManager;