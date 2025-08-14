import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import type { CognitiveProcess, SuggestionProfile } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import { BrainCircuitIcon, PlusCircleIcon, XCircleIcon, RefreshIcon, PhotographIcon } from './Icons';

interface QueryConsoleProps {
  onSubmit: (query: string, image?: { mimeType: string; data: string; }) => void;
  onCancel: () => void;
  onNewChat: () => void;
  process: CognitiveProcess | null;
  isInteractionDisabled: boolean;
  isThinking: boolean;
}

const QueryConsole: React.FC<QueryConsoleProps> = ({ onSubmit, onCancel, onNewChat, process, isInteractionDisabled, isThinking }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionProfile, setSuggestionProfile] = useState<SuggestionProfile>('medium');
  const [image, setImage] = useState<{ file: File, preview: string, data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAwaitingInput = process?.state === 'AwaitingExecution';
  const hasHistory = process && process.history.length > 0;

  const fetchSuggestions = useCallback((profile: SuggestionProfile) => {
    setLoadingSuggestions(true);
    nexusAIService.getSuggestedQueries(profile)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false));
  }, []);

  useEffect(() => {
    // Only fetch suggestions if the chat is empty AND we don't have any loaded
    if (!hasHistory && suggestions.length === 0) {
      fetchSuggestions(suggestionProfile);
    }
  }, [hasHistory, suggestionProfile, fetchSuggestions, suggestions.length]);

  const handleSuggestionProfileChange = (profile: SuggestionProfile) => {
      setSuggestionProfile(profile);
      fetchSuggestions(profile);
  }
  
  const handleRegenerate = () => {
      nexusAIService.clearSuggestionCache(); // Correct place to clear cache
      fetchSuggestions(suggestionProfile);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
          file,
          preview: URL.createObjectURL(file),
          data: base64String
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
      if (image) {
          URL.revokeObjectURL(image.preview);
      }
      setImage(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isInteractionDisabled) {
      const imageData = image ? { mimeType: image.file.type, data: image.data } : undefined;
      onSubmit(query.trim(), imageData);
      setQuery('');
      removeImage();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Automatically submit suggestion for better UX
    const imageData = image ? { mimeType: image.file.type, data: image.data } : undefined;
    onSubmit(suggestion, imageData);
    setQuery('');
    removeImage();
  }
  
  const getButtonText = () => {
    if (!isInteractionDisabled) return 'Send Message';
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
      <div className="flex-grow relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAwaitingInput ? "Review and approve the plan below..." : (isInteractionDisabled ? "Controls disabled..." : (hasHistory ? "Send a follow-up message..." : "Enter a high-level query..."))}
            disabled={isInteractionDisabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className={`w-full h-full p-3 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none font-mono text-sm disabled:cursor-not-allowed ${image ? 'pb-24' : ''}`}
          />
          {image && (
                <div className="absolute bottom-2 left-2 p-1.5 bg-nexus-surface/80 rounded-md backdrop-blur-sm">
                    <div className="relative">
                        <img src={image.preview} alt="Upload preview" className="h-16 w-16 object-cover rounded" />
                        <button 
                            type="button" 
                            onClick={removeImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                            <XCircleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
          )}
      </div>
      <div className="flex items-center space-x-2">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={isInteractionDisabled}
        />
        {!isInteractionDisabled && (
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 bg-purple-500/20 text-purple-400 font-bold py-2 px-3 rounded-md border border-purple-500/50
                           hover:bg-purple-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                title="Attach Image"
            >
                <PhotographIcon className="w-5 h-5" />
            </button>
        )}
        {!isInteractionDisabled && hasHistory && (
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
          disabled={isInteractionDisabled || !query.trim()}
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
      
      {!isInteractionDisabled && !hasHistory && (
        <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider flex items-center">
                  <BrainCircuitIcon className="w-4 h-4 mr-2" />
                  Query Suggestions
                </h4>
                <div className="flex items-center gap-1">
                    {(['short', 'medium', 'long'] as SuggestionProfile[]).map(p => (
                         <button key={p} type="button" onClick={() => handleSuggestionProfileChange(p)} className={`px-2 py-0.5 text-xs rounded-md transition-colors ${suggestionProfile === p ? 'bg-nexus-primary text-nexus-dark' : 'bg-nexus-surface hover:bg-nexus-surface/70'}`}>
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