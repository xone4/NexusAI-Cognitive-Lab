import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage, PrimaryEmotion } from '../types';
import DashboardCard from './DashboardCard';
import { BookOpenIcon, EyeIcon, TrashIcon, MagnifyingGlassIcon, RefreshIcon, TrajectoryIcon, XCircleIcon } from './Icons';
import { nexusAIService } from '../services/nexusAIService';

interface MemoryExplorerViewProps {
    archivedTraces: ChatMessage[];
    onViewTrace: (trace: ChatMessage) => void;
    onDeleteTrace: (traceId: string) => void;
    onFindSimilarProcesses: (traceId: string) => Promise<ChatMessage[]>;
}

const emotions: { name: PrimaryEmotion; color: string }[] = [
    { name: 'joy', color: 'bg-yellow-400' }, { name: 'trust', color: 'bg-green-400' },
    { name: 'fear', color: 'bg-teal-400' }, { name: 'surprise', color: 'bg-sky-400' },
    { name: 'sadness', color: 'bg-blue-500' }, { name: 'disgust', color: 'bg-purple-500' },
    { name: 'anger', color: 'bg-red-500' }, { name: 'anticipation', color: 'bg-orange-400' },
];
const emotionColorMap = new Map(emotions.map(e => [e.name, e.color]));

const MemoryCard: React.FC<{
    trace: ChatMessage;
    onViewTrace: (trace: ChatMessage) => void;
    onDeleteTrace: (traceId: string) => void;
    onFindSimilar: (trace: ChatMessage) => void;
}> = ({ trace, onViewTrace, onDeleteTrace, onFindSimilar }) => {
    const { t } = useTranslation();
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t('memory.deleteConfirm'))) {
            onDeleteTrace(trace.id);
        }
    };

    const topEmotion = useMemo(() => {
        if (!trace.emotionTags || trace.emotionTags.length === 0) return null;
        return trace.emotionTags.reduce((max, current) => current.intensity > max.intensity ? current : max, trace.emotionTags[0]);
    }, [trace.emotionTags]);

    return (
        <div className="bg-nexus-surface/50 p-4 rounded-xl border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in group">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-nexus-text-muted">{new Date(trace.archivedAt!).toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        {trace.similarity !== undefined && (
                            <span className="text-xs font-bold text-nexus-primary bg-nexus-primary/10 px-2 py-0.5 rounded-full">
                               {(trace.similarity * 100).toFixed(0)}% {t('memory.match')}
                            </span>
                        )}
                        {trace.trajectorySimilarity !== undefined && (
                            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                                {(trace.trajectorySimilarity * 100).toFixed(0)}% {t('memory.pathMatch')}
                            </span>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-nexus-text mt-1 truncate">
                        {t('memory.query')}: <span className="text-nexus-primary font-normal italic">"{trace.userQuery}"</span>
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                        {trace.salience !== undefined && (
                            <div className="flex-shrink-0">
                                <label className="text-xs text-nexus-text-muted">{t('memory.salience')}</label>
                                <div className="w-24 h-2 bg-nexus-dark/50 rounded-full mt-1"><div className="h-2 bg-nexus-accent rounded-full" style={{ width: `${trace.salience * 100}%` }} /></div>
                            </div>
                        )}
                        {topEmotion && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-nexus-text-muted">{t('memory.mood')}:</span>
                                <span className="font-semibold text-nexus-secondary">{trace.affectiveStateSnapshot?.mood || t('memory.unknown')}</span>
                                <span className={`w-3 h-3 rounded-full ${emotionColorMap.get(topEmotion.type)}`} title={t('memory.dominantEmotion', { emotion: topEmotion.type })} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onFindSimilar(trace); }} disabled={!trace.cognitiveTrajectory} className="flex items-center gap-2 text-sm bg-purple-500/20 text-purple-400 font-bold py-1.5 px-3 rounded-full border border-purple-500/50 hover:bg-purple-500/40 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" title={t('memory.findSimilar')}><TrajectoryIcon className="w-4 h-4"/> {t('memory.findSimilar')}</button>
                        <button onClick={() => onViewTrace(trace)} className="flex items-center gap-2 text-sm bg-nexus-primary/20 text-nexus-primary font-bold py-1.5 px-3 rounded-full border border-nexus-primary/50 hover:bg-nexus-primary/40 hover:text-white"><EyeIcon className="w-4 h-4"/> {t('memory.view')}</button>
                    </div>
                    <button onClick={handleDelete} className="text-red-500/70 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/20" title={t('behaviors.deleteBehavior')}><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    );
};

const MemoryExplorerView: React.FC<MemoryExplorerViewProps> = ({ archivedTraces, onViewTrace, onDeleteTrace, onFindSimilarProcesses }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [displayedTraces, setDisplayedTraces] = useState<ChatMessage[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<PrimaryEmotion[]>([]);
    const [salienceFilter, setSalienceFilter] = useState(0);
    const [processSearchReference, setProcessSearchReference] = useState<ChatMessage | null>(null);

    const handleEmotionToggle = (emotion: PrimaryEmotion) => {
        setSelectedEmotions(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
        setProcessSearchReference(null);
        setSearchTerm('');
    };
    
    const handleSalienceChange = (value: number) => {
        setSalienceFilter(value);
        setProcessSearchReference(null);
        setSearchTerm('');
    };

    const handleFindSimilar = async (referenceTrace: ChatMessage) => {
        setIsSearching(true);
        setProcessSearchReference(referenceTrace);
        setSearchTerm('');
        const results = await onFindSimilarProcesses(referenceTrace.id);
        setDisplayedTraces(results);
        setIsSearching(false);
    };

    const handleClearProcessSearch = () => {
        setProcessSearchReference(null);
    };

    useEffect(() => {
        // If a process search is active, don't run this effect
        if (processSearchReference) return;

        // Semantic search logic
        if (searchTerm.trim()) {
            const handler = setTimeout(async () => {
                setIsSearching(true);
                const results = await nexusAIService.semanticSearchInMemory(searchTerm);
                setDisplayedTraces(results);
                setIsSearching(false);
            }, 500); // 500ms debounce

            return () => clearTimeout(handler);
        }
        
        // Default local filtering logic
        const locallyFilteredTraces = archivedTraces
            .filter(trace => {
                const emotionMatch = selectedEmotions.length === 0 ||
                    selectedEmotions.some(se => trace.emotionTags?.some(et => et.type === se));
                const salienceMatch = !trace.salience || trace.salience >= salienceFilter;
                return emotionMatch && salienceMatch;
            })
            .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));

        setDisplayedTraces(locallyFilteredTraces);
        
    }, [searchTerm, archivedTraces, selectedEmotions, salienceFilter, processSearchReference]);
    
    const isSearchActive = searchTerm.trim().length > 0 || !!processSearchReference;

    return (
        <div className="flex flex-col h-full gap-6">
            <DashboardCard title={t('memory.filtersTitle')} icon={<MagnifyingGlassIcon />} defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search-memory" className="text-sm font-medium text-nexus-text-muted">{t('memory.searchKeyword')}</label>
                        <input id="search-memory" type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setProcessSearchReference(null); }} placeholder={t('memory.searchPlaceholder')} className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary" />
                    </div>
                    <div className={isSearchActive ? 'opacity-50' : ''}>
                        <label className="text-sm font-medium text-nexus-text-muted">{t('memory.filterEmotion')}</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {emotions.map(({ name, color }) => (
                                <button key={name} onClick={() => handleEmotionToggle(name)} disabled={isSearchActive} className={`px-3 py-1 text-xs rounded-full capitalize transition-all duration-200 border ${selectedEmotions.includes(name) ? `${color} text-nexus-dark font-bold border-transparent` : 'bg-nexus-dark/50 text-nexus-text-muted border-nexus-surface hover:border-nexus-primary'} disabled:cursor-not-allowed`}>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={isSearchActive ? 'opacity-50' : ''}>
                        <label htmlFor="salience-filter" className="text-sm font-medium text-nexus-text-muted">{t('memory.minSalience')}: {salienceFilter.toFixed(2)}</label>
                        <input id="salience-filter" type="range" min="0" max="1" step="0.05" value={salienceFilter} onChange={e => handleSalienceChange(parseFloat(e.target.value))} disabled={isSearchActive} className="w-full h-2 bg-nexus-dark rounded-full appearance-none cursor-pointer mt-2 disabled:cursor-not-allowed" />
                    </div>
                     {searchTerm.trim() && (
                        <p className="md:col-span-2 text-xs text-center text-nexus-accent">{t('memory.semanticSearchActive')}</p>
                    )}
                </div>
            </DashboardCard>
            
            <DashboardCard title={t('memory.retrievedMemories')} icon={<BookOpenIcon />} fullHeight className="flex-grow">
                 <div className="h-full overflow-y-auto pr-2">
                    {processSearchReference && (
                        <div className="bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm p-3 rounded-xl mb-4 flex justify-between items-center">
                            <p className="flex-grow">{t('memory.processSearchActive')}</p>
                            <button onClick={handleClearProcessSearch} className="flex items-center gap-1 text-xs font-semibold hover:text-white">
                                <XCircleIcon className="w-4 h-4" /> {t('memory.clearSearch')}
                            </button>
                        </div>
                    )}
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                            <RefreshIcon className="w-12 h-12 animate-spin text-nexus-primary" />
                            <p className="mt-4 font-semibold text-lg">{t('memory.searching')}</p>
                        </div>
                    ) : displayedTraces.length > 0 ? (
                        <div className="space-y-4">
                            {displayedTraces.map(trace => <MemoryCard key={trace.id} trace={trace} onViewTrace={onViewTrace} onDeleteTrace={onDeleteTrace} onFindSimilar={handleFindSimilar} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                            <BookOpenIcon className="w-16 h-16" />
                            <p className="mt-4 font-semibold text-lg">{t('memory.noMemoriesFound')}</p>
                            <p className="text-sm">{t('memory.noMemoriesHint')}</p>
                        </div>
                    )}
                 </div>
            </DashboardCard>
        </div>
    );
};

export default MemoryExplorerView;