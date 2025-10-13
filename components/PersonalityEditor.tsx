import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Personality, EnergyFocus, InformationProcessing, DecisionMaking, WorldApproach } from '../types';

interface PersonalityEditorProps {
    personality: Personality;
    onChange: (newPersonality: Personality) => void;
    disabled?: boolean;
}

const TraitToggle: React.FC<{
    label: string;
    description: string;
    option1: { value: string; label: string; };
    option2: { value: string; label: string; };
    currentValue: string;
    onClick: (value: any) => void;
    disabled?: boolean;
}> = ({ label, description, option1, option2, currentValue, onClick, disabled }) => {

    return (
        <div className="bg-nexus-dark/30 p-3 rounded-xl">
            <div className="flex justify-between items-center">
                <div className="relative group">
                    <label className="block text-sm font-medium text-nexus-text-muted cursor-help">{label}</label>
                     <div className="absolute bottom-full left-0 mb-2 w-64 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        {description}
                        <div className="absolute top-full left-4 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
                    </div>
                </div>
                 <div className="flex rounded-full shadow-sm bg-nexus-bg">
                    <button
                        type="button"
                        onClick={() => !disabled && onClick(option1.value)}
                        disabled={disabled}
                        className={`px-3 py-1 text-sm font-semibold rounded-l-full transition-colors ${currentValue === option1.value ? 'bg-nexus-primary text-nexus-dark' : 'text-nexus-text-muted hover:bg-nexus-surface'}`}
                    >
                        {option1.label}
                    </button>
                    <button
                        type="button"
                        onClick={() => !disabled && onClick(option2.value)}
                        disabled={disabled}
                        className={`px-3 py-1 text-sm font-semibold rounded-r-full transition-colors ${currentValue === option2.value ? 'bg-nexus-primary text-nexus-dark' : 'text-nexus-text-muted hover:bg-nexus-surface'}`}
                    >
                        {option2.label}
                    </button>
                 </div>
            </div>
        </div>
    );
};


const PersonalityEditor: React.FC<PersonalityEditorProps> = ({ personality, onChange, disabled = false }) => {
    const { t } = useTranslation();

    const handleChange = (key: keyof Personality, value: any) => {
        onChange({ ...personality, [key]: value });
    };

    return (
        <div className="space-y-3">
            <TraitToggle
                label={t('personality.energyFocus.label')}
                description={t('personality.energyFocus.desc')}
                option1={{ value: 'INTROVERSION', label: t('personality.energyFocus.introversion') }}
                option2={{ value: 'EXTROVERSION', label: t('personality.energyFocus.extroversion') }}
                currentValue={personality.energyFocus}
                onClick={(v: EnergyFocus) => handleChange('energyFocus', v)}
                disabled={disabled}
            />
            <TraitToggle
                label={t('personality.informationProcessing.label')}
                description={t('personality.informationProcessing.desc')}
                option1={{ value: 'SENSING', label: t('personality.informationProcessing.sensing') }}
                option2={{ value: 'INTUITION', label: t('personality.informationProcessing.intuition') }}
                currentValue={personality.informationProcessing}
                onClick={(v: InformationProcessing) => handleChange('informationProcessing', v)}
                disabled={disabled}
            />
            <TraitToggle
                label={t('personality.decisionMaking.label')}
                description={t('personality.decisionMaking.desc')}
                option1={{ value: 'THINKING', label: t('personality.decisionMaking.thinking') }}
                option2={{ value: 'FEELING', label: t('personality.decisionMaking.feeling') }}
                currentValue={personality.decisionMaking}
                onClick={(v: DecisionMaking) => handleChange('decisionMaking', v)}
                disabled={disabled}
            />
            <TraitToggle
                label={t('personality.worldApproach.label')}
                description={t('personality.worldApproach.desc')}
                option1={{ value: 'JUDGING', label: t('personality.worldApproach.judging') }}
                option2={{ value: 'PERCEIVING', label: t('personality.worldApproach.perceiving') }}
                currentValue={personality.worldApproach}
                onClick={(v: WorldApproach) => handleChange('worldApproach', v)}
                disabled={disabled}
            />
        </div>
    );
};

export default PersonalityEditor;