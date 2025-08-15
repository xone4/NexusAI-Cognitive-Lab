import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolutionState, EvolutionConfig, FitnessGoal, Toolchain, MentalTool, EvolutionProgress } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { DnaIcon, PlayIcon, TrashIcon, ArrowRightIcon, LinkIcon, XCircleIcon } from './Icons';

interface EvolutionChamberProps {
    evolutionState: EvolutionState;
    allTools: MentalTool[];
    onCreateToolchain: (data: Omit<Toolchain, 'id'>) => void;
}

const EvolutionChamber: React.FC<EvolutionChamberProps> = ({ evolutionState, allTools, onCreateToolchain }) => {
    const [config, setConfig] = useState<EvolutionConfig>(evolutionState.config);
    const { isRunning, progress, fittestIndividual } = evolutionState;

    const handleStart = () => {
        nexusAIService.startEvolution(config);
    };

    const handleStop = () => {
        nexusAIService.stopEvolution();
    };

    const handlePromote = () => {
        if (!fittestIndividual) return;

        const lastProgress = progress.length > 0 ? progress[progress.length - 1] : null;
        const fitnessScore = lastProgress ? lastProgress.bestFitness.toFixed(4) : "N/A";
        
        const name = prompt("Enter a name for the new toolchain:", (fittestIndividual as Toolchain).name);
        if (!name) return;
        onCreateToolchain({
            name,
            description: `Evolved for goal: ${config.fitnessGoal}. Fitness: ${fitnessScore}`,
            toolIds: (fittestIndividual as Toolchain).toolIds
        });
        alert(`Toolchain "${name}" has been created and added to the Mental Tools Lab.`);
    };
    
    const toolsMap = new Map(allTools.map(tool => [tool.id, tool]));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* --- Configuration Panel --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <DashboardCard title="Evolution Configuration" icon={<DnaIcon />}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-nexus-text-muted">Fitness Goal</label>
                            <select value={config.fitnessGoal} onChange={e => setConfig(p => ({...p, fitnessGoal: e.target.value as FitnessGoal}))} disabled={isRunning} className="w-full mt-1 config-input">
                                <option value="SHORTEST_CHAIN">Shortest Chain</option>
                                <option value="LOWEST_COMPLEXITY">Lowest Complexity</option>
                                <option value="HIGHEST_COMPLEXITY">Highest Complexity</option>
                                <option value="FEWEST_TOOLS">Fewest Unique Tools</option>
                                <option value="MAXIMIZE_VISUAL_BALANCE">Maximize Visual Balance</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-nexus-text-muted">Population Size ({config.populationSize})</label>
                            <input type="range" min="10" max="200" step="10" value={config.populationSize} onChange={e => setConfig(p => ({...p, populationSize: +e.target.value}))} disabled={isRunning} className="w-full h-2 config-range" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-nexus-text-muted">Mutation Rate ({config.mutationRate.toFixed(2)})</label>
                            <input type="range" min="0" max="1" step="0.05" value={config.mutationRate} onChange={e => setConfig(p => ({...p, mutationRate: +e.target.value}))} disabled={isRunning} className="w-full h-2 config-range" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-nexus-text-muted">Generations ({config.generations})</label>
                            <input type="range" min="10" max="500" step="10" value={config.generations} onChange={e => setConfig(p => ({...p, generations: +e.target.value}))} disabled={isRunning} className="w-full h-2 config-range" />
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button onClick={handleStart} disabled={isRunning} className="flex-1 btn-primary"><PlayIcon className="w-5 h-5"/> Start</button>
                             <button onClick={handleStop} disabled={!isRunning} className="flex-1 btn-secondary"><XCircleIcon className="w-5 h-5"/> Stop</button>
                        </div>
                    </div>
                </DashboardCard>
            </div>

            {/* --- Results Panel --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <DashboardCard title="Evolution Progress" fullHeight>
                   <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="generation" stroke="#a0a0a0" />
                            <YAxis stroke="#00e5ff" domain={['dataMin', 'dataMax']}/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 15, 31, 0.8)', borderColor: '#18213a' }} />
                            <Legend />
                            <Line type="monotone" dataKey="bestFitness" name="Best Fitness" stroke="#00e5ff" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="averageFitness" name="Average Fitness" stroke="#ff00aa" strokeWidth={1} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </DashboardCard>
                <DashboardCard title="Fittest Individual" icon={<LinkIcon/>}>
                    {fittestIndividual ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-nexus-text">{(fittestIndividual as Toolchain).name}</h4>
                                <button onClick={handlePromote} disabled={isRunning} className="btn-primary text-xs">Promote to Toolchain</button>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                {(fittestIndividual as Toolchain).toolIds.map((tid, i) => (
                                    <React.Fragment key={i}>
                                        <span className="bg-nexus-surface px-2 py-1 rounded text-nexus-text font-mono">
                                            {toolsMap.get(tid)?.name || 'Unknown'}
                                        </span>
                                        {i < (fittestIndividual as Toolchain).toolIds.length - 1 && <ArrowRightIcon className="w-5 h-5 text-nexus-secondary" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-nexus-text-muted">Run evolution to find the fittest toolchain.</p>
                    )}
                </DashboardCard>
            </div>
            {/* Some styling for this component */}
            <style>{`
                .config-input {
                    background-color: #0a0f1f;
                    color: #e0e0e0;
                    border: 1px solid #18213a;
                    border-radius: 0.375rem;
                    padding: 0.5rem;
                }
                .config-range {
                    -webkit-appearance: none;
                    appearance: none;
                    background-color: #0a0f1f;
                    border-radius: 9999px;
                    border: 1px solid #18213a;
                }
                .config-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 1rem;
                    height: 1rem;
                    background-color: #00e5ff;
                    border-radius: 9999px;
                    cursor: pointer;
                }
                .btn-primary, .btn-secondary {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    font-weight: 600;
                    border-radius: 0.375rem;
                    border-width: 1px;
                    transition: all 0.2s;
                }
                .btn-primary { background-color: #00aaff20; color: #00aaff; border-color: #00aaff80; }
                .btn-primary:hover:not(:disabled) { background-color: #00aaff40; color: white; }
                .btn-secondary { background-color: #ff00aa20; color: #ff00aa; border-color: #ff00aa80; }
                .btn-secondary:hover:not(:disabled) { background-color: #ff00aa40; color: white; }
                .btn-primary:disabled, .btn-secondary:disabled {
                    background-color: #18213a80 !important;
                    color: #a0a0a080 !important;
                    border-color: #18213a !important;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default EvolutionChamber;