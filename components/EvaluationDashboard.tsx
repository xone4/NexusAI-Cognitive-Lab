import React from 'react';
import { useTranslation } from 'react-i18next';
import type { EvaluationState } from '../types';
import DashboardCard from './DashboardCard';
// FIX: Replaced local icon definition with standardized import from Icons.tsx to ensure consistency.
import { ChartPieIcon, BrainCircuitIcon, SparklesIcon, RefreshIcon, CheckCircleIcon, LightBulbIcon, WrenchScrewdriverIcon } from './Icons';

interface EvaluationDashboardProps {
    evaluationState: EvaluationState;
    onRunEvaluation: () => void;
}

const MetricDisplay: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
}> = ({ icon, label, value, description }) => (
    <DashboardCard title={label} icon={icon} isCollapsible={false} className="text-center">
        <p className="text-5xl font-bold text-nexus-primary">{value}</p>
        <p className="text-sm text-nexus-text-muted mt-2">{description}</p>
    </DashboardCard>
);

const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ evaluationState, onRunEvaluation }) => {
    const { t } = useTranslation();
    const { isEvaluating, lastRun, metrics } = evaluationState;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <DashboardCard title={t('evaluation.title')} icon={<ChartPieIcon />}>
                <div className="text-center p-4">
                    <p className="text-nexus-text-muted mb-6 max-w-3xl mx-auto">{t('evaluation.description')}</p>
                    <button
                        onClick={onRunEvaluation}
                        disabled={isEvaluating}
                        className="flex items-center justify-center gap-3 mx-auto bg-nexus-primary text-nexus-dark font-bold py-3 px-8 rounded-full border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
                    >
                        <BrainCircuitIcon className={`w-6 h-6 ${isEvaluating ? 'animate-spin' : ''}`} />
                        {isEvaluating ? t('evaluation.running') : t('evaluation.run')}
                    </button>
                </div>
            </DashboardCard>

            {isEvaluating ? (
                <div className="flex flex-col items-center justify-center text-center text-nexus-text-muted p-8">
                    <div className="w-16 h-16 mb-4 relative"><div className="nexus-loader"></div></div>
                    <p className="font-semibold text-lg animate-pulse">{t('evaluation.running')}</p>
                </div>
            ) : metrics ? (
                <DashboardCard title={t('evaluation.resultsTitle')} icon={<SparklesIcon />}>
                    <div className="p-4">
                        <p className="text-sm text-center text-nexus-text-muted mb-6">
                            {t('evaluation.lastRun', { date: new Date(lastRun!).toLocaleString() })}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <MetricDisplay
                                icon={<CheckCircleIcon className="w-12 h-12 text-green-400"/>}
                                label={t('evaluation.inferenceAccuracy')}
                                value={`${metrics.inferenceAccuracy.toFixed(1)}%`}
                                description={t('evaluation.inferenceAccuracyDesc')}
                            />
                             <MetricDisplay
                                icon={<LightBulbIcon className="w-12 h-12 text-yellow-400"/>}
                                label={t('evaluation.planningQuality')}
                                value={`${metrics.planningQuality.toFixed(1)}%`}
                                description={t('evaluation.planningQualityDesc')}
                            />
                            <MetricDisplay
                                icon={<RefreshIcon className="w-12 h-12 text-blue-400"/>}
                                label={t('evaluation.selfCorrection')}
                                value={`${metrics.selfCorrectionRate.toFixed(1)}%`}
                                description={t('evaluation.selfCorrectionDesc')}
                            />
                             <MetricDisplay
                                icon={<WrenchScrewdriverIcon className="w-12 h-12 text-purple-400"/>}
                                label={t('evaluation.toolInnovation')}
                                value={`${metrics.toolInnovationScore.toFixed(1)}%`}
                                description={t('evaluation.toolInnovationDesc')}
                            />
                            <MetricDisplay
                                icon={<SparklesIcon className="w-12 h-12 text-pink-400"/>}
                                label={t('evaluation.flowEfficiency')}
                                value={metrics.flowEfficiency.toFixed(2)}
                                description={t('evaluation.flowEfficiencyDesc')}
                            />
                           
                        </div>
                    </div>
                </DashboardCard>
            ) : (
                 <div className="text-center text-nexus-text-muted py-10">
                    <p>{t('evaluation.notRun')}</p>
                </div>
            )}
        </div>
    );
};

export default EvaluationDashboard;