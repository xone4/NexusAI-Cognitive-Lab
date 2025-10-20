import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SimulationState, SimulationConfig } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { FlaskConicalIcon, PlayIcon, BrainCircuitIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface SimulationLabProps {
    simulationState: SimulationState;
    isGloballyBusy: boolean;
}

const SimulationLab: React.FC<SimulationLabProps> = ({ simulationState, isGloballyBusy }) => {
    const { t } = useTranslation();
    const [config, setConfig] = useState<Omit<SimulationConfig, 'strategies'>>({
        name: 'Economic Downturn Scenario',
        scenario: 'A small tech startup faces a sudden economic downturn. Customer spending is down 50%. The goal is to survive for the next 6 months.',
        maxSteps: 10,
        evaluationCriteria: 'The strategy that maintains the highest cash reserve after 6 months wins.',
    });
    const [strategies, setStrategies] = useState([
        { name: 'Aggressive Expansion', description: 'Double down on marketing and release a new feature to capture market share, funded by a small loan.' },
        { name: 'Defensive Downsizing', description: 'Cut all non-essential costs, reduce marketing spend by 80%, and focus only on retaining existing customers.' },
    ]);

    const { isRunning, statusMessage, result, error } = simulationState;
    const isBusy = isRunning || isGloballyBusy;

    const handleRunSimulation = () => {
        const fullConfig: SimulationConfig = {
            ...config,
            strategies,
        };
        nexusAIService.runSimulation(fullConfig);
    };

    const handleStrategyChange = (index: number, field: 'name' | 'description', value: string) => {
        const newStrategies = [...strategies];
        newStrategies[index][field] = value;
        setStrategies(newStrategies);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <DashboardCard title={t('simulationLab.title')} icon={<FlaskConicalIcon />}>
                 <div className="space-y-4">
                    <p className="text-sm text-nexus-text-muted">{t('simulationLab.description')}</p>
                    
                    {/* Scenario Definition */}
                    <div>
                        <label className="text-sm font-medium text-nexus-text-muted">{t('simulationLab.scenario')}</label>
                        <textarea
                            value={config.scenario}
                            onChange={e => setConfig(p => ({ ...p, scenario: e.target.value }))}
                            placeholder={t('simulationLab.scenarioPlaceholder')}
                            disabled={isBusy}
                            className="w-full h-24 p-3 mt-1 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-y"
                        />
                    </div>
                    
                    {/* Strategies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="bg-nexus-dark/50 p-3 rounded-xl">
                                <label className="text-sm font-medium text-nexus-text-muted">{t('simulationLab.strategy', { number: index + 1 })}</label>
                                <input
                                    type="text"
                                    value={strategy.name}
                                    onChange={e => handleStrategyChange(index, 'name', e.target.value)}
                                    placeholder={t('simulationLab.strategyNamePlaceholder')}
                                    disabled={isBusy}
                                    className="w-full mt-2 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                                />
                                <textarea
                                    value={strategy.description}
                                    onChange={e => handleStrategyChange(index, 'description', e.target.value)}
                                    placeholder={t('simulationLab.strategyDescPlaceholder')}
                                    disabled={isBusy}
                                    rows={3}
                                    className="w-full mt-2 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-y"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Evaluation Criteria */}
                     <div>
                        <label className="text-sm font-medium text-nexus-text-muted">{t('simulationLab.evaluationCriteria')}</label>
                        <input
                            type="text"
                            value={config.evaluationCriteria}
                            onChange={e => setConfig(p => ({...p, evaluationCriteria: e.target.value}))}
                            placeholder={t('simulationLab.evaluationPlaceholder')}
                            disabled={isBusy}
                            className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                        />
                    </div>
                    
                    <button onClick={handleRunSimulation} disabled={isBusy} className="w-full flex items-center justify-center gap-2 bg-nexus-primary/90 text-nexus-dark font-bold py-3 px-4 rounded-full border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlayIcon className="w-5 h-5"/>
                        {isRunning ? t('simulationLab.running') : t('simulationLab.run')}
                    </button>
                    {isGloballyBusy && !isRunning && <p className="text-xs text-center mt-2 text-nexus-accent">{t('analysis.disabledWhileThinking')}</p>}
                </div>
            </DashboardCard>
            
            {(isRunning || result || error) && (
                <DashboardCard title={t('simulationLab.resultsTitle')} icon={<BrainCircuitIcon />}>
                    {isRunning ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted p-4">
                            <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
                            <p className="font-semibold text-lg animate-pulse">{statusMessage || t('simulationLab.running')}</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl">
                            <p className="font-bold">{t('videoForge.errorOccurred')}</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    ) : result ? (
                        <div className="space-y-4">
                            <div className="bg-nexus-dark/50 p-4 rounded-xl text-center">
                                <p className="text-sm uppercase tracking-wider text-nexus-text-muted">{t('simulationLab.winningStrategy')}</p>
                                <p className="text-xl font-bold text-nexus-secondary flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="w-6 h-6"/> {result.winningStrategy}
                                </p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-nexus-text">{t('simulationLab.summary')}</h4>
                                <p className="text-sm text-nexus-text-muted italic mt-1">"{result.summary}"</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-nexus-text">{t('simulationLab.trace')}</h4>
                                <div className="mt-2 space-y-2 max-h-96 overflow-y-auto bg-nexus-dark/30 p-2 rounded-xl">
                                    {result.stepByStepTrace.map(step => {
                                        let formattedState = '';
                                        try {
                                            // Try to parse if it's a string, otherwise stringify if it's an object
                                            formattedState = typeof step.state === 'string'
                                                ? JSON.stringify(JSON.parse(step.state), null, 2)
                                                : JSON.stringify(step.state, null, 2);
                                        } catch (e) {
                                            // If parsing fails, just show the raw string
                                            formattedState = String(step.state);
                                        }

                                        return (
                                            <div key={step.step} className="p-2 border-b border-nexus-surface/50">
                                                <p className="font-bold text-nexus-primary">Step {step.step} - <span className="text-nexus-text">{step.strategy}</span></p>
                                                <p className="text-xs text-nexus-text-muted"><strong>Action:</strong> {step.action}</p>
                                                <p className="text-xs text-nexus-secondary"><strong>Outcome:</strong> {step.outcome}</p>
                                                {step.state && (
                                                    <div className="mt-1">
                                                        <p className="text-xs text-nexus-text-muted"><strong>State:</strong></p>
                                                        <pre className="text-xs font-mono bg-nexus-dark/70 p-2 rounded text-cyan-400 whitespace-pre-wrap">
                                                            {formattedState}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DashboardCard>
            )}

        </div>
    );
};

export default memo(SimulationLab);