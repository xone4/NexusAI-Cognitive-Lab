import React, { memo } from 'react';
import type { CognitiveConstitution, RuleType } from '../types';
import { BrainCircuitIcon } from './Icons';

interface ConstitutionManagerProps {
  constitutions: CognitiveConstitution[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isThinking: boolean;
}

const RuleIcon: React.FC<{ type: RuleType }> = memo(({ type }) => {
    // A simple icon mapping for visual flair
    const iconMap: Record<RuleType, string> = {
        'MAX_REPLICAS': '📦',
        'MAX_PLAN_STEPS': '📏',
        'FORBIDDEN_TOOLS': '🚫',
        'REQUIRED_TOOLS': '🔧'
    };
    return <span className="mr-2">{iconMap[type] || '⚙️'}</span>
});
RuleIcon.displayName = 'RuleIcon';

const ConstitutionManager: React.FC<ConstitutionManagerProps> = ({ constitutions, activeId, onSelect, isThinking }) => {
  const activeConstitution = constitutions.find(c => c.id === activeId) ?? null;

  return (
    <div className="flex flex-col h-full space-y-3">
        <div>
            <label htmlFor="constitution-select" className="block text-sm font-medium text-nexus-text-muted">
                Active Cognitive Constitution
            </label>
            <select
                id="constitution-select"
                value={activeId ?? ''}
                onChange={(e) => onSelect(e.target.value)}
                disabled={isThinking}
                className="mt-1 block w-full rounded-xl border-0 py-2 pl-3 pr-10 bg-nexus-dark text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6 disabled:opacity-60"
            >
                {constitutions.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
        
        <div className="flex-grow p-3 bg-nexus-dark/50 rounded-xl border border-nexus-surface/50 overflow-y-auto">
            {activeConstitution ? (
                <div className="space-y-2">
                    <p className="text-sm text-nexus-text-muted italic">"{activeConstitution.description}"</p>
                    <div className="pt-2 border-t border-nexus-surface/30">
                        <h4 className="font-semibold text-nexus-primary text-xs uppercase tracking-wider mb-2">Active Rules:</h4>
                        {activeConstitution.rules.length > 0 ? (
                             <ul className="space-y-1.5 text-sm text-nexus-text">
                                {activeConstitution.rules.map((rule, i) => (
                                    <li key={i} className="flex items-start">
                                        <RuleIcon type={rule.type} />
                                        <span>{rule.description}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-nexus-text-muted text-center py-2">No special rules. Operating under default parameters.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-nexus-text-muted">
                    <p>Select a constitution to view its rules.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default memo(ConstitutionManager);