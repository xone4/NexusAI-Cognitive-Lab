import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { nexusAIService, VideoGenerationState } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { FilmIcon, DownloadIcon, CheckCircleIcon, XCircleIcon } from './Icons';

const ModalitiesLab: React.FC = () => {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [generationState, setGenerationState] = useState<VideoGenerationState>({
        isGenerating: false,
        statusMessage: '',
        videoUrl: null,
        error: null,
    });
    const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const keySelected = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(keySelected);
        } else {
            // Fallback for environments where aistudio is not available
            setHasApiKey(true); 
            console.warn('window.aistudio.hasSelectedApiKey not found. Assuming API key is present.');
        }
    }, []);

    useEffect(() => {
        checkApiKey();
        
        const subscription = nexusAIService.subscribeToVideoGeneration((state) => {
            setGenerationState(state);
            // If we get a specific API key error, prompt the user to select one again.
            if (state.error && state.error.includes("Requested entity was not found")) {
                setHasApiKey(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [checkApiKey]);
    
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Optimistically assume key is selected to show the main UI immediately.
            setHasApiKey(true);
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        nexusAIService.generateVideo({
            prompt,
            config: { aspectRatio, resolution }
        });
    };

    const { isGenerating, statusMessage, videoUrl, error } = generationState;

    if (hasApiKey === null) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-16 h-16 relative"><div className="nexus-loader"></div></div>
            </div>
        );
    }

    if (!hasApiKey) {
        return (
            <DashboardCard title={t('modalitiesLab.apiKeyRequired')} icon={<FilmIcon/>}>
                <div className="text-center p-4">
                    <p className="text-nexus-text-muted mb-4">{t('modalitiesLab.apiKeyDescription')}</p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-nexus-primary hover:underline mb-6 block">
                        {t('modalitiesLab.billingInfo')}
                    </a>
                    <button onClick={handleSelectKey} className="bg-nexus-primary text-nexus-dark font-bold py-2 px-6 rounded-full hover:bg-nexus-secondary">
                        {t('modalitiesLab.selectApiKey')}
                    </button>
                </div>
            </DashboardCard>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <DashboardCard title={t('modalitiesLab.title')} icon={<FilmIcon />}>
                <div className="space-y-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('modalitiesLab.promptPlaceholder')}
                        disabled={isGenerating}
                        className="w-full h-24 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-y"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-nexus-text-muted">{t('modalitiesLab.aspectRatio')}</label>
                            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} disabled={isGenerating} className="w-full mt-1 config-input">
                                <option value="16:9">{t('modalitiesLab.landscape')}</option>
                                <option value="9:16">{t('modalitiesLab.portrait')}</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-nexus-text-muted">{t('modalitiesLab.resolution')}</label>
                            <select value={resolution} onChange={e => setResolution(e.target.value as '720p' | '1080p')} disabled={isGenerating} className="w-full mt-1 config-input">
                                <option value="720p">720p</option>
                                <option value="1080p">1080p</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full flex items-center justify-center gap-2 bg-nexus-primary/90 text-nexus-dark font-bold py-3 px-4 rounded-full border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <FilmIcon className="w-5 h-5"/>
                        {isGenerating ? t('modalitiesLab.generating') : t('modalitiesLab.generate')}
                    </button>
                </div>
            </DashboardCard>
            
            {isGenerating && (
                <DashboardCard title={t('modalitiesLab.generationStatus')} icon={<div className="w-5 h-5 relative"><div className="nexus-loader"></div></div>}>
                    <div className="text-center p-4">
                        <p className="text-lg font-semibold text-nexus-text animate-pulse">{statusMessage}</p>
                        <p className="text-sm text-nexus-text-muted mt-2">{t('modalitiesLab.patience')}</p>
                    </div>
                </DashboardCard>
            )}

            {error && (
                <DashboardCard title={t('modalitiesLab.errorTitle')} icon={<XCircleIcon/>}>
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl">
                        <p className="font-bold">{t('modalitiesLab.errorOccurred')}</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </DashboardCard>
            )}

            {videoUrl && (
                <DashboardCard title={t('modalitiesLab.result')} icon={<CheckCircleIcon/>}>
                    <div className="space-y-4">
                        <video src={videoUrl} controls className="w-full rounded-xl" />
                        <a href={videoUrl} download="nexus-ai-video.mp4" className="w-full flex items-center justify-center gap-2 bg-green-500/20 text-green-400 font-bold py-3 px-4 rounded-full border border-green-500/50 hover:bg-green-500/40 hover:text-white transition-all">
                            <DownloadIcon className="w-5 h-5"/>
                            {t('modalitiesLab.download')}
                        </a>
                    </div>
                </DashboardCard>
            )}

             <style>{`
                .config-input { background-color: #0a0f1f; color: #e0e0e0; border: 1px solid #18213a; border-radius: 0.75rem; padding: 0.75rem; }
            `}</style>
        </div>
    );
};

export default ModalitiesLab;