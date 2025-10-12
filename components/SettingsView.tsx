import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSettings, SystemPersonality, LogVerbosity, AnimationLevel, Language } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, TrashIcon, BrainCircuitIcon, EyeIcon } from './Icons';
import { nexusAIService } from '../services/nexusAIService';

interface SettingsViewProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const modelOptions = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
];

const languageOptions: { id: Language, name: string }[] = [
    { id: 'en', name: 'English' },
    { id: 'ar', name: 'العربية (Arabic)' },
    { id: 'es', name: 'Español (Spanish)' },
    { id: 'fr', name: 'Français (French)' },
    { id: 'de', name: 'Deutsch (German)' },
    { id: 'zh', name: '中文 (Mandarin)' },
];

const SettingsRadioGroup = <T extends string>({ label, description, options, selected, onChange }: { label: string, description: string, options: {value: T, label: string}[], selected: T, onChange: (value: T) => void }) => (
    <div>
        <label className="block text-sm font-medium text-nexus-text-muted">{label}</label>
        <div className="mt-2 flex rounded-full shadow-sm">
            {options.map((option, idx) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-nexus-surface focus:z-10
                    ${selected === option.value ? 'bg-nexus-primary text-nexus-dark' : 'bg-nexus-bg text-nexus-text-muted hover:bg-nexus-surface'}
                    first:rounded-l-full last:rounded-r-full`}
                >
                    {option.label}
                </button>
            ))}
        </div>
        <p className="text-xs text-nexus-text-muted mt-2">{description}</p>
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };
  
  const handleClearCache = () => {
    nexusAIService.clearSuggestionCache();
    alert(t('settings.cacheClearedMsg'));
  }

  const handleFactoryReset = () => {
    if(confirm(t('settings.factoryResetConfirm'))) {
        nexusAIService.factoryReset();
    }
  }

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  
  const personalityOptions: { value: SystemPersonality; label: string; }[] = [
    { value: 'BALANCED', label: t('settings.balanced') },
    { value: 'CREATIVE', label: t('settings.creative') },
    { value: 'LOGICAL', label: t('settings.logical') },
  ];
  
  const verbosityOptions: { value: LogVerbosity; label: string; }[] = [
    { value: 'STANDARD', label: t('settings.standard') },
    { value: 'VERBOSE', label: t('settings.verbose') },
  ];
  
  const animationOptions: { value: AnimationLevel; label: string; }[] = [
    { value: 'FULL', label: t('settings.full') },
    { value: 'MINIMAL', label: t('settings.minimal') },
    { value: 'NONE', label: t('settings.none') },
  ];

  const modelDescriptions: {[key: string]: string} = {
      'gemini-2.5-flash': t('settings.modelDescGemini')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DashboardCard title={t('settings.cognitiveCore')} icon={<BrainCircuitIcon />}>
        <div className="space-y-6 p-4">
            <SettingsRadioGroup
                label={t('settings.systemPersonality')}
                description={t('settings.systemPersonalityDesc')}
                options={personalityOptions}
                selected={localSettings.systemPersonality}
                onChange={(v) => setLocalSettings(p => ({...p, systemPersonality: v}))}
            />
            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-nexus-text-muted">
                {t('settings.cognitiveModel')}
              </label>
              <select
                id="model-select"
                value={localSettings.model}
                onChange={(e) => setLocalSettings(p => ({ ...p, model: e.target.value }))}
                className="mt-2 block w-full rounded-xl border-0 py-2 ps-3 pe-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6"
              >
                {modelOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-nexus-text-muted mt-2">
                {modelDescriptions[localSettings.model] ?? t('settings.selectModelDesc')}
              </p>
            </div>
          <div>
            <label htmlFor="delay-slider" className="block text-sm font-medium text-nexus-text-muted mb-2">
              {t('settings.cognitiveStepDelay')}: <span className="font-bold text-nexus-secondary">{localSettings.cognitiveStepDelay}ms</span>
            </label>
            <input
              type="range"
              id="delay-slider"
              min="500"
              max="5000"
              step="100"
              value={localSettings.cognitiveStepDelay}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, cognitiveStepDelay: parseInt(e.target.value, 10) }))}
              className="w-full h-2 bg-nexus-dark rounded-full appearance-none cursor-pointer"
            />
             <p className="text-xs text-nexus-text-muted mt-2">
               {t('settings.cognitiveStepDelayDesc')}
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title={t('settings.interface')} icon={<EyeIcon />}>
        <div className="space-y-6 p-4">
            <SettingsRadioGroup
                label={t('settings.animationLevel')}
                description={t('settings.animationLevelDesc')}
                options={animationOptions}
                selected={localSettings.animationLevel}
                onChange={(v) => setLocalSettings(p => ({...p, animationLevel: v}))}
            />
            <SettingsRadioGroup
                label={t('settings.logVerbosity')}
                description={t('settings.logVerbosityDesc')}
                options={verbosityOptions}
                selected={localSettings.logVerbosity}
                onChange={(v) => setLocalSettings(p => ({...p, logVerbosity: v}))}
            />
             <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-nexus-text-muted">
                {t('settings.responseLanguage')}
              </label>
              <select
                id="language-select"
                value={localSettings.language}
                onChange={(e) => setLocalSettings(p => ({ ...p, language: e.target.value as Language }))}
                className="mt-2 block w-full rounded-xl border-0 py-2 ps-3 pe-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6"
              >
                {languageOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
               <p className="text-xs text-nexus-text-muted mt-2">
                {t('settings.responseLanguageDesc')}
              </p>
            </div>
        </div>
      </DashboardCard>
      
       <DashboardCard title={t('settings.dataManagement')} icon={<TrashIcon />}>
          <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                  <div>
                     <h4 className="font-semibold text-nexus-text">{t('settings.aiQuerySuggestions')}</h4>
                     <p className="text-sm text-nexus-text-muted">{t('settings.aiQuerySuggestionsDesc')}</p>
                  </div>
                   <button
                      onClick={handleClearCache}
                      className="bg-blue-500/20 text-blue-400 font-bold py-2 px-4 rounded-full border border-blue-500/50
                                 hover:bg-blue-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                   >
                      {t('settings.clearCache')}
                   </button>
              </div>
              <div className="h-px bg-nexus-surface/50"></div>
              <div className="flex items-center justify-between">
                  <div>
                     <h4 className="font-semibold text-nexus-text">{t('settings.factoryReset')}</h4>
                     <p className="text-sm text-nexus-text-muted">{t('settings.factoryResetDesc')}</p>
                  </div>
                   <button
                      onClick={handleFactoryReset}
                      className="bg-red-500/20 text-red-400 font-bold py-2 px-4 rounded-full border border-red-500/50
                                 hover:bg-red-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                   >
                      {t('settings.resetApplication')}
                   </button>
              </div>
          </div>
       </DashboardCard>

       <div className="flex items-center justify-end space-x-4 pt-4">
        {showSaveConfirmation && <span className="text-sm text-green-400 animate-text-focus-in">{t('settings.settingsSaved')}</span>}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-nexus-primary text-nexus-dark font-bold py-2 px-6 rounded-full border border-nexus-primary/80
                      hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary
                      disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
        >
          {t('settings.saveChanges')}
        </button>
      </div>
    </div>
  );
};

export default SettingsView;