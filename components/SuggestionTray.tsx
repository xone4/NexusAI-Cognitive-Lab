import React, { useState, useEffect, useCallback, memo } from 'react';
import type { CognitiveProcess, SuggestionProfile } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import { RefreshIcon, ChatBubbleBottomCenterTextIcon } from './Icons';

interface SuggestionTrayProps {
  process: CognitiveProcess | null;
  permissions: { canSubmitQuery: boolean; };
  onSubmitQuery: (query: string) => void;
}

const SuggestionTray: React.FC<SuggestionTrayProps> = ({ process, permissions, onSubmitQuery }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionProfile, setSuggestionProfile] = useState<SuggestionProfile>('medium');

  const hasHistory = process && process.history.length > 0;
  const isVisible = permissions.canSubmitQuery && !hasHistory;

  const fetchSuggestions = useCallback((profile: SuggestionProfile) => {
    setLoadingSuggestions(true);
    nexusAIService.getSuggestedQueries(profile)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false));
  }, []);

  useEffect(() => {
    // Fetch suggestions only if the component is visible and we don't have any loaded
    if (isVisible && suggestions.length === 0) {
      fetchSuggestions(suggestionProfile);
    }
  }, [isVisible, suggestionProfile, fetchSuggestions, suggestions.length]);

  const handleSuggestionProfileChange = (profile: SuggestionProfile) => {
    setSuggestionProfile(profile);
    fetchSuggestions(profile);
  };
  
  const handleRegenerate = () => {
    nexusAIService.clearSuggestionCache();
    fetchSuggestions(suggestionProfile);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSubmitQuery(suggestion);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-nexus-bg to-transparent">
        <div className="bg-nexus-surface/80 backdrop-blur-md rounded-lg p-3 border border-nexus-surface shadow-lg animate-spawn-in">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                    Query Suggestions
                </h4>
                <div className="flex items-center gap-1">
                    {(['short', 'medium', 'long'] as SuggestionProfile[]).map(p => (
                         <button key={p} type="button" onClick={() => handleSuggestionProfileChange(p)} className={`px-2 py-0.5 text-xs rounded-full transition-colors ${suggestionProfile === p ? 'bg-nexus-primary text-nexus-dark font-bold' : 'bg-nexus-dark/50 hover:bg-nexus-surface'}`}>
                           {p.charAt(0).toUpperCase() + p.slice(1)}
                         </button>
                    ))}
                    <button type="button" onClick={handleRegenerate} className="p-1 text-nexus-text-muted hover:text-nexus-primary" title="Regenerate Suggestions">
                        <RefreshIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {loadingSuggestions ? (
               <div className="text-sm text-center py-4 text-nexus-text-muted animate-pulse">Generating creative starting points...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-sm bg-nexus-surface px-3 py-1.5 rounded-md text-nexus-text-muted hover:bg-nexus-primary hover:text-nexus-dark transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
        </div>
    </div>
  );
};

export default memo(SuggestionTray);
