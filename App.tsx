import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, ActiveView, CognitiveProcess, AppSettings, Toolchain, ChatMessage, PlanStep, CognitiveConstitution, EvolutionState, PlaybookItem, Language, Personality, WorldModelEntity, CognitiveNetworkState, LiveTranscriptionState } from './types';
import { nexusAIService } from './services/nexusAIService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ReplicasView from './components/ReplicaTree';
import MentalToolsLab from './components/MentalToolsLab';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import CognitiveProcessVisualizer from './components/CognitiveProcessVisualizer';
import SettingsView from './components/SettingsView';
import AnalysisLab from './components/AnalysisLab';
import EvolutionChamber from './components/EvolutionChamber';
import ErrorBoundary from './components/ErrorBoundary';
import RawIntrospectionModal from './components/RawIntrospectionModal';
import MemoryExplorerView from './components/MemoryExplorerView';
import CognitiveTraceInspector from './components/CognitiveTraceInspector';
import CognitiveCommandCenter from './components/CognitiveCommandCenter';
import VitalsPanel from './components/VitalsPanel';
import SuggestionTray from './components/SuggestionTray';
import DreamingView from './components/DreamingView';
import WorldModelView from './components/WorldModelView';
import LiveTranscriptionDisplay from './components/LiveTranscriptionDisplay';
import VideoForge from './components/VideoForge';

type SystemStatus = 'Online' | 'Degraded' | 'Offline' | 'Initializing';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [replicas, setReplicas] = useState<Replica | null>(null);
  const [tools, setTools] = useState<MentalTool[]>([]);
  const [toolchains, setToolchains] = useState<Toolchain[]>([]);
  const [playbook, setPlaybook] = useState<PlaybookItem[]>([]);
  const [constitutions, setConstitutions] = useState<CognitiveConstitution[]>([]);
  const [evolutionState, setEvolutionState] = useState<EvolutionState | null>(null);
  const [worldModel, setWorldModel] = useState<any | null>(null);
  const [cognitiveNetwork, setCognitiveNetwork] = useState<CognitiveNetworkState>({ activeProblems: [] });
  const [archivedTraces, setArchivedTraces] = useState<ChatMessage[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('Initializing');
  const [cognitiveProcess, setCognitiveProcess] = useState<CognitiveProcess | null>(null);
  const [liveTranscription, setLiveTranscription] = useState<LiveTranscriptionState>({ isLive: false, isVideoActive: false, userTranscript: '', modelTranscript: '', history: [] });
  const [isRawIntrospectionOpen, setIsRawIntrospectionOpen] = useState(false);
  const [activeTrace, setActiveTrace] = useState<ChatMessage | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isVitalsPanelOpen, setIsVitalsPanelOpen] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const isRtl = i18n.dir() === 'rtl';


  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaultSettings: AppSettings = {
      model: 'gemini-flash-latest',
      modelProfile: 'flash',
      cognitiveStepDelay: 1000,
      coreAgentPersonality: { energyFocus: 'EXTROVERSION', informationProcessing: 'INTUITION', decisionMaking: 'THINKING', worldApproach: 'PERCEIVING' }, // ENTP Default
      logVerbosity: 'STANDARD',
      animationLevel: 'FULL',
      language: 'en',
      cognitiveStyle: 'balanced',
    };

    try {
      const savedSettingsJSON = localStorage.getItem('nexusai-settings');
      if (savedSettingsJSON) {
        let parsed = JSON.parse(savedSettingsJSON);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            // Graceful migration from old 'systemPersonality' string to new object
            if (parsed.systemPersonality) {
                switch(parsed.systemPersonality) {
                    case 'CREATIVE': parsed.coreAgentPersonality = { energyFocus: 'EXTROVERSION', informationProcessing: 'INTUITION', decisionMaking: 'FEELING', worldApproach: 'PERCEIVING' }; break; // ENFP
                    case 'LOGICAL': parsed.coreAgentPersonality = { energyFocus: 'INTROVERSION', informationProcessing: 'SENSING', decisionMaking: 'THINKING', worldApproach: 'JUDGING' }; break; // ISTJ
                    default: parsed.coreAgentPersonality = { ...defaultSettings.coreAgentPersonality }; // ENTP
                }
                delete parsed.systemPersonality;
                localStorage.setItem('nexusai-settings', JSON.stringify(parsed));
                console.log("Migrated settings from old personality format.");
            }
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch (error)      {
        console.error("Failed to parse settings from localStorage, using defaults.", error);
    }
    
    return defaultSettings;
  });

  useEffect(() => {
    // Handle language and direction on <html>
    const currentLang = settings.language || 'en';
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
    document.documentElement.lang = currentLang;
    const direction = i18n.dir(currentLang);
    document.documentElement.dir = direction;

    // Manage body classes for animations and fonts
    const body = document.body;
    
    // Clean up old classes first.
    body.classList.remove('animations-full', 'animations-minimal', 'animations-none');
    
    // Add animation class
    body.classList.add(`animations-${settings.animationLevel.toLowerCase()}`);

    // Manage font classes
    if (direction === 'rtl') {
      body.classList.remove('font-sans');
      body.classList.add('font-arabic');
    } else {
      body.classList.remove('font-arabic');
      body.classList.add('font-sans');
    }
  }, [settings.language, settings.animationLevel, i18n]);


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
  
  const handlePlaybookUpdate = useCallback((newPlaybook: PlaybookItem[]) => {
    setPlaybook(newPlaybook);
  }, []);

  const handleConstitutionsUpdate = useCallback((newConstitutions: CognitiveConstitution[]) => {
    setConstitutions(newConstitutions);
  }, []);

  const handleEvolutionUpdate = useCallback((newState: EvolutionState) => {
    setEvolutionState(newState);
  }, []);

  const handleWorldModelUpdate = useCallback((newWorldModelState: any) => {
    setWorldModel(newWorldModelState);
  }, []);

  const handleCognitiveNetworkUpdate = useCallback((newNetworkState: CognitiveNetworkState) => {
    setCognitiveNetwork(newNetworkState);
  }, []);

  const handleCognitiveProcessUpdate = useCallback((process: CognitiveProcess) => {
    setCognitiveProcess(process);
  }, []);

  const handleLiveTranscriptionUpdate = useCallback((newState: LiveTranscriptionState) => {
    setLiveTranscription(newState);
  }, []);

  const handleArchivesUpdate = useCallback((archives: ChatMessage[]) => {
    setArchivedTraces(archives);
  }, []);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nexusai-settings', JSON.stringify(newSettings));
    nexusAIService.updateSettings(newSettings);
  }, []);
  
  const handleTtsToggle = useCallback((enabled: boolean) => {
    setIsTtsEnabled(enabled);
    nexusAIService.setTtsEnabled(enabled);
  }, []);

  const handleLiveSessionToggle = useCallback(() => {
    if (liveTranscription.isLive) {
        nexusAIService.stopLiveSession();
    } else {
        nexusAIService.startLiveSession();
    }
  }, [liveTranscription.isLive]);

  const handleVideoSessionToggle = useCallback(() => {
    if (liveTranscription.isLive && liveTranscription.isVideoActive) {
        nexusAIService.stopLiveSession(); // a single stop function for both
    } else if (!liveTranscription.isLive) {
        nexusAIService.startVideoSession();
    }
  }, [liveTranscription.isLive, liveTranscription.isVideoActive]);


  useEffect(() => {
    const initializeApp = async () => {
      nexusAIService.updateSettings(settings);
  
      const { initialReplicas, initialTools, initialToolchains, initialPlaybook, initialConstitutions, initialEvolutionState, initialLogs, initialPerfData, initialCognitiveProcess, initialArchives, initialWorldModel, initialCognitiveNetworkState } = await nexusAIService.initialize();
      setReplicas(initialReplicas);
      setTools(initialTools);
      setToolchains(initialToolchains);
      setPlaybook(initialPlaybook);
      setConstitutions(initialConstitutions);
      setEvolutionState(initialEvolutionState);
      setArchivedTraces(initialArchives);
      setWorldModel(initialWorldModel);
      setCognitiveNetwork(initialCognitiveNetworkState);
      setLogs(initialLogs);
      setPerformanceData(initialPerfData);
      setCognitiveProcess(initialCognitiveProcess);
      setSystemStatus('Online');
      setIsInitialized(true);
  
      nexusAIService.subscribeToLogs(handleLog);
      nexusAIService.subscribeToPerformance(handlePerformanceUpdate);
      nexusAIService.subscribeToReplicas(handleReplicaUpdate);
      nexusAIService.subscribeToTools(handleToolsUpdate);
      nexusAIService.subscribeToToolchains(handleToolchainsUpdate);
      nexusAIService.subscribeToPlaybook(handlePlaybookUpdate);
      nexusAIService.subscribeToConstitutions(handleConstitutionsUpdate);
      nexusAIService.subscribeToEvolution(handleEvolutionUpdate);
      nexusAIService.subscribeToWorldModel(handleWorldModelUpdate);
      nexusAIService.subscribeToCognitiveNetwork(handleCognitiveNetworkUpdate);
      nexusAIService.subscribeToCognitiveProcess(handleCognitiveProcessUpdate);
      nexusAIService.subscribeToLiveTranscription(handleLiveTranscriptionUpdate);
      nexusAIService.subscribeToArchives(handleArchivesUpdate);
  
      const serviceInterval = nexusAIService.start();
  
      return () => {
        clearInterval(serviceInterval);
        nexusAIService.unsubscribeFromAll();
      };
    };

    const cleanupPromise = initializeApp();

    return () => {
        cleanupPromise.then(cleanup => cleanup && cleanup());
    };
}, []);

  const spawnReplica = useCallback((parentId: string) => {
    nexusAIService.spawnReplica(parentId);
  }, []);
  
  const pruneReplica = useCallback((replicaId: string) => {
    if (window.confirm(t('replicas.pruneConfirmation'))) {
        nexusAIService.pruneReplica(replicaId);
    }
  }, [t]);

  const assignReplicaPurpose = useCallback((replicaId: string, purpose: string) => {
    nexusAIService.assignReplicaPurpose(replicaId, purpose);
  }, []);
  
  const recalibrateReplica = useCallback((replicaId: string) => {
    nexusAIService.recalibrateReplica(replicaId);
  }, []);

  const setReplicaConstitution = useCallback((replicaId: string, constitutionId: string) => {
    nexusAIService.setReplicaConstitution(replicaId, constitutionId);
  }, []);
  
  const setReplicaPersonality = useCallback((replicaId: string, personality: Personality) => {
    nexusAIService.setReplicaPersonality(replicaId, personality);
  }, []);

  const broadcastProblem = useCallback((replicaId: string, problem: string) => {
      nexusAIService.broadcastProblem(replicaId, problem);
  }, []);

  const handleTriggerGlobalSync = useCallback(() => {
    nexusAIService.triggerGlobalSync();
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

  const expandPlan = useCallback((messageId: string) => nexusAIService.expandPlan(messageId), []);
  const optimizePlan = useCallback((messageId: string) => nexusAIService.optimizePlan(messageId), []);
  const revisePlan = useCallback((messageId: string) => nexusAIService.revisePlan(messageId), []);
  const discardPlan = useCallback((messageId: string) => nexusAIService.discardPlan(messageId), []);

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
      const name = prompt(t('toolchains.promptName'), t('toolchains.promptNameDefault'));
      if (!name) return;
      const description = prompt(t('toolchains.promptDesc'), t('toolchains.promptDescDefault', { count: plan.length }));
      if (description === null) return;
      nexusAIService.createToolchainFromPlan(plan, name, description);
  }, [t]);

  const handleArchiveTrace = useCallback(async (messageId: string) => {
      const archivedTrace = await nexusAIService.archiveTrace(messageId);
      if (archivedTrace) {
        setActiveTrace(archivedTrace);
      }
  }, []);

  const handleExtractBehavior = useCallback(async (messageId: string) => {
      if (!cognitiveProcess) return;
      const trace = cognitiveProcess.history.find(m => m.id === messageId);
      if (trace) {
          try {
              await nexusAIService.triggerACECycle(trace);
              // Consider showing a success toast/notification here
          } catch (e) {
              console.error("Failed to extract behavior", e);
              // Consider showing an error toast/notification here
          }
      }
  }, [cognitiveProcess]);

  const handleRerunTrace = useCallback((trace: ChatMessage) => {
    nexusAIService.rerunTrace(trace);
    setActiveView('dashboard');
  }, []);

  const handleArchiveEvolvedAnswer = useCallback(async (trace: ChatMessage) => {
      await nexusAIService.archiveEvolvedAnswer(trace);
  }, []);

  const handleExtractBehaviorFromEvolved = useCallback(async (trace: ChatMessage) => {
      try {
          await nexusAIService.learnFromEvolvedAnswer(trace);
      } catch (e) {
          console.error("Failed to extract behavior from evolved answer", e);
      }
  }, []);

  const handleRerunEvolution = useCallback((problem: string) => {
      nexusAIService.rerunEvolutionProblem(problem);
      setActiveView('dashboard');
  }, []);
  
  const handleUpdateWorldModelEntity = useCallback((entity: WorldModelEntity) => {
    nexusAIService.updateWorldModelEntity(entity);
  }, []);

  const cognitivePermissions = useMemo(() => {
    const state = cognitiveProcess?.state ?? 'Idle';
    const isProcessing = state === 'Receiving' || state === 'Executing' || state === 'Synthesizing' || state === 'Planning';
    const isLive = liveTranscription.isLive;

    return {
        canSubmitQuery: (state === 'Idle' || state === 'Done' || state === 'Error' || state === 'Cancelled') && !isLive,
        canEditPlan: state === 'AwaitingExecution' && !isLive,
        canExecutePlan: state === 'AwaitingExecution' && !isLive,
        canCancelProcess: isProcessing && !isLive,
        canUseManualControls: (state === 'Idle' || state === 'Done' || state === 'Error' || state === 'Cancelled') && !isLive,
        isGloballyBusy: isProcessing || state === 'AwaitingExecution' || isLive,
    };
  }, [cognitiveProcess?.state, liveTranscription.isLive]);


  const replicaCount = useMemo(() => {
    const count = (replica: Replica | null): number => {
      if (!replica) return 0;
      return 1 + replica.children.reduce((acc, child) => acc + count(child), 0);
    };
    return count(replicas);
  }, [replicas]);

  const renderDashboard = () => (
    <div className="flex flex-col h-full bg-nexus-bg">
        <div className="flex-grow h-full overflow-hidden relative">
             <LiveTranscriptionDisplay state={liveTranscription} />
             {cognitiveProcess && <CognitiveProcessVisualizer
              process={cognitiveProcess}
              constitutions={constitutions}
              onExecutePlan={executePlan}
              onUpdatePlanStep={updatePlanStep}
              onReorderPlan={reorderPlan}
              onAddPlanStep={addPlanStep}
              onDeletePlanStep={deletePlanStep}
              onSavePlanAsToolchain={handleSavePlanAsToolchain}
              onArchiveTrace={handleArchiveTrace}
              onExtractBehavior={handleExtractBehavior}
              onRerunTrace={handleRerunTrace}
              onTranslate={(messageId, text, lang) => nexusAIService.translateResponse(messageId, text, lang)}
              onExpandPlan={expandPlan}
              onOptimizePlan={optimizePlan}
              onRevisePlan={revisePlan}
              onDiscardPlan={discardPlan}
              language={settings.language}
            />}
            <SuggestionTray
              process={cognitiveProcess}
              permissions={cognitivePermissions}
              onSubmitQuery={submitQuery}
            />
        </div>

        <div className="flex-shrink-0 bg-nexus-dark/80 backdrop-blur-md border-t border-nexus-surface z-20 p-2">
             <CognitiveCommandCenter
              permissions={cognitivePermissions}
              process={cognitiveProcess}
              settings={settings}
              isTtsEnabled={isTtsEnabled}
              liveTranscription={liveTranscription}
              onTtsToggle={handleTtsToggle}
              onLiveSessionToggle={handleLiveSessionToggle}
              onVideoSessionToggle={handleVideoSessionToggle}
              onSubmitQuery={submitQuery}
              onCancelQuery={cancelQuery}
              onNewChat={startNewChat}
              onSpawnReplica={() => spawnReplica(replicas?.id || 'nexus-core')} 
              onGoToForge={() => setActiveView('tools')}
              onOpenIntrospection={() => setIsRawIntrospectionOpen(true)}
              onGoToDreaming={() => setActiveView('dreaming')}
            />
        </div>
    </div>
  );

  const renderView = () => {
    if (!isInitialized) {
        return <div className="flex items-center justify-center h-full text-nexus-text-muted">{t('app.initializing')}</div>;
    }
    switch (activeView) {
      case 'replicas':
        return replicas && <ReplicasView 
            rootReplica={replicas} 
            isInteractionDisabled={!cognitivePermissions.canUseManualControls}
            cognitiveNetwork={cognitiveNetwork}
            onSpawnReplica={spawnReplica}
            onPruneReplica={pruneReplica}
            onRecalibrate={recalibrateReplica}
            onAssignPurpose={assignReplicaPurpose}
            constitutions={constitutions}
            onSetConstitution={setReplicaConstitution}
            onBroadcastProblem={broadcastProblem}
            onSetPersonality={setReplicaPersonality}
            onTriggerGlobalSync={handleTriggerGlobalSync}
        />;
      case 'tools':
        return <MentalToolsLab 
                  tools={tools} 
                  toolchains={toolchains}
                  playbook={playbook}
                  isInteractionDisabled={!cognitivePermissions.canUseManualControls}
                  onForgeTool={nexusAIService.forgeTool}
                  onModifyTool={nexusAIService.modifyTool}
                  onToggleStatus={nexusAIService.toggleToolStatus}
                  onOptimizeTool={nexusAIService.optimizeTool}
                  onArchiveTool={nexusAIService.archiveTool}
                  onDecommissionTool={nexusAIService.decommissionTool}
                  onCreateToolchain={nexusAIService.createToolchain}
                  onUpdateToolchain={nexusAIService.updateToolchain}
                  onDeleteToolchain={nexusAIService.deleteToolchain}
                  onUpdatePlaybookItem={nexusAIService.updatePlaybookItem}
                  onDeletePlaybookItem={nexusAIService.deletePlaybookItem}
                />;
      case 'architecture':
        return cognitiveProcess && <ArchitectureDiagram 
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
                 isThinking={cognitivePermissions.isGloballyBusy}
                 onSubmitQuery={(q) => submitQuery(q)}
                 onPruneReplica={pruneReplica}
                 onRecalibrate={recalibrateReplica}
                 onOptimizeTool={nexusAIService.optimizeTool}
               />;
      case 'settings':
        return <SettingsView settings={settings} onSettingsChange={handleSettingsChange} />;
      case 'evolution':
        return evolutionState && <EvolutionChamber
                 evolutionState={evolutionState}
                 archivedTraces={archivedTraces}
                 playbook={playbook}
                 onArchive={handleArchiveEvolvedAnswer}
                 onExtractBehavior={handleExtractBehaviorFromEvolved}
                 onRerun={handleRerunEvolution}
                 onTranslate={(messageId, text, lang) => nexusAIService.translateResponse(messageId, text, lang as Language)}
                 language={settings.language}
               />;
      case 'memory':
        return <MemoryExplorerView
                  archivedTraces={archivedTraces}
                  onViewTrace={setActiveTrace}
                  onDeleteTrace={nexusAIService.deleteTrace}
                  onFindSimilarProcesses={nexusAIService.findSimilarProcesses}
                />;
      case 'dreaming':
        return <DreamingView onSubmitQuery={submitQuery} setActiveView={setActiveView} />;
      case 'world_model':
        return <WorldModelView 
                  worldModel={worldModel} 
                  onUpdateEntity={handleUpdateWorldModelEntity}
                />;
      case 'video_forge':
        return <VideoForge />;
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
        <main className={`flex-1 overflow-y-auto p-6 bg-nexus-bg transition-[margin] duration-500 ease-in-out ${isVitalsPanelOpen && activeView === 'dashboard' ? (isRtl ? 'ml-96' : 'mr-96') : ''}`}>
          <ErrorBoundary key={activeView}>
             {renderView()}
          </ErrorBoundary>
        </main>
      </div>

      {activeView === 'dashboard' &&
        <VitalsPanel
            isOpen={isVitalsPanelOpen}
            setIsOpen={setIsVitalsPanelOpen}
            status={systemStatus}
            onSetStatus={(s: SystemStatus) => setSystemStatus(s)}
            isInteractionDisabled={!cognitivePermissions.canUseManualControls}
            replicaCount={replicaCount}
            toolCount={tools.length}
            performanceData={performanceData}
            logs={logs}
        />
      }

      {isRawIntrospectionOpen && <RawIntrospectionModal onClose={() => setIsRawIntrospectionOpen(false)} />}
      {activeTrace && <CognitiveTraceInspector trace={activeTrace} onClose={() => setActiveTrace(null)} />}
    </div>
  );
};

export default App;
