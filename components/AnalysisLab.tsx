import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Replica, MentalTool, LogEntry, SystemSuggestion, AnalysisConfig, SystemAnalysisResult } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { MagnifyingGlassIcon, LightBulbIcon, CogIcon, BrainCircuitIcon } from './Icons';

interface AnalysisLabProps {
    replicas: Replica | null;
    tools: MentalTool[];
    logs: LogEntry[];
    isThinking: boolean;
    onSubmitQuery: (query: string) => void;
    onPruneReplica: (id: string) => void;
    onRecalibrate: (id: string) => void;
    onOptimizeTool: (id: string) => void;
}

const ConfigToggle: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled: boolean; }> = ({ label, checked, onChange, disabled }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-nexus-primary' : 'bg-nexus-dark'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-full' : ''}`}></div>
        </div>
        <span className={`text-sm font-medium ${disabled ? 'text-nexus-text-muted/50' : 'text-nexus-text-muted'}`}>{label}</span>
    </label>
);

const SuggestionCard: React.FC<{
    suggestion: SystemSuggestion;
    onExecute: (suggestion: SystemSuggestion) => void;
}> = ({ suggestion, onExecute }) => (
    <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in">
        <div className="flex items-center gap-3 mb-2">
            {suggestion.type === 'action' 
                ? <CogIcon className="w-5 h-5 text-nexus-accent flex-shrink-0" /> 
                : <LightBulbIcon className="w-5 h-5 text-nexus-secondary flex-shrink-0" />
            }
            <h4 className="font-semibold text-nexus-text">{suggestion.description}</h4>
        </div>
        <p className="text-sm text-nexus-text-muted pl-8 mb-4">
            <span className="font-bold text-nexus-text-muted/80">AI Rationale: </span>{suggestion.reason}
        </p>
        <div className="flex justify-end pl-8">
            <button
                onClick={() => onExecute(suggestion)}
                className="bg-nexus-primary/20 text-nexus-primary text-sm font-bold py-1.5 px-4 rounded-full border border-nexus-primary/50
                           hover:bg-nexus-primary/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary"
            >
                {suggestion.type === 'action' ? 'Execute Action' : 'Run Query'}
            </button>
        </div>
    </div>
);


const AnalysisLab: React.FC<AnalysisLabProps> = (props) => {
    const { t } = useTranslation();
    const { replicas, tools, logs, isThinking } = props;
    const [config, setConfig] = useState<AnalysisConfig>({
        scope: { replicas: true, tools: true, logs: true },
        depth: 'Standard'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<SystemAnalysisResult | null>(null);

    const handleRunAnalysis = useCallback(async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        const result = await nexusAIService.getSystemAnalysisSuggestions(
            config,
            replicas,
            tools,
            logs.slice(-20) // Send last 20 logs for context
        );
        setAnalysisResult(result);
        setIsLoading(false);
    }, [config, replicas, tools, logs]);

    const handleExecuteSuggestion = (suggestion: SystemSuggestion) => {
        if (suggestion.type === 'query' && suggestion.queryString) {
            props.onSubmitQuery(suggestion.queryString);
        } else if (suggestion.type === 'action' && suggestion.command && suggestion.targetId) {
            nexusAIService.log('AI', `Executing AI-suggested action: ${suggestion.command} on ${suggestion.targetId}`);
            switch (suggestion.command) {
                case 'pruneReplica':
                    // Confirmation is handled in the App component's handler
                    props.onPruneReplica(suggestion.targetId);
                    break;
                case 'recalibrateReplica':
                    props.onRecalibrate(suggestion.targetId);
                    break;
                case 'optimizeTool':
                    props.onOptimizeTool(suggestion.targetId);
                    break;
                default:
                    nexusAIService.log('WARN', `Unknown AI-suggested command: ${suggestion.command}`);
                    break;
            }
        }
        // Remove the executed suggestion from the list
        if (analysisResult) {
            setAnalysisResult({
                ...analysisResult,
                suggestions: analysisResult.suggestions.filter(s => s !== suggestion)
            });
        }
    };
    
    const loadingMessage = isLoading ? t('analysis.loadingMessage') : t('analysis.noSuggestions');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* --- Configuration Panel --- */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <DashboardCard title={t('analysis.configTitle')} icon={<CogIcon />}>
                    <div className="space-y-6">
                        {/* Scope */}
                        <div>
                            <h4 className="font-semibold text-nexus-text mb-3">{t('analysis.scope')}</h4>
                            <div className="space-y-3">
                                <ConfigToggle label={t('analysis.replicas')} checked={config.scope.replicas} onChange={c => setConfig(p => ({ ...p, scope: {...p.scope, replicas: c}}))} disabled={isLoading || isThinking} />
                                <ConfigToggle label={t('analysis.mentalTools')} checked={config.scope.tools} onChange={c => setConfig(p => ({ ...p, scope: {...p.scope, tools: c}}))} disabled={isLoading || isThinking}/>
                                <ConfigToggle label={t('analysis.systemLogs')} checked={config.scope.logs} onChange={c => setConfig(p => ({ ...p, scope: {...p.scope, logs: c}}))} disabled={isLoading || isThinking}/>
                            </div>
                        </div>
                        {/* Depth */}
                        <div>
                             <h4 className="font-semibold text-nexus-text mb-3">{t('analysis.depth')}</h4>
                             <div className="flex rounded-full shadow-sm">
                                {(['Quick', 'Standard', 'Deep'] as const).map((depth, idx, arr) => (
                                     <button
                                        key={depth}
                                        onClick={() => setConfig(p => ({...p, depth}))}
                                        disabled={isLoading || isThinking}
                                        className={`relative inline-flex items-center justify-center w-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-nexus-surface focus:z-10
                                            ${config.depth === depth ? 'bg-nexus-primary text-nexus-dark' : 'bg-nexus-bg text-nexus-text-muted hover:bg-nexus-surface'}
                                            ${idx === 0 ? 'rounded-l-full' : ''}
                                            ${idx === arr.length - 1 ? 'rounded-r-full' : '-ml-px'}
                                            disabled:opacity-50 disabled:cursor-not-allowed`}
                                     >
                                         {t(`analysis.${depth.toLowerCase()}`)}
                                     </button>
                                ))}
                             </div>
                        </div>
                        {/* Action Button */}
                        <div>
                             <button
                                onClick={handleRunAnalysis}
                                disabled={isLoading || isThinking}
                                className="w-full flex items-center justify-center gap-2 bg-nexus-primary/90 text-nexus-dark font-bold py-3 px-4 rounded-full border border-nexus-primary/80
                                          hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary
                                          disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
                             >
                                <MagnifyingGlassIcon className="w-5 h-5"/>
                                {isLoading ? t('analysis.analyzing') : t('analysis.runAnalysis')}
                             </button>
                             {isThinking && <p className="text-xs text-center mt-2 text-nexus-accent">{t('analysis.disabledWhileThinking')}</p>}
                        </div>
                    </div>
                </DashboardCard>
            </div>

            {/* --- Results Panel --- */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <DashboardCard title={t('analysis.resultsTitle')} icon={<BrainCircuitIcon />} fullHeight>
                    <div className="h-full overflow-y-auto pr-2">
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                                <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
                                <p className="font-semibold text-lg">{t('analysis.loadingMessage')}</p>
                                <p className="text-sm">{t('analysis.loadingMessageDesc')}</p>
                             </div>
                        )}
                        {!isLoading && !analysisResult && (
                             <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                                <MagnifyingGlassIcon className="w-16 h-16" />
                                <p className="mt-4 font-semibold text-lg">{t('analysis.readyMessage')}</p>
                                <p className="text-sm">{t('analysis.readyMessageDesc')}</p>
                             </div>
                        )}
                        {!isLoading && analysisResult && (
                             <div className="space-y-6">
                                <DashboardCard title={t('analysis.summaryTitle')} icon={<LightBulbIcon />} className="bg-nexus-dark/30">
                                    <p className="text-nexus-text-muted italic">"{analysisResult.summary}"</p>
                                </DashboardCard>
                                 <h3 className="text-lg font-semibold text-nexus-text border-b border-nexus-surface pb-2">{t('analysis.recommendations')}</h3>
                                <div className="space-y-4">
                                    {analysisResult.suggestions.length > 0 ? (
                                        analysisResult.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} onExecute={handleExecuteSuggestion} />)
                                    ) : (
                                        <p className="text-nexus-text-muted text-center py-4">{t('analysis.noSuggestions')}</p>
                                    )}
                                </div>
                             </div>
                        )}
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default AnalysisLab;