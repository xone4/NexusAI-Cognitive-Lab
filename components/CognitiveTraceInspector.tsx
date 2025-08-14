import React, { useState, useEffect } from 'react';
import type { ChatMessage, PlanStep, GeneratedImage } from '../types';
import { nexusAIService } from '../services/nexusAIService';
import QualiaVectorVisualizer from './QualiaVectorVisualizer';
import { DocumentMagnifyingGlassIcon, CheckCircleIcon, CogIcon, CodeBracketIcon, CubeTransparentIcon, LightBulbIcon, PhotographIcon, SparklesIcon, XCircleIcon, BrainCircuitIcon, ChatBubbleLeftRightIcon, UserIcon } from './Icons';

interface CognitiveTraceInspectorProps {
    trace: ChatMessage;
    onClose: () => void;
}

type InspectorTab = 'summary' | 'flow' | 'reflection' | 'discuss';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 border-b-2
        ${active ? 'border-nexus-primary text-nexus-primary' : 'border-transparent text-nexus-text-muted hover:text-nexus-text'}`}
    >
        {children}
    </button>
);

const DetailCard: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={`bg-nexus-dark/50 p-3 rounded-md ${className}`}>
        <h5 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider">{label}</h5>
        <div className="mt-1 text-sm text-nexus-text">{children}</div>
    </div>
);

const DetailedPlanStep: React.FC<{ step: PlanStep }> = ({ step }) => {
    const getStepIcon = () => {
        switch(step.tool) {
            case 'google_search': return <CubeTransparentIcon className="w-5 h-5 text-blue-400" />;
            case 'code_interpreter': return <CodeBracketIcon className="w-5 h-5 text-purple-400" />;
            case 'evoke_qualia': return <LightBulbIcon className="w-5 h-5 text-yellow-400" />;
            case 'generate_image': return <PhotographIcon className="w-5 h-5 text-green-400" />;
            case 'analyze_image_input': return <SparklesIcon className="w-5 h-5 text-pink-400" />;
            default: return <CogIcon className="w-5 h-5 text-gray-400" />;
        }
    };
    
    const renderResult = () => {
        if (step.status === 'error') {
            return <pre className="text-xs whitespace-pre-wrap text-red-400 font-mono bg-red-500/10 p-2 rounded-md">{String(step.result)}</pre>;
        }
        if (!step.result) return <p className="text-xs text-nexus-text-muted italic">No result recorded.</p>;
        
        if (typeof step.result === 'object' && step.result.id?.startsWith('img-')) {
            const image = step.result as GeneratedImage;
            return (
                 <div className="mt-2 p-2 bg-nexus-dark/70 rounded-md border border-nexus-surface">
                    <img 
                        src={`data:image/jpeg;base64,${image.base64Image}`} 
                        alt={image.concept}
                        className="w-full rounded border-2 border-nexus-surface"
                    />
                    <p className="text-xs text-nexus-text-muted mt-2 italic">
                        Prompt: "{image.concept}"
                    </p>
                </div>
            )
        }
        
        return <pre className="text-xs whitespace-pre-wrap text-green-400 font-mono bg-green-500/10 p-2 rounded-md">{String(step.result)}</pre>;
    };

    return (
        <div className="bg-nexus-dark/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                {step.status === 'complete' ? <CheckCircleIcon className="w-5 h-5 text-nexus-secondary"/> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                <h4 className="font-semibold text-nexus-text flex-grow flex items-center gap-2">{getStepIcon()} {step.description}</h4>
                 <span className="text-xs font-mono text-nexus-text-muted">Step {step.step}</span>
            </div>
             <div className="pl-8 space-y-3">
                {(step.query || step.code || step.concept) && (
                    <div>
                        <h5 className="text-xs font-bold text-nexus-text-muted">Input:</h5>
                        <pre className="text-xs whitespace-pre-wrap text-nexus-text-muted font-mono bg-nexus-dark/70 p-2 rounded-md">{step.query || step.code || step.concept}</pre>
                    </div>
                )}
                <div>
                     <h5 className="text-xs font-bold text-nexus-text-muted">Result:</h5>
                     {renderResult()}
                </div>
             </div>
        </div>
    );
};


const CognitiveTraceInspector: React.FC<CognitiveTraceInspectorProps> = ({ trace, onClose }) => {
    const [activeTab, setActiveTab] = useState<InspectorTab>('summary');
    const [reflection, setReflection] = useState<string | null>(null);
    const [isLoadingReflection, setIsLoadingReflection] = useState(false);
    const [discussionHistory, setDiscussionHistory] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [discussionInput, setDiscussionInput] = useState('');
    const [isDiscussing, setIsDiscussing] = useState(false);

    const handleGenerateReflection = async () => {
        setIsLoadingReflection(true);
        const result = await nexusAIService.generateReflectionResponse(trace);
        setReflection(result);
        setIsLoadingReflection(false);
    };

    const handleSendDiscussionMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!discussionInput.trim() || isDiscussing) return;

        const newUserMessage = { role: 'user' as const, text: discussionInput.trim() };
        const newHistory = [...discussionHistory, newUserMessage];
        
        setDiscussionHistory(newHistory);
        setDiscussionInput('');
        setIsDiscussing(true);

        const modelResponseText = await nexusAIService.generateDiscussionResponse(trace, newHistory, newUserMessage.text);

        setDiscussionHistory(prev => [...prev, { role: 'model' as const, text: modelResponseText }]);
        setIsDiscussing(false);
    };

    const DiscussionUserMessage: React.FC<{text: string}> = ({ text }) => (
        <div className="flex justify-end my-2 animate-spawn-in">
            <div className="bg-nexus-primary/80 text-nexus-dark rounded-xl rounded-br-none max-w-xl p-3 shadow-md">
                <p className="text-sm">{text}</p>
            </div>
             <UserIcon className="w-8 h-8 text-nexus-primary ml-3 flex-shrink-0" />
        </div>
    );
    const DiscussionModelMessage: React.FC<{text: string}> = ({ text }) => (
        <div className="flex justify-start my-2 animate-spawn-in">
             <BrainCircuitIcon className="w-8 h-8 text-nexus-secondary mr-3 flex-shrink-0" />
            <div className="bg-nexus-dark rounded-xl rounded-bl-none max-w-xl p-3 shadow-md">
                <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text">{text}</pre>
            </div>
        </div>
    );
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'summary':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailCard label="User Query" className="md:col-span-2">
                            <p className="italic">"{trace.userQuery}"</p>
                        </DetailCard>
                         <DetailCard label="Final Answer" className="md:col-span-2">
                            <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text bg-nexus-dark/50 p-3 rounded-md max-h-64 overflow-y-auto">{String(trace.text || '')}</pre>
                        </DetailCard>
                         <DetailCard label="Metrics">
                            <p>Plan Steps: {trace.plan?.length || 0}</p>
                            <p>Constitution: {trace.constitutionId || 'Default'}</p>
                         </DetailCard>
                         <DetailCard label="Qualia State">
                             <div className="h-48">
                                <QualiaVectorVisualizer activeVector={trace.qualiaVector || null} onUpdate={() => {}} isThinking={true} />
                            </div>
                         </DetailCard>
                    </div>
                );
            case 'flow':
                return (
                    <div className="space-y-3">
                        {trace.plan?.map(step => <DetailedPlanStep key={step.step} step={step} />)}
                    </div>
                );
            case 'reflection':
                 return (
                    <div className="text-center py-4">
                        {!reflection && !isLoadingReflection && (
                             <button onClick={handleGenerateReflection} className="flex items-center gap-2 mx-auto bg-nexus-primary text-nexus-dark font-bold py-2 px-4 rounded-md hover:bg-nexus-secondary">
                                 <BrainCircuitIcon className="w-5 h-5"/> Generate AI Self-Reflection
                            </button>
                        )}
                        {isLoadingReflection && <p className="text-nexus-text-muted animate-pulse">AI is reflecting on its performance...</p>}
                        {reflection && (
                             <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text text-left bg-nexus-dark/50 p-4 rounded-md overflow-y-auto">
                                 {String(reflection || '')}
                             </pre>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-nexus-dark/80 backdrop-blur-sm flex items-center justify-center z-50 animate-spawn-in">
            <div className="bg-nexus-surface p-6 rounded-lg shadow-2xl w-full max-w-4xl border border-nexus-primary/50 flex flex-col max-h-[90vh]">
                 <div className="flex-shrink-0 flex justify-between items-start">
                    <div className="flex items-center gap-3 mb-4">
                        <DocumentMagnifyingGlassIcon className="w-8 h-8 text-nexus-primary"/>
                        <div>
                            <h3 className="text-xl font-bold text-nexus-text">Cognitive Trace Inspector</h3>
                            <p className="text-xs text-nexus-text-muted">{new Date(trace.archivedAt!).toLocaleString()}</p>
                        </div>
                    </div>
                     <button onClick={onClose} className="text-nexus-text-muted hover:text-white text-2xl font-bold">&times;</button>
                 </div>
                
                 <div className="flex-shrink-0 border-b border-nexus-surface mb-4">
                    <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>Summary</TabButton>
                    <TabButton active={activeTab === 'flow'} onClick={() => setActiveTab('flow')}>Execution Flow</TabButton>
                    <TabButton active={activeTab === 'reflection'} onClick={() => setActiveTab('reflection')}>AI Reflection</TabButton>
                    <TabButton active={activeTab === 'discuss'} onClick={() => setActiveTab('discuss')}>
                        <div className="flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                            Discuss Trace
                        </div>
                    </TabButton>
                 </div>

                {activeTab === 'discuss' ? (
                    <div className="flex-grow flex flex-col overflow-hidden">
                        <div className="flex-grow overflow-y-auto p-2 pr-4 space-y-2">
                             {discussionHistory.length === 0 && (
                                 <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted">
                                    <ChatBubbleLeftRightIcon className="w-16 h-16"/>
                                    <p className="mt-4 font-semibold text-lg">Discussion Hub</p>
                                    <p className="text-sm">Ask questions about the AI's plan, reasoning, or final answer.</p>
                                 </div>
                             )}
                            {discussionHistory.map((msg, index) => (
                                msg.role === 'user'
                                    ? <DiscussionUserMessage key={index} text={msg.text} />
                                    : <DiscussionModelMessage key={index} text={msg.text} />
                            ))}
                            {isDiscussing && (
                                <div className="flex justify-start my-2 animate-spawn-in">
                                     <BrainCircuitIcon className="w-8 h-8 text-nexus-secondary mr-3 flex-shrink-0" />
                                    <div className="bg-nexus-dark rounded-xl rounded-bl-none max-w-lg p-3 shadow-md">
                                        <p className="text-sm text-nexus-text-muted animate-pulse">Thinking...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSendDiscussionMessage} className="flex-shrink-0 p-2 pt-4 border-t border-nexus-surface flex gap-2">
                            <input
                                type="text"
                                value={discussionInput}
                                onChange={(e) => setDiscussionInput(e.target.value)}
                                placeholder="Ask about this trace..."
                                disabled={isDiscussing}
                                className="flex-grow bg-nexus-dark/70 border border-nexus-surface rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isDiscussing || !discussionInput.trim()}
                                className="bg-nexus-primary text-nexus-dark font-bold py-2 px-4 rounded-md hover:bg-nexus-secondary disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto pr-4 p-2">
                        {renderTabContent()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CognitiveTraceInspector;
