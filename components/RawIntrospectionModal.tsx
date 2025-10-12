import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { nexusAIService } from '../services/nexusAIService';
import { DocumentMagnifyingGlassIcon, CheckCircleIcon, DocumentTextIcon } from './Icons';

interface RawIntrospectionModalProps {
    onClose: () => void;
}

interface RawContext {
    systemInstruction: string;
    planSchema: string;
    affectiveStateSchema: string;
}

const useCopyToClipboard = () => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    const copyText = copied ? t('introspection.copied') : t('introspection.copy');
    return [copied, copy, copyText] as const;
};

const CodeBlock: React.FC<{ title: string, content: string }> = ({ title, content }) => {
    const [copied, copy, copyText] = useCopyToClipboard();

    return (
         <div className="bg-nexus-dark/50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-nexus-secondary">{title}</h4>
                <button
                    onClick={() => copy(content)}
                    className="flex items-center gap-2 text-xs bg-nexus-surface px-2 py-1 rounded-full text-nexus-text-muted hover:bg-nexus-primary hover:text-nexus-dark transition-all"
                >
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <DocumentTextIcon className="w-4 h-4" />}
                    {copyText}
                </button>
            </div>
            <pre className="w-full text-xs text-nexus-text-muted bg-nexus-dark/70 p-3 rounded-xl overflow-auto max-h-48 font-mono">
                <code>{content}</code>
            </pre>
        </div>
    );
};


const RawIntrospectionModal: React.FC<RawIntrospectionModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [context, setContext] = useState<RawContext | null>(null);

    useEffect(() => {
        const rawContext = nexusAIService.getRawSystemContext() as RawContext;
        setContext(rawContext);
    }, []);

    return (
         <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-xl shadow-2xl w-full max-w-4xl border border-nexus-primary/50 relative">
                 <button onClick={onClose} className="absolute top-4 end-4 text-nexus-text-muted hover:text-white text-2xl font-bold">&times;</button>
                
                <div className="flex items-center gap-3 mb-4">
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-nexus-primary"/>
                    <h3 className="text-xl font-bold text-nexus-text">{t('introspection.title')}</h3>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-2">
                    {context ? (
                        <>
                           <CodeBlock title={t('introspection.systemInstruction')} content={context.systemInstruction} />
                           <CodeBlock title={t('introspection.planSchema')} content={context.planSchema} />
                           <CodeBlock title={t('introspection.affectiveStateSchema')} content={context.affectiveStateSchema} />
                        </>
                    ) : (
                        <p className="text-nexus-text-muted">{t('introspection.loading')}</p>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                     <button onClick={onClose} className="py-2 px-6 rounded-full bg-nexus-primary text-nexus-dark font-bold hover:bg-nexus-secondary">{t('introspection.close')}</button>
                </div>
            </div>
        </div>
    );
};

export default RawIntrospectionModal;