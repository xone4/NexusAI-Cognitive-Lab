import React, { useState } from 'react';
import type { Replica, MentalTool, CognitiveProcess, AppSettings, ActiveView } from '../types';
import DashboardCard from './DashboardCard';
import { 
    ArchIcon, BrainCircuitIcon, CodeBracketIcon, CubeTransparentIcon, GlobeAltIcon, 
    UserGroupIcon, VariableIcon, ViewColumnsIcon, ArrowsRightLeftIcon, FireIcon, LightBulbIcon
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
    className={`bg-nexus-surface/50 border border-nexus-primary/30 p-4 rounded-lg text-center flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden
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

const StructuralView: React.FC<ArchitectureDiagramProps> = ({ replicaCount, tools, settings, cognitiveProcess, setActiveView }) => {
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 space-y-2 font-sans">
            <ArchBox title="User Interface Layer" items={[`Animation: ${settings.animationLevel}`, `Verbosity: ${settings.logVerbosity}`]} icon={<UserGroupIcon />} className="w-full md:w-1/2" isInteractive onClick={() => setActiveView('settings')} />
            <Connector />
            <ArchBox title="Nexus Core Engine" items={[`Personality: ${settings.systemPersonality}`, `Status: ${cognitiveProcess.state}`]} icon={<BrainCircuitIcon />} className="w-full md:w-2/3" isGlowing={isThinking}/>
            <div className="w-full flex justify-center items-center">
                <Connector />
                <Connector />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-5/6">
                 <ArchBox title="Qualia Vector Space (QVS)" items={[`State: ${cognitiveProcess.activeQualiaVector ? 'Active' : 'Dormant'}`]} icon={<LightBulbIcon />} className="w-full" isGlowing={!!cognitiveProcess.activeQualiaVector} />
                 <div className="flex items-center justify-center">
                    <div className="w-0.5 h-full bg-nexus-primary/30"></div>
                 </div>
            </div>
             <div className="w-full flex justify-center items-center">
                <Connector />
             </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-5/6">
                <ArchBox title="Replicas" items={[`${replicaCount} Active Instances`]} icon={<CubeTransparentIcon />} isInteractive onClick={() => setActiveView('replicas')} />
                <ArchBox title="Mental Tools" items={[`${tools.length} Tools Available`]} icon={<CodeBracketIcon />} isInteractive onClick={() => setActiveView('tools')} />
            </div>
            <Connector />
            <ArchBox title="External Integrations" items={[`Model: ${settings.model}`, 'Google Search', 'Federated Learning']} icon={<GlobeAltIcon />} className="w-full md:w-2/3" isInteractive onClick={() => setActiveView('settings')} />
      </div>
    );
};

const DataFlowView: React.FC<ArchitectureDiagramProps> = ({ cognitiveProcess }) => {
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    return (
        <div className="h-full w-full flex flex-col items-center justify-around p-4 font-sans text-center">
            <ArchBox title="UI/UX" icon={<UserGroupIcon />} className="w-48"/>
            <Connector isAnimated={isThinking} />
            <ArchBox title="Nexus Core" icon={<BrainCircuitIcon />} className="w-48" isGlowing={isThinking} >
                {cognitiveProcess.activeQualiaVector && <LightBulbIcon className="absolute w-5 h-5 top-2 right-2 text-yellow-300 animate-pulse" />}
            </ArchBox>
            <div className="w-full flex justify-around items-center my-2">
                <Connector type="x" isAnimated={isThinking} />
                <Connector type="x" isAnimated={isThinking} />
            </div>
            <div className="w-full flex justify-around">
                <ArchBox title="Replicas" icon={<CubeTransparentIcon />} className="w-48"/>
                <ArchBox title="Tools" icon={<CodeBracketIcon />} className="w-48"/>
                <ArchBox title="Memory" icon={<VariableIcon />} className="w-48"/>
            </div>
        </div>
    );
};

const CognitiveLoadView: React.FC<ArchitectureDiagramProps> = ({ replicas, tools, cognitiveProcess }) => {
    const isThinking = cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled';
    
    const calculateCoreLoad = () => {
        if (!isThinking) return 0.1;
        const states: CognitiveProcess['state'][] = ['Receiving', 'Planning', 'Executing', 'Synthesizing'];
        let load = states.includes(cognitiveProcess.state) ? 0.7 + Math.random() * 0.2 : 0.3;
        if(cognitiveProcess.activeQualiaVector) load += 0.1; // Qualia adds cognitive load
        return Math.min(1, load);
    }
    const coreLoad = calculateCoreLoad();

    return (
        <div className="h-full w-full flex items-center justify-center p-4">
            <div className="relative w-96 h-96 border-2 border-nexus-primary/20 rounded-full flex items-center justify-center">
                {/* Core */}
                <div 
                    className="absolute w-24 h-24 bg-nexus-surface rounded-full flex flex-col items-center justify-center text-center transition-all duration-500"
                    style={{ transform: `scale(${1 + coreLoad * 0.3})`, boxShadow: `0 0 ${coreLoad * 25}px ${coreLoad * 10}px rgba(0, 170, 255, ${coreLoad * 0.5})` }}
                >
                    <BrainCircuitIcon className="w-8 h-8 text-nexus-primary" />
                    <span className="text-xs font-bold mt-1">Core</span>
                    {cognitiveProcess.activeQualiaVector && <LightBulbIcon className="absolute w-4 h-4 bottom-1 text-yellow-300 animate-pulse-slow" />}
                </div>
                {/* Replicas */}
                {replicas?.children.map((replica, i) => {
                    const angle = (i / replicas.children.length) * 2 * Math.PI;
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const loadScale = 0.5 + (replica.load / 100) * 0.5;
                    return (
                        <div key={replica.id} className="absolute w-12 h-12 bg-nexus-surface/80 rounded-full flex items-center justify-center transition-all duration-500"
                            style={{ 
                                top: `calc(50% - 24px + ${y}px)`, 
                                left: `calc(50% - 24px + ${x}px)`, 
                                transform: `scale(${loadScale})`,
                                border: replica.status === 'Active' ? '2px solid #00e5ff' : '2px solid #a0a0a0',
                                opacity: replica.status === 'Dormant' ? 0.6 : 1
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
                    return (
                        <div key={tool.id} className="absolute w-8 h-8 bg-nexus-dark rounded-full flex items-center justify-center transition-all duration-500"
                            style={{ 
                                top: `calc(50% - 16px + ${y}px)`, 
                                left: `calc(50% - 16px + ${x}px)`, 
                                border: isActive ? '2px solid #ff00aa' : '2px solid #18213a',
                                animation: isActive ? 'glow-pulse 3s infinite' : 'none'
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
    const [viewMode, setViewMode] = useState<ViewMode>('structural');

    const viewModes: { id: ViewMode, label: string, icon: React.ReactNode }[] = [
        { id: 'structural', label: 'Structural', icon: <ViewColumnsIcon /> },
        { id: 'data_flow', label: 'Data Flow', icon: <ArrowsRightLeftIcon /> },
        { id: 'cognitive_load', label: 'Cognitive Load', icon: <FireIcon /> },
    ];
    
    const renderView = () => {
        switch(viewMode) {
            case 'structural': return <StructuralView {...props} />;
            case 'data_flow': return <DataFlowView {...props} />;
            case 'cognitive_load': return <CognitiveLoadView {...props} />;
            default: return <StructuralView {...props} />;
        }
    }

    return (
        <DashboardCard title="Live System Architecture" icon={<ArchIcon />} fullHeight className="flex flex-col">
            <div className="flex justify-center p-2 bg-nexus-dark/50 rounded-t-lg">
                <div className="inline-flex rounded-md shadow-sm" role="group">
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
                                first:rounded-l-lg last:rounded-r-lg`}
                        >
                            <div className="w-5 h-5">{mode.icon}</div>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow bg-nexus-bg rounded-b-lg">
                {renderView()}
            </div>
        </DashboardCard>
    );
};

export default ArchitectureDiagram;
