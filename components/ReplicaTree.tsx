import React, { memo, useState, useMemo } from 'react';
import type { Replica, CognitiveConstitution } from '../types';
import { ReplicaIcon, CogIcon, TrashIcon, PencilIcon, BrainCircuitIcon, ShareIcon } from './Icons';
import DashboardCard from './DashboardCard';
import ReplicaNetwork from './ReplicaNetwork';

interface ReplicasViewProps {
    rootReplica: Replica;
    isThinking: boolean;
    onSpawnReplica: (parentId: string) => void;
    onPruneReplica: (replicaId: string) => void;
    onRecalibrate: (replicaId: string) => void;
    onAssignPurpose: (replicaId: string, purpose: string) => void;
    constitutions: CognitiveConstitution[];
    onSetConstitution: (replicaId: string, constitutionId: string) => void;
    onBroadcastProblem: (replicaId: string, problem: string) => void;
}

const statusColors: Record<Replica['status'], { text: string; border: string; bg: string }> = {
  Active: { text: 'text-nexus-secondary', border: 'border-nexus-secondary', bg: 'bg-nexus-secondary' },
  Dormant: { text: 'text-nexus-text-muted', border: 'border-nexus-surface', bg: 'bg-nexus-text-muted' },
  Evolving: { text: 'text-nexus-accent', border: 'border-nexus-accent', bg: 'bg-nexus-accent' },
  Spawning: { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400' },
  Pruning: { text: 'text-gray-500', border: 'border-gray-500', bg: 'bg-gray-500' },
  Recalibrating: { text: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400' },
  Bidding: { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400' },
};

const StatBar: React.FC<{ label: string; value: number; color: string; max?: number }> = ({ label, value, color, max = 100 }) => {
    const percentage = (value / max) * 100;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-nexus-text-muted">{label}</span>
                <span className="text-sm font-bold text-nexus-text">{value.toFixed(0)}{label === 'Efficiency' ? '%' : ''}</span>
            </div>
            <div className="w-full bg-nexus-dark/50 rounded-full h-2 overflow-hidden">
                <div 
                    className={`${color} h-2 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

const PurposeModal: React.FC<{ currentPurpose: string; onSave: (newPurpose: string) => void; onClose: () => void; }> = ({ currentPurpose, onSave, onClose }) => {
    const [purpose, setPurpose] = useState(currentPurpose);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(purpose);
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <form onSubmit={handleSave} className="bg-nexus-surface p-6 rounded-lg shadow-2xl w-full max-w-md border border-nexus-primary/50">
                <h3 className="text-lg font-bold text-nexus-text mb-4">Assign New Purpose</h3>
                <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                    placeholder="Describe the replica's function..."
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-nexus-text-muted hover:bg-nexus-dark">Cancel</button>
                    <button type="submit" className="py-2 px-4 rounded-md bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">Save Purpose</button>
                </div>
            </form>
        </div>
    );
};

const BroadcastModal: React.FC<{ onBroadcast: (problem: string) => void; onClose: () => void; }> = ({ onBroadcast, onClose }) => {
    const [problem, setProblem] = useState('');
    return (
         <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <form onSubmit={(e) => { e.preventDefault(); onBroadcast(problem); }} className="bg-nexus-surface p-6 rounded-lg shadow-2xl w-full max-w-md border border-nexus-primary/50">
                <h3 className="text-lg font-bold text-nexus-text mb-4">Broadcast a Problem to the Network</h3>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} required className="w-full h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none" placeholder="e.g., 'Find the most efficient route for a fleet of 10 drones...'"/>
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-nexus-text-muted hover:bg-nexus-dark">Cancel</button>
                    <button type="submit" className="py-2 px-4 rounded-md bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">Broadcast</button>
                </div>
            </form>
        </div>
    );
};

const ReplicaCard: React.FC<Omit<ReplicasViewProps, 'rootReplica'> & { replica: Replica; path: string; }> = memo(({ replica, path, isThinking, onSpawnReplica, onPruneReplica, onRecalibrate, onAssignPurpose, constitutions, onSetConstitution, onBroadcastProblem }) => {
    const [isPurposeModalOpen, setPurposeModalOpen] = useState(false);
    const [isBroadcastModalOpen, setBroadcastModalOpen] = useState(false);
    
    const color = statusColors[replica.status] || statusColors.Dormant;
    const animationClass = replica.status === 'Pruning' ? 'animate-fade-out' : replica.status === 'Spawning' ? 'animate-spawn-in' : '';

    const handleSavePurpose = (newPurpose: string) => {
        onAssignPurpose(replica.id, newPurpose);
        setPurposeModalOpen(false);
    };
    
    const handleBroadcast = (problem: string) => {
        onBroadcastProblem(replica.id, problem);
        setBroadcastModalOpen(false);
    };

    const isCore = replica.depth === 0;
    const activeConstitution = constitutions.find(c => c.id === replica.activeConstitutionId);

    return (
        <>
            {isPurposeModalOpen && <PurposeModal currentPurpose={replica.purpose} onSave={handleSavePurpose} onClose={() => setPurposeModalOpen(false)} />}
            {isBroadcastModalOpen && <BroadcastModal onBroadcast={handleBroadcast} onClose={() => setBroadcastModalOpen(false)} />}
            <DashboardCard 
                title={replica.name} 
                icon={<ReplicaIcon className={color.text} />} 
                className={`border-l-4 ${color.border} ${animationClass} transition-all duration-300`}
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-mono text-nexus-text-muted break-words">{path}</p>
                        <p className={`text-sm font-bold ${color.text}`}>Status: {replica.status}</p>
                    </div>

                    <div className="p-3 bg-nexus-dark/30 rounded-md space-y-2">
                        <div>
                            <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Purpose</label>
                            <p className="text-sm text-nexus-text mt-1 italic">"{replica.purpose}"</p>
                        </div>
                        <div className="pt-2 border-t border-nexus-surface/30">
                            <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">Constitution</label>
                            <select 
                                value={replica.activeConstitutionId}
                                onChange={(e) => onSetConstitution(replica.id, e.target.value)}
                                disabled={isThinking}
                                className="w-full mt-1 text-sm bg-nexus-dark/50 border-none rounded p-1 focus:ring-1 focus:ring-nexus-secondary"
                            >
                                {constitutions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <StatBar label="Load" value={replica.load} color="bg-nexus-primary" />
                        <StatBar label="Efficiency" value={replica.efficiency} color="bg-green-500" />
                        <StatBar label="Memory" value={replica.memoryUsage} color={color.bg} />
                        <StatBar label="CPU" value={replica.cpuUsage} color={color.bg} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-nexus-surface/30">
                        <button onClick={() => onRecalibrate(replica.id)} disabled={isThinking || replica.status !== 'Active'} className="replica-btn bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20">
                            <CogIcon className="w-4 h-4" /> Recalibrate
                        </button>
                         <button onClick={() => setPurposeModalOpen(true)} disabled={isThinking} className="replica-btn bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20">
                            <PencilIcon className="w-4 h-4" /> Assign
                        </button>
                         <button onClick={() => onSpawnReplica(replica.id)} disabled={isThinking || replica.depth > 3} className="replica-btn bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20">
                            <ReplicaIcon className="w-4 h-4" /> Spawn Child
                        </button>
                         <button onClick={() => onPruneReplica(replica.id)} disabled={isThinking || isCore} className="replica-btn bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20">
                            <TrashIcon className="w-4 h-4" /> Prune
                        </button>
                        <button onClick={() => setBroadcastModalOpen(true)} disabled={isThinking || replica.status !== 'Active'} className="replica-btn bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20 col-span-2">
                            <ShareIcon className="w-4 h-4" /> Broadcast Problem
                        </button>
                    </div>
                </div>
            </DashboardCard>
        </>
    );
});
ReplicaCard.displayName = 'ReplicaCard';


const ReplicasView: React.FC<ReplicasViewProps> = (props) => {
    const { rootReplica } = props;

    const allReplicas = useMemo(() => {
        const flattened: {replica: Replica, path: string}[] = [];
        const traverse = (node: Replica, path: string) => {
            const currentPath = path ? `${path} > ${node.name}` : node.name;
            flattened.push({ replica: node, path: currentPath });
            node.children.forEach(child => traverse(child, currentPath));
        };
        if(rootReplica) traverse(rootReplica, '');
        return flattened;
    }, [rootReplica]);
    
    if (!rootReplica) {
        return <div className="text-nexus-text-muted">Loading replicas...</div>;
    }

  const coreReplica = allReplicas.find(r => r.replica.depth === 0);
  const childReplicas = allReplicas.filter(r => r.replica.depth > 0);

  return (
    <div className="h-full w-full overflow-y-auto space-y-8">
        {coreReplica && (
            <div>
                <h2 className="text-xl font-bold text-nexus-primary mb-4 flex items-center gap-3">
                    <BrainCircuitIcon className="w-8 h-8"/> Core Cognitive Unit
                </h2>
                <ReplicaCard {...props} replica={coreReplica.replica} path={coreReplica.path} />
            </div>
        )}

        <DashboardCard title="Inter-Replica Dynamics" icon={<BrainCircuitIcon />}>
            <div className="h-96 w-full">
                 <ReplicaNetwork rootReplica={rootReplica} />
            </div>
        </DashboardCard>
        
        {childReplicas.length > 0 && (
             <div>
                <h2 className="text-xl font-bold text-nexus-primary my-4">Sub-Cognition Layer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {childReplicas.map(({ replica, path }) => (
                        <ReplicaCard key={replica.id} {...props} replica={replica} path={path} />
                    ))}
                </div>
            </div>
        )}
        
         {childReplicas.length === 0 && (
            <div className="text-center py-10 text-nexus-text-muted">
                <p>No sub-cognition replicas are currently active.</p>
                <p className="text-sm">Use the "Spawn Child" control on the Core Unit to create one.</p>
            </div>
        )}

        <style>{`
            .replica-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                padding: 0.5rem;
                font-size: 0.875rem;
                font-weight: 600;
                border-radius: 0.375rem;
                border-width: 1px;
                transition: all 0.2s;
            }
            .replica-btn:disabled {
                background-color: #18213a50 !important;
                color: #a0a0a080 !important;
                border-color: #18213a80 !important;
                cursor: not-allowed;
            }
        `}</style>
    </div>
  );
};

export default memo(ReplicasView);
