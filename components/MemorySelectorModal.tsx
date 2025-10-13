import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import type { ChatMessage, Behavior } from '../types';
import { BookOpenIcon, BrainCircuitIcon } from './Icons';

interface MemorySelectorModalProps {
    archivedTraces: ChatMessage[];
    behaviors: Behavior[];
    onClose: () => void;
    onSelect: (item: ChatMessage | Behavior) => void;
}

const tabClasses = ({ selected }: { selected: boolean }) => `
    w-full py-2.5 text-sm font-medium leading-5 rounded-lg
    ring-white/60 ring-offset-2 ring-offset-nexus-bg focus:outline-none focus:ring-2
    ${selected
        ? 'bg-nexus-primary text-nexus-dark shadow'
        : 'text-nexus-text-muted hover:bg-nexus-dark/70 hover:text-white'
    }
`;

const MemorySelectorModal: React.FC<MemorySelectorModalProps> = ({ archivedTraces, behaviors, onClose, onSelect }) => {
    
    const sortedTraces = [...archivedTraces].sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
    const sortedBehaviors = [...behaviors].sort((a, b) => b.lastUsed - a.lastUsed);

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-3xl border border-nexus-primary/50 flex flex-col max-h-[80vh]">
                 <div className="flex-shrink-0 flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <BookOpenIcon className="w-8 h-8 text-nexus-primary"/>
                        <div>
                            <h3 className="text-xl font-bold text-nexus-text">Load Problem from Memory</h3>
                            <p className="text-sm text-nexus-text-muted">Select a past experience to use as a foundation for evolution.</p>
                        </div>
                    </div>
                     <button onClick={onClose} className="text-nexus-text-muted hover:text-white text-2xl font-bold">&times;</button>
                 </div>
                
                <div className="flex-grow min-h-0">
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-nexus-dark/50 p-1">
                            <Tab className={tabClasses}>
                                <div className="flex items-center justify-center gap-2"><BookOpenIcon className="w-5 h-5"/> Archived Memories ({sortedTraces.length})</div>
                            </Tab>
                            <Tab className={tabClasses}>
                                <div className="flex items-center justify-center gap-2"><BrainCircuitIcon className="w-5 h-5"/> Learned Behaviors ({sortedBehaviors.length})</div>
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-2 h-[calc(100%-44px)]">
                            <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 p-2 focus:outline-none overflow-y-auto">
                                <div className="space-y-2">
                                    {sortedTraces.map(trace => (
                                        <div key={trace.id} onClick={() => onSelect(trace)} className="p-3 bg-nexus-surface/50 rounded-lg cursor-pointer hover:bg-nexus-primary/20 hover:border-nexus-primary border border-transparent">
                                            <p className="text-xs text-nexus-text-muted">{new Date(trace.archivedAt!).toLocaleString()}</p>
                                            <p className="font-semibold text-nexus-text truncate">Query: <span className="italic font-normal">"{trace.userQuery}"</span></p>
                                        </div>
                                    ))}
                                </div>
                            </Tab.Panel>
                             <Tab.Panel className="h-full rounded-xl bg-nexus-dark/20 p-2 focus:outline-none overflow-y-auto">
                                <div className="space-y-2">
                                    {sortedBehaviors.map(behavior => (
                                        <div key={behavior.id} onClick={() => onSelect(behavior)} className="p-3 bg-nexus-surface/50 rounded-lg cursor-pointer hover:bg-nexus-primary/20 hover:border-nexus-primary border border-transparent">
                                            <p className="font-semibold text-nexus-text">{behavior.name}</p>
                                            <p className="text-sm text-nexus-text-muted italic truncate">"{behavior.description}"</p>
                                        </div>
                                    ))}
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>

                <div className="flex-shrink-0 flex justify-end mt-4">
                    <button onClick={onClose} className="py-2 px-6 rounded-full bg-nexus-surface text-nexus-text-muted font-bold hover:bg-nexus-dark">Close</button>
                </div>
            </div>
        </div>
    );
};

export default MemorySelectorModal;
