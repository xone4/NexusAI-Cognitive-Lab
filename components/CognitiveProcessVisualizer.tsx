import React, { memo, useEffect, useRef, useState } from 'react';
import type { CognitiveProcess, ChatMessage, PlanStep, CognitiveConstitution, GeneratedImage } from '../types';
import { BrainCircuitIcon, UserIcon, BookOpenIcon, CogIcon, CheckCircleIcon, CubeTransparentIcon, PlayIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlusCircleIcon, CodeBracketIcon, LightBulbIcon, LinkIcon, ArrowRightIcon, PhotographIcon, SparklesIcon, ArchiveBoxArrowDownIcon, RefreshIcon, GlobeAltIcon } from './Icons';

interface CognitiveProcessVisualizerProps {
  process: CognitiveProcess;
  constitutions: CognitiveConstitution[];
  onExecutePlan: (messageId: string) => void;
  onUpdatePlanStep: (messageId: string, stepIndex: number, newStep: PlanStep) => void;
  onReorderPlan: (messageId: string, fromIndex: number, toIndex: number) => void;
  onAddPlanStep: (messageId: string) => void;
  onDeletePlanStep: (messageId: string, stepIndex: number) => void;
  onSavePlanAsToolchain: (plan: PlanStep[]) => void;
  onArchiveTrace: (messageId: string) => void;
  onRerunTrace: (trace: ChatMessage) => void;
  onTranslate: (text: string, language: string) => Promise<string>;
  language: string;
}

const GroundingCitations: React.FC<{ metadata: any }> = memo(({ metadata }) => {
    const chunks = metadata?.groundingChunks;
    if (!chunks || chunks.length === 0) return null;

    const validChunks = chunks.filter((chunk: any) => chunk.web && chunk.web.uri);
    if (validChunks.length === 0) return null;

    return (
        <div className="mt-4 pt-3 border-t border-nexus-surface/50">
            <h4 className="text-xs font-semibold text-nexus-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4"/>
                Sources
            </h4>
            <ul className="space-y-2 text-sm">
                {validChunks.map((chunk: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                         <span className="text-nexus-text-muted flex-shrink-0">{index + 1}.</span>
                         <a
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-nexus-secondary hover:underline break-all"
                            title={chunk.web.uri}
                         >
                             {String(chunk.web.title || chunk.web.uri || '')}
                         </a>
                    </li>
                ))}
            </ul>
        </div>
    );
});
GroundingCitations.displayName = 'GroundingCitations';


const UserMessage: React.FC<{ message: ChatMessage }> = memo(({ message }) => (
    <div className="flex justify-end my-2 animate-spawn-in">
        <div className="bg-nexus-primary/80 text-nexus-dark rounded-xl rounded-br-none max-w-lg p-3 shadow-md">
            {message.image && (
                 <img 
                    src={`data:${message.image.mimeType};base64,${message.image.data}`} 
                    alt="User upload"
                    className="w-full rounded-lg mb-2 border-2 border-white/50"
                 />
            )}
            <p className="text-sm">{String(message.text || '')}</p>
        </div>
        <UserIcon className="w-8 h-8 text-nexus-primary ml-3 flex-shrink-0" />
    </div>
));
UserMessage.displayName = 'UserMessage';

const GeneratedImageViewer: React.FC<{ image: GeneratedImage }> = memo(({ image }) => {
    return (
        <div className="mt-2 p-3 bg-nexus-dark/50 rounded-md border border-nexus-surface/50">
            <p className="text-xs text-nexus-text-muted font-mono mb-2">Generated Image: {image.id}</p>
            <img 
                src={`data:image/jpeg;base64,${image.base64Image}`} 
                alt={image.concept}
                className="w-full rounded border-2 border-nexus-surface shadow-lg"
            />
            <p className="text-xs text-nexus-text-muted mt-2 italic">
                <span className="font-bold">Prompt:</span> "{image.concept}"
            </p>
        </div>
    );
});
GeneratedImageViewer.displayName = 'GeneratedImageViewer';


const PlanStepView: React.FC<{ step: PlanStep, isCurrent: boolean, isEditable: boolean, onUpdate: (newStep: PlanStep) => void, onDelete: () => void, onMove: (direction: 'up' | 'down') => void, isFirst: boolean, isLast: boolean }> = ({ step, isCurrent, isEditable, onUpdate, onDelete, onMove, isFirst, isLast }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [editContent, setEditContent] = useState(step.description);
    const [editCode, setEditCode] = useState(step.code || step.query || step.concept || '');
    
    const words = step.description.split(' ');
    const isTruncatable = words.length > 7;
    const truncatedText = isTruncatable ? words.slice(0, 7).join(' ') + '...' : step.description;
    const displayedDescription = isDescriptionExpanded ? step.description : truncatedText;


    const handleSave = () => {
        const newStep = { ...step, description: editContent };
        if (step.tool === 'code_interpreter' || step.tool === 'induce_emotion') newStep.code = editCode;
        else if (step.tool === 'generate_image') newStep.concept = editCode;
        else newStep.query = editCode;

        onUpdate(newStep);
        setIsEditing(false);
    };

    const statusIcon = () => {
        switch (step.status) {
            case 'pending': return <div className="w-5 h-5 rounded-full border-2 border-nexus-text-muted/50" title="Pending" />;
            case 'executing': return <div className="w-5 h-5 relative"><div className="nexus-loader"></div></div>;
            case 'complete': return <CheckCircleIcon className="w-5 h-5 text-nexus-secondary" title="Complete"/>;
            case 'error': return <div className="w-5 h-5 rounded-full bg-red-500" title="Error"/>;
            default: return null;
        }
    };

    const getStepIcon = () => {
        switch(step.tool) {
            case 'google_search': return <CubeTransparentIcon className="w-4 h-4 text-blue-400" />;
            case 'code_interpreter': return <CodeBracketIcon className="w-4 h-4 text-purple-400" />;
            case 'recall_memory': return <BookOpenIcon className="w-4 h-4 text-yellow-400" />;
            case 'induce_emotion': return <LightBulbIcon className="w-4 h-4 text-orange-400" />;
            case 'generate_image': return <PhotographIcon className="w-4 h-4 text-green-400" />;
            case 'analyze_image_input': return <SparklesIcon className="w-4 h-4 text-pink-400" />;
            case 'forge_tool': return <SparklesIcon className="w-4 h-4 text-yellow-500" />;
            case 'spawn_replica': return <CubeTransparentIcon className="w-4 h-4 text-teal-400" />;
            case 'replan': return <RefreshIcon className="w-4 h-4 text-red-400" />;
            case 'translate_text': return <GlobeAltIcon className="w-4 h-4 text-cyan-400" />;
            default: return <CogIcon className="w-4 h-4 text-gray-400" />;
        }
    }
    
    const renderResult = () => {
        if (!step.result) return null;

        if (typeof step.result === 'object' && step.result.id?.startsWith('img-')) {
            return <GeneratedImageViewer image={step.result as GeneratedImage} />;
        }
        
        return <pre className="text-xs text-green-400/80 font-mono italic whitespace-pre-wrap">Result: {String(step.result)}</pre>;
    };

    const isCodeEditable = ['code_interpreter', 'google_search', 'recall_memory', 'generate_image', 'analyze_image_input', 'induce_emotion', 'translate_text', 'summarize_text', 'replan'].includes(step.tool);

    return (
        <li className={`p-2 rounded-md transition-all duration-300 ${isCurrent ? 'bg-nexus-primary/10' : ''} ${isEditable ? 'hover:bg-nexus-surface/50' : ''}`}>
             <div className="flex items-center gap-3">
                 <div className="pt-0.5">{statusIcon()}</div>
                 <div className="flex-grow min-w-0">
                     <p className={`font-semibold flex items-center gap-2 ${isCurrent ? 'text-nexus-primary' : 'text-nexus-text'}`} >
                        {getStepIcon()}
                        <span 
                            className={`${isTruncatable ? 'cursor-pointer' : ''} flex-grow truncate`}
                            title={isTruncatable ? `Click to expand: "${step.description}"` : step.description}
                            onClick={() => isTruncatable && setIsDescriptionExpanded(!isDescriptionExpanded)}
                        >
                            {displayedDescription}
                        </span>
                        {step.inputRef && <span className="text-xs text-nexus-text-muted font-mono flex-shrink-0">(Input: Step {step.inputRef})</span>}
                     </p>
                 </div>
                 <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className={`transform transition-transform duration-200 ${isDetailsOpen ? 'rotate-90' : 'rotate-0'}`}>
                     <ArrowRightIcon className="w-4 h-4 text-nexus-text-muted" />
                 </button>
            </div>
            {isDetailsOpen && (
                <div className="pl-8 pt-2 animate-spawn-in space-y-2">
                    {isEditing ? (
                        <div className="space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                                placeholder="Edit step description..."
                            />
                            {isCodeEditable && (
                                <textarea
                                    value={editCode}
                                    onChange={(e) => setEditCode(e.target.value)}
                                    className="w-full h-20 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                                    placeholder="Edit query, code, or concept..."
                                />
                            )}
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded bg-nexus-surface">Cancel</button>
                                <button onClick={handleSave} className="text-xs px-2 py-1 rounded bg-nexus-primary text-nexus-dark">Save</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex-grow">{renderResult()}</div>
                            {isEditable && (
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    <button onClick={() => setIsEditing(true)} className="p-1 text-nexus-text-muted hover:text-nexus-primary" title="Edit Step"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onMove('up')} disabled={isFirst} className="p-1 text-nexus-text-muted hover:text-nexus-primary disabled:opacity-30" title="Move Up"><ArrowUpIcon className="w-4 h-4"/></button>
                                    <button onClick={() => onMove('down')} disabled={isLast} className="p-1 text-nexus-text-muted hover:text-nexus-primary disabled:opacity-30" title="Move Down"><ArrowDownIcon className="w-4 h-4"/></button>
                                    <button onClick={onDelete} className="p-1 text-nexus-text-muted hover:text-red-500" title="Delete Step"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </li>
    );
};

const ModelMessage: React.FC<CognitiveProcessVisualizerProps & { message: ChatMessage }> = memo((props) => {
    const { message, onExecutePlan, onUpdatePlanStep, onReorderPlan, onAddPlanStep, onDeletePlanStep, onSavePlanAsToolchain, onArchiveTrace, onRerunTrace, onTranslate, constitutions, process } = props;
    const isPlanEditable = message.state === 'awaiting_execution' && !message.isPlanFinalized;
    const [isPlanOpen, setIsPlanOpen] = useState(true);
    const [isResponseCollapsed, setIsResponseCollapsed] = useState(true);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const activeConstitution = constitutions.find(c => c.id === message.constitutionId);

    const handleTranslate = async () => {
        if (!message.text) return;
        setIsTranslating(true);
        setTranslatedText(null);
        try {
            const translation = await onTranslate(message.text, props.language === 'English' ? 'Arabic' : 'English');
            setTranslatedText(translation);
        } catch (e) {
            setTranslatedText("Translation failed.");
        } finally {
            setIsTranslating(false);
        }
    };

    const renderContent = () => {
        if (message.state === 'planning') {
            return (
                <div className="flex items-center text-nexus-text-muted italic">
                    <div className="w-5 h-5 mr-2 relative"><div className="nexus-loader"></div></div>
                    NexusAI is formulating a cognitive plan...
                </div>
            );
        }

        if (message.plan) {
             return (
                <div className="space-y-4">
                     <div onClick={() => setIsPlanOpen(!isPlanOpen)} className="font-bold text-nexus-primary uppercase tracking-wider text-sm mb-2 cursor-pointer list-none flex justify-between items-center">
                        <span className="flex items-center gap-2">
                            <span className={`transform transition-transform duration-200 ${isPlanOpen ? 'rotate-90' : 'rotate-0'}`}>
                                <ArrowRightIcon className="w-4 h-4" />
                            </span>
                             {isPlanEditable ? "Cognitive Plan (Review & Edit)" : "Cognitive Plan"}
                        </span>
                         {activeConstitution && (
                            <div className="relative group text-xs font-normal normal-case bg-nexus-dark px-2 py-0.5 rounded-full text-nexus-secondary font-mono" title={activeConstitution.description}>
                                {activeConstitution.name}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                     Constitution active during planning.
                                     <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
                                </div>
                            </div>
                        )}
                         {message.isPlanFinalized && (
                            <button onClick={() => onSavePlanAsToolchain(message.plan!)} title="Save as Toolchain" className="flex items-center gap-1 text-xs bg-nexus-surface px-2 py-1 rounded text-nexus-text-muted hover:bg-nexus-primary hover:text-nexus-dark transition-all">
                                <LinkIcon className="w-3 h-3"/> Save as Toolchain
                            </button>
                         )}
                    </div>
                    
                    {isPlanOpen && (
                        <div className="animate-spawn-in">
                            <ul className="space-y-1">
                                {message.plan.map((step, index) => (
                                    <PlanStepView
                                      key={`${message.id}-step-${step.step}`}
                                      step={step}
                                      isCurrent={message.currentStep === index}
                                      isEditable={isPlanEditable}
                                      onUpdate={(newStep) => onUpdatePlanStep(message.id, index, newStep)}
                                      onDelete={() => onDeletePlanStep(message.id, index)}
                                      onMove={(dir) => onReorderPlan(message.id, index, dir === 'up' ? index - 1 : index + 1)}
                                      isFirst={index === 0}
                                      isLast={index === message.plan.length - 1}
                                    />
                                ))}
                            </ul>
                             {isPlanEditable && (
                                <button onClick={() => onAddPlanStep(message.id)} className="text-xs flex items-center gap-1 text-nexus-secondary hover:text-nexus-primary mt-2 p-1">
                                    <PlusCircleIcon className="w-4 h-4" /> Add Step
                                </button>
                            )}
                        </div>
                    )}


                    {isPlanEditable && (
                         <div className="pt-4 border-t border-nexus-surface/50 flex justify-center">
                             <button
                                onClick={() => onExecutePlan(message.id)}
                                className="w-1/2 flex items-center justify-center gap-2 bg-nexus-primary/90 text-nexus-dark font-bold py-3 px-4 rounded-md border border-nexus-primary/80 hover:bg-nexus-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-nexus-secondary animate-load-pulse"
                            >
                                <PlayIcon className="w-6 h-6"/> Execute Plan
                             </button>
                         </div>
                    )}
                    
                    {message.isPlanFinalized && message.state === 'executing' && (
                         <p className="text-nexus-accent italic animate-pulse text-sm text-center pt-2">Executing plan...</p>
                    )}

                    {message.state === 'synthesizing' && (
                        <div className="pt-4 border-t border-nexus-surface/50 animate-spawn-in">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-nexus-primary uppercase tracking-wider text-sm">Synthesizing Answer</h4>
                                {process.activeAffectiveState && (
                                     <div className="relative group">
                                         <LightBulbIcon className="w-5 h-5 text-yellow-400" title={`Influenced by mood: ${process.activeAffectiveState.mood}`} />
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                             Influenced by active Affective State.
                                             <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
                                         </div>
                                     </div>
                                )}
                             </div>
                            <div className="text-nexus-text">
                                <pre className="text-sm whitespace-pre-wrap font-sans">{message.text}</pre>
                                <span className="inline-block w-2 h-4 bg-nexus-primary animate-pulse ml-1 align-bottom"></span>
                            </div>
                        </div>
                    )}

                    {message.state === 'done' && (
                        <div className="pt-4 border-t border-nexus-surface/50">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-nexus-primary uppercase tracking-wider text-sm">Synthesized Answer</h4>
                                <div className="flex items-center gap-2">
                                {message.affectiveStateSnapshot && (
                                     <div className="relative group">
                                         <LightBulbIcon className="w-5 h-5 text-yellow-400" title={`Influenced by mood: ${message.affectiveStateSnapshot.mood}`} />
                                         <div className="absolute bottom-full right-0 mb-2 w-48 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                             Influenced by Affective State at time of synthesis.
                                             <div className="absolute top-full right-3 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
                                         </div>
                                     </div>
                                )}
                                <button onClick={() => setIsResponseCollapsed(!isResponseCollapsed)} className="text-xs text-nexus-text-muted hover:text-white">
                                    {isResponseCollapsed ? 'Expand' : 'Collapse'}
                                </button>
                                </div>
                             </div>
                             <div className={`${isResponseCollapsed ? 'max-h-32 overflow-hidden relative' : ''}`}>
                                 <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text">{String(message.text || "...")}</pre>
                                 {isResponseCollapsed && <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-nexus-surface/80 to-transparent"></div>}
                             </div>
                             {translatedText && (
                                <div className="mt-3 pt-3 border-t border-dashed border-nexus-surface/50">
                                    <h5 className="text-xs font-semibold text-nexus-secondary">Translation:</h5>
                                    <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text-muted">{translatedText}</pre>
                                </div>
                             )}
                            <div className="flex justify-center items-center gap-4 mt-4">
                                <button 
                                    onClick={() => onArchiveTrace(message.id)}
                                    className="flex items-center gap-2 bg-blue-500/20 text-blue-400 font-bold py-2 px-4 rounded-md border border-blue-500/50 hover:bg-blue-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                                    Archive
                                </button>
                                <button 
                                    onClick={() => onRerunTrace(message)}
                                    className="flex items-center gap-2 bg-green-500/20 text-green-400 font-bold py-2 px-4 rounded-md border border-green-500/50 hover:bg-green-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                                >
                                    <RefreshIcon className="w-5 h-5" />
                                    Rerun
                                </button>
                                <button 
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                    className="flex items-center gap-2 bg-purple-500/20 text-purple-400 font-bold py-2 px-4 rounded-md border border-purple-500/50 hover:bg-purple-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
                                >
                                    <GlobeAltIcon className="w-5 h-5" />
                                    {isTranslating ? 'Translating...' : 'Translate'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
             );
        }
        
        return (
            <pre className="text-sm whitespace-pre-wrap font-sans text-nexus-text">{String(message.text || "...")}</pre>
        );
    }

    const getModelIcon = () => {
        switch(message.state) {
            case 'planning': return <BrainCircuitIcon className="w-8 h-8 text-nexus-accent animate-pulse-slow"/>;
            case 'awaiting_execution': return <PencilIcon className="w-8 h-8 text-yellow-400 animate-pulse-slow"/>;
            case 'executing':
            case 'synthesizing': 
                return <div className="w-8 h-8 relative"><div className="nexus-loader"></div></div>;
            case 'done': return <BrainCircuitIcon className="w-8 h-8 text-nexus-secondary animate-glow-pulse" />;
            case 'error': return <BrainCircuitIcon className="w-8 h-8 text-red-500" />;
            default: return <BrainCircuitIcon className="w-8 h-8 text-nexus-text-muted" />;
        }
    }

    return (
        <div className="flex justify-start my-2 animate-spawn-in">
            <div className="w-8 h-8 mr-3 flex-shrink-0">{getModelIcon()}</div>
            
            <div className="bg-nexus-surface/80 border border-nexus-surface rounded-xl rounded-bl-none max-w-2xl p-4 shadow-lg w-full">
                <div className="text-sm text-nexus-text space-y-2">
                   {renderContent()}
                </div>

                {message.state === 'error' && (
                     <p className="text-red-400 font-semibold mt-2 pt-2 border-t border-red-500/30">{message.text}</p>
                )}

                {message.state === 'done' && <GroundingCitations metadata={message.groundingMetadata} />}
            </div>
        </div>
    );
});
ModelMessage.displayName = 'ModelMessage';

const CognitiveProcessVisualizer: React.FC<CognitiveProcessVisualizerProps> = (props) => {
  const { process } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [process.history, process.history[process.history.length - 1]?.text, process.state]);


  if (!process || process.history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-nexus-text-muted p-4">
        <BrainCircuitIcon className="w-12 h-12 mb-4" />
        <p className="font-semibold">AI Core Idle</p>
        <p className="text-sm">Submit a query in the Cognitive Command console to begin a dialogue.</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full w-full overflow-y-auto p-4 space-y-4 pb-48">
      {process.history.map(message => 
          message.role === 'user'
            ? <UserMessage key={message.id} message={message} />
            : <ModelMessage key={message.id} message={message} {...props} />
      )}
    </div>
  );
};

export default memo(CognitiveProcessVisualizer);