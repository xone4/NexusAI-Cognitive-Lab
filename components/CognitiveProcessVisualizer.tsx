import React, { memo, useEffect, useRef, useState } from 'react';
import type { CognitiveProcess, ChatMessage, PlanStep, CognitiveConstitution, SimulatedImage } from '../types';
import { BrainCircuitIcon, UserIcon, BookOpenIcon, CogIcon, CheckCircleIcon, CubeTransparentIcon, PlayIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlusCircleIcon, CodeBracketIcon, LightBulbIcon, LinkIcon, ArrowRightIcon, PhotographIcon, SparklesIcon } from './Icons';
import Markdown from 'react-markdown';

interface CognitiveProcessVisualizerProps {
  process: CognitiveProcess;
  onExecutePlan: (messageId: string) => void;
  onUpdatePlanStep: (messageId: string, stepIndex: number, newStep: PlanStep) => void;
  onReorderPlan: (messageId: string, fromIndex: number, toIndex: number) => void;
  onAddPlanStep: (messageId: string) => void;
  onDeletePlanStep: (messageId: string, stepIndex: number) => void;
  onSavePlanAsToolchain: (plan: PlanStep[]) => void;
  constitutions: CognitiveConstitution[];
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
                             {chunk.web.title || chunk.web.uri}
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
            <p className="text-sm">{message.text}</p>
        </div>
        <UserIcon className="w-8 h-8 text-nexus-primary ml-3 flex-shrink-0" />
    </div>
));
UserMessage.displayName = 'UserMessage';

const SimulatedImageViewer: React.FC<{ image: SimulatedImage }> = memo(({ image }) => {
    const { balance, complexity, harmony, novelty } = image.properties;
    
    // Generate a deterministic but visually interesting background
    const gradientAngle = (harmony * 360).toFixed(0);
    const colorStop1 = `hsl(${(novelty * 360).toFixed(0)}, 70%, 50%)`;
    const colorStop2 = `hsl(${(balance * 120 + 240).toFixed(0)}, 60%, 50%)`;

    return (
        <div className="mt-2 p-2 bg-nexus-dark/50 rounded-md">
            <p className="text-xs text-nexus-text-muted font-mono mb-2">Generated Image: {image.id}</p>
            <div 
                className="w-full h-24 rounded border-2 border-nexus-surface"
                style={{
                    background: `linear-gradient(${gradientAngle}deg, ${colorStop1}, ${colorStop2})`,
                    filter: `blur(${(1-complexity) * 3}px)`,
                    opacity: 0.8
                }}
            ></div>
        </div>
    );
});
SimulatedImageViewer.displayName = 'SimulatedImageViewer';


const PlanStepView: React.FC<{ step: PlanStep, isCurrent: boolean, isEditable: boolean, onUpdate: (newStep: PlanStep) => void, onDelete: () => void, onMove: (direction: 'up' | 'down') => void, isFirst: boolean, isLast: boolean }> = ({ step, isCurrent, isEditable, onUpdate, onDelete, onMove, isFirst, isLast }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(step.tool === 'code_interpreter' ? step.code || '' : step.tool === 'evoke_qualia' ? step.concept || '' : step.query || '');

    const handleSave = () => {
        const newStep = { ...step };
        if (step.tool === 'code_interpreter') {
            newStep.code = editContent;
            newStep.description = `Execute code: ${editContent.slice(0, 30)}...`;
        } else if (step.tool === 'google_search') {
            newStep.query = editContent;
            newStep.description = `Search web for: "${editContent}"`;
        } else if (step.tool === 'evoke_qualia') {
            newStep.concept = editContent;
            newStep.description = `Evoke qualia for: "${editContent}"`;
        }
        onUpdate(newStep);
        setIsEditing(false);
    };

    const statusIcon = () => {
        switch (step.status) {
            case 'pending': return <div className="w-5 h-5 rounded-full border-2 border-nexus-text-muted/50" title="Pending" />;
            case 'executing': return <CogIcon className="w-5 h-5 text-nexus-accent animate-spin" title="Executing"/>;
            case 'complete': return <CheckCircleIcon className="w-5 h-5 text-nexus-secondary" title="Complete"/>;
            case 'error': return <div className="w-5 h-5 rounded-full bg-red-500" title="Error"/>;
            default: return null;
        }
    };

    const getStepIcon = () => {
        switch(step.tool) {
            case 'google_search': return <CubeTransparentIcon className="w-4 h-4 text-blue-400" />;
            case 'code_interpreter': return <CodeBracketIcon className="w-4 h-4 text-purple-400" />;
            case 'evoke_qualia': return <LightBulbIcon className="w-4 h-4 text-yellow-400" />;
            case 'generate_image': return <PhotographIcon className="w-4 h-4 text-green-400" />;
            case 'analyze_image_input': return <SparklesIcon className="w-4 h-4 text-pink-400" />;
            default: return <CogIcon className="w-4 h-4 text-gray-400" />;
        }
    }
    
    const renderResult = () => {
        if (!step.result) return null;

        if (typeof step.result === 'object' && step.result.id?.startsWith('img-')) {
            return <SimulatedImageViewer image={step.result as SimulatedImage} />;
        }
        
        return <p className="text-xs text-green-400/80 font-mono italic">Result: {String(step.result).substring(0, 100)}...</p>;
    };


    return (
        <li className={`p-2 rounded-md transition-all duration-300 ${isCurrent ? 'bg-nexus-primary/10' : ''} ${isEditable ? 'hover:bg-nexus-surface/50' : ''}`}>
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                 <div className="pt-0.5">{statusIcon()}</div>
                 <div className="flex-grow">
                     <p className={`font-semibold flex items-center gap-2 ${isCurrent ? 'text-nexus-primary' : 'text-nexus-text'}`}>
                        {getStepIcon()}
                        {step.description}
                        {step.inputRef && <span className="text-xs text-nexus-text-muted font-mono">(Input: Step {step.inputRef})</span>}
                     </p>
                 </div>
                 <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
                     <ArrowRightIcon className="w-4 h-4 text-nexus-text-muted" />
                 </span>
            </div>
            {isOpen && (
                <div className="pl-8 pt-2 animate-spawn-in">
                    {isEditing ? (
                        <div>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-20 p-2 bg-nexus-dark/70 border border-nexus-surface rounded-md focus:outline-none focus:ring-2 focus:ring-nexus-primary text-nexus-text font-mono text-sm"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs px-2 py-1 rounded bg-nexus-surface">Cancel</button>
                                <button onClick={handleSave} className="text-xs px-2 py-1 rounded bg-nexus-primary text-nexus-dark">Save</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex-grow">{renderResult()}</div>
                            {isEditable && (
                                <div className="flex-shrink-0 flex items-center gap-1">
                                    { (step.tool !== 'synthesize_answer') && <button onClick={() => setIsEditing(true)} className="p-1 text-nexus-text-muted hover:text-nexus-primary" title="Edit Step"><PencilIcon className="w-4 h-4"/></button> }
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
    const { message, onExecutePlan, onUpdatePlanStep, onReorderPlan, onAddPlanStep, onDeletePlanStep, onSavePlanAsToolchain, constitutions } = props;
    const isPlanEditable = message.state === 'awaiting_execution' && !message.isPlanFinalized;
    const [isPlanOpen, setIsPlanOpen] = useState(true);
    const activeConstitution = constitutions.find(c => c.id === message.constitutionId);

    const renderContent = () => {
        if (message.state === 'planning') {
            return (
                <div className="flex items-center text-nexus-text-muted italic">
                    <CogIcon className="w-5 h-5 mr-2 animate-spin" />
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

                    {message.state === 'done' && (
                        <div className="pt-4 border-t border-nexus-surface/50">
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-nexus-primary uppercase tracking-wider text-sm">Synthesized Answer</h4>
                                {message.qualiaVector && (
                                     <div className="relative group">
                                         <LightBulbIcon className="w-5 h-5 text-yellow-400" />
                                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-nexus-dark text-white text-xs rounded-md p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                             Influenced by active Qualia state.
                                             <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-nexus-dark"></div>
                                         </div>
                                     </div>
                                )}
                             </div>
                            <div className="prose prose-invert prose-sm max-w-none text-nexus-text">
                                <Markdown>{message.text || "..."}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
             );
        }
        
        return (
            <div className="prose prose-invert prose-sm max-w-none text-nexus-text">
                <Markdown>{message.text || "..."}</Markdown>
            </div>
        );
    }

    const getModelIcon = () => {
        switch(message.state) {
            case 'planning': return <CogIcon className="w-8 h-8 text-nexus-accent animate-spin"/>;
            case 'awaiting_execution': return <PencilIcon className="w-8 h-8 text-yellow-400 animate-pulse-slow"/>;
            case 'executing': return <CogIcon className="w-8 h-8 text-nexus-accent animate-spin"/>;
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
    <div ref={scrollRef} className="h-full w-full overflow-y-auto p-2 space-y-4">
      {process.history.map(message => 
          message.role === 'user'
            ? <UserMessage key={message.id} message={message} />
            : <ModelMessage key={message.id} message={message} {...props} />
      )}
    </div>
  );
};

export default memo(CognitiveProcessVisualizer);
