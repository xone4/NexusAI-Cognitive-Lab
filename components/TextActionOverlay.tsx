import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyIcon, DownloadIcon, CheckCircleIcon } from './Icons';

interface TextActionOverlayProps {
  content: string;
  filename?: string;
  className?: string;
}

const TextActionOverlay: React.FC<TextActionOverlayProps> = ({ content, filename = 'nexus-ai-export.txt', className = '' }) => {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, filename]);

  return (
    <div className={`absolute top-2 ${i18n.dir() === 'rtl' ? 'left-2' : 'right-2'} z-10 bg-nexus-surface/70 backdrop-blur-sm rounded-full p-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${className}`}>
      {copied ? (
        <div className="flex items-center gap-1 text-green-400 px-2">
          <CheckCircleIcon className="w-4 h-4" />
          <span className="text-xs font-semibold">{t('introspection.copied')}</span>
        </div>
      ) : (
        <button
          onClick={handleCopy}
          className="p-1.5 text-nexus-text-muted hover:text-nexus-primary hover:bg-nexus-dark/50 rounded-full transition-colors"
          title={t('introspection.copy')}
        >
          <CopyIcon className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={handleDownload}
        className="p-1.5 text-nexus-text-muted hover:text-nexus-primary hover:bg-nexus-dark/50 rounded-full transition-colors"
        title={t('textActions.download')}
      >
        <DownloadIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TextActionOverlay;