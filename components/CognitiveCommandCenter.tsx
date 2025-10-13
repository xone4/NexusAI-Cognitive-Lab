import React, { useState, useEffect, memo, useCallback, useRef, Fragment } from 'react';
import { Tab } from '@headlessui/react';
import type { CognitiveProcess, AppSettings } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import { BrainCircuitIcon, PlusCircleIcon, XCircleIcon, RefreshIcon, PhotographIcon, DocumentMagnifyingGlassIcon, LightBulbIcon, SparklesIcon } from './Icons';
import AffectiveDashboard from './AffectiveDashboard';

interface CognitiveCommandCenterProps {
    permissions: {
        canSubmitQuery: boolean;
        canEditPlan: boolean;
        canExecutePlan: boolean;
        canCancelProcess: boolean;
        canUseManualControls: boolean;
        isGloballyBusy: boolean;
    };
    process: CognitiveProcess | null;
    settings: AppSettings;
    onSubmitQuery: (query: string, image?: { mimeType: string; data: string; }) => void;
    onCancelQuery: () => void;
    onNewChat: () => void;
    onSpawnReplica: () => void;
    onGoToForge: () => void;
    onOpenIntrospection: () => void;
    onGoToDreaming: () => void;
}

const QueryTab: React.FC<Pick<CognitiveCommandCenterProps, 'permissions' | 'process' | 'onSubmitQuery' | 'onCancelQuery' | 'onNewChat'>> = 
({ permissions, process, onSubmitQuery, onCancelQuery, onNewChat }) => {
    const [query, setQuery] = useState('');
    const [image, setImage] = useState<{ file: File, preview: string, data: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAwaitingInput = process?.state === 'AwaitingExecution';
    const hasHistory = process && process.history.length > 0;
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImage({ file, preview: URL.createObjectURL(file), data: base64String });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const removeImage = () => {
        if (image) { URL.revokeObjectURL(image.preview); }
        setImage(null);
        if(fileInputRef.current) { fileInputRef.current.value = ""; }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((query.trim() || image) && permissions.canSubmitQuery) {
            const imageData = image ? { mimeType: image.file.type, data: image.data } : undefined;
            onSubmitQuery(query.trim(), imageData);
            setQuery('');
            removeImage();
        }
    };
    
    const getButtonText = () => {
        if (!permissions.isGloballyBusy) return 'Send';
        switch (process?.state) {
            case 'Receiving': return '...';
            case 'Planning': return 'Planning...';
            case 'Executing': return 'Executing...';
            case 'Synthesizing': return 'Synthesizing...';
            default: return '...';
        }
    };

    return (
        <div className="flex flex-col gap-2 h-full justify-center">
            <form onSubmit={handleSubmit} className="flex-grow flex items-center gap-2 relative">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" disabled={!permissions.canSubmitQuery}/>
                
                {image && (
                    <div className="absolute bottom-full left-2 mb-2 p-1.5 bg-nexus-surface/80 rounded-xl backdrop-blur-sm shadow-lg">
                        <div className="relative">
                            <img src={image.preview} alt="Upload preview" className="h-16 w-16 object-cover rounded-lg" />
                            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><XCircleIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}

                {permissions.canSubmitQuery && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-2 rounded-full bg-nexus-surface hover:bg-nexus-primary/20 text-nexus-text-muted hover:text-nexus-primary transition-colors" title="Attach Image">
                        <PhotographIcon className="w-5 h-5" />
                    </button>
                )}
                
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isAwaitingInput ? "Review and approve the plan..." : (!permissions.canSubmitQuery ? "AI is processing..." : "Enter a query or send a follow-up...")}
                    disabled={!permissions.canSubmitQuery}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                    className="w-full h-12 p-3 bg-nexus-dark/70 border border-nexus-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text resize-none text-sm font-mono"
                    rows={1}
                />

                <button type="submit" disabled={!permissions.canSubmitQuery || (!query.trim() && !image)} className="px-4 py-2 bg-nexus-primary text-nexus-dark font-bold rounded-full hover:bg-nexus-secondary transition-all disabled:bg-nexus-surface/50 disabled:text-nexus-text-muted disabled:cursor-not-allowed">
                    {getButtonText()}
                </button>
                
                {permissions.canSubmitQuery && hasHistory && (
                    <button type="button" onClick={onNewChat} className="p-2 rounded-full bg-nexus-surface hover:bg-blue-500/20 text-nexus-text-muted hover:text-blue-400 transition-colors" title="Start New Chat">
                        <PlusCircleIcon className="w-5 h-5" />
                    </button>
                )}

                {permissions.canCancelProcess && (
                    <button type="button" onClick={onCancelQuery} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white transition-colors" title="Cancel Cognitive Process">
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
            </form>
        </div>
    );
};

const ManualActionsTab: React.FC<Pick<CognitiveCommandCenterProps, 'permissions' | 'onGoToDreaming' | 'onGoToForge' | 'onOpenIntrospection'>> = 
({ permissions, onGoToDreaming, onGoToForge, onOpenIntrospection }) => {
    const ControlButton: React.FC<{onClick: () => void; children: React.ReactNode; disabled?: boolean;}> = ({ onClick, children, disabled }) => (
        <button onClick={onClick} disabled={disabled} className="flex-grow flex items-center justify-center gap-2 bg-nexus-surface text-nexus-text-muted py-2 px-3 rounded-full border border-nexus-surface/50 hover:bg-nexus-primary/20 hover:text-nexus-primary transition-all disabled:bg-nexus-dark/50 disabled:text-nexus-text-muted/50 disabled:cursor-not-allowed text-sm">
            {children}
        </button>
    );
    
    if (permissions.isGloballyBusy) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted p-4">
                <p className="font-semibold text-nexus-accent animate-pulse">AI is Thinking</p>
                <p className="text-xs mt-1">Manual controls are disabled during cognitive processing.</p>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3 h-full justify-center p-2">
            <ControlButton onClick={onGoToDreaming} disabled={!permissions.canUseManualControls}>
                <SparklesIcon className="w-4 h-4"/> Dream
            </ControlButton>
            <ControlButton onClick={onGoToForge} disabled={!permissions.canUseManualControls}>Go to Tool Forge</ControlButton>
            <ControlButton onClick={onOpenIntrospection} disabled={!permissions.canUseManualControls}><DocumentMagnifyingGlassIcon className="w-4 h-4" /> Inspect Directives</ControlButton>
        </div>
    );
};

const CognitiveCommandCenter: React.FC<CognitiveCommandCenterProps> = (props) => {
    const { process, settings } = props;

    const tabClasses = ({ selected }: { selected: boolean }) => `
        w-full py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg
        ring-white/60 ring-offset-2 ring-offset-nexus-bg focus:outline-none focus:ring-2
        ${selected
            ? 'bg-nexus-surface text-nexus-primary shadow-inner'
            : 'text-nexus-text-muted hover:bg-nexus-dark/70 hover:text-white'
        }
    `;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="rounded-xl overflow-hidden bg-nexus-dark/50 border border-nexus-surface/50">
                <Tab.Group>
                    <Tab.List className="flex space-x-1 p-1">
                        <Tab className={tabClasses}>Query</Tab>
                        <Tab className={tabClasses}>Manual Actions</Tab>
                        <Tab className={tabClasses}>Affective Control</Tab>
                    </Tab.List>
                    <Tab.Panels className="bg-nexus-surface/50 h-[90px] p-2">
                        <Tab.Panel className="h-full rounded-xl focus:outline-none">
                            <QueryTab {...props} />
                        </Tab.Panel>
                        <Tab.Panel className="h-full rounded-xl focus:outline-none">
                            <ManualActionsTab {...props} />
                        </Tab.Panel>
                        <Tab.Panel className="h-full rounded-xl p-2 focus:outline-none">
                            <AffectiveDashboard 
                                activeState={process?.activeAffectiveState || null}
                                personality={settings.coreAgentPersonality}
                                onInduceEmotion={nexusAIService.induceUserEmotion}
                                isInteractionDisabled={props.permissions.isGloballyBusy}
                            />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
};

export default memo(CognitiveCommandCenter);