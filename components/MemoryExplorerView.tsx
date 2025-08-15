import React, { useState, useMemo } from 'react';
import type { ChatMessage, PrimaryEmotion, EmotionInstance } from '../types';
import DashboardCard from './DashboardCard';
import { BookOpenIcon, EyeIcon, TrashIcon, LightBulbIcon } from './Icons';

interface MemoryExplorerViewProps {
    archivedTraces: ChatMessage[];
    onViewTrace: (trace: ChatMessage) => void;
    onDeleteTrace: (traceId: string) => void;
}

const emotions: { name: PrimaryEmotion; color: string }[] = [
    { name: 'joy', color: 'bg-yellow-400' }, { name: 'trust', color: 'bg-green-400' },
    { name: 'fear', color: 'bg-teal-400' }, { name: 'surprise', color: 'bg-sky-400' },
    { name: 'sadness', color: 'bg-blue-500' }, { name: 'disgust', color: 'bg-purple-500' },
    { name: 'anger', color: 'bg-red-500' }, { name: 'anticipation', color: 'bg-orange-400' },
];
const emotionColorMap = new Map(emotions.map(e => [e.name, e.color]));

const MemoryCard: React.FC<Pick<MemoryExplorerViewProps, 'onViewTrace' | 'onDeleteTrace'> & { trace: ChatMessage }> = ({ trace, onViewTrace, onDeleteTrace }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to permanently delete this memory?')) {
            onDeleteTrace(trace.id);
        }
    };

    const topEmotion = useMemo(() => {
        if (!trace.emotionTags || trace.emotionTags.length === 0) return null;
        return trace.emotionTags.reduce((max, current) => current.intensity > max.intensity ? current : max, trace.emotionTags[0]);
    }, [trace.emotionTags]);

    return (
        <div className="bg-nexus-surface/50 p-4 rounded-lg border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-primary/70 animate-spawn-in group">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow min-w-0">
                    <p className="text-xs text-nexus-text-muted">{new Date(trace.archivedAt!).toLocaleString()}</p>
                    <h4 className="font-semibold text-nexus-text mt-1 truncate">
                        Query: <span className="text-nexus-primary font-normal italic">"{trace.userQuery}"</span>
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                        {trace.salience !== undefined && (
                            <div className="flex-shrink-0">
                                <label className="text-xs text-nexus-text-muted">Salience</label>
                                <div className="w-24 h-2 bg-nexus-dark/50 rounded-full mt-1"><div className="h-2 bg-nexus-accent rounded-full" style={{ width: `${trace.salience * 100}%` }} /></div>
                            </div>
                        )}
                        {topEmotion && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-nexus-text-muted">Mood:</span>
                                <span className="font-semibold text-nexus-secondary">{trace.affectiveStateSnapshot?.mood || 'Unknown'}</span>
                                <span className={`w-3 h-3 rounded-full ${emotionColorMap.get(topEmotion.type)}`} title={`Dominant Emotion: ${topEmotion.type}`} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => onViewTrace(trace)} className="flex items-center gap-2 text-sm bg-nexus-primary/20 text-nexus-primary font-bold py-1.5 px-3 rounded-md border border-nexus-primary/50 hover:bg-nexus-primary/40 hover:text-white"><EyeIcon className="w-4 h-4"/> View</button>
                    <button onClick={handleDelete} className="text-red-500/70 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/20" title="Delete Trace"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    );
};

const MemoryExplorerView: React.FC<MemoryExplorerViewProps> = ({ archivedTraces, onViewTrace, onDeleteTrace }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmotions, setSelectedEmotions] = useState<PrimaryEmotion[]>([]);
    const [salienceFilter, setSalienceFilter] = useState(0);

    const handleEmotionToggle = (emotion: PrimaryEmotion) => {
        setSelectedEmotions(prev => prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]);
    };

    const filteredTraces = useMemo(() => {
        return archivedTraces
            .filter(trace => {
                const searchMatch = !searchTerm ||
                    trace.userQuery?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trace.text?.toLowerCase().includes(searchTerm.toLowerCase());
                const emotionMatch = selectedEmotions.length === 0 ||
                    selectedEmotions.some(se => trace.emotionTags?.some(et => et.type === se));
                const salienceMatch = !trace.salience || trace.salience >= salienceFilter;
                return searchMatch && emotionMatch && salienceMatch;
            })
            .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
    }, [archivedTraces, searchTerm, selectedEmotions, salienceFilter]);

    return (
        <div className="flex flex-col h-full gap-6">
            <DashboardCard title="Memory Filters" icon={<LightBulbIcon />} defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search-memory" className="text-sm font-medium text-nexus-text-muted">Search by Keyword</label>
                        <input id="search-memory" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search queries or responses..." className="w-full mt-1 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-nexus-text-muted">Filter by Emotion</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {emotions.map(({ name, color }) => (
                                <button key={name} onClick={() => handleEmotionToggle(name)} className={`px-3 py-1 text-xs rounded-full capitalize transition-all duration-200 border ${selectedEmotions.includes(name) ? `${color} text-nexus-dark font-bold border-transparent` : 'bg-nexus-dark/50 text-nexus-text-muted border-nexus-surface hover:border-nexus-primary'}`}>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="salience-filter" className="text-sm font-medium text-nexus-text-muted">Minimum Salience: {salienceFilter.toFixed(2)}</label>
                        <input id="salience-filter" type="range" min="0" max="1" step="0.05" value={salienceFilter} onChange={e => setSalienceFilter(parseFloat(e.target.value))} className="w-full h-2 bg-nexus-dark rounded-lg appearance-none cursor-pointer mt-2" />
                    </div>
                </div>
            </DashboardCard>
            
            <DashboardCard title="Retrieved Memories" icon={<BookOpenIcon />} fullHeight className="flex-grow">
                 <div className="h-full overflow-y-auto pr-2">
                    {filteredTraces.length > 0 ? (
                        <div className="space-y-4">
                            {filteredTraces.map(trace => <MemoryCard key={trace.id} trace={trace} onViewTrace={onViewTrace} onDeleteTrace={onDeleteTrace} />)}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                            <BookOpenIcon className="w-16 h-16" />
                            <p className="mt-4 font-semibold text-lg">No Memories Found</p>
                            <p className="text-sm">Try adjusting your filters or archiving new cognitive traces.</p>
                        </div>
                    )}
                 </div>
            </DashboardCard>
        </div>
    );
};

export default MemoryExplorerView;