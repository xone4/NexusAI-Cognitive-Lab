import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, ActiveView, CognitiveProcess, AppSettings, Toolchain, ChatMessage, PlanStep, QualiaVector, CognitiveConstitution, EvolutionState, ThinkingState } from './types';
import { nexusAIService } from './services/nexusAIService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardCard from './components/DashboardCard';
import ReplicasView from './components/ReplicaTree';
import PerformanceCharts from './components/PerformanceCharts';
import MentalToolsLab from './components/MentalToolsLab';
import LogStream from './components/LogStream';
import ControlPanel from './components/ControlPanel';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import QueryConsole from './components/QueryConsole';
import CognitiveProcessVisualizer from './components/CognitiveProcessVisualizer';
import QualiaVectorVisualizer from './components/QualiaVectorVisualizer';
import SettingsView from './components/SettingsView';
import AnalysisLab from './components/AnalysisLab';
import EvolutionChamber from './components/EvolutionChamber';
import ErrorBoundary from './components/ErrorBoundary';
import RawIntrospectionModal from './components/RawIntrospectionModal';
import ArchivesView from './components/ArchivesView';
import CognitiveTraceInspector from './components/CognitiveTraceInspector';
import SystemStatusControl from './components/SystemStatusControl';
import { CpuChipIcon, BeakerIcon, DocumentMagnifyingGlassIcon, CircleStackIcon, BrainCircuitIcon } from './components/Icons';

type SystemStatus = 'Online' | 'Degraded' | 'Offline' | 'Initializing';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [replicas, setReplicas] = useState<Replica | null>(null);
  const [tools, setTools] = useState<MentalTool[]>([]);
  const [toolchains, setToolchains] = useState<Toolchain[]>([]);
  const [constitutions, setConstitutions] = useState<CognitiveConstitution[]>([]);
  const [evolutionState, setEvolutionState] = useState<EvolutionState>(nexusAIService.getInitialData().initialEvolutionState);
  const [archivedTraces, setArchivedTraces] = useState<ChatMessage[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('Initializing');
  const [cognitiveProcess, setCognitiveProcess] = useState<CognitiveProcess>(nexusAIService.getInitialData().initialCognitiveProcess);
  const [isRawIntrospectionOpen, setIsRawIntrospectionOpen] = useState(false);
  const [activeTrace, setActiveTrace] = useState<ChatMessage | null>(null);
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      model: 'gemini-2.5-flash',
      cognitiveStepDelay: 1000,
      systemPersonality: 'BALANCED',
      logVerbosity: 'STANDARD',
      animationLevel: 'FULL',
      language: 'English',
    };

    try {
      const savedSettingsJSON = localStorage.getItem('nexusai-settings');
      if (savedSettingsJSON) {
        const parsed = JSON.parse(savedSettingsJSON);
        // Ensure parsed value is a valid, non-null object before merging
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error)      {
        console.error("Failed to parse settings from localStorage, using defaults.", error);
    }
    
    return defaultSettings;
  });

  useEffect(() => {
    const animationClass = `animations-${settings.animationLevel.toLowerCase()}`;
    const originalClasses = ['bg-nexus-dark', 'text-nexus-text', 'font-sans'];
    document.body.className = `${originalClasses.join(' ')} ${animationClass}`;
  }, [settings.animationLevel]);


  const handleLog = useCallback((newLog: LogEntry) => {
    setLogs(prev => [...prev.slice(-200), newLog]);
  }, []);

  const handlePerformanceUpdate = useCallback((newDataPoint: PerformanceDataPoint) => {
    setPerformanceData(prev => [...prev.slice(-30), newDataPoint]);
  }, []);

  const handleReplicaUpdate = useCallback((newReplicaState: Replica) => {
    setReplicas(newReplicaState);
  }, []);
  
  const handleToolsUpdate = useCallback((newToolsState: MentalTool[]) => {
    setTools(newToolsState);
  }, []);

  const handleToolchainsUpdate = useCallback((newToolchains: Toolchain[]) => {
    setToolchains(newToolchains);
  }, []);
  
  const handleConstitutionsUpdate = useCallback((newConstitutions: CognitiveConstitution[]) => {
    setConstitutions(newConstitutions);
  }, []);

  const handleEvolutionUpdate = useCallback((newState: EvolutionState) => {
    setEvolutionState(newState);
  }, []);

  const handleCognitiveProcessUpdate = useCallback((process: CognitiveProcess) => {
    setCognitiveProcess(process);
  }, []);

  const handleArchivesUpdate = useCallback((archives: ChatMessage[]) => {
    setArchivedTraces(archives);
  }, []);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nexusai-settings', JSON.stringify(newSettings));
    nexusAIService.updateSettings(newSettings);
  }, []);

  useEffect(() => {
    nexusAIService.updateSettings(settings);

    const { initialReplicas, initialTools, initialToolchains, initialConstitutions, initialEvolutionState, initialLogs, initialPerfData, initialCognitiveProcess, initialArchives } = nexusAIService.getInitialData();
    setReplicas(initialReplicas);
    setTools(initialTools);
    setToolchains(initialToolchains);
    setConstitutions(initialConstitutions);
    setEvolutionState(initialEvolutionState);
    setArchivedTraces(initialArchives);
    setLogs(initialLogs);
    setPerformanceData(initialPerfData);
    setCognitiveProcess(initialCognitiveProcess);
    setSystemStatus('Online');

    nexusAIService.subscribeToLogs(handleLog);
    nexusAIService.subscribeToPerformance(handlePerformanceUpdate);
    nexusAIService.subscribeToReplicas(handleReplicaUpdate);
    nexusAIService.subscribeToTools(handleToolsUpdate);
    nexusAIService.subscribeToToolchains(handleToolchainsUpdate);
    nexusAIService.subscribeToConstitutions(handleConstitutionsUpdate);
    nexusAIService.subscribeToEvolution(handleEvolutionUpdate);
    nexusAIService.subscribeToCognitiveProcess(handleCognitiveProcessUpdate);
    nexusAIService.subscribeToArchives(handleArchivesUpdate);


    const serviceInterval = nexusAIService.start();

    return () => {
      clearInterval(serviceInterval);
      nexusAIService.unsubscribeFromAll();
    };
  }, [handleLog, handlePerformanceUpdate, handleReplicaUpdate, handleToolsUpdate, handleToolchainsUpdate, handleConstitutionsUpdate, handleEvolutionUpdate, handleCognitiveProcessUpdate, handleArchivesUpdate, settings]);

  const spawnReplica = useCallback((parentId: string) => {
    nexusAIService.spawnReplica(parentId);
  }, []);
  
  const pruneReplica = useCallback((replicaId: string) => {
    if (window.confirm('Are you sure you want to prune this replica and all its children? This action is permanent.')) {
        nexusAIService.pruneReplica(replicaId);
    }
  }, []);

  const assignReplicaPurpose = useCallback((replicaId: string, purpose: string) => {
    nexusAIService.assignReplicaPurpose(replicaId, purpose);
  }, []);
  
  const recalibrateReplica = useCallback((replicaId: string) => {
    nexusAIService.recalibrateReplica(replicaId);
  }, []);

  const setReplicaConstitution = useCallback((replicaId: string, constitutionId: string) => {
    nexusAIService.setReplicaConstitution(replicaId, constitutionId);
  }, []);

  const broadcastProblem = useCallback((replicaId: string, problem: string) => {
      nexusAIService.broadcastProblem(replicaId, problem);
  }, []);

  const submitQuery = useCallback((query: string, image?: { mimeType: string, data: string }) => {
    setActiveView('dashboard');
    nexusAIService.submitQuery(query, image);
  }, []);

  const cancelQuery = useCallback(() => {
    nexusAIService.cancelQuery();
  }, []);
  
  const startNewChat = useCallback(() => {
    nexusAIService.startNewChat();
  }, []);

  const executePlan = useCallback((messageId: string) => {
    nexusAIService.executePlan(messageId);
  }, []);

  const updatePlanStep = useCallback((messageId: string, stepIndex: number, newStep: PlanStep) => {
    nexusAIService.updatePlanStep(messageId, stepIndex, newStep);
  }, []);
  
  const reorderPlan = useCallback((messageId: string, fromIndex: number, toIndex: number) => {
      nexusAIService.reorderPlan(messageId, fromIndex, toIndex);
  }, []);

  const addPlanStep = useCallback((messageId: string) => {
      nexusAIService.addPlanStep(messageId);
  }, []);

  const deletePlanStep = useCallback((messageId: string, stepIndex: number) => {
      nexusAIService.deletePlanStep(messageId, stepIndex);
  }, []);
  
  const handleSavePlanAsToolchain = useCallback((plan: PlanStep[]) => {
      const name = prompt("Enter a name for the new toolchain:", "My Saved Plan");
      if (!name) return;
      const description = prompt("Enter a short description:", `Created from plan with ${plan.length} steps.`);
      if (description === null) return;
      nexusAIService.createToolchainFromPlan(plan, name, description);
  }, []);

  const updateActiveQualiaVector = useCallback((vector: QualiaVector) => {
    nexusAIService.updateActiveQualiaVector(vector);
  }, []);

  const handleArchiveTrace = useCallback((messageId: string) => {
      const archivedTrace = nexusAIService.archiveTrace(messageId);
      if (archivedTrace) {
        setActiveTrace(archivedTrace); // Open inspector immediately for the new archive
      }
  }, []);

  const handleRerunTrace = useCallback((trace: ChatMessage) => {
    nexusAIService.rerunTrace(trace);
    setActiveView('dashboard');
  }, []);
  
  const isThinking = useMemo(() => {
    if (!cognitiveProcess?.state) return false;
    const thinkingStates: ThinkingState[] = ['Receiving', 'Planning', 'AwaitingExecution', 'Executing', 'Synthesizing'];
    return thinkingStates.includes(cognitiveProcess.state);
  }, [cognitiveProcess?.state]);

  const isInteractionDisabled = isThinking || isAutonomousMode;

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <div className="lg:col-span-2 grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <DashboardCard title="Cognitive Command" icon={<BrainCircuitIcon />}>
              <QueryConsole
                onSubmit={submitQuery}
                onCancel={cancelQuery}
                onNewChat={startNewChat}
                process={cognitiveProcess}
                isInteractionDisabled={isInteractionDisabled}
                isThinking={isThinking}
              />
          </DashboardCard>
          <DashboardCard title="Cognitive Dialogue" fullHeight>
              <CognitiveProcessVisualizer
                process={cognitiveProcess}
                constitutions={constitutions}
                onExecutePlan={executePlan}
                onUpdatePlanStep={updatePlanStep}
                onReorderPlan={reorderPlan}
                onAddPlanStep={addPlanStep}
                onDeletePlanStep={deletePlanStep}
                onSavePlanAsToolchain={handleSavePlanAsToolchain}
                onArchiveTrace={handleArchiveTrace}
                onRerunTrace={handleRerunTrace}
                onTranslate={nexusAIService.translateResponse}
                language={settings.language}
              />
          </DashboardCard>
      </div>

      <div className="lg:col-span-3 grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard title="System Status" icon={<CpuChipIcon />}>
              <SystemStatusControl
                status={systemStatus}
                onSetStatus={(s: SystemStatus) => setSystemStatus(s)}
                isInteractionDisabled={isInteractionDisabled}
               />
          </DashboardCard>
           <DashboardCard title="Active Replicas" icon={<CircleStackIcon />}>
              <p className="text-2xl font-bold text-nexus-primary">{replicaCount}</p>
          </DashboardCard>
           <DashboardCard title="Mental Tools" icon={<BeakerIcon />}>
              <p className="text-2xl font-bold text-nexus-primary">{tools.length}</p>
          </DashboardCard>
           <DashboardCard title="Manual Control" icon={<DocumentMagnifyingGlassIcon />}>
              <ControlPanel 
                onSpawnReplica={() => spawnReplica(replicas?.id || 'nexus-core')} 
                onGoToForge={() => setActiveView('tools')}
                onOpenIntrospection={() => setIsRawIntrospectionOpen(true)}
                isInteractionDisabled={isInteractionDisabled} 
                isAutonomousMode={isAutonomousMode}
                onToggleAutonomousMode={() => setIsAutonomousMode(prev => !prev)}
              />
          </DashboardCard>
        </div>
        <DashboardCard title="Internal State: Qualia Vector Space" fullHeight>
          <QualiaVectorVisualizer 
              activeVector={cognitiveProcess.activeQualiaVector || null} 
              onUpdate={updateActiveQualiaVector}
              isInteractionDisabled={isInteractionDisabled}
          />
        </DashboardCard>
         <DashboardCard title="System Log Stream" fullHeight>
          <LogStream logs={logs} />
        </DashboardCard>
      </div>
    </div>
  );
  
  const replicaCount = useMemo(() => {
    const count = (replica: Replica | null): number => {
      if (!replica) return 0;
      return 1 + replica.children.reduce((acc, child) => acc + count(child), 0);
    };
    return count(replicas);
  }, [replicas]);

  const renderView = () => {
    switch (activeView) {
      case 'replicas':
        return replicas && <ReplicasView 
            rootReplica={replicas} 
            isInteractionDisabled={isInteractionDisabled}
            onSpawnReplica={spawnReplica}
            onPruneReplica={pruneReplica}
            onRecalibrate={recalibrateReplica}
            onAssignPurpose={assignReplicaPurpose}
            constitutions={constitutions}
            onSetConstitution={setReplicaConstitution}
            onBroadcastProblem={broadcastProblem}
        />;
      case 'tools':
        return <MentalToolsLab 
                  tools={tools} 
                  toolchains={toolchains}
                  isInteractionDisabled={isInteractionDisabled}
                  onForgeTool={nexusAIService.forgeTool}
                  onModifyTool={nexusAIService.modifyTool}
                  onToggleStatus={nexusAIService.toggleToolStatus}
                  onOptimizeTool={nexusAIService.optimizeTool}
                  onArchiveTool={nexusAIService.archiveTool}
                  onDecommissionTool={nexusAIService.decommissionTool}
                  onCreateToolchain={nexusAIService.createToolchain}
                  onUpdateToolchain={nexusAIService.updateToolchain}
                  onDeleteToolchain={nexusAIService.deleteToolchain}
                />;
      case 'architecture':
        return <ArchitectureDiagram 
                  replicas={replicas}
                  tools={tools}
                  cognitiveProcess={cognitiveProcess}
                  settings={settings}
                  setActiveView={setActiveView}
                  replicaCount={replicaCount}
                />;
       case 'analysis':
        return <AnalysisLab
                 replicas={replicas}
                 tools={tools}
                 logs={logs}
                 isThinking={isThinking}
                 onSubmitQuery={(q) => submitQuery(q)}
                 onPruneReplica={pruneReplica}
                 onRecalibrate={recalibrateReplica}
                 onOptimizeTool={nexusAIService.optimizeTool}
               />;
      case 'settings':
        return <SettingsView settings={settings} onSettingsChange={handleSettingsChange} />;
      case 'evolution':
        return <EvolutionChamber
                 evolutionState={evolutionState}
                 allTools={tools}
                 onCreateToolchain={nexusAIService.createToolchain}
               />;
      case 'archives':
        return <ArchivesView
                  archivedTraces={archivedTraces}
                  onViewTrace={setActiveTrace}
                  onDeleteTrace={nexusAIService.deleteTrace}
                />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-nexus-dark font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-nexus-bg">
          <ErrorBoundary key={activeView}>
            {renderView()}
          </ErrorBoundary>
        </main>
      </div>
      {isRawIntrospectionOpen && <RawIntrospectionModal onClose={() => setIsRawIntrospectionOpen(false)} />}
      {activeTrace && <CognitiveTraceInspector trace={activeTrace} onClose={() => setActiveTrace(null)} />}
    </div>
  );
};

export default App;