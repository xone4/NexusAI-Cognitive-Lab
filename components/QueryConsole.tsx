import React, { useState, useEffect, memo, useCallback } from 'react';
import type { CognitiveProcess, SuggestionProfile } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import { BrainCircuitIcon, PlusCircleIcon, XCircleIcon, RefreshIcon } from './Icons';

interface QueryConsoleProps {
  onSubmit: (query: string) => void;
  onCancel: () => void;
  onNewChat: () => void;
  process: CognitiveProcess | null;
}

const QueryConsole: React.FC<QueryConsoleProps> = ({ onSubmit, onCancel, onNewChat, process }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionProfile, setSuggestionProfile] = useState<SuggestionProfile>('medium');

  const isThinking = process?.state !== 'Idle' && process?.state !== 'Done' && process?.state !== 'Cancelled';
  const isAwaitingInput = process?.state === 'AwaitingExecution';
  const hasHistory = process && process.history.length > 0;

  const fetchSuggestions = useCallback(() => {
    setLoadingSuggestions(true);
    nexusAIService.getSuggestedQueries(suggestionProfile)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false));
  }, [suggestionProfile]);

  useEffect(() => {
    // Only fetch suggestions if the chat is empty
    if (!hasHistory) {
      fetchSuggestions();
    }
  }, [hasHistory, fetchSuggestions]);
  
  const handleRegenerate = () => {
      nexusAIService.clearSuggestionCache();
      fetchSuggestions();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isThinking) {
      onSubmit(query.trim());
      setQuery('');
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Automatically submit suggestion for better UX
    onSubmit(suggestion);
    setQuery('');
  }
  
  const getButtonText = () => {
    if (!isThinking) return 'Send Message';
    switch (process?.state) {
        case 'Receiving': return 'Receiving...';
        case 'Planning': return 'Planning...';
        case 'AwaitingExecution': return 'Awaiting Plan Approval...';
        case 'Executing': return 'Executing...';
        case 'Synthesizing': return 'Synthesizing...';
        default: return 'Processing...';
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3 h-full">
      <div className="flex-grow">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAwaitingInput ? "Review and approve the plan below..." : (hasHistory ? "Send a follow-up message..." : "Enter a high-level query...")}
            disabled={isThinking}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full h-full p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm disabled:cursor-not-allowed"
          />
      </div>
      <div className="flex items-center space-x-2">
        {!isThinking && hasHistory && (
             <button
                type="button"
                onClick={onNewChat}
                className="flex-shrink-0 bg-blue-500/20 text-blue-400 font-bold py-2 px-3 rounded-md border border-blue-500/50
                           hover:bg-blue-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Start New Chat"
            >
                <PlusCircleIcon className="w-5 h-5" />
            </button>
        )}
        <button
          type="submit"
          disabled={isThinking || !query.trim()}
          className="flex-grow bg-nexus-primary text-nexus-dark font-bold py-2 px-4 rounded-md border border-nexus-primary/80
                    hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary
                    disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
        {isThinking && !isAwaitingInput && (
            <button
                type="button"
                onClick={onCancel}
                className="flex-shrink-0 bg-red-500/80 text-white font-bold py-2 px-3 rounded-md border border-red-500
                           hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Cancel Cognitive Process"
            >
                <XCircleIcon className="w-5 h-5" />
            </button>
        )}
      </div>
      
      {!isThinking && !hasHistory && (
        <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider flex items-center">
                  <BrainCircuitIcon className="w-4 h-4 mr-2" />
                  Query Suggestions
                </h4>
                <div className="flex items-center gap-1">
                    {(['short', 'medium', 'long'] as SuggestionProfile[]).map(p => (
                         <button key={p} type="button" onClick={() => setSuggestionProfile(p)} className={`px-2 py-0.5 text-xs rounded-md transition-colors ${suggestionProfile === p ? 'bg-nexus-primary text-nexus-dark' : 'bg-nexus-surface hover:bg-nexus-surface/70'}`}>
                           {p.charAt(0).toUpperCase() + p.slice(1)}
                         </button>
                    ))}
                    <button type="button" onClick={handleRegenerate} className="p-1 text-nexus-text-muted hover:text-nexus-primary" title="Regenerate Suggestions">
                        <RefreshIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {loadingSuggestions ? (
               <div className="text-sm text-nexus-text-muted animate-pulse">Generating suggestions...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-xs bg-nexus-surface px-3 py-1.5 rounded-md text-nexus-text-muted hover:bg-nexus-primary hover:text-nexus-dark transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
        </div>
      )}
    </form>
  );
};

export default memo(QueryConsole);