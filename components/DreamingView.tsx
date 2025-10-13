import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { nexusAIService } from '../services/nexusAIService';
import type { DreamProcessUpdate, SystemDirective, ActiveView } from '../types';
import DashboardCard from './DashboardCard';
import { SparklesIcon, BrainCircuitIcon, CheckCircleIcon, LightBulbIcon } from './Icons';

interface DreamingViewProps {
    onSubmitQuery: (query: string) => void;
    setActiveView: (view: ActiveView) => void;
}

const DreamStage: React.FC<{ message: string; isComplete: boolean }> = ({ message, isComplete }) => (
    <div className="flex items-center gap-3 text-lg transition-all duration-500">
        {isComplete ? (
            <CheckCircleIcon className="w-6 h-6 text-nexus-secondary flex-shrink-0" />
        ) : (
            <div className="w-6 h-6 flex-shrink-0 relative"><div className="nexus-loader"></div></div>
        )}
        <span className={isComplete ? "text-nexus-text-muted" : "text-nexus-text animate-pulse"}>
            {message}
        </span>
    </div>
);

const DreamingView: React.FC<DreamingViewProps> = ({ onSubmitQuery, setActiveView }) => {
    const { t } = useTranslation();
    const [dreamState, setDreamState] = useState<DreamProcessUpdate>({
        stage: 'IDLE',
        message: 'Dream cycle has not been initiated.'
    });
    const [progress, setProgress] = useState<string[]>([]);
    
    const dreamSubscription = useCallback((update: DreamProcessUpdate) => {
        setDreamState(update);
        if (update.stage !== 'IDLE' && update.stage !== 'ERROR') {
            setProgress(prev => [...prev, update.message]);
        }
    }, []);

    const handleStartDream = () => {
        setProgress([]);
        nexusAIService.initiateDreamCycle();
    };

    const handleDirectiveClick = (directive: SystemDirective) => {
        const query = `Reflect on the new directive: "${directive.text}". How does this change my approach to problem-solving? Provide concrete examples.`;
        onSubmitQuery(query);
        setActiveView('dashboard');
    };
    
    useEffect(() => {
        nexusAIService.subscribeToDreamProcess(dreamSubscription);
        return () => {
            nexusAIService.unsubscribeFromDreamProcess(dreamSubscription);
        }
    }, [dreamSubscription]);

    const isDreaming = dreamState.stage !== 'IDLE' && dreamState.stage !== 'DONE' && dreamState.stage !== 'ERROR';

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <DashboardCard title={t('dreaming.title')} icon={<SparklesIcon />}>
                <div className="text-center p-4">
                    <p className="text-nexus-text-muted mb-6">{t('dreaming.description')}</p>
                    <button
                        onClick={handleStartDream}
                        disabled={isDreaming}
                        className="flex items-center justify-center gap-3 mx-auto bg-nexus-primary text-nexus-dark font-bold py-3 px-8 rounded-full border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
                    >
                        <BrainCircuitIcon className="w-6 h-6"/>
                        {isDreaming ? t('dreaming.inProgress') : t('dreaming.start')}
                    </button>
                </div>
            </DashboardCard>

            {(dreamState.stage !== 'IDLE') && (
                <DashboardCard title={t('dreaming.progressTitle')} icon={<BrainCircuitIcon />} defaultOpen>
                    <div className="p-4 space-y-4">
                        {progress.map((msg, index) => {
                            const isLast = index === progress.length - 1;
                            return <DreamStage key={index} message={msg} isComplete={!isLast || dreamState.stage === 'DONE' || dreamState.stage === 'ERROR'} />;
                        })}
                        {dreamState.stage === 'ERROR' && (
                             <p className="text-red-400 text-center font-semibold pt-4">{dreamState.message}</p>
                        )}
                    </div>
                </DashboardCard>
            )}

            {dreamState.stage === 'DONE' && dreamState.newDirectives && dreamState.newDirectives.length > 0 && (
                 <DashboardCard title={t('dreaming.resultsTitle')} icon={<LightBulbIcon />} defaultOpen>
                     <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-nexus-text">{t('dreaming.newDirectives')}</h4>
                        {dreamState.newDirectives.map(directive => (
                            <div key={directive.id} 
                                 onClick={() => handleDirectiveClick(directive)}
                                 className="bg-nexus-dark/50 p-3 rounded-xl transition-all duration-300 hover:bg-nexus-surface/50 hover:border-nexus-primary border border-transparent cursor-pointer group">
                                <p className="text-sm italic text-nexus-secondary group-hover:text-nexus-primary">"{directive.text}"</p>
                            </div>
                        ))}
                     </div>
                </DashboardCard>
            )}
        </div>
    );
};

export default DreamingView;