import React from 'react';
import type { ChatMessage } from '../types';
import DashboardCard from './DashboardCard';
import { ArchiveBoxIcon, EyeIcon, TrashIcon } from './Icons';

interface ArchivesViewProps {
    archivedTraces: ChatMessage[];
    onViewTrace: (trace: ChatMessage) => void;
    onDeleteTrace: (traceId: string) => void;
}

const ArchivesView: React.FC<ArchivesViewProps> = ({ archivedTraces, onViewTrace, onDeleteTrace }) => {
    
    const handleDelete = (e: React.MouseEvent, traceId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to permanently delete this archived trace?')) {
            onDeleteTrace(traceId);
        }
    };

    return (
        <DashboardCard title="Cognitive Trace Archives" icon={<ArchiveBoxIcon />} fullHeight>
            <div className="h-full overflow-y-auto pr-2">
                {archivedTraces.length > 0 ? (
                    <div className="space-y-4">
                        {archivedTraces.map(trace => (
                            <div 
                                key={trace.id}
                                className="bg-nexus-surface/50 p-4 rounded-lg border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <p className="text-xs text-nexus-text-muted">
                                            {new Date(trace.archivedAt!).toLocaleString()}
                                        </p>
                                        <h4 className="font-semibold text-nexus-text mt-1">
                                            Query: <span className="text-nexus-primary font-normal italic">"{trace.userQuery}"</span>
                                        </h4>
                                        <p className="text-sm text-nexus-text-muted mt-2">
                                            {trace.plan?.length || 0} steps executed. Final status: {trace.state}.
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                                        <button 
                                            onClick={() => onViewTrace(trace)}
                                            className="flex items-center gap-2 text-sm bg-nexus-primary/20 text-nexus-primary font-bold py-1.5 px-3 rounded-md border border-nexus-primary/50 hover:bg-nexus-primary/40 hover:text-white"
                                        >
                                            <EyeIcon className="w-4 h-4"/> View
                                        </button>
                                         <button 
                                            onClick={(e) => handleDelete(e, trace.id)}
                                            className="text-red-500/70 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/20"
                                            title="Delete Trace"
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                        <ArchiveBoxIcon className="w-16 h-16" />
                        <p className="mt-4 font-semibold text-lg">No Archived Traces</p>
                        <p className="text-sm">Complete a task in the Cognitive Dialogue and use the "Archive & Analyze" button to save it here for future review.</p>
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};

export default ArchivesView;