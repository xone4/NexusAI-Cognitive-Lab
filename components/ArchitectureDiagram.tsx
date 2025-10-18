import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Replica, MentalTool, CognitiveProcess, AppSettings, ActiveView } from '../types';
import DashboardCard from './DashboardCard';
import ArchitectureDetailModal, { DetailItem } from './ArchitectureDetailModal';
import { 
    ArchIcon, BrainCircuitIcon, CodeBracketIcon, CubeTransparentIcon, GlobeAltIcon, 
    UserGroupIcon, CircleStackIcon, ArrowsRightLeftIcon, FireIcon, LightBulbIcon
} from './Icons';

type ViewMode = 'structural' | 'data_flow' | 'cognitive_load';

interface ArchitectureDiagramProps {
    replicas: Replica | null;
    tools: MentalTool[];
    cognitiveProcess: CognitiveProcess;
    settings: AppSettings;
    setActiveView: (view: ActiveView) => void;
    replicaCount: number;
}

const ArchBox: React.FC<{ title: string; items?: string[]; icon: React.ReactNode; className?: string; onClick?: () => void; isInteractive?: boolean; isGlowing?: boolean, children?: React.ReactNode }> = 
({ title, items, icon, className, onClick, isInteractive, isGlowing, children }) => (
  <div 
    className={`bg-nexus-surface/50 border border-nexus-primary/30 p-4 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden
    ${isInteractive ? 'cursor-pointer hover:border-nexus-secondary hover:bg-nexus-surface' : ''}
    ${isGlowing ? 'animate-load-pulse border-nexus-accent' : ''}
    ${className}`}
    onClick={onClick}
  >
    <div className="w-8 h-8 text-nexus-secondary mb-2 z-10">{icon}</div>
    <h4 className="font-bold text-nexus-text mb-2 z-10">{title}</h4>
    {items && <ul className="text-xs text-nexus-text-muted space-y-1 z-10">
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>}
    {children}
  </div>
);

const Connector: React.FC<{ type?: 'x' | 'y'; isAnimated?: boolean }> = ({ type = 'y', isAnimated=false }) => {
  const baseClasses = "bg-nexus-primary/30";
  const animatedClasses = isAnimated 
    ? `bg-gradient-to-t from-nexus-primary via-nexus-secondary to-nexus-primary bg-[length:100%_300%] ${type === 'y' ? 'animate-data-flow-y' : 'animate-data-flow-x'}`
    : '';
  
  return (
    <div className={`flex items-center justify-center ${type === 'y' ? 'h-8' : 'w-16 mx-auto'}`}>
      <div className={`${baseClasses} ${type === 'y' ? 'w-0.5 h-full' : 'h-0.5 w-full'} ${animatedClasses}`}></div>
    </div>
  );
};


//======= VIEW MODES =======//

const StructuralView: React.FC<ArchitectureDiagramProps & { onSelectDetail: (item: DetailItem) => void }> = ({ replicaCount, tools, settings, cognitiveProcess, onSelectDetail }) => {
    const { t } = useTranslation();
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    
    const lastMessage = cognitiveProcess.history[cognitiveProcess.history.length - 1];
    const currentStep = (lastMessage?.role === 'model' && lastMessage.currentStep !== undefined) ? lastMessage.plan?.[lastMessage.currentStep] : null;
    const activeTool = currentStep?.tool;

    const personalityCode = `${settings.coreAgentPersonality.energyFocus[0]}${settings.coreAgentPersonality.informationProcessing[0]}${settings.coreAgentPersonality.decisionMaking[0]}${settings.coreAgentPersonality.worldApproach[0]}`;

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 space-y-2 font-sans">
            <ArchBox title={t('architecture.userInterfaceLayer')} items={[t('architecture.animation', {level: settings.animationLevel}), t('architecture.verbosity', {level: settings.logVerbosity})]} icon={<UserGroupIcon />} className="w-full md:w-1/2" isInteractive onClick={() => onSelectDetail({ type: 'ui', data: { settings } })} />
            <Connector />
            <ArchBox title={t('architecture.nexusCoreEngine')} items={[t('architecture.personality', {personality: personalityCode}), t('architecture.status', {status: cognitiveProcess.state})]} icon={<BrainCircuitIcon />} className="w-full md:w-2/3" isGlowing={isThinking && !activeTool} isInteractive onClick={() => onSelectDetail({ type: 'core', data: { cognitiveProcess, settings } })}/>
            <div className="w-full flex justify-center items-center">
                <Connector />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-5/6">
                 <ArchBox title={t('architecture.affectiveCore')} items={[t('architecture.state', {state: cognitiveProcess.activeAffectiveState ? cognitiveProcess.activeAffectiveState.mood : t('architecture.dormant')})]} icon={<LightBulbIcon />} className="w-full" isGlowing={activeTool === 'induce_emotion'} isInteractive onClick={() => onSelectDetail({ type: 'affective_core', data: { cognitiveProcess } })}/>
                 <ArchBox title={t('architecture.longTermMemory')} items={[t('architecture.archiveOfTraces')]} icon={<CircleStackIcon />} className="w-full" isInteractive onClick={() => onSelectDetail({ type: 'memory', data: {} })} isGlowing={activeTool === 'recall_memory'} />
            </div>
             <div className="w-full flex justify-center items-center">
                <Connector />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-5/6">
                <ArchBox title={t('architecture.replicas')} items={[t('architecture.replicaInstances', { count: replicaCount })]} icon={<CubeTransparentIcon />} isInteractive onClick={() => onSelectDetail({ type: 'replicas_summary', data: { replicaCount } })} isGlowing={activeTool === 'spawn_replica'} />
                <ArchBox title={t('architecture.mentalTools')} items={[t('architecture.toolsAvailable', { count: tools.length })]} icon={<CodeBracketIcon />} isInteractive onClick={() => onSelectDetail({ type: 'tools_summary', data: { tools } })} isGlowing={!!activeTool && !['induce_emotion', 'recall_memory', 'spawn_replica', 'synthesize_answer'].includes(activeTool)} />
            </div>
            <Connector />
            <ArchBox title={t('architecture.externalIntegrations')} items={[t('architecture.model', {model: settings.model}), 'Google Search', 'Federated Learning']} icon={<GlobeAltIcon />} className="w-full md:w-2/3" isInteractive onClick={() => onSelectDetail({ type: 'integrations', data: { settings } })} />
      </div>
    );
};

const DataFlowView: React.FC<ArchitectureDiagramProps & { onSelectDetail: (item: DetailItem) => void }> = ({ cognitiveProcess, settings, replicaCount, tools, onSelectDetail }) => {
    const { t } = useTranslation();
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    
    const lastMessage = cognitiveProcess.history[cognitiveProcess.history.length - 1];
    const currentStep = (lastMessage?.role === 'model' && lastMessage.currentStep !== undefined) ? lastMessage.plan?.[lastMessage.currentStep] : null;
    const activeTool = currentStep?.tool;

    return (
        <div className="h-full w-full flex flex-col items-center justify-around p-4 font-sans text-center">
            <ArchBox title={t('architecture.ui_ux')} icon={<UserGroupIcon />} className="w-48" isInteractive onClick={() => onSelectDetail({ type: 'ui', data: { settings } })}/>
            <Connector isAnimated={isThinking} />
            <ArchBox title={t('architecture.nexusCore')} icon={<BrainCircuitIcon />} className="w-48" isGlowing={isThinking} isInteractive onClick={() => onSelectDetail({ type: 'core', data: { cognitiveProcess, settings } })}>
                {cognitiveProcess.activeAffectiveState && <LightBulbIcon className="absolute w-5 h-5 top-2 right-2 text-yellow-300 animate-pulse" />}
            </ArchBox>
            <div className="w-full flex justify-around items-center my-2">
                <Connector type="x" isAnimated={isThinking} />
                <Connector type="x" isAnimated={isThinking} />
            </div>
            <div className="w-full flex justify-around">
                <ArchBox title={t('architecture.replicas')} icon={<CubeTransparentIcon />} className="w-48" isGlowing={activeTool === 'spawn_replica'} isInteractive onClick={() => onSelectDetail({ type: 'replicas_summary', data: { replicaCount } })}/>
                <ArchBox title={t('architecture.tools')} icon={<CodeBracketIcon />} className="w-48" isGlowing={!!activeTool && !['induce_emotion', 'recall_memory', 'spawn_replica', 'synthesize_answer'].includes(activeTool)} isInteractive onClick={() => onSelectDetail({ type: 'tools_summary', data: { tools } })}/>
                <ArchBox title={t('architecture.memory')} icon={<CircleStackIcon />} className="w-48" isGlowing={activeTool === 'recall_memory'} isInteractive onClick={() => onSelectDetail({ type: 'memory', data: {} })}/>
            </div>
        </div>
    );
};

const CognitiveLoadView: React.FC<ArchitectureDiagramProps & { onSelectDetail: (item: DetailItem) => void }> = ({ replicas, tools, cognitiveProcess, settings, onSelectDetail }) => {
    const { t } = useTranslation();
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    const lastMessage = cognitiveProcess.history[cognitiveProcess.history.length - 1];
    const currentStep = (lastMessage?.role === 'model' && lastMessage.currentStep !== undefined) ? lastMessage.plan?.[lastMessage.currentStep] : null;
    const activeTool = currentStep?.tool;
    
    const calculateCoreLoad = () => {
        if (!isThinking) return 0.1;
        const states: CognitiveProcess['state'][] = ['Receiving', 'Planning', 'Executing', 'Synthesizing'];
        let load = states.includes(cognitiveProcess.state) ? 0.7 + Math.random() * 0.2 : 0.3;
        if(cognitiveProcess.activeAffectiveState) load += 0.1;
        return Math.min(1, load);
    }
    const coreLoad = calculateCoreLoad();

    return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="relative w-96 h-96 border-2 border-nexus-primary/20 rounded-full flex items-center justify-center">
                {/* Core */}
                <div 
                    onClick={() => onSelectDetail({ type: 'core', data: { cognitiveProcess, settings } })}
                    className="absolute w-24 h-24 bg-nexus-surface rounded-full flex flex-col items-center justify-center text-center transition-all duration-500 cursor-pointer hover:scale-110"
                    style={{ transform: `scale(${1 + coreLoad * 0.3})`, boxShadow: `0 0 ${coreLoad * 25}px ${coreLoad * 10}px rgba(0, 170, 255, ${coreLoad * 0.5})` }}
                >
                    <BrainCircuitIcon className="w-8 h-8 text-nexus-primary" />
                    <span className="text-xs font-bold mt-1">{t('architecture.core')}</span>
                </div>
                {/* Affective Core */}
                <div 
                     onClick={() => onSelectDetail({ type: 'affective_core', data: { cognitiveProcess } })}
                     className="absolute transition-all duration-500 cursor-pointer hover:scale-125"
                     style={{
                        top: 'calc(50% - 16px)', left: 'calc(50% - 80px)',
                        animation: activeTool === 'induce_emotion' ? 'glow-pulse 2s infinite' : 'none',
                        filter: activeTool === 'induce_emotion' ? 'drop-shadow(0 0 8px #facc15)' : 'none',
                     }}
                     title="Affective Core">
                    <LightBulbIcon className="w-8 h-8 text-yellow-400" />
                </div>
                {/* Memory */}
                 <div 
                    onClick={() => onSelectDetail({ type: 'memory', data: {} })}
                    className="absolute transition-all duration-500 cursor-pointer hover:scale-125"
                     style={{
                        top: 'calc(50% - 16px)', left: 'calc(50% + 48px)',
                        animation: activeTool === 'recall_memory' ? 'glow-pulse 2s infinite' : 'none',
                        filter: activeTool === 'recall_memory' ? 'drop-shadow(0 0 8px #a78bfa)' : 'none',
                     }}
                     title="Memory">
                    <CircleStackIcon className="w-8 h-8 text-purple-400" />
                </div>
                {/* Replicas */}
                {replicas?.children.map((replica, i) => {
                    const angle = (i / replicas.children.length) * 2 * Math.PI;
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const loadScale = 0.5 + (replica.load / 100) * 0.5;
                    const isGlowing = activeTool === 'spawn_replica';
                    return (
                        <div 
                            key={replica.id} 
                            onClick={() => onSelectDetail({ type: 'replica', data: replica })}
                            className="absolute w-12 h-12 bg-nexus-surface/80 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:!scale-125 hover:z-10"
                            style={{ 
                                top: `calc(50% - 24px + ${y}px)`, 
                                left: `calc(50% - 24px + ${x}px)`, 
                                transform: `scale(${loadScale})`,
                                border: replica.status === 'Active' ? '2px solid #00e5ff' : '2px solid #a0a0a0',
                                opacity: replica.status === 'Dormant' ? 0.6 : 1,
                                animation: isGlowing ? 'glow-pulse 2s infinite' : 'none',
                            }}
                            title={`${replica.name} - Load: ${replica.load.toFixed(0)}%`}
                        >
                            <CubeTransparentIcon className="w-6 h-6" />
                        </div>
                    );
                })}
                 {/* Tools */}
                 {tools.map((tool, i) => {
                    const angle = (i / tools.length) * 2 * Math.PI + Math.PI/4; // offset angle
                    const radius = 180;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const isActive = tool.status === 'Active' || tool.status === 'Optimizing';
                    const isCurrentTool = !!activeTool && !['induce_emotion', 'recall_memory', 'spawn_replica', 'synthesize_answer'].includes(activeTool);
                    return (
                        <div 
                            key={tool.id} 
                            onClick={() => onSelectDetail({ type: 'tool', data: tool })}
                            className="absolute w-8 h-8 bg-nexus-dark rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:!scale-125 hover:z-10"
                            style={{ 
                                top: `calc(50% - 16px + ${y}px)`, 
                                left: `calc(50% - 16px + ${x}px)`, 
                                border: isActive ? '2px solid #ff00aa' : '2px solid #18213a',
                                animation: isCurrentTool ? 'glow-pulse 2s infinite' : 'none'
                            }}
                            title={tool.name}
                        >
                            <CodeBracketIcon className="w-4 h-4" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = (props) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';
    const [viewMode, setViewMode] = useState<ViewMode>('structural');
    const [detailItem, setDetailItem] = useState<DetailItem | null>(null);

    const handleNavigate = (view: ActiveView) => {
        setDetailItem(null);
        props.setActiveView(view);
    };

    const viewModes: { id: ViewMode, label: string, icon: React.ReactNode }[] = [
        { id: 'structural', label: t('architecture.structural'), icon: <ArchIcon /> },
        { id: 'data_flow', label: t('architecture.dataFlow'), icon: <ArrowsRightLeftIcon /> },
        { id: 'cognitive_load', label: t('architecture.cognitiveLoad'), icon: <FireIcon /> },
    ];
    
    const renderView = () => {
        const viewProps = { ...props, onSelectDetail: setDetailItem };
        switch(viewMode) {
            case 'structural': return <StructuralView {...viewProps} />;
            case 'data_flow': return <DataFlowView {...viewProps} />;
            case 'cognitive_load': return <CognitiveLoadView {...viewProps} />;
            default: return <StructuralView {...viewProps} />;
        }
    }

    return (
        <>
            <DashboardCard title={t('architecture.title')} icon={<ArchIcon />} fullHeight className="flex flex-col">
                <div className="flex justify-center p-2 bg-nexus-dark/50 rounded-t-xl">
                    <div className="inline-flex rounded-full shadow-sm" role="group">
                        {viewModes.map(mode => (
                            <button
                                key={mode.id}
                                type="button"
                                onClick={() => setViewMode(mode.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors duration-200
                                    ${viewMode === mode.id 
                                        ? 'bg-nexus-primary text-nexus-dark border-nexus-primary z-10' 
                                        : 'bg-nexus-surface text-nexus-text-muted border-nexus-surface/50 hover:bg-nexus-surface/80 hover:text-nexus-text'
                                    }
                                    ${isRtl ? 'first:rounded-e-full last:rounded-s-full' : 'first:rounded-s-full last:rounded-e-full'}`}
                            >
                                <div className="w-5 h-5">{mode.icon}</div>
                                {mode.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow bg-nexus-bg rounded-b-xl">
                    {renderView()}
                </div>
            </DashboardCard>
            <ArchitectureDetailModal item={detailItem} onClose={() => setDetailItem(null)} onNavigate={handleNavigate} />
        </>
    );
};

export default ArchitectureDiagram;