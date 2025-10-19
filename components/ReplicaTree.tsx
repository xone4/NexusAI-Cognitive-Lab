import React, { memo, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Replica, CognitiveConstitution, Personality, CognitiveNetworkState, CognitiveProblem } from '../types';
import { ReplicaIcon, CogIcon, TrashIcon, PencilIcon, BrainCircuitIcon, ShareIcon, UserIcon, ClockIcon, ArchIcon } from './Icons';
import DashboardCard from './DashboardCard';
import ReplicaNetwork from './ReplicaNetwork';
import PersonalityEditor from './PersonalityEditor';

interface ReplicasViewProps {
    rootReplica: Replica;
    isInteractionDisabled: boolean;
    cognitiveNetwork: CognitiveNetworkState;
    onSpawnReplica: (parentId: string) => void;
    onPruneReplica: (replicaId: string) => void;
    onRecalibrate: (replicaId: string) => void;
    onAssignPurpose: (replicaId: string, purpose: string) => void;
    constitutions: CognitiveConstitution[];
    onSetConstitution: (replicaId: string, constitutionId: string) => void;
    onBroadcastProblem: (replicaId: string, problem: string) => void;
    onSetPersonality: (replicaId: string, personality: Personality) => void;
    onTriggerGlobalSync: () => void;
}

const statusColors: Record<Replica['status'], { text: string; border: string; bg: string }> = {
  Active: { text: 'text-nexus-secondary', border: 'border-nexus-secondary', bg: 'bg-nexus-secondary' },
  'Executing Task': { text: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400' },
  Dormant: { text: 'text-nexus-text-muted', border: 'border-nexus-surface', bg: 'bg-nexus-text-muted' },
  Evolving: { text: 'text-nexus-accent', border: 'border-nexus-accent', bg: 'bg-nexus-accent' },
  Spawning: { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400' },
  Pruning: { text: 'text-gray-500', border: 'border-gray-500', bg: 'bg-gray-500' },
  Recalibrating: { text: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400' },
  Bidding: { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400' },
};

const StatBar: React.FC<{ label: string; value: number; color: string; max?: number, unit?: string }> = ({ label, value, color, max = 100, unit = '' }) => {
    const percentage = (value / max) * 100;
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-semibold text-nexus-text-muted">{label}</span>
                <span className="text-sm font-bold text-nexus-text">{value.toFixed(unit ? 2 : 0)}{unit}</span>
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

const PersonalityModal: React.FC<{ replica: Replica; onSave: (personality: Personality) => void; onClose: () => void; }> = ({ replica, onSave, onClose }) => {
    const { t } = useTranslation();
    const [personality, setPersonality] = useState(replica.personality);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(personality);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <form onSubmit={handleSave} className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-nexus-primary/50">
                <h3 className="text-lg font-bold text-nexus-text mb-4">{t('replicas.setPersonalityFor', { name: replica.name })}</h3>
                <PersonalityEditor personality={personality} onChange={setPersonality} />
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">{t('cognitiveProcess.cancel')}</button>
                    <button type="submit" className="py-2 px-4 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">{t('replicas.savePersonality')}</button>
                </div>
            </form>
        </div>
    );
};

const PurposeModal: React.FC<{ currentPurpose: string; onSave: (newPurpose: string) => void; onClose: () => void; }> = ({ currentPurpose, onSave, onClose }) => {
    const { t } = useTranslation();
    const [purpose, setPurpose] = useState(currentPurpose);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(purpose);
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <form onSubmit={handleSave} className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-md border border-nexus-primary/50">
                <h3 className="text-lg font-bold text-nexus-text mb-4">{t('replicas.assignNewPurpose')}</h3>
                <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm"
                    placeholder={t('replicas.purposePlaceholder')}
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">{t('cognitiveProcess.cancel')}</button>
                    <button type="submit" className="py-2 px-4 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">{t('replicas.savePurpose')}</button>
                </div>
            </form>
        </div>
    );
};

const BroadcastModal: React.FC<{ onBroadcast: (problem: string) => void; onClose: () => void; }> = ({ onBroadcast, onClose }) => {
    const { t } = useTranslation();
    const [problem, setProblem] = useState('');
    return (
         <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <form onSubmit={(e) => { e.preventDefault(); onBroadcast(problem); }} className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-md border border-nexus-primary/50">
                <h3 className="text-lg font-bold text-nexus-text mb-4">{t('replicas.broadcastProblem')}</h3>
                <textarea value={problem} onChange={(e) => setProblem(e.target.value)} required className="w-full h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none" placeholder={t('replicas.broadcastProblemPlaceholder')}/>
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-full text-nexus-text-muted hover:bg-nexus-dark">{t('cognitiveProcess.cancel')}</button>
                    <button type="submit" className="py-2 px-4 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">{t('replicas.broadcast')}</button>
                </div>
            </form>
        </div>
    );
};

const getPersonalityCode = (p: Personality): string => {
    if (!p) return '----';
    return `${p.energyFocus[0]}${p.informationProcessing[0]}${p.decisionMaking[0]}${p.worldApproach[0]}`;
}


const ReplicaCard: React.FC<Omit<ReplicasViewProps, 'rootReplica' | 'onTriggerGlobalSync' | 'cognitiveNetwork'> & { replica: Replica; path: string; }> = memo(({ replica, path, isInteractionDisabled, onSpawnReplica, onPruneReplica, onRecalibrate, onAssignPurpose, constitutions, onSetConstitution, onBroadcastProblem, onSetPersonality }) => {
    const { t } = useTranslation();
    const [isPurposeModalOpen, setPurposeModalOpen] = useState(false);
    const [isBroadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [isPersonalityModalOpen, setPersonalityModalOpen] = useState(false);
    
    const color = statusColors[replica.status] || statusColors.Dormant;
    const animationClass = replica.status === 'Pruning' ? 'animate-fade-out' : replica.status === 'Spawning' ? 'animate-spawn-in' : ['Executing Task', 'Recalibrating', 'Bidding'].includes(replica.status) ? 'animate-pulse' : '';

    const handleSavePurpose = (newPurpose: string) => {
        onAssignPurpose(replica.id, newPurpose);
        setPurposeModalOpen(false);
    };
    
    const handleBroadcast = (problem: string) => {
        onBroadcastProblem(replica.id, problem);
        setBroadcastModalOpen(false);
    };
    
    const handleSavePersonality = (newPersonality: Personality) => {
        onSetPersonality(replica.id, newPersonality);
    }

    const isCore = replica.depth === 0;
    const personalityCode = getPersonalityCode(replica.personality);

    return (
        <>
            {isPurposeModalOpen && <PurposeModal currentPurpose={replica.purpose} onSave={handleSavePurpose} onClose={() => setPurposeModalOpen(false)} />}
            {isBroadcastModalOpen && <BroadcastModal onBroadcast={handleBroadcast} onClose={() => setBroadcastModalOpen(false)} />}
            {isPersonalityModalOpen && <PersonalityModal replica={replica} onSave={handleSavePersonality} onClose={() => setPersonalityModalOpen(false)} />}

            <DashboardCard 
                title={replica.name} 
                icon={<ReplicaIcon className={color.text} />} 
                className={`border-s-4 ${color.border} ${animationClass} transition-all duration-300`}
                isCollapsible={false}
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-mono text-nexus-text-muted break-words">{path}</p>
                        <div className="flex justify-between items-center">
                             <p className={`text-sm font-bold ${color.text}`}>{t('replicas.status')}: {t(`replicas.status_${replica.status.replace(' ', '')}`, replica.status)}</p>
                             <div className="text-sm font-mono font-bold text-nexus-accent bg-nexus-accent/10 px-2 py-0.5 rounded-full">{personalityCode}</div>
                        </div>
                    </div>

                    <div className="p-3 bg-nexus-dark/30 rounded-xl space-y-2">
                        <div>
                            <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">{t('replicas.purpose')}</label>
                            <p className="text-sm text-nexus-text mt-1 italic">"{replica.purpose}"</p>
                        </div>
                        <div className="pt-2 border-t border-nexus-surface/30">
                            <label className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">{t('replicas.constitution')}</label>
                            <select 
                                value={replica.activeConstitutionId}
                                onChange={(e) => onSetConstitution(replica.id, e.target.value)}
                                disabled={isInteractionDisabled}
                                className="w-full mt-1 text-sm bg-nexus-dark/50 border-none rounded-full p-1 focus:ring-1 focus:ring-nexus-secondary"
                            >
                                {constitutions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <StatBar label={t('replicas.cognitiveLoad')} value={replica.load} color="bg-nexus-primary" />
                        <StatBar label={t('replicas.learningRate')} value={replica.efficiency} color="bg-green-500" unit="%" />
                        <StatBar label={t('replicas.contextUtilization')} value={replica.memoryUsage} color={color.bg} />
                        <StatBar label={t('replicas.processingCycles')} value={replica.cpuUsage} color={color.bg} />
                        <div className="pt-2 border-t border-nexus-surface/30 space-y-3">
                            <StatBar label={t('replicas.tempo')} value={replica.tempo} color="bg-orange-500" max={5.5} unit=" T/s"/>
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-semibold text-nexus-text-muted">{t('replicas.internalTime')}</span>
                                <span className="text-sm font-bold text-nexus-text font-mono">{replica.internalTick.toLocaleString(undefined, { maximumFractionDigits: 0 })} T</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-nexus-surface/30">
                        <button onClick={() => onRecalibrate(replica.id)} disabled={isInteractionDisabled || replica.status !== 'Active'} className="replica-btn bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20">
                            <CogIcon className="w-4 h-4" /> {t('replicas.recalibrate')}
                        </button>
                         <button onClick={() => setPurposeModalOpen(true)} disabled={isInteractionDisabled} className="replica-btn bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20">
                            <PencilIcon className="w-4 h-4" /> {t('replicas.assign')}
                        </button>
                         <button onClick={() => onSpawnReplica(replica.id)} disabled={isInteractionDisabled || replica.depth > 3} className="replica-btn bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20">
                            <ReplicaIcon className="w-4 h-4" /> {t('replicas.spawnChild')}
                        </button>
                         <button onClick={() => onPruneReplica(replica.id)} disabled={isInteractionDisabled || isCore} className="replica-btn bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20">
                            <TrashIcon className="w-4 h-4" /> {t('replicas.prune')}
                        </button>
                         <button onClick={() => setPersonalityModalOpen(true)} disabled={isInteractionDisabled} className="replica-btn bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20">
                            <UserIcon className="w-4 h-4" /> {t('replicas.setPersonality')}
                        </button>
                        <button onClick={() => setBroadcastModalOpen(true)} disabled={isInteractionDisabled || replica.status !== 'Active'} className="replica-btn bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20">
                            <ShareIcon className="w-4 h-4" /> {t('replicas.broadcastProblem')}
                        </button>
                    </div>
                </div>
            </DashboardCard>
        </>
    );
});
ReplicaCard.displayName = 'ReplicaCard';

const TemporalCoordinatorView: React.FC<{ allReplicas: {replica: Replica, path: string}[] }> = ({ allReplicas }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-4 pt-4 border-t border-nexus-surface/50">
            <h4 className="text-sm font-semibold text-nexus-primary mb-2 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                {t('replicas.temporalCoordinatorLog')}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {allReplicas.map(({ replica }) => {
                    const tickPercentage = (replica.internalTick % 1000) / 10;
                    const color = statusColors[replica.status] || statusColors.Dormant;
                    return (
                        <div key={replica.id} className="text-xs">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`font-semibold ${color.text}`}>{replica.name}</span>
                                <span className="font-mono text-nexus-text-muted">{t('replicas.tempo')}: {replica.tempo.toFixed(2)} T/s</span>
                            </div>
                            <div className="w-full bg-nexus-dark/50 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`${color.bg} h-2 rounded-full transition-all duration-1000 ease-linear`}
                                    style={{ width: `${tickPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CognitiveNetworkMonitor: React.FC<{ problems: CognitiveProblem[] }> = ({ problems }) => {
    const { t } = useTranslation();

    return (
        <DashboardCard title={t('replicas.networkMonitorTitle')} icon={<ArchIcon />}>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {problems.length === 0 ? (
                    <p className="text-sm text-nexus-text-muted text-center py-4">{t('replicas.noActiveProblems')}</p>
                ) : (
                    problems.map(problem => (
                        <div key={problem.id} className="bg-nexus-dark/30 p-3 rounded-xl animate-spawn-in">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-semibold text-nexus-text">"{problem.description}"</p>
                                    <p className="text-xs text-nexus-text-muted">{t('replicas.broadcastBy')}: {problem.broadcastByName}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${problem.isOpen ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                                    {problem.isOpen ? t('replicas.openForBids') : t('replicas.closed')}
                                </span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-nexus-surface/30">
                                <h5 className="text-xs font-semibold text-nexus-primary mb-2">{t('replicas.bidsReceived')}</h5>
                                {problem.bids.length === 0 && problem.isOpen && <p className="text-xs text-nexus-text-muted italic animate-pulse">{t('replicas.awaitingBids')}</p>}
                                <div className="space-y-1">
                                    {problem.bids.sort((a,b) => b.confidenceScore - a.confidenceScore).map(bid => {
                                        const isWinner = problem.winningBid?.bidderId === bid.bidderId;
                                        return (
                                            <div key={bid.bidderId} className={`flex justify-between items-center text-xs p-1 rounded ${isWinner ? 'bg-green-500/20' : ''}`}>
                                                <span className={`${isWinner ? 'font-bold text-green-300' : 'text-nexus-text-muted'}`}>{bid.bidderName}</span>
                                                <span className={`font-mono font-bold ${isWinner ? 'text-green-300' : 'text-orange-400'}`}>
                                                    {t('replicas.confidence')}: {(bid.confidenceScore * 100).toFixed(1)}% {isWinner ? `(${t('replicas.winner')})` : ''}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardCard>
    );
};

const ReplicasView: React.FC<ReplicasViewProps> = (props) => {
    const { rootReplica, onTriggerGlobalSync, isInteractionDisabled, cognitiveNetwork } = props;
    const { t } = useTranslation();

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
    
    const isSyncing = useMemo(() => {
        return allReplicas.some(r => r.replica.status === 'Recalibrating');
    }, [allReplicas]);

    if (!rootReplica) {
        return <div className="text-nexus-text-muted">{t('replicas.loading')}</div>;
    }

  const coreReplica = allReplicas.find(r => r.replica.depth === 0);
  const childReplicas = allReplicas.filter(r => r.replica.depth > 0);

  return (
    <div className="w-full space-y-8">
        {coreReplica && (
            <div>
                <h2 className="text-xl font-bold text-nexus-primary mb-4 flex items-center gap-3">
                    <BrainCircuitIcon className="w-8 h-8"/> {t('replicas.coreUnit')}
                </h2>
                <ReplicaCard {...props} replica={coreReplica.replica} path={coreReplica.path} />
            </div>
        )}
        
        <CognitiveNetworkMonitor problems={cognitiveNetwork.activeProblems} />

        <DashboardCard title={t('replicas.interReplicaDynamics')} icon={<BrainCircuitIcon />}>
            <div className="h-96 w-full">
                 <ReplicaNetwork rootReplica={rootReplica} />
            </div>
            <div className="flex justify-center mt-4">
                <button
                    onClick={onTriggerGlobalSync}
                    disabled={isInteractionDisabled || isSyncing}
                    className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/50 hover:bg-blue-500/20 font-semibold px-4 py-2 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ClockIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? t('replicas.synchronizing') : t('replicas.issueGlobalTempoPulse')}
                </button>
            </div>
            <TemporalCoordinatorView allReplicas={allReplicas} />
        </DashboardCard>
        
        {childReplicas.length > 0 && (
             <div>
                <h2 className="text-xl font-bold text-nexus-primary my-4">{t('replicas.subCognitionLayer')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {childReplicas.map(({ replica, path }) => (
                        <ReplicaCard key={replica.id} {...props} replica={replica} path={path} />
                    ))}
                </div>
            </div>
        )}
        
         {childReplicas.length === 0 && (
            <div className="text-center py-10 text-nexus-text-muted">
                <p>{t('replicas.noSubReplicas')}</p>
                <p className="text-sm">{t('replicas.spawnChildHint')}</p>
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
                border-radius: 9999px;
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