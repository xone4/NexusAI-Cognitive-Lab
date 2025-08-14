import React, { memo } from 'react';
import { ProactiveInsight, Toolchain, MentalTool } from '../types';
import { LightBulbIcon, ArrowRightIcon, LinkIcon } from './Icons';
import { nexusAIService } from '../services/nexusAIService';

interface InsightCardProps {
    insight: ProactiveInsight;
    toolsMap: Map<string, MentalTool>;
    onUse: (toolchain: Toolchain) => void;
}

const InsightCard: React.FC<InsightCardProps> = memo(({ insight, toolsMap, onUse }) => {
    return (
        <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-surface/50 transition-all duration-300 hover:border-nexus-accent/70 animate-spawn-in">
            <div className="flex items-start gap-3">
                <LightBulbIcon className="w-8 h-8 text-nexus-accent flex-shrink-0 mt-1" />
                <div>
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-nexus-text">{insight.title}</h4>
                        <span className="text-xs font-mono text-nexus-accent bg-nexus-accent/10 px-2 py-0.5 rounded-full">
                            Score: {insight.relevanceScore.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-sm text-nexus-text-muted italic mt-1">"{insight.summary}"</p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-nexus-surface/30">
                <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Suggested Workflow
                </h5>
                <div className="flex flex-wrap items-center gap-2 text-sm bg-nexus-dark/50 p-2 rounded-md">
                   {insight.actionableToolchain.toolIds.map((tid, i, arr) => (
                       <React.Fragment key={`${tid}-${i}`}>
                           <span className="font-mono">{toolsMap.get(tid)?.name || 'Unknown'}</span>
                           {i < arr.length - 1 && <ArrowRightIcon className="w-4 h-4 text-nexus-secondary" />}
                       </React.Fragment>
                   ))}
                </div>
                <div className="flex justify-end mt-3">
                    <button 
                        onClick={() => onUse(insight.actionableToolchain)}
                        className="text-xs bg-nexus-accent/20 text-nexus-accent font-bold py-1 px-3 rounded-md border border-nexus-accent/50 hover:bg-nexus-accent/40 hover:text-white transition-all">
                        Promote to Toolchain
                    </button>
                </div>
            </div>
        </div>
    );
});
InsightCard.displayName = "InsightCard";

export default InsightCard;
