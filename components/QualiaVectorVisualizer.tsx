import React, { memo } from 'react';
import type { AffectiveState } from '../types';
import { LightBulbIcon } from './Icons';

interface AffectiveStateVisualizerProps {
  activeState: AffectiveState | null;
}

const AffectiveStateVisualizer: React.FC<AffectiveStateVisualizerProps> = ({ activeState }) => {
    if (!activeState) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                <LightBulbIcon className="w-10 h-10" />
                <p className="mt-2 text-sm">Affective State Dormant</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-center">
                <p className="text-xs text-nexus-text-muted uppercase">Mood at Synthesis</p>
                <p className="text-2xl font-bold text-nexus-secondary">{activeState.mood}</p>
            </div>
            <div className="w-full text-xs space-y-1 px-4">
                <p className="text-xs text-nexus-text-muted uppercase text-center mb-2">Dominant Emotions</p>
                {activeState.dominantEmotions.length > 0 ? activeState.dominantEmotions.sort((a,b) => b.intensity - a.intensity).slice(0, 4).map(e => (
                    <div key={e.type} className="flex items-center justify-between gap-2">
                        <span className="text-nexus-text-muted capitalize flex-shrink-0 w-20">{e.type}</span>
                        <div className="w-full bg-nexus-dark rounded-full h-2 border border-nexus-surface/50">
                             <div 
                                className="bg-nexus-primary h-full rounded-full transition-all duration-500" 
                                style={{ width: `${e.intensity * 100}%` }}
                            />
                        </div>
                        <span className="text-nexus-text font-mono w-8 text-right">{(e.intensity * 100).toFixed(0)}%</span>
                    </div>
                )) : <p className="text-xs text-nexus-text-muted text-center">No dominant emotions recorded.</p>}
            </div>
        </div>
    );
};

export default memo(AffectiveStateVisualizer);