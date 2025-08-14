import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, ActiveView, CognitiveProcess, AppSettings, Toolchain, ChatMessage, PlanStep, QualiaVector } from './types';
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
import ErrorBoundary from './components/ErrorBoundary';
import RawIntrospectionModal from './components/RawIntrospectionModal';
import { CpuChipIcon, BeakerIcon, DocumentMagnifyingGlassIcon, CircleStackIcon, BrainCircuitIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [replicas, setReplicas] = useState<Replica | null>(null);
  const [tools, setTools] = useState<MentalTool[]>([]);
  const [toolchains, setToolchains] = useState<Toolchain[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Degraded' | 'Initializing'>('Initializing');
  const [cognitiveProcess, setCognitiveProcess] = useState<CognitiveProcess>(nexusAIService.getInitialData().initialCognitiveProcess);
  const [isRawIntrospectionOpen, setIsRawIntrospectionOpen] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      model: 'gemini-2.5-flash',
      cognitiveStepDelay: 1000,
      systemPersonality: 'BALANCED',
      logVerbosity: 'STANDARD',
      animationLevel: 'FULL',
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

  const handleCognitiveProcessUpdate = useCallback((process: CognitiveProcess) => {
    setCognitiveProcess(process);
  }, []);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nexusai-settings', JSON.stringify(newSettings));
    nexusAIService.updateSettings(newSettings);
  }, []);

  useEffect(() => {
    nexusAIService.updateSettings(settings);

    const { initialReplicas, initialTools, initialToolchains, initialLogs, initialPerfData, initialCognitiveProcess } = nexusAIService.getInitialData();
    setReplicas(initialReplicas);
    setTools(initialTools);
    setToolchains(initialToolchains);
    setLogs(initialLogs);
    setPerformanceData(initialPerfData);
    setCognitiveProcess(initialCognitiveProcess);
    setSystemStatus('Online');

    nexusAIService.subscribeToLogs(handleLog);
    nexusAIService.subscribeToPerformance(handlePerformanceUpdate);
    nexusAIService.subscribeToReplicas(handleReplicaUpdate);
    nexusAIService.subscribeToTools(handleToolsUpdate);
    nexusAIService.subscribeToToolchains(handleToolchainsUpdate);
    nexusAIService.subscribeToCognitiveProcess(handleCognitiveProcessUpdate);

    const serviceInterval = nexusAIService.start();

    return () => {
      clearInterval(serviceInterval);
      nexusAIService.unsubscribeFromAll();
    };
  }, [handleLog, handlePerformanceUpdate, handleReplicaUpdate, handleToolsUpdate, handleToolchainsUpdate, handleCognitiveProcessUpdate, settings]);

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

  const submitQuery = useCallback((query: string) => {
    setActiveView('dashboard');
    nexusAIService.submitQuery(query);
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


  const isThinking = cognitiveProcess?.state !== 'Idle' && cognitiveProcess?.state !== 'Done' && cognitiveProcess?.state !== 'Cancelled' && cognitiveProcess?.state !== 'Error';

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <div className="lg:col-span-2 grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <DashboardCard title="Cognitive Command" icon={<BrainCircuitIcon />}>
              <QueryConsole onSubmit={submitQuery} onCancel={cancelQuery} onNewChat={startNewChat} process={cognitiveProcess} />
          </DashboardCard>
          <DashboardCard title="Cognitive Dialogue" fullHeight>
              <CognitiveProcessVisualizer
                process={cognitiveProcess}
                onExecutePlan={executePlan}
                onUpdatePlanStep={updatePlanStep}
                onReorderPlan={reorderPlan}
                onAddPlanStep={addPlanStep}
                onDeletePlanStep={deletePlanStep}
                onSavePlanAsToolchain={handleSavePlanAsToolchain}
              />
          </DashboardCard>
      </div>

      <div className="lg:col-span-3 grid grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard title="System Status" icon={<CpuChipIcon />}>
              <p className={`text-2xl font-bold ${systemStatus === 'Online' ? 'text-nexus-secondary' : 'text-nexus-accent'}`}>{systemStatus}</p>
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
                isThinking={isThinking} 
              />
          </DashboardCard>
        </div>
        <DashboardCard title="Internal State: Qualia Vector Space" fullHeight>
          <QualiaVectorVisualizer 
              activeVector={cognitiveProcess.activeQualiaVector || null} 
              onUpdate={updateActiveQualiaVector}
              isThinking={isThinking}
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
            isThinking={isThinking}
            onSpawnReplica={spawnReplica}
            onPruneReplica={pruneReplica}
            onRecalibrate={recalibrateReplica}
            onAssignPurpose={assignReplicaPurpose}
        />;
      case 'tools':
        return <MentalToolsLab 
                  tools={tools} 
                  toolchains={toolchains}
                  isThinking={isThinking}
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
                 onSubmitQuery={submitQuery}
                 onPruneReplica={pruneReplica}
                 onRecalibrate={recalibrateReplica}
                 onOptimizeTool={nexusAIService.optimizeTool}
               />;
      case 'settings':
        return <SettingsView settings={settings} onSettingsChange={handleSettingsChange} />;
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
    </div>
  );
};

export default App;
