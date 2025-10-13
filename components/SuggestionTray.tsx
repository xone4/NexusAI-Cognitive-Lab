import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CognitiveProcess, SuggestionProfile } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import { RefreshIcon, ChatBubbleBottomCenterTextIcon, DicesIcon, SparklesIcon } from './Icons';

interface SuggestionTrayProps {
  process: CognitiveProcess | null;
  permissions: { canSubmitQuery: boolean; };
  onSubmitQuery: (query: string) => void;
}

const SuggestionTray: React.FC<SuggestionTrayProps> = ({ process, permissions, onSubmitQuery }) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestionProfile, setSuggestionProfile] = useState<SuggestionProfile>('medium');
  const [keywords, setKeywords] = useState('');
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const hasHistory = process && process.history.length > 0;
  const isVisible = permissions.canSubmitQuery && !hasHistory;

  const fetchSuggestions = useCallback((profile: SuggestionProfile, currentKeywords: string) => {
    setLoadingSuggestions(true);
    nexusAIService.getSuggestedQueries(profile, currentKeywords)
      .then(setSuggestions)
      .finally(() => setLoadingSuggestions(false));
  }, []);

  useEffect(() => {
    if (isVisible) {
      fetchSuggestions(suggestionProfile, keywords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleSuggestionProfileChange = (profile: SuggestionProfile) => {
    if (suggestionProfile !== profile) {
      setSuggestionProfile(profile);
      fetchSuggestions(profile, keywords);
    }
  };

  const handleGenerateRandomKeywords = async () => {
    setIsGeneratingKeywords(true);
    const randomKeywords = await nexusAIService.generateRandomKeywords();
    if (randomKeywords && randomKeywords.length > 0) {
      const keywordsStr = randomKeywords.join(', ');
      setKeywords(keywordsStr);
      fetchSuggestions(suggestionProfile, keywordsStr);
    }
    setIsGeneratingKeywords(false);
  };
  
  const handleGenerateFromKeywords = () => {
      fetchSuggestions(suggestionProfile, keywords);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSubmitQuery(suggestion);
  };

  if (!isVisible) {
    return null;
  }

  const profileLabels: Record<SuggestionProfile, string> = {
    short: t('dashboard.short'),
    medium: t('dashboard.medium'),
    long: t('dashboard.long'),
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-nexus-bg via-nexus-bg/90 to-transparent">
        <div className="bg-nexus-surface/80 backdrop-blur-md rounded-xl p-3 border border-nexus-surface shadow-lg animate-spawn-in">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider flex items-center gap-2">
                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                    {t('dashboard.querySuggestions')}
                </h4>
                <div className="flex items-center gap-1">
                    {(['short', 'medium', 'long'] as SuggestionProfile[]).map(p => (
                         <button
                            key={p}
                            type="button"
                            onClick={() => handleSuggestionProfileChange(p)}
                            className={`px-2 py-0.5 text-xs rounded-full transition-colors ${suggestionProfile === p ? 'bg-nexus-primary text-nexus-dark font-bold' : 'bg-nexus-dark/50 hover:bg-nexus-surface'}`}
                         >
                           {profileLabels[p]}
                         </button>
                    ))}
                </div>
            </div>
            
             <div className="flex items-center gap-2 mb-3">
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateFromKeywords(); }}
                    placeholder={t('dashboard.keywordsPlaceholder')}
                    className="flex-grow bg-nexus-dark/70 border border-nexus-surface rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text text-sm font-mono"
                />
                {keywords.trim() ? (
                    <button onClick={handleGenerateFromKeywords} className="flex-shrink-0 flex items-center gap-1.5 bg-nexus-primary/80 text-nexus-dark font-bold text-sm px-3 py-2 rounded-xl hover:bg-nexus-secondary transition-colors" title={t('dashboard.generateFromKeywords')}>
                        <SparklesIcon className="w-4 h-4" />
                        <span>{t('dashboard.generate')}</span>
                    </button>
                ) : (
                    <button onClick={handleGenerateRandomKeywords} disabled={isGeneratingKeywords} className="flex-shrink-0 p-2 rounded-xl bg-nexus-surface hover:bg-nexus-primary/20 text-nexus-text-muted hover:text-nexus-primary transition-colors disabled:opacity-50" title={t('dashboard.randomKeywords')}>
                        {isGeneratingKeywords ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <DicesIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {loadingSuggestions ? (
               <div className="text-sm text-center py-4 text-nexus-text-muted animate-pulse">{t('dashboard.generatingSuggestions')}</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="text-sm bg-nexus-surface px-3 py-1.5 rounded-full text-nexus-text-muted hover:bg-nexus-primary hover:text-nexus-dark transition-all duration-200"
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