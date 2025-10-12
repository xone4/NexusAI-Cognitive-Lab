import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolutionState, EvolutionConfig, FitnessGoal, IndividualPlan, PlanStep, ChatMessage } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { DnaIcon, PlayIcon, LinkIcon, XCircleIcon, SparklesIcon, BrainCircuitIcon } from './Icons';

interface EvolutionChamberProps {
    evolutionState: EvolutionState;
    // No longer need allTools or onCreateToolchain, as this is now self-contained for problem solving.
}

const planToText = (plan: PlanStep[]) => {
    return plan.map(s => `Step ${s.step}: ${s.description} (Tool: ${s.tool})`).join('\n');
};

const IndividualPlanCard: React.FC<{
    individual: IndividualPlan,
    style: React.CSSProperties,
    isSelected: boolean,
    onSelect: (id: string | null) => void,
}> = memo(({ individual, style, isSelected, onSelect }) => {
    const statusClasses: Record<IndividualPlan['status'], string> = {
        elite: 'border-nexus-accent ring-2 ring-nexus-accent',
        survived: 'border-nexus-secondary',
        new: 'border-nexus-primary',
        culled: 'border-gray-600 opacity-50',
    };

    const shortPlan = individual.plan.length > 0 ? `1. ${individual.plan[0].description}` : 'Empty Plan';

    return (
        <div 
            className={`absolute w-48 bg-nexus-surface/80 backdrop-blur-sm p-2 rounded-xl border-2 transition-all duration-500 cursor-pointer hover:scale-110 hover:z-10 ${statusClasses[individual.status]}`}
            style={style}
            onClick={() => onSelect(isSelected ? null : individual.id)}
        >
            <div className="flex justify-between text-xs font-mono">
                <span className="text-nexus-text">Gen: {individual.generation}</span>
                <span className="font-bold text-nexus-primary">Fit: {individual.fitness.toFixed(2)}</span>
            </div>
            <p className="text-xs text-nexus-text-muted truncate mt-1" title={shortPlan}>{shortPlan}</p>
        </div>
    );
});

const EvolutionChamber: React.FC<EvolutionChamberProps> = ({ evolutionState }) => {
    const { t } = useTranslation();
    const [problemStatement, setProblemStatement] = useState(evolutionState.problemStatement);
    const [config, setConfig] = useState<EvolutionConfig>(evolutionState.config);
    const [selectedIndividualId, setSelectedIndividualId] = useState<string | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    
    const { isRunning, progress, population, statusMessage, finalEnsembleResult } = evolutionState;

    const fitnessGoals: { value: FitnessGoal, label: string }[] = [
        { value: 'EFFICIENCY', label: t('evolution.efficiency') },
        { value: 'CREATIVITY', label: t('evolution.creativity') },
        { value: 'ROBUSTNESS', label: t('evolution.robustness') },
        { value: 'CONCISENESS', label: t('evolution.conciseness') }
    ];

    const handleInitialize = () => {
        if (!problemStatement.trim()) {
            alert(t('evolution.problemRequired'));
            return;
        }
        setSelectedIndividualId(null);
        nexusAIService.initializeEvolution(problemStatement, config);
    };

    const handleStart = () => nexusAIService.startEvolution();
    const handleStop = () => nexusAIService.stopEvolution();
    
    const handleSynthesize = async () => {
        setIsSynthesizing(true);
        await nexusAIService.ensembleAndFinalize();
        setIsSynthesizing(false);
    };

    const selectedIndividual = useMemo(() => {
        return population.find(p => p.id === selectedIndividualId) || null;
    }, [selectedIndividualId, population]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
            {/* --- Left Panel: Controls --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <DashboardCard title={t('evolution.problemStatement')} icon={<DnaIcon />} defaultOpen>
                     <textarea
                        value={problemStatement}
                        onChange={e => setProblemStatement(e.target.value)}
                        placeholder={t('evolution.problemPlaceholder')}
                        disabled={isRunning}
                        className="w-full h-24 p-2 bg-nexus-dark rounded-xl text-sm resize-none focus:ring-1 focus:ring-nexus-primary"
                    />
                    <button onClick={handleInitialize} disabled={isRunning || !problemStatement.trim()} className="w-full mt-2 btn-primary">{t('evolution.initializePopulation')}</button>
                </DashboardCard>

                <DashboardCard title={t('evolution.geneticOperators')} icon={<SparklesIcon />} defaultOpen>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-nexus-text-muted">{t('evolution.fitnessGoal')}</label>
                            <select value={config.fitnessGoal} onChange={e => setConfig(p => ({...p, fitnessGoal: e.target.value as FitnessGoal}))} disabled={isRunning} className="w-full mt-1 config-input">
                                {fitnessGoals.map(goal => <option key={goal.value} value={goal.value}>{goal.label}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-nexus-text-muted">{t('evolution.generations')} ({config.generations})</label>
                            <input type="range" min="5" max="50" step="1" value={config.generations} onChange={e => setConfig(p => ({...p, generations: +e.target.value}))} disabled={isRunning} className="w-full h-2 config-range" />
                        </div>
                        <div className="flex gap-2 pt-2">
                             <button onClick={handleStart} disabled={isRunning || population.length === 0} className="flex-1 btn-primary"><PlayIcon className="w-5 h-5"/> {t('evolution.run')}</button>
                             <button onClick={handleStop} disabled={!isRunning} className="flex-1 btn-secondary"><XCircleIcon className="w-5 h-5"/> {t('evolution.stop')}</button>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title={t('evolution.progressTitle')} fullHeight>
                   <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="generation" name="Gen" stroke="#a0a0a0" />
                            <YAxis stroke="#00e5ff" domain={[0, 100]}/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 15, 31, 0.8)', borderColor: '#18213a' }} />
                            <Legend />
                            <Line type="monotone" dataKey="bestFitness" name={t('evolution.bestFitness')} stroke="#00e5ff" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="averageFitness" name={t('evolution.averageFitness')} stroke="#ff00aa" strokeWidth={1} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </DashboardCard>
            </div>

            {/* --- Right Panel: Visualization & Results --- */}
            <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
                <DashboardCard title={t('evolution.population')} icon={<BrainCircuitIcon />} fullHeight className="flex-grow">
                     <div className="relative w-full h-full">
                        {population.length === 0 && !statusMessage && <p className="text-center text-nexus-text-muted absolute inset-0 flex items-center justify-center">{t('evolution.initializeHint')}</p>}
                        {statusMessage && <p className="text-center text-nexus-accent animate-pulse absolute inset-0 flex items-center justify-center">{statusMessage}</p>}
                        
                        {population.map((individual, i) => {
                             const angle = (i / population.length) * 2 * Math.PI;
                             const radius = Math.min(250, window.innerWidth / 5); // Responsive radius
                             const x = Math.cos(angle) * radius + 250 - 96; // 96 is half width of card
                             const y = Math.sin(angle) * radius + 200 - 28; // 28 is half height of card
                             return <IndividualPlanCard key={individual.id} individual={individual} style={{ top: `${y}px`, left: `${x}px` }} isSelected={selectedIndividualId === individual.id} onSelect={setSelectedIndividualId}/>
                        })}
                     </div>
                </DashboardCard>

                <DashboardCard title={selectedIndividual ? t('evolution.selectedIndividual') : t('evolution.ensembleTitle')} icon={<LinkIcon/>} className="flex-shrink-0">
                    {selectedIndividual ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            <h4 className="font-semibold text-nexus-text">Plan Details (Gen {selectedIndividual.generation}, Fitness {selectedIndividual.fitness.toFixed(2)})</h4>
                            <pre className="text-xs font-mono whitespace-pre-wrap p-2 bg-nexus-dark rounded-xl">{planToText(selectedIndividual.plan)}</pre>
                        </div>
                    ) : (
                         <div className="space-y-3">
                             {finalEnsembleResult ? (
                                 <div>
                                     <h4 className="font-bold text-nexus-primary">{t('evolution.finalAnswer')}</h4>
                                     <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text bg-nexus-dark/50 p-3 rounded-xl max-h-48 overflow-y-auto mt-2">{finalEnsembleResult.text}</pre>
                                 </div>
                             ) : (
                                <>
                                 <p className="text-sm text-nexus-text-muted">{!isRunning && population.length > 0 ? t('evolution.ensembleReady') : t('evolution.ensembleHint')}</p>
                                 <button onClick={handleSynthesize} disabled={isRunning || population.length === 0 || isSynthesizing} className="btn-primary w-full">
                                     {isSynthesizing ? t('evolution.synthesizing') : t('evolution.synthesizeAnswer')}
                                 </button>
                                </>
                             )}
                         </div>
                    )}
                </DashboardCard>
            </div>
            
            <style>{`
                .config-input { background-color: #0a0f1f; color: #e0e0e0; border: 1px solid #18213a; border-radius: 9999px; padding: 0.5rem; }
                .config-range { -webkit-appearance: none; appearance: none; background-color: #0a0f1f; border-radius: 9999px; border: 1px solid #18213a; }
                .config-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 1rem; height: 1rem; background-color: #00e5ff; border-radius: 9999px; cursor: pointer; }
                .btn-primary, .btn-secondary { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem; font-weight: 600; border-radius: 9999px; border-width: 1px; transition: all 0.2s; }
                .btn-primary { background-color: #00aaff20; color: #00aaff; border-color: #00aaff80; }
                .btn-primary:hover:not(:disabled) { background-color: #00aaff40; color: white; }
                .btn-secondary { background-color: #ff00aa20; color: #ff00aa; border-color: #ff00aa80; }
                .btn-secondary:hover:not(:disabled) { background-color: #ff00aa40; color: white; }
                .btn-primary:disabled, .btn-secondary:disabled { background-color: #18213a80 !important; color: #a0a0a80 !important; border-color: #18213a !important; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default EvolutionChamber;