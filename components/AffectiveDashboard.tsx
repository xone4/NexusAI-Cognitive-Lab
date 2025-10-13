import React, { memo } from 'react';
import type { AffectiveState, PrimaryEmotion, Personality } from '../types';
import { LightBulbIcon } from './Icons';

interface AffectiveDashboardProps {
  activeState: AffectiveState | null;
  personality: Personality;
  onInduceEmotion: (emotion: PrimaryEmotion, intensity: number) => void;
  isInteractionDisabled: boolean;
}

const emotions: { name: PrimaryEmotion; color: string; angle: number }[] = [
    { name: 'joy', color: '#facc15', angle: 0 },
    { name: 'trust', color: '#4ade80', angle: 45 },
    { name: 'fear', color: '#2dd4bf', angle: 90 },
    { name: 'surprise', color: '#60a5fa', angle: 135 },
    { name: 'sadness', color: '#3b82f6', angle: 180 },
    { name: 'disgust', color: '#a855f7', angle: 225 },
    { name: 'anger', color: '#f43f5e', angle: 270 },
    { name: 'anticipation', color: '#f97316', angle: 315 },
];

const EmotionWheel: React.FC<AffectiveDashboardProps> = ({ activeState, personality, onInduceEmotion, isInteractionDisabled }) => {
    const getIntensity = (emotion: PrimaryEmotion) => {
        return activeState?.dominantEmotions.find(e => e.type === emotion)?.intensity || 0;
    };
    
    const isFeelingType = personality.decisionMaking === 'FEELING';
    const wheelSizeClass = isFeelingType ? "w-24 h-24" : "w-20 h-20";
    const iconSizeClass = isFeelingType ? "w-8 h-8" : "w-6 h-6";

    return (
        <div className={`relative transition-all duration-300 ${wheelSizeClass}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <g transform="translate(50,50)">
                    {emotions.map(({ name, color, angle }) => {
                        const intensity = getIntensity(name);
                        const pathData = `M 0 0 L ${45 * Math.cos((angle - 22.5) * Math.PI / 180)} ${45 * Math.sin((angle - 22.5) * Math.PI / 180)} A 45 45 0 0 1 ${45 * Math.cos((angle + 22.5) * Math.PI / 180)} ${45 * Math.sin((angle + 22.5) * Math.PI / 180)} Z`;
                        return (
                            <path
                                key={name}
                                d={pathData}
                                fill={color}
                                fillOpacity={0.2 + intensity * 0.8}
                                stroke="#18213a"
                                strokeWidth="1.5"
                                onClick={() => !isInteractionDisabled && onInduceEmotion(name, 0.7)}
                                className={`transition-all duration-300 ${isInteractionDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:stroke-white'}`}
                            >
                                <title>Induce {name}</title>
                            </path>
                        );
                    })}
                     <circle cx="0" cy="0" r="15" fill="#18213a" />
                </g>
            </svg>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <LightBulbIcon className={`text-nexus-primary ${iconSizeClass}`} />
            </div>
        </div>
    );
};

const AffectiveDashboard: React.FC<AffectiveDashboardProps> = (props) => {
    const { activeState, isInteractionDisabled } = props;
    
    if (isInteractionDisabled) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted p-4">
                <p className="font-semibold text-nexus-accent">Affective Controls Locked</p>
                <p className="text-xs mt-1">Controls are disabled during cognitive processing.</p>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-around h-full p-2">
            <EmotionWheel {...props} />
            <div className="text-center">
                <p className="text-xs text-nexus-text-muted uppercase">Current Mood</p>
                <p className="text-lg font-bold text-nexus-secondary">{activeState?.mood || 'Neutral'}</p>
            </div>
            <div className="w-1/3 text-xs space-y-1">
                {activeState ? activeState.dominantEmotions.sort((a,b) => b.intensity - a.intensity).slice(0, 3).map(e => (
                    <div key={e.type} className="flex items-center justify-between gap-2">
                        <span className="text-nexus-text-muted capitalize flex-shrink-0">{e.type}</span>
                        <div className="w-full bg-nexus-dark rounded-full h-1.5">
                             <div 
                                className="bg-nexus-primary h-1.5 rounded-full" 
                                style={{ width: `${e.intensity * 100}%` }}
                            />
                        </div>
                    </div>
                )) : <p className="text-xs text-nexus-text-muted text-center">State is dormant.</p>}
            </div>
        </div>
    );
};

export default memo(AffectiveDashboard);