import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { LiveTranscriptionState } from '../types';
import { MicIcon } from './Icons';

interface LiveTranscriptionDisplayProps {
  state: LiveTranscriptionState;
}

const TranscriptLine: React.FC<{ role: 'user' | 'model', text: string }> = ({ role, text }) => {
    const { t } = useTranslation();
    const isUser = role === 'user';
    const textColor = isUser ? 'text-nexus-primary' : 'text-nexus-secondary';
    const label = isUser ? t('live.you') : t('live.nexusai');
    const placeholder = text ? '' : (isUser ? t('live.listening') : t('live.thinking'));

    return (
        <p className={`text-lg transition-opacity duration-300 ${text ? 'opacity-100' : 'opacity-60'}`}>
            <span className={`font-bold ${textColor}`}>{label}</span>
            <span className="ms-2 text-nexus-text">{text || placeholder}</span>
        </p>
    );
};

const LiveTranscriptionDisplay: React.FC<LiveTranscriptionDisplayProps> = ({ state }) => {
  const { isLive, userTranscript, modelTranscript } = state;

  if (!isLive) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-30 pointer-events-none">
        <div className="bg-nexus-dark/80 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-nexus-surface/50 animate-spawn-in flex items-center gap-4">
            <MicIcon className="w-8 h-8 text-red-500 animate-pulse flex-shrink-0" />
            <div className="flex-grow space-y-2">
                <TranscriptLine role="user" text={userTranscript} />
                <TranscriptLine role="model" text={modelTranscript} />
            </div>
        </div>
    </div>
  );
};

export default memo(LiveTranscriptionDisplay);