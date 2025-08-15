
import React, { useState, useEffect } from 'react';
import type { AppSettings, SystemPersonality, LogVerbosity, AnimationLevel } from '../types';
import DashboardCard from './DashboardCard';
import { CogIcon, TrashIcon, BrainCircuitIcon, EyeIcon } from './Icons';
import { nexusAIService } from '../services/nexusAIService';

interface SettingsViewProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const modelOptions = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'The recommended model for most use cases, balancing speed, and intelligence.' },
];

const languageOptions = [
    { id: 'English', name: 'English' },
    { id: 'Arabic', name: 'العربية (Arabic)' },
    { id: 'Spanish', name: 'Español (Spanish)' },
    { id: 'French', name: 'Français (French)' },
    { id: 'German', name: 'Deutsch (German)' },
    { id: 'Mandarin', name: '中文 (Mandarin)' },
];

const SettingsRadioGroup = <T extends string>({ label, description, options, selected, onChange }: { label: string, description: string, options: {value: T, label: string}[], selected: T, onChange: (value: T) => void }) => (
    <div>
        <label className="block text-sm font-medium text-nexus-text-muted">{label}</label>
        <div className="mt-2 flex rounded-md shadow-sm">
            {options.map((option, idx) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`relative inline-flex items-center justify-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-nexus-surface focus:z-10
                    ${selected === option.value ? 'bg-nexus-primary text-nexus-dark' : 'bg-nexus-bg text-nexus-text-muted hover:bg-nexus-surface'}
                    ${idx === 0 ? 'rounded-l-md' : ''}
                    ${idx === options.length - 1 ? 'rounded-r-md' : '-ml-px'}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
        <p className="text-xs text-nexus-text-muted mt-2">{description}</p>
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
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
    alert('AI query suggestion cache has been cleared.');
  }

  const handleFactoryReset = () => {
    if(confirm('Are you sure you want to perform a factory reset? This will clear ALL local data, including settings, and reload the application.')) {
        nexusAIService.factoryReset();
    }
  }

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  
  const personalityOptions: { value: SystemPersonality; label: string; }[] = [
    { value: 'BALANCED', label: 'Balanced' },
    { value: 'CREATIVE', label: 'Creative' },
    { value: 'LOGICAL', label: 'Logical' },
  ];
  
  const verbosityOptions: { value: LogVerbosity; label: string; }[] = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'VERBOSE', label: 'Verbose' },
  ];
  
  const animationOptions: { value: AnimationLevel; label: string; }[] = [
    { value: 'FULL', label: 'Full' },
    { value: 'MINIMAL', label: 'Minimal' },
    { value: 'NONE', label: 'None' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DashboardCard title="Cognitive Core" icon={<BrainCircuitIcon />}>
        <div className="space-y-6 p-4">
            <SettingsRadioGroup
                label="System Personality"
                description="Defines the AI's core behavior and response style for planning and synthesis."
                options={personalityOptions}
                selected={localSettings.systemPersonality}
                onChange={(v) => setLocalSettings(p => ({...p, systemPersonality: v}))}
            />
            <div>
              <label htmlFor="model-select" className="block text-sm font-medium text-nexus-text-muted">
                Cognitive Model
              </label>
              <select
                id="model-select"
                value={localSettings.model}
                onChange={(e) => setLocalSettings(p => ({ ...p, model: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6"
              >
                {modelOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-nexus-text-muted mt-2">
                {modelOptions.find(opt => opt.id === localSettings.model)?.description ?? 'Select a model to see its description.'}
              </p>
            </div>
          <div>
            <label htmlFor="delay-slider" className="block text-sm font-medium text-nexus-text-muted mb-2">
              Cognitive Step Delay: <span className="font-bold text-nexus-secondary">{localSettings.cognitiveStepDelay}ms</span>
            </label>
            <input
              type="range"
              id="delay-slider"
              min="500"
              max="5000"
              step="100"
              value={localSettings.cognitiveStepDelay}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, cognitiveStepDelay: parseInt(e.target.value, 10) }))}
              className="w-full h-2 bg-nexus-dark rounded-lg appearance-none cursor-pointer"
            />
             <p className="text-xs text-nexus-text-muted mt-2">
               Adds a delay between each step of the AI's execution plan. Higher values prevent API rate-limiting errors.
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Interface" icon={<EyeIcon />}>
        <div className="space-y-6 p-4">
            <SettingsRadioGroup
                label="Animation Level"
                description="Adjust the level of UI animations. 'None' may improve performance on some systems."
                options={animationOptions}
                selected={localSettings.animationLevel}
                onChange={(v) => setLocalSettings(p => ({...p, animationLevel: v}))}
            />
            <SettingsRadioGroup
                label="Log Verbosity"
                description="'Verbose' includes additional informational logs. 'Standard' shows important system events."
                options={verbosityOptions}
                selected={localSettings.logVerbosity}
                onChange={(v) => setLocalSettings(p => ({...p, logVerbosity: v}))}
            />
             <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-nexus-text-muted">
                Response Language
              </label>
              <select
                id="language-select"
                value={localSettings.language}
                onChange={(e) => setLocalSettings(p => ({ ...p, language: e.target.value }))}
                className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 bg-nexus-bg text-nexus-text ring-1 ring-inset ring-nexus-surface focus:ring-2 focus:ring-nexus-primary sm:text-sm sm:leading-6"
              >
                {languageOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
               <p className="text-xs text-nexus-text-muted mt-2">
                Sets the language for AI responses and thinking processes. Changing this will start a new chat session.
              </p>
            </div>
        </div>
      </DashboardCard>
      
       <DashboardCard title="Data Management" icon={<TrashIcon />}>
          <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                  <div>
                     <h4 className="font-semibold text-nexus-text">AI Query Suggestions</h4>
                     <p className="text-sm text-nexus-text-muted">Clear the session cache to force regeneration of new query suggestions.</p>
                  </div>
                   <button
                      onClick={handleClearCache}
                      className="bg-blue-500/20 text-blue-400 font-bold py-2 px-4 rounded-md border border-blue-500/50
                                 hover:bg-blue-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                   >
                      Clear Cache
                   </button>
              </div>
              <div className="h-px bg-nexus-surface/50"></div>
              <div className="flex items-center justify-between">
                  <div>
                     <h4 className="font-semibold text-nexus-text">Factory Reset</h4>
                     <p className="text-sm text-nexus-text-muted">Clear all stored settings and cache data, resetting the app to its default state.</p>
                  </div>
                   <button
                      onClick={handleFactoryReset}
                      className="bg-red-500/20 text-red-400 font-bold py-2 px-4 rounded-md border border-red-500/50
                                 hover:bg-red-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                   >
                      Reset Application
                   </button>
              </div>
          </div>
       </DashboardCard>

       <div className="flex items-center justify-end space-x-4 pt-4">
        {showSaveConfirmation && <span className="text-sm text-green-400 animate-text-focus-in">Settings Saved!</span>}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-nexus-primary text-nexus-dark font-bold py-2 px-6 rounded-md border border-nexus-primary/80
                      hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary
                      disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsView;