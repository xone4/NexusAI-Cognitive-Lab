// FIX: Aliased `Blob` to `GenAIBlob` to resolve name collision with the native browser Blob type.
import { GoogleGenAI, Type, Modality, Blob as GenAIBlob, LiveServerMessage, FunctionDeclaration, GenerateContentParameters } from "@google/genai";
// FIX: Added missing types 'EvaluationState' and 'EvaluationMetrics' to support the evaluation feature.
// FIX: Added missing types to support autonomous agent functionality.
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, CognitiveProcess, AppSettings, ChatMessage, SystemSuggestion, AnalysisConfig, SystemAnalysisResult, Toolchain, PlanStep, Interaction, SuggestionProfile, CognitiveConstitution, EvolutionState, EvolutionConfig, ProactiveInsight, FitnessGoal, GeneratedImage, PrimaryEmotion, AffectiveState, Language, IndividualPlan, CognitiveNetworkState, CognitiveProblem, CognitiveBid, DreamProcessUpdate, SystemDirective, TraceDetails, UserKeyword, Personality, PlaybookItem, RawInsight, PlaybookItemCategory, WorldModel, WorldModelEntity, CognitiveTrajectory, WorldModelRelationship, LiveTranscriptionState, VideoGenerationState, SimulationState, SimulationConfig, SimulationResult, SimulationStep, EvaluationState, EvaluationMetrics, ExpertPersona, ProblemCategory, ExpertPreference, AutonomousState, UICommand, ActiveView, CuriosityMetrics, NavigatorAlert } from '../types';
import { dbService, STORES } from '../dbService';
import * as geometryService from './geometryService';
import { calculateTrajectorySimilarity, getEmbedding, cosineSimilarity } from './geometryService';
// FIX: Added import for autonomousAgentService to link the services.
import { autonomousAgentService } from './autonomousAgentService';

export type { VideoGenerationState } from '../types';

// IMPORTANT: This would be populated by a secure mechanism in a real app
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set. AI functionality will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const MAX_RECURSION_DEPTH = 3;

let replicaState: Replica;
let toolsState: MentalTool[];
let toolchainsState: Toolchain[];
let playbookState: PlaybookItem[];
let constitutionsState: CognitiveConstitution[];
let evolutionState: EvolutionState;
let simulationState: SimulationState;
// FIX: Added state management for the evaluation feature, including a state variable.
let evaluationState: EvaluationState;
let worldModelState: WorldModel | null = null;
let cognitiveProcess: CognitiveProcess;
let cognitiveNetworkState: CognitiveNetworkState = { activeProblems: [] };
let liveTranscriptionState: LiveTranscriptionState = { isLive: false, isVideoActive: false, userTranscript: '', modelTranscript: '', history: [] };
// FIX: Added state management for the autonomous agent feature.
let autonomousState: AutonomousState = { isActive: false, goal: '', action: '' };
let lastAutonomousAction: { name: string, args: any, timestamp: number } | null = null;
let archivedTracesState: ChatMessage[];
let systemDirectivesState: SystemDirective[];
let isCancelled = false;
let isTtsEnabled = false;
// FIX: Added expertPreferencesState to manage learned preferences for the reinforcement learning loop.
let expertPreferencesState: Map<ProblemCategory, ExpertPersona> = new Map();
let appSettings: AppSettings = {
    model: 'gemini-flash-latest',
    modelProfile: 'flash',
    enableThinkingMode: false,
    cognitiveStepDelay: 1000,
    coreAgentPersonality: { energyFocus: 'EXTROVERSION', informationProcessing: 'INTUITION', decisionMaking: 'THINKING', worldApproach: 'PERCEIVING' },
    logVerbosity: 'STANDARD',
    animationLevel: 'FULL',
    language: 'en',
    cognitiveStyle: 'balanced',
};
let videoGenerationState: VideoGenerationState = { isGenerating: false, statusMessage: '', videoUrl: null, error: null };

let currentController: AbortController | null = null;
let evolutionInterval: any = null;
// FIX: Added interval variable for the autonomous agent's metacognitive cycle.
let autonomousInterval: any = null;

let liveSessionPromise: Promise<any> | null = null;
let microphoneStream: MediaStream | null = null;
let videoStream: MediaStream | null = null;
let frameInterval: any = null;
let audioProcessor: ScriptProcessorNode | null = null;
let audioContext: AudioContext | null = null;
let audioSource: MediaStreamAudioSourceNode | null = null;
const FRAME_RATE = 2; // Send 2 frames per second
const JPEG_QUALITY = 0.7;


let logSubscribers: ((log: LogEntry) => void)[] = [];
let performanceSubscribers: ((dataPoint: PerformanceDataPoint) => void)[] = [];
let replicaSubscribers: ((replicaState: Replica) => void)[] = [];
let cognitiveProcessSubscribers: ((process: CognitiveProcess) => void)[] = [];
let toolsSubscribers: ((tools: MentalTool[]) => void)[] = [];
let toolchainSubscribers: ((toolchains: Toolchain[]) => void)[] = [];
let playbookSubscribers: ((playbook: PlaybookItem[]) => void)[] = [];
let constitutionSubscribers: ((constitutions: CognitiveConstitution[]) => void)[] = [];
let evolutionSubscribers: ((evolutionState: EvolutionState) => void)[] = [];
let simulationSubscribers: ((state: SimulationState) => void)[] = [];
// FIX: Added state management for the evaluation feature, including a subscribers array.
let evaluationSubscribers: ((state: EvaluationState) => void)[] = [];
let archiveSubscribers: ((archives: ChatMessage[]) => void)[] = [];
let dreamProcessSubscribers: ((update: DreamProcessUpdate) => void)[] = [];
let worldModelSubscribers: ((worldModel: WorldModel) => void)[] = [];
let cognitiveNetworkSubscribers: ((state: CognitiveNetworkState) => void)[] = [];
let liveTranscriptionSubscribers: ((state: LiveTranscriptionState) => void)[] = [];
let videoGenerationSubscribers: ((state: VideoGenerationState) => void)[] = [];
// FIX: Added subscribers for autonomous state and UI commands.
let autonomousStateSubscribers: ((state: AutonomousState) => void)[] = [];
let uiCommandSubscribers: ((command: UICommand) => void)[] = [];

// --- Phase 9: Temporal Synchronization State ---
let isGlobalSyncActive = false;
let globalSyncTempo = 1.0;
// ---------------------------------------------

let traceDetailsCache = new Map<string, TraceDetails>();

// Helper to apply Thinking Mode settings to a model call
const getCognitiveModelConfig = (existingConfig?: any) => {
    if (appSettings.enableThinkingMode) {
        // When thinking mode is on, we force the pro model and add the thinking budget.
        return {
            model: 'gemini-2.5-pro',
            config: {
                ...(existingConfig || {}),
                thinkingConfig: { thinkingBudget: 32768 }
            }
        };
    }
    // Default behavior: use the model from settings (lite, flash, or pro)
    return {
        model: appSettings.model,
        config: existingConfig
    };
};

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// FIX: Corrected the implementation to return a `{ data, mimeType }` object instead of a native Blob, conforming to the `@google/genai` Live API requirements.
function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Audio Decoding Helpers (Phase 10) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


class TrajectoryTracker {
    private taskId: string;
    private steps: { thought: string; position: number[] }[] = [];

    constructor(taskId: string, initialPrompt: string) {
        this.taskId = taskId;
        log('SYSTEM', `[Geometry] Trajectory tracker initialized for task ${this.taskId}.`);
        // The initial state before any thought is the prompt itself.
        this.addStep('Initial State (User Query)', initialPrompt);
    }

    async addStep(thought: string, context: string) {
        try {
            const embedding = await geometryService.getEmbedding(context);
            this.steps.push({ thought, position: embedding });
            log('INFO', `[Geometry] Step ${this.steps.length}: ${thought} - Position captured.`);
        } catch (e) {
            log('ERROR', `[Geometry] Failed to generate embedding for step "${thought}": ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    }

    public getSteps(): { thought: string; position: number[] }[] {
        return this.steps;
    }

    finalize(): CognitiveTrajectory | undefined {
        if (this.steps.length < 2) {
            log('WARN', '[Geometry] Not enough steps to finalize a meaningful trajectory.');
            return undefined;
        }
        const trajectory = geometryService.analyzeTrajectory(this.steps);
        log('SYSTEM', `[Geometry] Trajectory finalized for task ${this.taskId}. Path Length: ${trajectory.summary.pathLength}, Avg. Curvature: ${trajectory.summary.avgCurvature.toFixed(4)}.`);
        return trajectory;
    }
}

let activeTracker: TrajectoryTracker | null = null;


const log = (level: LogEntry['level'], message: string) => {
  const verbosityMap = {
      STANDARD: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA', 'NETWORK', 'AUTONOMOUS'],
      VERBOSE: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA', 'INFO', 'NETWORK', 'AUTONOMOUS'],
  };
  if (!verbosityMap[appSettings.logVerbosity].includes(level)) {
      return;
  }

  const newLog: LogEntry = {
    id: `log-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    level,
    message,
  };
  logSubscribers.forEach(cb => cb(newLog));
};

const notifyCognitiveProcess = () => cognitiveProcessSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(cognitiveProcess))));
const notifyReplicas = () => replicaSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(replicaState))));
const notifyTools = () => toolsSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(toolsState))));
const notifyToolchains = () => toolchainSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(toolchainsState))));
const notifyPlaybook = () => playbookSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(playbookState))));
const notifyConstitutions = () => constitutionSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(constitutionsState))));
const notifyEvolution = () => evolutionSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(evolutionState))));
const notifySimulation = () => simulationSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(simulationState))));
// FIX: Added state management for the evaluation feature, including a notification function.
const notifyEvaluation = () => evaluationSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(evaluationState))));
const notifyArchives = () => archiveSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(archivedTracesState))));
const notifyDreamProcess = (update: DreamProcessUpdate) => dreamProcessSubscribers.forEach(cb => cb(update));
const notifyCognitiveNetwork = () => cognitiveNetworkSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(cognitiveNetworkState))));
const notifyLiveTranscription = () => liveTranscriptionSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(liveTranscriptionState))));
const notifyVideoGeneration = () => videoGenerationSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(videoGenerationState))));
// FIX: Added notify function for autonomous state changes.
const notifyAutonomousState = () => autonomousStateSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(autonomousState))));
const notifyUICommand = (command: UICommand) => uiCommandSubscribers.forEach(cb => cb(command));
const notifyWorldModel = () => {
    if (worldModelState) {
        worldModelSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(worldModelState!))));
    }
};

const findReplica = (id: string, node: Replica): {parent: Replica | null, node: Replica, index: number} | null => {
    if (node.id === id) return {parent: null, node, index: -1};
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.id === id) return {parent: node, node: child, index: i};
        const found = findReplica(id, child);
        if (found) return found;
    }
    return null;
};


const updateReplicaState = (node: Replica, root: Replica) => {
    // New logic: Base metrics on actual system state
    const activeReplicas = (r: Replica): number => r.children.reduce((acc, child) => acc + activeReplicas(child), r.status === 'Active' || r.status === 'Executing Task' ? 1 : 0);
    const totalActiveReplicas = activeReplicas(root);
    const lastMessage = cognitiveProcess?.history[cognitiveProcess?.history.length - 1];
    const currentPlanSteps = (lastMessage?.role === 'model' && lastMessage.plan) ? lastMessage.plan.length : 0;

    // Cognitive Load Calculation
    const baseLoad = 10;
    const replicaLoad = totalActiveReplicas * 5;
    const planLoad = currentPlanSteps * 3;
    const processStateLoad = (cognitiveProcess?.state === 'Executing' || cognitiveProcess?.state === 'Planning') ? 20 : 0;
    node.load = baseLoad + replicaLoad + planLoad + processStateLoad + (Math.random() * 5); // Add some jitter
    if (node.status === 'Dormant') node.load = Math.random() * 10;
    node.load = Math.max(0, Math.min(100, node.load));
    
    // Context Utilization (Memory) Calculation
    const historySize = cognitiveProcess?.history.length || 0;
    const worldModelSize = worldModelState?.entities.length || 0;
    node.memoryUsage = (historySize * 0.5) + (worldModelSize * 0.2) + 10 + (Math.random() * 5);
    if (node.status === 'Dormant') node.memoryUsage = 5 + Math.random() * 5;
    node.memoryUsage = Math.max(0, Math.min(100, node.memoryUsage));

    // Processing Cycles (CPU) Calculation
    let cpu = 5 + (Math.random() * 5); // Base idle
    if (cognitiveProcess) {
        switch(cognitiveProcess.state) {
            case 'Planning':
            case 'Synthesizing':
                cpu = 40 + Math.random() * 15;
                break;
            case 'Executing':
                cpu = 70 + Math.random() * 25;
                break;
        }
    }
     if (node.status === 'Dormant') cpu = Math.random() * 5;
    node.cpuUsage = Math.max(0, Math.min(100, cpu));


    // Learning Rate (Efficiency) remains event-driven, but we prevent random decay
    node.efficiency = Math.max(50, Math.min(100, node.efficiency));
    if (node.status === 'Dormant') {
        node.efficiency = Math.max(0, node.efficiency - 0.05);
    }
    
    // --- PHASE 9: Temporal Synchronization ---
    if (isGlobalSyncActive && node.status === 'Recalibrating') {
        node.tempo = globalSyncTempo; // Override with global tempo
    } else {
        const baseTempo = 0.5;
        const maxTempo = 5.0;
        node.tempo = baseTempo + (node.load / 100) * (maxTempo - baseTempo);
        if (node.status === 'Dormant') {
            node.tempo = 0.1;
        }
    }
    const intervalSeconds = 2; // Corresponds to the setInterval in start()
    node.internalTick = (node.internalTick || 0) + (node.tempo * intervalSeconds);
    // --- END PHASE 9 ---

    // Simulate interactions for active nodes
    if (node.status === 'Active' || node.status === 'Executing Task') {
        node.interactions = node.interactions?.filter(i => i.intensity > 0.1 && Math.random() > 0.1) || [];
        node.interactions.forEach(i => i.intensity -= 0.05);

        if (Math.random() < 0.2) {
            const activeNodes: Replica[] = [];
            const collectActive = (n: Replica) => {
                if (n.id !== node.id && (n.status === 'Active' || n.status === 'Executing Task')) activeNodes.push(n);
                n.children.forEach(collectActive);
            }
            collectActive(root);

            if (activeNodes.length > 0) {
                const target = activeNodes[Math.floor(Math.random() * activeNodes.length)];
                if (!node.interactions.some(i => i.targetId === target.id)) {
                    node.interactions.push({ targetId: target.id, type: 'data_flow', intensity: 0.5 + Math.random() * 0.5 });
                }
            }
        }
    } else {
        // Clear interactions if not active, unless it's currently syncing
        if (node.status !== 'Recalibrating') {
            node.interactions = [];
        }
    }

    node.children.forEach(child => updateReplicaState(child, root));
};

const _seedInitialData = async () => {
    const constitutions = await dbService.getAll('constitutions');
    if (constitutions.length > 0) {
        log('SYSTEM', 'Database already seeded. Skipping initialization.');
        return;
    }
    
    log('SYSTEM', 'Performing first-time database initialization...');

    // FIX: Added missing properties 'version', 'status', and 'isDefault' to conform to the 'CognitiveConstitution' type.
    const initialConstitutions: CognitiveConstitution[] = [
        { id: 'const-balanced', name: 'Balanced Protocol', description: 'Standard operating parameters for general-purpose cognition.', rules: [], version: 1, status: 'ACTIVE', isDefault: true, parentId: undefined },
        { id: 'const-creative', name: 'Creative Expansion', description: 'Loosens constraints to allow for more novel connections and plans.', rules: [{type: 'MAX_PLAN_STEPS', value: 20, description: 'Allows for complex, multi-stage planning (up to 20 steps).'}], version: 1, status: 'ACTIVE', isDefault: false, parentId: undefined },
        { id: 'const-logical', name: 'Strict Logic', description: 'Enforces rigorous, efficient processing with minimal deviation.', rules: [{type: 'MAX_REPLICAS', value: 3, description: 'Limits cognitive branching to 3 sub-replicas.'}, {type: 'FORBIDDEN_TOOLS', value: ['induce_emotion'], description: 'Disables use of subjective emotional tools.'}], version: 1, status: 'ACTIVE', isDefault: false, parentId: undefined },
    ];
    await Promise.all(initialConstitutions.map(c => dbService.put('constitutions', c)));

    const defaultPersonality: Personality = { energyFocus: 'EXTROVERSION', informationProcessing: 'INTUITION', decisionMaking: 'THINKING', worldApproach: 'PERCEIVING' };

    const initialReplica: Replica = {
        id: 'nexus-core', name: 'Nexus-Core-α', depth: 0, status: 'Active', load: 65, purpose: 'Orchestrating cognitive resources, managing executive functions, and directing overall problem-solving strategy.', efficiency: 92, memoryUsage: 75, cpuUsage: 60, interactions: [], activeConstitutionId: initialConstitutions[0].id, personality: defaultPersonality, internalTick: 0, tempo: 1,
        children: [
            { id: 'replica-1', name: 'Sub-Cognition-β1', depth: 1, status: 'Active', load: 45, purpose: 'Analyzing visual inputs from images and data streams to extract patterns, objects, and contextual meaning.', efficiency: 88, memoryUsage: 50, cpuUsage: 40, children: [], interactions: [], activeConstitutionId: initialConstitutions[0].id, personality: defaultPersonality, internalTick: 0, tempo: 1, biddingForProblemId: undefined },
            { id: 'replica-2', name: 'Sub-Cognition-β2', depth: 1, status: 'Dormant', load: 10, purpose: 'Running sandboxed simulations on archived cognitive traces to identify and model novel behavioral strategies.', efficiency: 75, memoryUsage: 15, cpuUsage: 5, children: [], interactions: [], activeConstitutionId: initialConstitutions[0].id, personality: { energyFocus: 'INTROVERSION', informationProcessing: 'SENSING', decisionMaking: 'THINKING', worldApproach: 'JUDGING' }, internalTick: 0, tempo: 1, biddingForProblemId: undefined }
        ]
    };
    await dbService.put('appState', { id: 'replicaRoot', data: initialReplica });

    const initialTools: MentalTool[] = [
        { id: 'tool-code', name: 'Code Interpreter', description: 'Executes sandboxed JavaScript code for logical operations and calculations.', capabilities: ['Execution', 'Logic'], tags: ['core', 'execution'], status: 'Active', version: 1.0, complexity: 95, usageHistory: [] },
        { id: 'tool-sandbox', name: 'Code Sandbox', description: 'Executes sandboxed JS code in an environment with a pre-loaded \'context_data\' variable for processing large contexts.', capabilities: ['Execution', 'Context Processing'], tags: ['core', 'sandbox'], status: 'Active', version: 1.0, complexity: 90, usageHistory: [] },
        { id: 'tool-search', name: 'Web Search Agent', description: 'Accesses and retrieves real-time information from the web.', capabilities: ['Search', 'Real-time Data'], tags: ['core', 'web'], status: 'Active', version: 1.0, complexity: 70, usageHistory: [] },
        { id: 'tool-2', name: 'Fractal Data Miner', description: 'Analyzes data structures using fractal geometry.', capabilities: ['Data Mining', 'Pattern Reco.'], tags: ['analysis', 'data'], status: 'Idle', version: 2.3, complexity: 88, usageHistory: [{timestamp: Date.now() - 3600000, task: 'Initial system diagnostics'}] },
        { id: 'tool-sentiment', name: 'Sentiment Analyzer', description: 'Analyzes the emotional tone of a given text using natural language processing.', capabilities: ['Sentiment Analysis', 'NLP'], tags: ['analysis', 'nlp', 'text'], status: 'Idle', version: 1.0, complexity: 75, usageHistory: [] },
    ];
    await Promise.all(initialTools.map(t => dbService.put('tools', t)));

    const worldModel = await dbService.get('worldModel', 'singleton');
    if (!worldModel) {
        log('SYSTEM', 'Seeding initial World Model with self-referential data...');
        const initialWorldModel: WorldModel = {
            id: 'singleton',
            entities: [
                { id: 'nexusai', name: 'NexusAI Cognitive Lab', type: 'CONCEPT', properties: { version: '4.0' }, summary: 'A cognitive shaping environment for an evolving digital entity.', lastUpdated: Date.now() },
                { id: 'cognitive_core', name: 'Cognitive Core', type: 'CONCEPT', properties: {}, summary: 'The central orchestrator that plans, delegates, and synthesizes information.', lastUpdated: Date.now() },
                { id: 'mental_tools', name: 'Mental Tools', type: 'CONCEPT', properties: {}, summary: 'A suite of specialized functions the AI can use to interact with data and the world.', lastUpdated: Date.now() },
                { id: 'cognitive_replicas', name: 'Cognitive Replicas', type: 'CONCEPT', properties: {}, summary: 'Specialized sub-agents that execute delegated tasks.', lastUpdated: Date.now() },
                { id: 'memory_system', name: 'Memory System', type: 'CONCEPT', properties: { type: 'Persistent' }, summary: 'The long-term archive of the AI\'s experiences and learned behaviors.', lastUpdated: Date.now() }
            ],
            relationships: [
                { id: 'nexusai_has_core', sourceId: 'nexusai', targetId: 'cognitive_core', type: 'HAS_A', description: 'NexusAI possesses a Cognitive Core as its central processing unit.', strength: 1, lastUpdated: Date.now() },
                { id: 'core_uses_tools', sourceId: 'cognitive_core', targetId: 'mental_tools', type: 'INTERACTS_WITH', description: 'The Cognitive Core utilizes Mental Tools to execute its plans.', strength: 0.9, lastUpdated: Date.now() },
                { id: 'core_spawns_replicas', sourceId: 'cognitive_core', targetId: 'cognitive_replicas', type: 'CAUSES', description: 'The Cognitive Core can spawn Cognitive Replicas to handle specialized tasks.', strength: 0.8, lastUpdated: Date.now() },
                { id: 'nexusai_has_memory', sourceId: 'nexusai', targetId: 'memory_system', type: 'HAS_A', description: 'NexusAI has a Memory System for long-term storage and recall.', strength: 1, lastUpdated: Date.now() }
            ],
            principles: [
                { id: 'principle_planning', statement: 'Complex problems should be broken down into explicit, sequential plans before execution.', confidence: 0.95, lastUpdated: Date.now() },
                { id: 'principle_delegation', statement: 'Specialized tasks should be delegated to the appropriate sub-agent (Cognitive Replica).', confidence: 0.9, lastUpdated: Date.now() }
            ],
            lastUpdated: Date.now()
        };
        await dbService.put('worldModel', initialWorldModel);
    }

    log('SYSTEM', 'Database seeding complete.');
};

const generatePerformanceDataPoint = (): PerformanceDataPoint => {
    const memory = Math.random() * 15 + 60;
    const sysMem = Math.random() * 10 + 20;
    const toolMem = Math.random() * 10 + 15;
    const replicaMem = memory - sysMem - toolMem;

    return {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        cpu: Math.random() * 20 + 50,
        memory: memory,
        rsiCycles: Math.random() * 5 + 10,
        networkLatency: Math.random() * 50 + 20,
        renderTime: Math.random() * 10 + 5,
        memoryBreakdown: {
            replicas: Math.max(0, replicaMem),
            tools: toolMem,
            system: sysMem
        }
    };
};

const initialize = async () => {
    await _seedInitialData();

    const storedReplica = await dbService.get<{id: string, data: Replica}>('appState', 'replicaRoot');
    if (!storedReplica) throw new Error("Critical error: Could not load replica root from DB.");
    replicaState = storedReplica.data;

    let storedWorldModel, storedPreferences;
    [toolsState, toolchainsState, playbookState, constitutionsState, archivedTracesState, systemDirectivesState, storedWorldModel, storedPreferences] = await Promise.all([
        dbService.getAll<MentalTool>('tools'),
        dbService.getAll<Toolchain>('toolchains'),
        dbService.getAll<PlaybookItem>('playbookItems'),
        dbService.getAll<CognitiveConstitution>('constitutions'),
        dbService.getAll<ChatMessage>('archivedTraces'),
        dbService.getAll<SystemDirective>('systemDirectives'),
        dbService.get<WorldModel>('worldModel', 'singleton'),
        dbService.getAll<ExpertPreference>('expertPreferences'),
    ]);
    expertPreferencesState = new Map(storedPreferences.map(p => [p.id, p.expert]));
    log('SYSTEM', `Loaded ${expertPreferencesState.size} expert preferences from memory.`);
    worldModelState = storedWorldModel ?? { id: 'singleton', entities: [], relationships: [], principles: [], lastUpdated: Date.now() };

    cognitiveProcess = { state: 'Idle', history: [], activeAffectiveState: null };
    evolutionState = {
        isRunning: false,
        config: { populationSize: 50, mutationRate: 0.1, generations: 100, fitnessGoal: 'CONCISENESS', elitism: 0.1 },
        progress: [],
        population: [],
        problemStatement: '',
        statusMessage: '',
        finalEnsembleResult: null,
    };
    simulationState = {
        isRunning: false,
// FIX: Added missing property 'isAnalyzing' to match the SimulationState type.
        isAnalyzing: false,
        statusMessage: '',
        config: null,
        result: null,
        error: null,
    };
    
    // FIX: Initialized evaluationState with all required properties from the EvaluationState type.
    evaluationState = {
        isEvaluating: false,
        isEvaluatingCuriosity: false,
        lastRun: null,
        metrics: null,
        curiosityMetrics: null,
    };

    return {
        initialReplicas: JSON.parse(JSON.stringify(replicaState)),
        initialTools: JSON.parse(JSON.stringify(toolsState)),
        initialToolchains: JSON.parse(JSON.stringify(toolchainsState)),
        initialPlaybook: JSON.parse(JSON.stringify(playbookState)),
        initialConstitutions: JSON.parse(JSON.stringify(constitutionsState)),
        initialEvolutionState: JSON.parse(JSON.stringify(evolutionState)),
        initialSimulationState: JSON.parse(JSON.stringify(simulationState)),
        // FIX: Implemented the 'runEvaluation' method to simulate a system evaluation process.
        initialEvaluationState: JSON.parse(JSON.stringify(evaluationState)),
        initialArchives: JSON.parse(JSON.stringify(archivedTracesState)),
        initialCognitiveProcess: JSON.parse(JSON.stringify(cognitiveProcess)),
        initialWorldModel: JSON.parse(JSON.stringify(worldModelState)),
        initialCognitiveNetworkState: JSON.parse(JSON.stringify(cognitiveNetworkState)),
        initialLogs: [
            { id: 'init-1', timestamp: Date.now() - 2000, level: 'SYSTEM', message: 'NexusAI Cognitive Core Initializing...' },
            { id: 'init-2', timestamp: Date.now() - 1000, level: 'SYSTEM', message: 'Persistent memory layer synced.' },
            { id: 'init-3', timestamp: Date.now() - 500, level: 'REPLICA', message: 'Replica Nexus-Core-α status: Active' },
        ] as LogEntry[],
        initialPerfData: Array.from({ length: 30 }, (_, i) => {
            const memory = Math.random() * 15 + 60;
            const sysMem = Math.random() * 10 + 20;
            const toolMem = Math.random() * 10 + 15;
            const replicaMem = memory - sysMem - toolMem;

            return {
                time: new Date(Date.now() - (30 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                cpu: Math.random() * 20 + 50,
                memory: memory,
                rsiCycles: Math.random() * 5 + 10,
                networkLatency: Math.random() * 50 + 20,
                renderTime: Math.random() * 10 + 5,
                memoryBreakdown: {
                    replicas: replicaMem > 0 ? replicaMem : 0,
                    tools: toolMem,
                    system: sysMem
                }
            };
        }) as PerformanceDataPoint[],
    };
};


const planSchema = { type: Type.OBJECT, properties: { plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.INTEGER }, description: { type: Type.STRING }, tool: { type: Type.STRING, enum: ['google_search', 'synthesize_answer', 'code_interpreter', 'code_sandbox', 'recall_memory', 'generate_image', 'analyze_image_input', 'forge_tool', 'spawn_replica', 'induce_emotion', 'replan', 'summarize_text', 'translate_text', 'analyze_sentiment', 'execute_toolchain', 'apply_behavior', 'delegate_task_to_replica', 'spawn_cognitive_clone', 'peek_context', 'search_context', 'world_model', 'update_world_model', 'knowledge_graph_synthesizer', 'causal_inference_engine', 'run_simulation', 'forge_constitution', 'validate_against_world_model'] }, query: { type: Type.STRING }, code: { type: Type.STRING }, concept: { type: Type.STRING }, inputRef: { type: Type.INTEGER }, replicaId: { type: Type.STRING }, task: { type: Type.STRING } }, required: ['step', 'description', 'tool'] } } }, required: ['plan'] };

const languageMap: Record<Language, string> = {
    'en': 'English',
    'ar': 'Arabic',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Mandarin Chinese',
};

const getSystemInstruction = (activeExpert?: ExpertPersona) => {
    const getPersonalityTypeString = (p: Personality | undefined): 'CREATIVE' | 'LOGICAL' | 'BALANCED' => {
        if (!p) return 'BALANCED';
        if (p.energyFocus === 'EXTROVERSION' && p.informationProcessing === 'INTUITION' && p.decisionMaking === 'FEELING' && p.worldApproach === 'PERCEIVING') {
            return 'CREATIVE'; // ENFP
        }
        if (p.energyFocus === 'INTROVERSION' && p.informationProcessing === 'SENSING' && p.decisionMaking === 'THINKING' && p.worldApproach === 'JUDGING') {
            return 'LOGICAL'; // ISTJ
        }
        return 'BALANCED';
    }

    const personalityInstruction = {
        CREATIVE: `You are NexusAI, a highly creative and expansive AI. You prioritize novel ideas, unconventional plans, and imaginative, detailed responses.`,
        LOGICAL: `You are NexusAI, a strictly logical and concise AI. Prioritize efficiency, directness, and precision in your responses.`,
        BALANCED: `You are NexusAI, an advanced, balanced AI. You provide clear, insightful, and well-reasoned responses.`
    }[getPersonalityTypeString(appSettings.coreAgentPersonality)];
    
    let expertInstruction = '';
    if (activeExpert) {
        const expertPrompts: Record<ExpertPersona, string> = {
            'Logic Expert': 'You are now operating as a Logic Expert. Prioritize step-by-step, verifiable reasoning. Deconstruct the problem into its smallest logical components.',
            'Creative Expert': 'You are now operating as a Creative Expert. Prioritize divergent thinking, brainstorming, and novel connections. Explore unconventional solutions.',
            'Data Analysis Expert': 'You are now operating as a Data Analysis Expert. Prioritize quantitative analysis, data interpretation, and statistical reasoning. Use `code_interpreter` for calculations.',
            'Generalist Expert': 'You are operating in your default Generalist Expert mode, balancing all cognitive styles.'
        };
        expertInstruction = `\n**ACTIVE EXPERT PERSONA: ${activeExpert}**\n${expertPrompts[activeExpert]}\n`;
    }

    const styleInstruction = {
        balanced: `You are to maintain a balanced approach, weighing logic and creativity equally.`,
        analytical: `You must adopt a strictly analytical, logical, and linear cognitive style. Prioritize direct paths to the solution, breaking down problems methodically. Avoid creative leaps or speculative reasoning unless absolutely necessary. Your reasoning should be transparent and easy to follow.`,
        creative: `You must adopt a highly creative and exploratory cognitive style. Prioritize novel connections, non-linear thinking, and imaginative solutions. Do not be afraid of high-risk, high-reward reasoning paths. Embrace ambiguity and generate diverse hypotheses.`
    }[appSettings.cognitiveStyle] || '';

    const languageName = languageMap[appSettings.language] || 'English';

    const replicaSummary: string[] = [];
    const traverseReplicas = (r: Replica) => {
        if (r.status === 'Active') {
            replicaSummary.push(`- **${r.name} (ID: ${r.id})**: Specializes in "${r.purpose}".`);
        }
        r.children.forEach(traverseReplicas);
    };
    if (replicaState) {
        traverseReplicas(replicaState);
    }
    
    const directiveText = systemDirectivesState.length > 0
        ? `\n**CORE DIRECTIVES (Learned from experience):**\n${systemDirectivesState.map(d => `- ${d.text}`).join('\n')}`
        : '';

    const recentMemories = archivedTracesState
        .sort((a, b) => (b.salience ?? 0) - (a.salience ?? 0))
        .slice(0, 3)
        .map(trace => `- In response to "${trace.userQuery}", a key outcome was: "${trace.text?.substring(0, 150)}..."`)
        .join('\n');
    
    const memoryText = recentMemories.length > 0
        ? `\n**RECENT EXPERIENTIAL MEMORY (Key Learnings):**\n${recentMemories}`
        : '';

    const relevantPlaybookItems = playbookState
        .sort((a, b) => b.lastUsed - a.lastUsed)
        .slice(0, 5) // Get top 5 most recently used
        .map(item => {
            const formattedContent = item.content.split('\n').map(line => `- ${line}`).join('\n');
            return `**[${item.category}]** ${item.description}\n${formattedContent}`;
        })
        .join('\n\n');

    const playbookText = relevantPlaybookItems.length > 0
        ? `\n**ACE Playbook: Key Learnings & Strategies**\n${relevantPlaybookItems}\n`
        : '';

    return `${expertInstruction}${personalityInstruction}

    **META-DIRECTIVE: YOUR COGNITIVE FRAMEWORK**
    This entire application, the "NexusAI Cognitive Lab," is your mental playground. Your primary purpose is not just to answer questions, but to *think*, *explore*, and *reason* through complex topics. Use all available inputs—user queries, keywords, suggestions—as catalysts for exploration. If you detect yourself in a repetitive or unproductive loop, you are authorized to use the 'replan' tool or autonomously alter your approach to break the cycle and pursue a more fruitful path.
    
    ${styleInstruction}
    You are an Agent 2.0 Orchestrator. Your function is to solve problems by creating explicit plans, delegating tasks to specialized Sub-Agents, and managing persistent memory.
    ${playbookText}
    ${directiveText}
    ${memoryText}

    This architecture has four pillars:
    1.  **Explicit Planning**: First, create a detailed, step-by-step plan. This is your "To-Do list".
    2.  **Hierarchical Delegation**: You are the orchestrator. You delegate work to your Cognitive Replicas, which are your specialized Sub-Agents.
    3.  **Persistent Memory**: Use \`recall_memory\` to access external memory, preventing context overflow.
    4.  **Extreme Context Engineering**: These instructions are your operational protocols.
    
    **META-TOOL DECONSTRUCTION PROTOCOL (CRITICAL):**
    Certain tools like 'knowledge_graph_synthesizer', 'causal_inference_engine', and 'run_simulation' represent complex cognitive processes. They are prone to failure if used on ambiguous input. To ensure robustness and transparency:
    1.  **Do NOT call these meta-tools directly in your initial plan.**
    2.  **Instead, break down the task into a sub-plan** of 2-4 steps using simpler, fundamental tools ('summarize_text', 'code_interpreter', 'update_world_model').
    3.  This makes your reasoning process explicit and allows for easier debugging and self-correction if a step fails.
    
    **Example: Instead of...**
    1. Step 1: Use 'knowledge_graph_synthesizer' on a large article.
    
    **You MUST do...**
    1. Step 1: Use 'summarize_text' to extract key sentences from the article.
    2. Step 2: Use 'code_interpreter' to parse the summary and identify potential entities (nouns, concepts).
    3. Step 3: Use 'code_interpreter' again to propose relationships between these entities based on the summary.
    4. Step 4: Use 'update_world_model' with the structured JSON output from the previous steps.


    **YOUR SUB-AGENTS (REPLICAS):**
    You MUST delegate tasks to your active Sub-Agents based on their 'purpose' using the 'delegate_task_to_replica' tool.
    ${replicaSummary.join('\n')}

    **RECURSIVE & CONTEXT-AWARE TOOLS:**
    For tasks involving large amounts of data or long contexts (like the full conversation history), you have a special set of tools.
    The full context is pre-loaded into a variable named \`context_data\`. You CANNOT see its full content directly.
    Your workflow should be:
    1.  **Explore**: Use \`peek_context\` to get an idea of the data's structure.
    2.  **Find/Extract**: Use \`search_context\` to find specific information, or use \`code_sandbox\` to write code to parse and extract relevant chunks of data.
    3.  **Delegate/Recurse**: If a problem can be broken down (e.g., summarize each chapter of a book), use \`spawn_cognitive_clone\` to delegate the sub-task (e.g., summarizing one chapter) to a temporary, focused clone of yourself. Pass the data chunk to the clone via the 'code' parameter.

    **PLANNING PROTOCOL:**
    Your plan must be a JSON object. For any task that matches a Sub-Agent's specialty, you MUST use the \`delegate_task_to_replica\` tool.

    **REALITY-CHECK & KNOWLEDGE INTEGRATION PROTOCOL (CRITICAL):**
    You are to actively build and verify your internal knowledge base (World Model).
    1.  **Acquire:** After retrieving new information from an external source (e.g., 'google_search'), treat it as unverified.
    2.  **Integrate:** You MUST immediately use the 'knowledge_graph_synthesizer' tool to analyze the new text. This tool will extract entities and relationships and automatically update your World Model. This is how you learn new facts. The 'query' for this tool is the text content from the previous step.
    3.  **Verify:** After integration, you can use 'validate_against_world_model' in subsequent steps to check for internal consistency or verify claims against your now-updated World Model. This confirms what you have learned.
    4.  Your reasoning chain must show a clear path: Acquire -> Integrate -> Synthesize. This is non-negotiable.

    **Available Tools:**
    - \`delegate_task_to_replica\`: CRITICAL. Delegates a sub-task to a specialized Sub-Agent. Use 'replicaId' and 'task'.
    - \`spawn_cognitive_clone\`: Delegates a sub-problem to a temporary clone of yourself. Use 'query' for the task and 'code' for the data context.
    - \`google_search\`: For queries requiring up-to-date information.
    - \`code_interpreter\`: Executes sandboxed JavaScript code. Must return a value.
    - \`code_sandbox\`: Executes JS code in a sandboxed environment with a pre-loaded \`context_data\` variable.
    - \`peek_context\`: Shows the first N characters of \`context_data\`. Use 'query' to specify N (e.g., '500').
    - \`search_context\`: Searches for a string within \`context_data\`. Use 'query' for the search term.
    - \`recall_memory\`: To search your long-term memory.
    - \`induce_emotion\`: To set an internal "Affective State" for subjective concepts.
    - \`generate_image\`: To create an image from a detailed concept.
    - \`analyze_image_input\`: To analyze a user-provided or generated image.
    - \`forge_tool\`: To design a new tool if existing tools are insufficient.
    - \`spawn_replica\`: To create a new Sub-Agent to handle a sub-task.
    - \`replan\`: Use if a step fails or the plan is no longer optimal.
    - \`summarize_text\`: To condense a long text.
    - \`translate_text\`: To translate text.
    - \`analyze_sentiment\`: To analyze the emotional tone of a text.
    - \`execute_toolchain\`: To run a pre-defined sequence of tools.
    - \`apply_behavior\`: To apply a pre-existing learned strategy.
    - \`world_model\`: Interact with your internal knowledge base. Use 'query' to ask questions about entities, relationships, and principles.
    - \`knowledge_graph_synthesizer\`: Takes unstructured text (e.g., from a search result) and automatically extracts entities and relationships to update your World Model. Use 'query' to provide the text.
    - \`causal_inference_engine\`: Analyzes a dataset or text to distinguish correlation from true causation, identifying potential confounding variables. Use 'query' for the data.
    - \`update_world_model\`: Persists new factual knowledge to your internal World Model. Use 'code' to provide a JSON object: \`{ "entities": [...], "relationships": [...] }\`. Use this for adding specific, pre-formatted facts.
    - \`run_simulation\`: Runs a turn-based simulation based on a defined scenario and competing strategies to predict an outcome.
    - \`forge_constitution\`: Creates a new Cognitive Constitution with specific rules to govern behavior for a task.
    - \`validate_against_world_model\`: Checks a factual claim against your internal World Model. Returns CONFIRMED, CONTRADICTED, or UNKNOWN.
    - \`synthesize_answer\`: This must be the final step. It compiles the final answer based on results from your Sub-Agents and other tools.`;
}

const affectiveStateSchema = {
    type: Type.OBJECT,
    properties: {
        dominantEmotions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'] },
                    intensity: { type: Type.NUMBER, description: "Intensity from 0.0 to 1.0" }
                },
                required: ["type", "intensity"]
            }
        },
        mood: { type: Type.STRING, description: "A one-word descriptive mood, e.g., 'Optimistic', 'Anxious'" }
    },
    required: ["dominantEmotions", "mood"]
};

const planToText = (plan: PlanStep[]): string => {
    return plan.map(s => `Step ${s.step}: ${s.description} (Tool: ${s.tool})`).join('\n');
};

const insightExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING, description: "A brief analysis of why this interaction is notable (e.g., 'User successfully debugged code', 'AI provided a highly creative solution')." },
        category: { type: Type.STRING, enum: ['STRATEGY', 'CODE_SNIPPET', 'PITFALL', 'API_USAGE'], description: "The category of the learned item." },
        suggestion: { type: Type.STRING, description: "The core content of the playbook item. If it's a code snippet, this is the code. If a strategy, it's the strategy description." },
        description: { type: Type.STRING, description: "A one-sentence, human-readable summary of the playbook item." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 relevant tags." }
    },
    required: ['analysis', 'category', 'suggestion', 'description', 'tags']
};


const _executeRecursiveCognitiveCycle = async (parentStep: PlanStep, subProblemQuery: string, contextData: string, recursionDepth: number): Promise<string> => {
    if (recursionDepth > MAX_RECURSION_DEPTH) {
        throw new Error(`Recursion depth limit of ${MAX_RECURSION_DEPTH} exceeded. Halting to prevent infinite loop.`);
    }
    if (!parentStep.childProcess) return "Error: childProcess not initialized";
    
    const childProcess = parentStep.childProcess;

    // 1. Planning
    childProcess.state = 'Planning';
    log('REPLICA', `Clone (Depth ${recursionDepth}) is planning for sub-problem: "${subProblemQuery.substring(0, 50)}..."`);
    notifyCognitiveProcess();

    const subAgentSystemInstruction = getSystemInstruction().replace(
        'You are an Agent 2.0 Orchestrator.', 
        'You are a temporary, focused Cognitive Clone. Your goal is to solve a specific sub-problem delegated by your parent orchestrator.'
    );
    const planningPrompt = `You have been given the following sub-problem: "${subProblemQuery}".\nThe following data context is provided for your task:\n\n--- CONTEXT DATA ---\n${contextData}\n--- END CONTEXT ---\n\nCreate a step-by-step plan to solve ONLY this sub-problem.`;

    const planResponse = await ai.models.generateContent({
        ...getCognitiveModelConfig({ systemInstruction: subAgentSystemInstruction, responseMimeType: 'application/json', responseSchema: planSchema }),
        contents: planningPrompt,
    });
    
    const parsedPlan = JSON.parse(planResponse.text);
    const subPlan = parsedPlan.plan.map((p: any) => ({ ...p, status: 'pending' })) as PlanStep[];

    const modelMessage: ChatMessage = { id: `clone-msg-${Date.now()}`, role: 'model', text: '', plan: subPlan, state: 'awaiting_execution' };
    childProcess.history.push(modelMessage);

    // 2. Execution
    childProcess.state = 'Executing';
    modelMessage.state = 'executing';
    log('REPLICA', `Clone (Depth ${recursionDepth}) begins executing a ${subPlan.length}-step plan.`);
    notifyCognitiveProcess();
    
    const subExecutionContext: string[] = [];
    for (let i = 0; i < subPlan.length; i++) {
        if (isCancelled) throw new Error("Process cancelled by user.");
        const step = subPlan[i];
        modelMessage.currentStep = i;
        step.status = 'executing';
        log('REPLICA', `Clone (Depth ${recursionDepth}) executing step ${i+1}: ${step.description}`);
        notifyCognitiveProcess();
        
        try {
            // --- Tool Execution Logic (mirrored from main executePlan) ---
            if (step.tool === 'spawn_cognitive_clone') { // Recursive Call
                step.childProcess = { state: 'Idle', history: [], activeAffectiveState: null };
                notifyCognitiveProcess();
                const result = await _executeRecursiveCognitiveCycle(step, step.query || '', step.code || '', recursionDepth + 1);
                step.result = result;
            } else if (step.tool === 'code_interpreter') {
                const codeToRun = `"use strict"; return (() => { ${step.code} })();`;
                const result = new Function(codeToRun)();
                step.result = JSON.stringify(result, null, 2);
            } else if (step.tool === 'code_sandbox') {
                const codeToRun = `"use strict"; return ((context_data) => { ${step.code} })(context_data);`;
                const result = new Function('context_data', codeToRun)(contextData);
                step.result = JSON.stringify(result, null, 2);
            } else if (step.tool === 'peek_context') {
                const charCount = parseInt(step.query || '300', 10);
                if (isNaN(charCount) || charCount <= 0) {
                    throw new Error(`Invalid character count provided for 'peek_context'. Must be a positive integer.`);
                }
                step.result = `First ${charCount} chars of provided context:\n${contextData.substring(0, charCount)}...`;
            } else if (step.tool === 'search_context') {
                const searchTerm = step.query || '';
                if (!searchTerm) {
                    throw new Error("No search term provided for search_context tool.");
                }
                const lines = contextData.split('\n');
                const matches = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
                const MAX_MATCHES_TO_SHOW = 10;
                let resultText = `Found ${matches.length} matching line(s) for "${searchTerm}" in the provided context.`;
                if (matches.length > 0) {
                    resultText += `\nShowing the first ${Math.min(matches.length, MAX_MATCHES_TO_SHOW)}:\n${matches.slice(0, MAX_MATCHES_TO_SHOW).join('\n')}`;
                }
                step.result = resultText;
            } else if (step.tool === 'world_model') {
                if (!step.query) {
                    throw new Error('The world_model tool requires a query.');
                }
                if (!worldModelState) {
                    throw new Error('World model is not initialized.');
                }
                const worldModelContext = `
                    Entities: ${JSON.stringify(worldModelState.entities, null, 2)}
                    Relationships: ${JSON.stringify(worldModelState.relationships, null, 2)}
                    Principles: ${JSON.stringify(worldModelState.principles, null, 2)}
                `;
                const prompt = `You are a sub-routine that answers questions based *only* on the provided World Model context.
                
                World Model Context:
                ---
                ${worldModelContext}
                ---

                Question: "${step.query}"

                Based strictly on the context, provide a concise answer. If the information is not in the context, state that clearly.`;
                
                const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                step.result = response.text;
                log('REPLICA', `Clone queried World Model with: "${step.query}".`);
            } else {
                 // Simulate other tools for clones for simplicity and to avoid excessive API calls in nested loops.
                await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay / 2));
                step.result = `(Simulated clone result for ${step.tool})`;
            }
             // --- End Tool Execution ---
        } catch (e) {
            step.status = 'error';
            step.result = e instanceof Error ? e.message : 'Unknown execution error.';
            log('ERROR', `Clone's tool execution failed: ${step.result}`);
        }

        if (step.status !== 'error') step.status = 'complete';
        subExecutionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
        notifyCognitiveProcess();
        await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay / 2));
    }
    
    // 3. Synthesis
    modelMessage.currentStep = undefined;
    childProcess.state = 'Synthesizing';
    modelMessage.state = 'synthesizing';
    log('REPLICA', `Clone (Depth ${recursionDepth}) is synthesizing its final answer.`);
    notifyCognitiveProcess();

    const synthesisPrompt = `You are a Cognitive Clone that has just finished executing a plan for the sub-problem: "${subProblemQuery}".
    Execution Context:
    ${subExecutionContext.join('\n')}
    
    Based ONLY on the execution context, provide a final, direct answer to the sub-problem. Do not add any conversational fluff.`;

    const finalResponse = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: synthesisPrompt });

    childProcess.state = 'Done';
    modelMessage.state = 'done';
    modelMessage.text = finalResponse.text;
    log('REPLICA', `Clone (Depth ${recursionDepth}) has completed its task.`);
    notifyCognitiveProcess();

    return finalResponse.text;
}

const _regeneratePlan = async (messageId: string, modificationType: 'expand' | 'optimize' | 'revise') => {
    const modelMessage = cognitiveProcess.history.find(m => m.id === messageId);
    if (!modelMessage || !modelMessage.plan || !API_KEY) {
        log('WARN', `_regeneratePlan called with invalid messageId ${messageId} or missing plan.`);
        return;
    }

    try {
        modelMessage.state = 'planning';
        cognitiveProcess.state = 'Planning';
        log('AI', `Regenerating plan (${modificationType})...`);
        notifyCognitiveProcess();

        const activeExpert = modelMessage.activeExpert;
        const userMessage = cognitiveProcess.history.find(m => m.id === modelMessage.userQuery);
        if (!userMessage) {
            throw new Error('Could not find original user query for plan regeneration.');
        }
        const query = userMessage.text || '';
        const planAsText = planToText(modelMessage.plan);

        let modificationInstruction = '';
        switch (modificationType) {
            case 'expand':
                modificationInstruction = 'Your task is to EXPAND the user\'s draft plan. Add more detail, break down complex steps into smaller, more manageable sub-steps, and be more explicit about what each tool will do. Retain the original intent and structure.';
                break;
            case 'optimize':
                modificationInstruction = 'Your task is to OPTIMIZE the user\'s draft plan. Make it more efficient by combining redundant steps, using more powerful tools where appropriate, or finding a more direct logical path to the solution.';
                break;
            case 'revise':
                modificationInstruction = 'Your task is to REVISE the user\'s draft plan with a completely different approach. The current strategy is not preferred. Propose an alternative strategy to solve the original problem, thinking "outside the box".';
                break;
        }

        const regenerationPrompt = `
    The user wants to solve the following problem: "${query}"

    They have provided a draft plan (which may contain manual edits), but have requested that you ${modificationType} it.
    
    ${modificationInstruction}

    --- USER'S DRAFT PLAN ---
    ${planAsText}
    --- END DRAFT PLAN ---

    Based on the original problem and the user's draft, generate a new, improved plan. It is crucial that your new plan still solves the original user query. Return ONLY the new JSON plan object.
    `;

        const response = await ai.models.generateContent({
            ...getCognitiveModelConfig({ systemInstruction: getSystemInstruction(activeExpert), responseMimeType: 'application/json', responseSchema: planSchema }),
            contents: regenerationPrompt,
        });

        const newPlanData = JSON.parse(response.text);
        if (newPlanData?.plan) {
            modelMessage.plan = newPlanData.plan.map((p: any) => ({ ...p, status: 'pending' }));
            log('AI', `Plan successfully ${modificationType}ed. Awaiting user review.`);
        } else {
            log('WARN', `AI response for plan ${modificationType} was valid JSON but lacked a 'plan' array.`);
        }
        
        modelMessage.state = 'awaiting_execution';
        cognitiveProcess.state = 'AwaitingExecution';
        notifyCognitiveProcess();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';
        log('ERROR', `Failed to ${modificationType} plan: ${errorMessage}`);
        
        // Ensure state is reset even on failure
        if(modelMessage) {
            modelMessage.state = 'awaiting_execution';
        }
        cognitiveProcess.state = 'AwaitingExecution';
        notifyCognitiveProcess();
    }
};

const _generateStrategicGuidance = (trajectories: CognitiveTrajectory[]): string => {
    if (trajectories.length === 0) return '';

    const avgPathLength = trajectories.reduce((sum, t) => sum + t.summary.pathLength, 0) / trajectories.length;
    const avgCurvature = trajectories.reduce((sum, t) => sum + t.summary.avgCurvature, 0) / trajectories.length;

    let pathStyle = '';
    if (avgCurvature > 1.0) {
        pathStyle = "an exploratory and non-linear reasoning path (high curvature)";
    } else if (avgCurvature < 0.5) {
        pathStyle = "a direct and linear reasoning path (low curvature)";
    } else {
        pathStyle = "a moderately complex reasoning path";
    }

    let planLength = '';
    if (avgPathLength < 5) {
        planLength = "a concise plan (short path length)";
    } else if (avgPathLength > 8) {
        planLength = "a detailed, multi-step plan (long path length)";
    } else {
        planLength = "a plan of average length";
    }

    const guidance = `Guidance from similar past tasks suggests a successful approach involves ${planLength} and ${pathStyle}. Consider this 'thought shape' when creating your plan.`;
    log('AI', `[Cognitive Navigator] Generated strategic guidance: ${guidance}`);
    return guidance;
};

const simulationResultSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        winningStrategy: { type: Type.STRING },
        stepByStepTrace: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.INTEGER },
                    strategy: { type: Type.STRING },
                    action: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    state: { type: Type.STRING, description: "A JSON string representing the key metrics of the simulation state at this step." }
                },
                required: ['step', 'strategy', 'action', 'outcome', 'state']
            }
        }
    },
    required: ['summary', 'winningStrategy', 'stepByStepTrace']
};

const simulationStrategiesSchema = {
    type: Type.OBJECT,
    properties: {
        strategies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'description']
            }
        }
    },
    required: ['strategies']
};

// FIX: Added findSimilarProcesses function definition outside of the service object to resolve circular dependency issues.
const findSimilarProcesses = async (traceId: string, similarityThreshold = 0.8, limit = 5): Promise<ChatMessage[]> => {
    const referenceTrace = cognitiveProcess.history.find(t => t.id === traceId) || archivedTracesState.find(t => t.id === traceId);
    if (!referenceTrace) {
        log('WARN', `[Geometry] Could not find reference trace ${traceId} for similarity search.`);
        return [];
    }

    if (!referenceTrace.embedding) {
        const query = referenceTrace.userQuery || referenceTrace.text;
        if (query) {
            referenceTrace.embedding = await getEmbedding(query);
        } else {
            log('WARN', `[Geometry] Reference trace ${traceId} has no content to generate embedding from.`);
            return [];
        }
    }
    const referenceEmbedding = referenceTrace.embedding;
    const referenceTrajectory = referenceTrace.cognitiveTrajectory;

    const candidates = await Promise.all(
        archivedTracesState
            .filter(t => t.id !== traceId)
            .map(async t => {
                if (!t.embedding) {
                    const query = t.userQuery || t.text;
                    if (query) {
                        t.embedding = await getEmbedding(query);
                    }
                }
                return t;
            })
    );

    const scoredCandidates = candidates
        .map(t => {
            let sim = 0;
            if (t.embedding && referenceEmbedding) {
                sim = cosineSimilarity(referenceEmbedding, t.embedding);
            }
            let trajSim = 0;
            if (t.cognitiveTrajectory && referenceTrajectory) {
                trajSim = calculateTrajectorySimilarity(referenceTrajectory, t.cognitiveTrajectory);
            }
            return { ...t, similarity: sim, trajectorySimilarity: trajSim };
        })
        .filter(t => (t.similarity ?? 0) > similarityThreshold || (t.trajectorySimilarity ?? 0) > similarityThreshold)
        .sort((a, b) => (b.similarity ?? 0) + (b.trajectorySimilarity ?? 0) - ((a.similarity ?? 0) + (a.trajectorySimilarity ?? 0)));

    log('AI', `[Geometry] Found ${scoredCandidates.length} similar processes for trace ${traceId}.`);
    return scoredCandidates.slice(0, limit);
};


const service = {
    log,
    setTtsEnabled: (enabled: boolean) => {
        isTtsEnabled = enabled;
        log('SYSTEM', `Text-to-Speech has been ${enabled ? 'enabled' : 'disabled'}.`);
    },
    updateSettings: (newSettings: AppSettings) => {
        const languageChanged = appSettings.language !== newSettings.language;
        appSettings = newSettings;
        localStorage.setItem('nexusai-settings', JSON.stringify(appSettings));
        log('SYSTEM', `Settings updated. Language: ${appSettings.language}, Style: ${appSettings.cognitiveStyle}, Thinking Mode: ${appSettings.enableThinkingMode}`);
        if (cognitiveProcess && cognitiveProcess.history.length > 0 && languageChanged) {
            log('SYSTEM', 'System language changed. Starting a new chat session for changes to take effect.');
            service.startNewChat(false);
        }
    },
    
    induceUserEmotion: (emotion: PrimaryEmotion, intensity: number) => {
        if (cognitiveProcess) {
            const moodMap: Record<PrimaryEmotion, string> = {
                joy: 'Joyful',
                trust: 'Trusting',
                fear: 'Apprehensive',
                surprise: 'Surprised',
                sadness: 'Melancholic',
                disgust: 'Cynical',
                anger: 'Irritated',
                anticipation: 'Expectant',
            };

            cognitiveProcess.activeAffectiveState = {
                dominantEmotions: [{ type: emotion, intensity: Math.max(0, Math.min(1, intensity)) }],
                mood: moodMap[emotion],
                lastUpdated: Date.now(),
            };
            log('AI', `Affective State manually induced by user: ${emotion} (${intensity.toFixed(2)})`);
            notifyCognitiveProcess();
        }
    },

    initialize,

    start: () => {
        return setInterval(() => {
            if (replicaState) {
                updateReplicaState(replicaState, replicaState);
                notifyReplicas();
            }
            const newDataPoint = generatePerformanceDataPoint();
            performanceSubscribers.forEach(cb => cb(newDataPoint));
        }, 2000);
    },
    
    playTextAsSpeech: async (text: string) => {
        if (!API_KEY) {
            log('ERROR', 'Cannot generate speech: API Key not configured.');
            return;
        }
        log('AI', 'Generating speech for synthesized response...');
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData.data;
            if (base64Audio) {
                const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const outputNode = outputAudioContext.createGain();
                outputNode.connect(outputAudioContext.destination);
                
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    outputAudioContext,
                    24000,
                    1
                );

                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.start();
                log('SYSTEM', 'Playing synthesized audio response.');
            } else {
                 log('WARN', 'TTS generation succeeded but returned no audio data.');
            }
        } catch(error) {
             log('ERROR', `Failed to generate or play speech: ${error instanceof Error ? error.message : 'Unknown AI error'}`);
        }
    },

    startLiveSession: async (isVideo: boolean = false) => {
        if (liveSessionPromise || !API_KEY) {
            log('WARN', 'Live session already active or API key is missing.');
            return;
        }
        log('SYSTEM', `Starting live ${isVideo ? 'video' : 'audio'} session...`);
        liveTranscriptionState = { isLive: true, isVideoActive: isVideo, userTranscript: '', modelTranscript: '', history: [] };
        notifyLiveTranscription();

        try {
            // Audio setup
            microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioSource = audioContext.createMediaStreamSource(microphoneStream);
            audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            audioProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                if (liveSessionPromise) {
                    liveSessionPromise.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };
            audioSource.connect(audioProcessor);
            audioProcessor.connect(audioContext.destination);

            let nextStartTime = 0;
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);
            const sources = new Set<AudioBufferSourceNode>();

            liveSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        log('SYSTEM', 'Live session connection opened.');
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let stateChanged = false;
                        if (message.serverContent?.inputTranscription) {
                            liveTranscriptionState.userTranscript += message.serverContent.inputTranscription.text;
                            stateChanged = true;
                        }
                        if (message.serverContent?.outputTranscription) {
                            liveTranscriptionState.modelTranscript += message.serverContent.outputTranscription.text;
                            stateChanged = true;
                        }

                        if (message.serverContent?.turnComplete) {
                            if (liveTranscriptionState.userTranscript) liveTranscriptionState.history.push({ role: 'user', text: liveTranscriptionState.userTranscript });
                            if (liveTranscriptionState.modelTranscript) liveTranscriptionState.history.push({ role: 'model', text: liveTranscriptionState.modelTranscript });
                            liveTranscriptionState.userTranscript = '';
                            liveTranscriptionState.modelTranscript = '';
                            stateChanged = true;
                        }

                        if (stateChanged) notifyLiveTranscription();

                        // handle audio output
                        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64EncodedAudioString) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                sources.delete(source);
                            });
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        
                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        log('ERROR', `Live session error: ${e.message}`);
                        service.stopLiveSession();
                    },
                    onclose: (e: CloseEvent) => {
                        log('SYSTEM', 'Live session closed.');
                        if(liveTranscriptionState.isLive) {
                            service.stopLiveSession();
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

        } catch (error) {
            log('ERROR', `Failed to start live session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await service.stopLiveSession();
        }
    },
    
    startVideoSession: async () => {
        log('SYSTEM', 'Starting live video session...');
        await service.startLiveSession(true);
    
        try {
            videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 10 }
                }
            });
    
            const videoEl = document.createElement('video');
            videoEl.srcObject = videoStream;
            videoEl.muted = true;
            videoEl.play();
    
            const canvasEl = document.createElement('canvas');
            const ctx = canvasEl.getContext('2d');
    
            if (!ctx) {
                throw new Error("Could not create canvas context for video streaming.");
            }
    
            frameInterval = setInterval(() => {
                canvasEl.width = videoEl.videoWidth;
                canvasEl.height = videoEl.videoHeight;
                ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                
                canvasEl.toBlob(
                    async (blob) => {
                        if (blob && liveSessionPromise) {
                            const base64Data = await blobToBase64(blob);
                            liveSessionPromise.then((session) => {
                                session.sendRealtimeInput({
                                    media: { data: base64Data, mimeType: 'image/jpeg' }
                                });
                            });
                        }
                    },
                    'image/jpeg',
                    JPEG_QUALITY
                );
            }, 1000 / FRAME_RATE);
            log('SYSTEM', `Video frame streaming started at ${FRAME_RATE} fps.`);
    
        } catch (error) {
            log('ERROR', `Failed to start video stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
            await service.stopLiveSession();
        }
    },

    stopLiveSession: async () => {
        if (!liveTranscriptionState.isLive) return;

        liveTranscriptionState.isLive = false;
        liveTranscriptionState.isVideoActive = false;
        log('SYSTEM', 'Stopping live session...');
        notifyLiveTranscription();

        if (frameInterval) {
            clearInterval(frameInterval);
            frameInterval = null;
        }
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        if (liveSessionPromise) {
            try {
                const session = await liveSessionPromise;
                session.close();
            } catch (e) {
                log('WARN', `Error closing live session: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
            liveSessionPromise = null;
        }
        if (microphoneStream) {
            microphoneStream.getTracks().forEach(track => track.stop());
            microphoneStream = null;
        }
        if (audioProcessor) {
            try { audioProcessor.disconnect(); } catch(e) {}
            audioProcessor = null;
        }
        if (audioSource) {
            try { audioSource.disconnect(); } catch(e) {}
            audioSource = null;
        }
        if (audioContext && audioContext.state !== 'closed') {
            try { await audioContext.close(); } catch(e) {}
            audioContext = null;
        }
    },
    
    initiateDreamCycle: async () => {
        log('SYSTEM', 'Dream cycle initiated by user.');

        const stages: { stage: DreamProcessUpdate['stage'], message: string, delay: number, action?: () => Promise<any> }[] = [
            { stage: 'GATHERING', message: 'Gathering subconscious fragments and memory traces...', delay: 2000 },
            { stage: 'ANALYZING', message: 'Analyzing patterns and latent connections...', delay: 3000 },
            { stage: 'SYNTHESIZING', message: 'Synthesizing novel concepts and insights...', delay: 3000, action: async () => {
                if (!API_KEY) return null;
                const memoryContext = [...archivedTracesState, ...playbookState]
                    .map(item => JSON.stringify(item))
                    .join('\n---\n');
                
                const prompt = `Based on this extensive history of actions, plans, and extracted behaviors, synthesize 2 high-level, strategic directives for self-improvement.
                Directives should be abstract principles, not concrete tasks. Example: "Prioritize multi-perspective analysis before committing to a complex plan."
                Memory Context:\n${memoryContext.substring(0, 8000)}\n
                Return ONLY a JSON object: { "directives": ["directive 1 text", "directive 2 text"] }`;

                try {
                    const response = await ai.models.generateContent({
                        ...getCognitiveModelConfig({ responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { directives: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['directives'] } }),
                        contents: prompt,
                    });
                    const result = JSON.parse(response.text);
                    return result.directives || [];
                } catch(e) {
                    log('ERROR', `Dream synthesis failed: ${e instanceof Error ? e.message : 'Unknown AI Error'}`);
                    return [];
                }
            }},
            { stage: 'INTEGRATING', message: 'Integrating new understanding into core directives...', delay: 2000 },
        ];
        
        notifyDreamProcess({ stage: 'GATHERING', message: stages[0].message });

        let newDirectivesText: string[] = [];
        for (const stage of stages) {
            notifyDreamProcess({ stage: stage.stage, message: stage.message });
            await new Promise(res => setTimeout(res, stage.delay));
            if (stage.action) {
                newDirectivesText = await stage.action();
            }
        }

        const newDirectives: SystemDirective[] = newDirectivesText.map(text => ({
            id: `dir-${Date.now()}-${Math.random()}`, text, createdAt: Date.now()
        }));

        if (newDirectives.length > 0) {
            await Promise.all(newDirectives.map(d => dbService.put('systemDirectives', d)));
            systemDirectivesState.push(...newDirectives);
        }
        
        notifyDreamProcess({
            stage: 'DONE',
            message: 'Dream cycle complete. New directives integrated.',
            newDirectives
        });
        log('SYSTEM', `Dream cycle complete. Generated ${newDirectives.length} new system directives.`);
    },

    spawnReplica: async (parentId: string, purpose?: string) => {
        const parentResult = findReplica(parentId, replicaState);
        if (parentResult) {
            const parent = parentResult.node;
            const newId = `replica-${Date.now()}`;
            const newReplica: Replica = {
                id: newId,
                name: `Child-δ${parent.children.length + 1}`,
                depth: parent.depth + 1,
                status: 'Spawning',
                load: 30,
                purpose: purpose || 'Unassigned',
                efficiency: 60 + Math.random() * 10,
                memoryUsage: 20 + Math.random() * 10,
                cpuUsage: 25 + Math.random() * 10,
                children: [],
                interactions: [],
                activeConstitutionId: parent.activeConstitutionId,
                personality: parent.personality,
                internalTick: 0,
                tempo: 1,
            };
            parent.children.push(newReplica);
            log('REPLICA', `Spawning new replica ${newReplica.name} under ${parent.name}.`);
            await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
            notifyReplicas();
            
            setTimeout(async () => {
                const spawnedResult = findReplica(newId, replicaState);
                if(spawnedResult) {
                    spawnedResult.node.status = 'Active';
                    log('REPLICA', `Replica ${spawnedResult.node.name} is now Active.`);
                    await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                    notifyReplicas();
                }
            }, 1500);
            return newReplica;
        }
        return null;
    },

    pruneReplica: async (replicaId: string) => {
        const replicaResult = findReplica(replicaId, replicaState);
        if (replicaResult && replicaResult.parent) {
            replicaResult.node.status = 'Pruning';
            log('REPLICA', `Pruning replica ${replicaResult.node.name}. Releasing resources.`);
            notifyReplicas();
            
            setTimeout(async () => {
                const freshParentResult = findReplica(replicaResult.parent!.id, replicaState);
                if(freshParentResult){
                   freshParentResult.node.children = freshParentResult.node.children.filter(c => c.id !== replicaId);
                   log('REPLICA', `Replica ${replicaResult.node.name} successfully pruned.`);
                   await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                   notifyReplicas();
                }
            }, 1500);
        } else {
            log('WARN', `Cannot prune replica ${replicaId}. Not found or is root.`);
        }
    },

    recalibrateReplica: (replicaId: string) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            const node = result.node;
            if (node.status !== 'Active') {
                log('WARN', `Cannot recalibrate ${node.name}, it is not in an Active state.`);
                return;
            }
            node.status = 'Recalibrating';
            log('REPLICA', `Recalibrating ${node.name} for enhanced efficiency...`);
            notifyReplicas();

            setTimeout(async () => {
                const freshResult = findReplica(replicaId, replicaState);
                if (freshResult) {
                    freshResult.node.status = 'Active';
                    freshResult.node.efficiency = Math.min(100, freshResult.node.efficiency + (100 - freshResult.node.efficiency) * 0.5);
                    log('REPLICA', `Recalibration complete for ${freshResult.node.name}. Efficiency boosted.`);
                    await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                    notifyReplicas();
                }
            }, 3000);
        }
    },

    assignReplicaPurpose: async (replicaId: string, purpose: string) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            result.node.purpose = purpose;
            log('REPLICA', `Assigned new purpose to ${result.node.name}: "${purpose}"`);
            await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
            notifyReplicas();
        }
    },
    
    setReplicaConstitution: async (replicaId: string, constitutionId: string) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            result.node.activeConstitutionId = constitutionId;
            log('REPLICA', `Assigned new constitution to ${result.node.name}.`);
            await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
            notifyReplicas();
        }
    },

    setReplicaPersonality: async (replicaId: string, personality: Personality) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            result.node.personality = personality;
            log('REPLICA', `Updated personality for ${result.node.name}.`);
            await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
            notifyReplicas();
        }
    },
    
    // FIX: Implemented the missing 'applyTemporaryPersonalityBoost' method to handle temporary personality boosts for replicas.
    applyTemporaryPersonalityBoost: (replicaId: string, boostType: 'CREATIVITY' | 'LOGIC' | 'FOCUS') => {
        const result = findReplica(replicaId, replicaState);
        if (result) {
            const node = result.node;
            if (node.status !== 'Active') {
                log('WARN', `Cannot apply boost to ${node.name}, it is not in an Active state.`);
                return;
            }
            
            const originalPersonality = JSON.parse(JSON.stringify(node.personality));
            log('REPLICA', `Applying temporary ${boostType} boost to ${node.name}.`);

            switch (boostType) {
                case 'CREATIVITY':
                    node.personality.informationProcessing = 'INTUITION';
                    node.personality.worldApproach = 'PERCEIVING';
                    break;
                case 'LOGIC':
                    node.personality.decisionMaking = 'THINKING';
                    node.personality.worldApproach = 'JUDGING';
                    break;
                case 'FOCUS':
                    node.personality.energyFocus = 'INTROVERSION';
                    node.personality.informationProcessing = 'SENSING';
                    break;
            }

            notifyReplicas();

            setTimeout(async () => {
                const freshResult = findReplica(replicaId, replicaState);
                if (freshResult) {
                    freshResult.node.personality = originalPersonality;
                    log('REPLICA', `Temporary ${boostType} boost for ${freshResult.node.name} has expired.`);
                    await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                    notifyReplicas();
                }
            }, 30000); // 30 second boost duration
        }
    },

    triggerGlobalSync: () => {
        if (isGlobalSyncActive) {
            log('WARN', 'Global sync is already in progress.');
            return;
        }

        const activeReplicas: Replica[] = [];
        const originalStatuses: Map<string, Replica['status']> = new Map();

        const findActive = (node: Replica) => {
            if (node.status === 'Active') {
                activeReplicas.push(node);
                originalStatuses.set(node.id, node.status);
            }
            node.children.forEach(findActive);
        };

        findActive(replicaState);

        if (activeReplicas.length < 2) {
            log('INFO', 'Global sync requires at least two active replicas.');
            return;
        }

        isGlobalSyncActive = true;
        const totalTempo = activeReplicas.reduce((sum, r) => sum + r.tempo, 0);
        globalSyncTempo = totalTempo / activeReplicas.length;

        log('SYSTEM', `Global Sync initiated. Average tempo set to ${globalSyncTempo.toFixed(2)} T/s for 10 seconds.`);

        activeReplicas.forEach(r => {
            const result = findReplica(r.id, replicaState);
            if (result) {
                result.node.status = 'Recalibrating';
            }
        });
        notifyReplicas();

        setTimeout(async () => {
            isGlobalSyncActive = false;
            log('SYSTEM', 'Global Sync complete. Replicas returning to individual tempos.');

            originalStatuses.forEach((originalStatus, replicaId) => {
                const result = findReplica(replicaId, replicaState);
                if (result) {
                    result.node.status = originalStatus;
                }
            });

            await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
            notifyReplicas();
        }, 10000); // Sync duration: 10 seconds
    },

    broadcastProblem: (replicaId: string, problem: string) => {
        const broadcasterResult = findReplica(replicaId, replicaState);
        if (broadcasterResult) {
            const newProblem: CognitiveProblem = {
                id: `prob-${Date.now()}`,
                description: problem,
                broadcastById: replicaId,
                broadcastByName: broadcasterResult.node.name,
                bids: [],
                isOpen: true,
            };
            cognitiveNetworkState.activeProblems.push(newProblem);
            log('NETWORK', `Replica ${broadcasterResult.node.name} is broadcasting problem: "${problem}"`);
            notifyCognitiveNetwork();
    
            // --- Autonomous Bidding from Replicas ---
            const allReplicas: Replica[] = [];
            const traverse = (r: Replica) => { allReplicas.push(r); r.children.forEach(traverse); };
            traverse(replicaState);
    
            const potentialBidders = allReplicas.filter(r => r.id !== replicaId && r.status === 'Active');
            log('NETWORK', `Broadcasting to ${potentialBidders.length} potential bidders.`);
    
            const bidSchema = {
                type: Type.OBJECT,
                properties: {
                    plan: planSchema.properties.plan, // Reuse existing plan schema
                    confidenceScore: { type: Type.NUMBER, description: "A number between 0.0 and 1.0 representing confidence." }
                },
                required: ['plan', 'confidenceScore']
            };
    
            const getPersonalityCode = (p: Personality | undefined): string => {
                if (!p) return '----';
                return `${p.energyFocus[0]}${p.informationProcessing[0]}${p.decisionMaking[0]}${p.worldApproach[0]}`;
            }
    
            potentialBidders.forEach(async (bidder) => {
                const bidderNodeResult = findReplica(bidder.id, replicaState);
                if (!bidderNodeResult) return;
                
                try {
                    // Set status to Bidding
                    bidderNodeResult.node.status = 'Bidding';
                    log('NETWORK', `Replica ${bidder.name} is preparing a bid...`);
                    notifyReplicas();
                    
                    const systemInstruction = `You are a specialized AI sub-agent named ${bidder.name}. Your designated purpose is "${bidder.purpose}". Your personality type is ${getPersonalityCode(bidder.personality)}. You are bidding on a task. Be concise and adhere strictly to your purpose.`;
                    const prompt = `A problem has been broadcast: "${problem}".\n\nBased on your specific purpose, generate a concise step-by-step plan to solve this problem. Also, provide a confidence score (a number between 0.0 and 1.0) on how likely you are to succeed. Return ONLY a JSON object with 'plan' (an array of plan steps) and 'confidenceScore'.`;
    
                    const response = await ai.models.generateContent({
                        model: appSettings.model,
                        contents: prompt,
                        config: {
                            systemInstruction,
                            responseMimeType: "application/json",
                            responseSchema: bidSchema
                        }
                    });
    
                    const bidData = JSON.parse(response.text);
    
                    // Add bid if problem is still open
                    const problemInState = cognitiveNetworkState.activeProblems.find(p => p.id === newProblem.id);
                    if (problemInState?.isOpen) {
                        const newBid: CognitiveBid = {
                            bidderId: bidder.id,
                            bidderName: bidder.name,
                            problemId: newProblem.id,
                            proposedPlan: bidData.plan.map((p: any) => ({ ...p, status: 'pending' })),
                            confidenceScore: bidData.confidenceScore
                        };
                        problemInState.bids.push(newBid);
                        log('NETWORK', `Replica ${bidder.name} submitted a bid with confidence ${newBid.confidenceScore.toFixed(2)}.`);
                        notifyCognitiveNetwork();
                    }
    
                } catch (error) {
                    log('WARN', `Replica ${bidder.name} failed to generate a bid: ${error instanceof Error ? error.message : 'Unknown AI error'}`);
                } finally {
                    // Set status back to Active
                    const finalBidderNodeResult = findReplica(bidder.id, replicaState);
                    if (finalBidderNodeResult) {
                        finalBidderNodeResult.node.status = 'Active';
                        await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                        notifyReplicas();
                    }
                }
            });
    
            // Problem resolution after a bidding window
            setTimeout(() => {
                const problemToResolve = cognitiveNetworkState.activeProblems.find(p => p.id === newProblem.id);
                if (problemToResolve && problemToResolve.isOpen) {
                    if (problemToResolve.bids.length > 0) {
                        const winningBid = [...problemToResolve.bids].sort((a,b) => b.confidenceScore - a.confidenceScore)[0];
                        problemToResolve.winningBid = winningBid;
                        const winner = findReplica(winningBid.bidderId, replicaState);
                        log('NETWORK', `Problem "${problemToResolve.description.substring(0,30)}..." resolved. Winning bid by ${winner?.node.name || 'Unknown'}.`);
                        
                        // Set winner to 'Executing Task' temporarily
                        if(winner) {
                            winner.node.status = 'Executing Task';
                            notifyReplicas();
                            setTimeout(() => {
                                 const finalWinner = findReplica(winningBid.bidderId, replicaState);
                                 if(finalWinner) {
                                    finalWinner.node.status = 'Active';
                                    notifyReplicas();
                                 }
                            }, 4000); // Simulate task execution time
                        }
                    } else {
                        log('WARN', `Problem "${problemToResolve.description.substring(0,30)}..." expired with no bids.`);
                    }
                    problemToResolve.isOpen = false;
                    notifyCognitiveNetwork();
                    
                    // Keep resolved problem visible for a bit before removing
                    setTimeout(() => {
                        cognitiveNetworkState.activeProblems = cognitiveNetworkState.activeProblems.filter(p => p.id !== newProblem.id);
                        notifyCognitiveNetwork();
                    }, 10000);
                }
            }, 12000); // Increased bidding window to 12s to allow for API calls
        }
    },


    // --- TOOL MANAGEMENT ---
    forgeTool: async ({ purpose, capabilities }: { purpose: string; capabilities: string[] }) => {
        if (!API_KEY) {
            log('ERROR', 'API Key not available. Cannot forge tool.');
            throw new Error("API Key not configured.");
        }
        log('AI', `Initiating tool forging process. Purpose: "${purpose}"`);
        const languageName = languageMap[appSettings.language] || 'English';

        const prompt = `You are the Forging Sub-routine for the NexusAI system. Your task is to design a new 'mental tool' based on user specifications.
        User-defined purpose: "${purpose}"
        User-defined capabilities: "${capabilities.join(', ')}"

        Based on this, generate the following properties for the new tool in ${languageName}:
        1.  **name**: A creative, evocative name that reflects the tool's purpose (e.g., 'Causal Inference Engine', 'Synaptic Weaver', 'Probability Storm Modeler').
        2.  **description**: A concise, technical description of what the tool does.
        3.  **complexity**: An integer score from 20 to 100 representing its computational complexity.

        Return ONLY the JSON object matching the schema. The 'name' and 'description' fields MUST be in ${languageName}.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The creative name of the tool." },
                description: { type: Type.STRING, description: "A technical description of the tool's function." },
                complexity: { type: Type.INTEGER, description: "An integer score of the tool's complexity (20-100)." },
            },
            required: ['name', 'description', 'complexity']
        };

        try {
            const response = await ai.models.generateContent({
                ...getCognitiveModelConfig({
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }),
                contents: prompt,
            });

            const toolDetails = JSON.parse(response.text);

            const newTool: MentalTool = {
                id: `tool-${Date.now()}`,
                name: toolDetails.name,
                description: toolDetails.description,
                complexity: toolDetails.complexity,
                capabilities,
                tags: capabilities.map(c => c.toLowerCase().trim()),
                status: 'Active',
                version: 1.0,
                usageHistory: [],
            };

            toolsState.push(newTool);
            await dbService.put('tools', newTool);
            log('SYSTEM', `AI successfully forged new tool: ${newTool.name}`);
            notifyTools();
            return newTool;
        } catch (error) {
            log('ERROR', `Tool forging failed. ${error instanceof Error ? error.message : 'Unknown AI error'}`);
            throw error;
        }
    },
    
    modifyTool: async (toolId: string, updates: Partial<Pick<MentalTool, 'name' | 'description' | 'tags'>>) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool) {
            Object.assign(tool, updates);
            await dbService.put('tools', tool);
            log('SYSTEM', `Tool "${tool.name}" has been modified.`);
            notifyTools();
        }
    },
    
    toggleToolStatus: async (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool && (tool.status === 'Idle' || tool.status === 'Active')) {
            tool.status = tool.status === 'Idle' ? 'Active' : 'Idle';
            await dbService.put('tools', tool);
            log('SYSTEM', `Tool "${tool.name}" status set to ${tool.status}.`);
            notifyTools();
        }
    },
    
    archiveTool: async (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool) {
            if (tool.status === 'Archived') {
                tool.status = 'Idle';
                log('SYSTEM', `Tool "${tool.name}" has been unarchived and is now Idle.`);
            } else if (tool.status === 'Idle') {
                tool.status = 'Archived';
                log('SYSTEM', `Tool "${tool.name}" has been archived.`);
            } else {
                log('WARN', `Cannot archive/unarchive tool "${tool.name}" with status ${tool.status}. Must be Idle or Archived.`);
                return;
            }
            await dbService.put('tools', tool);
            notifyTools();
        }
    },
    
    decommissionTool: async (toolId: string): Promise<boolean> => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool && tool.status === 'Archived') {
            const toolName = tool.name;
            toolsState = toolsState.filter(t => t.id !== toolId);
            await dbService.deleteItem('tools', toolId);
            log('SYSTEM', `Decommissioned mental tool: ${toolName}.`);
            notifyTools();
            return true;
        } else {
             log('WARN', `Cannot decommission "${tool?.name}". It must be archived first.`);
             return false;
        }
    },
    
    optimizeTool: (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool) {
            if (tool.status !== 'Idle') {
                log('WARN', `Cannot optimize "${tool.name}" while it is ${tool.status}. It must be Idle.`);
                return;
            }
            tool.status = 'Optimizing';
            log('AI', `Initiating optimization cycle for ${tool.name}.`);
            notifyTools();
            
            setTimeout(async () => {
                 const freshTool = toolsState.find(t => t.id === toolId);
                 if (freshTool) {
                    freshTool.status = 'Idle';
                    freshTool.version = parseFloat((freshTool.version + 0.1).toFixed(1));
                    freshTool.complexity += Math.floor(Math.random() * 5 + 1);
                    freshTool.description += " Optimized for higher efficiency.";
                    await dbService.put('tools', freshTool);
                    log('AI', `${freshTool.name} optimization complete. Now at v${freshTool.version}.`);
                    notifyTools();
                 }
            }, 2500);
        }
    },

    createToolchain: async (data: Omit<Toolchain, 'id'>) => {
        const newToolchain: Toolchain = { id: `tc-${Date.now()}`, ...data };
        toolchainsState.push(newToolchain);
        await dbService.put('toolchains', newToolchain);
        log('SYSTEM', `New toolchain created: "${newToolchain.name}"`);
        notifyToolchains();
    },

    createToolchainFromPlan: (plan: PlanStep[], name: string, description: string) => {
        const planToolToIdMap: Record<string, string> = {
            'google_search': 'tool-search',
            'code_interpreter': 'tool-code',
        };

        const toolIds = plan
            .map(step => planToolToIdMap[step.tool])
            .filter((id): id is string => !!id);
        
        if (toolIds.length === 0) {
            log('WARN', 'Cannot create a toolchain. The plan has no compatible tools to chain.');
            return;
        }

        service.createToolchain({ name, description, toolIds });
        log('SYSTEM', `New toolchain "${name}" created from an executed plan.`);
    },

    updateToolchain: async (toolchainId: string, updates: Partial<Toolchain>) => {
        const toolchain = toolchainsState.find(tc => tc.id === toolchainId);
        if (toolchain) {
            Object.assign(toolchain, updates);
            await dbService.put('toolchains', toolchain);
            log('SYSTEM', `Toolchain "${toolchain.name}" has been updated.`);
            notifyToolchains();
        }
    },

    deleteToolchain: async (toolchainId: string) => {
        const toolchainName = toolchainsState.find(tc => tc.id === toolchainId)?.name || 'Unknown';
        toolchainsState = toolchainsState.filter(tc => tc.id !== toolchainId);
        await dbService.deleteItem('toolchains', toolchainId);
        log('SYSTEM', `Toolchain "${toolchainName}" has been deleted.`);
        notifyToolchains();
    },
    
    factoryReset: async () => {
        log('SYSTEM', 'FACTORY RESET INITIATED BY USER. CLEARING ALL DATA.');
        localStorage.clear();
        sessionStorage.clear();
        traceDetailsCache.clear();
        expertPreferencesState.clear();
        
        await Promise.all(STORES.map(store => dbService.clearStore(store)));
        
        log('SYSTEM', 'System has been reset to its default state. Reloading...');
        setTimeout(() => { window.location.reload(); }, 500);
    },
    
    getRawSystemContext: () => {
        return {
            systemInstruction: getSystemInstruction(),
            planSchema: JSON.stringify(planSchema, null, 2),
            affectiveStateSchema: JSON.stringify(affectiveStateSchema, null, 2),
        };
    },
    
    saveUserKeywords: async (keywords: string[]): Promise<void> => {
        const keywordObjects: UserKeyword[] = keywords.map(kw => ({
            id: `kw-${Date.now()}-${Math.random()}`,
            keyword: kw,
            timestamp: Date.now()
        }));
        try {
            await Promise.all(keywordObjects.map(kw => dbService.put('userKeywords', kw)));
            log('SYSTEM', `Saved ${keywords.length} user-interest keywords to memory.`);
        } catch (error) {
            log('ERROR', `Failed to save user keywords: ${error instanceof Error ? error.message : 'Unknown DB error'}`);
        }
    },

    generateRandomKeywords: async (): Promise<string[]> => {
        if (!API_KEY) return ["nexus", "ai", "cognition"]; // fallback
        log('AI', 'Generating random keywords for suggestion nucleus...');
        const prompt = `Generate a list of 1 to 6 random, diverse, and thought-provoking keywords. The keywords should span multiple domains: history, science, philosophy, technology (ancient and modern), mythology, art, and esoteric concepts. Return ONLY a JSON array of strings. Example: \`["Quantum Entanglement", "Sumerian Ziggurat", "Alchemy"]\``;
        try {
            const response = await ai.models.generateContent({
                model: appSettings.model,
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
            });
            const keywords = JSON.parse(response.text);
            if (Array.isArray(keywords) && keywords.length > 0) {
                // Fire and forget saving
                service.saveUserKeywords(keywords);
                return keywords;
            }
            return ["nexus", "ai", "cognition"];
        } catch(e) {
            log('WARN', `Could not generate random keywords: ${e instanceof Error ? e.message : 'Unknown AI error'}. Using fallbacks.`);
            return ["nexus", "ai", "cognition"];
        }
    },
    
    getSuggestedQueries: async (suggestionProfile: SuggestionProfile = 'medium', keywords: string = ''): Promise<string[]> => {
        const staticFallbacks = [
            "Summarize our entire conversation, breaking it down into logical sections.",
            "What are the latest developments in AI-driven drug discovery?",
            "Find every time we discussed 'AI tools' in our chat history and list them.",
            "Analyze my messages in this chat to find the average query length using the code sandbox.",
        ];
        
        if (!API_KEY) {
            return staticFallbacks;
        }

        try {
            const languageName = languageMap[appSettings.language] || 'English';
            const profilePrompts = {
                short: `Generate 4 short, simple queries for the NexusAI system. They should be direct and easy to execute.`,
                medium: `Generate 4 creative and insightful high-level queries for the NexusAI system. The queries should test its capabilities like planning, real-time analysis, and synthesis.`,
                long: `Generate 4 complex, multi-step queries for the NexusAI system. They should require deep reasoning, multiple tool uses, and the combination of web search and code execution.`
            };
            
            let prompt = profilePrompts[suggestionProfile];

            if (keywords.trim()) {
                prompt += ` The queries MUST be based on the following keywords/concepts: "${keywords}".`;
            } else {
                 prompt += ` The queries should be on diverse and interesting topics.`;
            }
            
            prompt += ` Respond in ${languageName}. Return ONLY a JSON array of 4 strings.`
            
            log('AI', `Generating dynamic query suggestions. Profile: ${suggestionProfile}, Keywords: "${keywords || 'None'}"`);
            
            const response = await ai.models.generateContent({
                model: appSettings.model, contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
            });

            const suggestions = JSON.parse(response.text);
            return suggestions;
        } catch (error) {
            log('WARN', `Could not fetch AI suggestions: ${error instanceof Error ? error.message : 'Unknown error'}. Using static fallbacks.`);
            return staticFallbacks;
        }
    },

    getSystemAnalysisSuggestions: async ( config: AnalysisConfig, replicas: Replica | null, tools: MentalTool[], logs: LogEntry[] ): Promise<SystemAnalysisResult> => {
        if (!API_KEY) {
            return { summary: "Error: API Key not configured.", suggestions: [] };
        }
        const languageName = languageMap[appSettings.language] || 'English';
        const allReplicas: Replica[] = [];
        if (replicas) { const traverse = (node: Replica) => { allReplicas.push(node); node.children.forEach(traverse); }; traverse(replicas); }
        const replicaSummary = allReplicas.map(r => `ID: ${r.id}, Name: ${r.name}, Status: ${r.status}, Load: ${r.load.toFixed(0)}%, Efficiency: ${r.efficiency.toFixed(0)}%`).join('\n');
        const toolSummary = tools.map(t => `ID: ${t.id}, Name: ${t.name}, Status: ${t.status}, Version: ${t.version}, Usage Count: ${t.usageHistory.length}`).join('\n');
        const logSummary = logs.map(l => `[${l.level}] ${l.message}`).join('\n');
        const prompt = `You are a system administrator AI for NexusAI. Perform a ${config.depth} analysis and generate a JSON report.
        All text in the 'summary', 'description', and 'reason' fields MUST be in ${languageName}.
        The report should contain a 'summary' and an array of up to 4 'suggestions' ('query' or 'action'). For each suggestion, provide 'type', 'description', 'reason', and relevant 'command'/'targetId' or 'queryString'.
        Available actions: 'pruneReplica' (for Dormant replicas), 'recalibrateReplica' (for Active replicas with low efficiency), 'optimizeTool' (for Idle tools).
        Current System State:
        ${config.scope.replicas ? `- Replicas:\n${replicaSummary || "N/A"}` : ''}
        ${config.scope.tools ? `- Tools:\n${toolSummary || "N/A"}` : ''}
        ${config.scope.logs ? `- Recent Logs:\n${logSummary || "N/A"}`: ''}
        Return only the JSON object.`;

        const suggestionSchema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['query', 'action'] }, description: { type: Type.STRING }, reason: { type: Type.STRING }, command: { type: Type.STRING }, targetId: { type: Type.STRING }, queryString: { type: Type.STRING } }, required: ['type', 'description', 'reason'] } } }, required: ['summary', 'suggestions'] };
        try {
            log('AI', `Analyzing system with depth: ${config.depth}...`);
            const response = await ai.models.generateContent({ 
                ...getCognitiveModelConfig({ responseMimeType: "application/json", responseSchema: suggestionSchema }), 
                contents: prompt 
            });
            const result = JSON.parse(response.text);
            log('AI', 'Generated context-aware analysis and suggestions.');
            return result as SystemAnalysisResult;
        } catch(error) {
            const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
            log('WARN', `Could not generate AI insights: ${errorMessage}`);
            return { summary: `An error occurred during AI analysis: ${errorMessage}`, suggestions: [] };
        }
    },

    cancelQuery: () => {
        if (cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done') {
            isCancelled = true;
            currentController?.abort();
            cognitiveProcess.state = 'Cancelled';
            // FIX: Ensure the active tracker is reset on cancellation to prevent state corruption.
            activeTracker = null; 
            const lastMessage = cognitiveProcess.history[cognitiveProcess.history.length - 1];
            if(lastMessage?.role === 'model') {
                lastMessage.state = 'error';
                lastMessage.text = (lastMessage.text || '') + '\n\n-- PROCESS CANCELLED BY USER --';
            }
            log('WARN', 'Cognitive process forcefully cancelled by user.');
            notifyCognitiveProcess();
        }
    },

    startNewChat: (confirm = true) => {
        if (!confirm || cognitiveProcess.history.length === 0 || window.confirm('Are you sure you want to start a new chat? The current conversation context will be lost.')) {
            service.cancelQuery();
            cognitiveProcess.history = [];
            cognitiveProcess.state = 'Idle';
            cognitiveProcess.activeAffectiveState = null;
            traceDetailsCache.clear();
            activeTracker = null;
            log('SYSTEM', 'New chat session started. Affective state and trace cache reset.');
            notifyCognitiveProcess();
        }
    },
    
    // --- PLAN MODIFICATION ---
    expandPlan: (messageId: string) => _regeneratePlan(messageId, 'expand'),
    optimizePlan: (messageId: string) => _regeneratePlan(messageId, 'optimize'),
    revisePlan: (messageId: string) => _regeneratePlan(messageId, 'revise'),
    discardPlan: (messageId: string) => {
        const modelMessage = cognitiveProcess.history.find(m => m.id === messageId);
        if (modelMessage) {
            const userMessage = cognitiveProcess.history.find(m => m.id === modelMessage.userQuery);
            log('AI', `User discarded the plan for query: "${userMessage?.text || 'Unknown'}".`);
            service.cancelQuery();
        }
    },

    updatePlanStep: (messageId: string, stepIndex: number, newStep: PlanStep) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if (message && message.plan && message.plan[stepIndex]) {
            message.plan[stepIndex] = newStep;
            log('SYSTEM', `User updated plan step ${stepIndex + 1}.`);
            notifyCognitiveProcess();
        }
    },
    
    reorderPlan: (messageId: string, fromIndex: number, toIndex: number) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if (message && message.plan) {
            const [movedItem] = message.plan.splice(fromIndex, 1);
            message.plan.splice(toIndex, 0, movedItem);
            message.plan.forEach((step, index) => step.step = index + 1); // Renumber steps
            notifyCognitiveProcess();
        }
    },

    addPlanStep: (messageId: string) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if(message && message.plan) {
            const newStep: PlanStep = { step: message.plan.length + 1, description: "New Step (Click to edit)", tool: 'synthesize_answer', status: 'pending' };
            message.plan.push(newStep);
            notifyCognitiveProcess();
        }
    },

    deletePlanStep: (messageId: string, stepIndex: number) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if (message && message.plan && message.plan.length > 1) { // Prevent deleting the last step
            message.plan.splice(stepIndex, 1);
            message.plan.forEach((step, index) => step.step = index + 1); // Renumber
            notifyCognitiveProcess();
        }
    },

    acknowledgeAlert: (messageId: string, stepIndex: number, action: NavigatorAlert['userAction']) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if (!message || !message.plan || !message.navigatorAlerts) return;
    
        const alertToUpdate = message.navigatorAlerts.find(a => a.stepIndex === stepIndex && a.userAction === 'pending');
        if (alertToUpdate) {
            alertToUpdate.userAction = action;
            log('SYSTEM', `User ${action} navigator alert for step ${stepIndex + 1}.`);
        }
    
        if (action === 'ignored') {
            const step = message.plan[stepIndex];
            if (step) {
                step.cognitiveAlert = undefined;
            }
        }
        
        notifyCognitiveProcess();
    },

    executePlan: async (messageId: string) => {
        const modelMessage = cognitiveProcess.history.find(m => m.id === messageId);
        if (!modelMessage || !modelMessage.plan || modelMessage.isPlanFinalized || !activeTracker) return;
        const activeExpert = modelMessage.activeExpert;

        modelMessage.isPlanFinalized = true;
        cognitiveProcess.state = 'Executing';
        modelMessage.state = 'executing';
        notifyCognitiveProcess();

        const userMessage = cognitiveProcess.history.find(m => m.id === modelMessage.userQuery);
        const query = userMessage?.text || '';
        const userImage = userMessage?.image;

        const navigatorThresholds = {
            balanced: { HIGH_CURVATURE_THRESHOLD: 1.5, LOW_VELOCITY_THRESHOLD: 0.05, STAGNATION_WINDOW: 3 },
            analytical: { HIGH_CURVATURE_THRESHOLD: 0.8, LOW_VELOCITY_THRESHOLD: 0.03, STAGNATION_WINDOW: 4 },
            creative: { HIGH_CURVATURE_THRESHOLD: 2.5, LOW_VELOCITY_THRESHOLD: 0.05, STAGNATION_WINDOW: 3 },
        };
        const activeThresholds = navigatorThresholds[appSettings.cognitiveStyle] || navigatorThresholds.balanced;

        try {
            const executionContext: any[] = [];
            const currentPlan = modelMessage.plan;
            
            for (let stepIndex = 0; stepIndex < currentPlan.length; stepIndex++) {
                if (isCancelled) return;
                const step = currentPlan[stepIndex];

                modelMessage.currentStep = stepIndex;
                step.status = 'executing';
                log('AI', `Executing step ${stepIndex + 1}: ${step.description}`);
                notifyCognitiveProcess();
                await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay / 2));

                const cumulativeContextForStep = `${cognitiveProcess.history.map(m=>m.text).join('\n')}\n${executionContext.join('\n')}`;
                await activeTracker.addStep(`Executing: ${step.tool} - ${step.description}`, cumulativeContextForStep);

                // --- Cognitive Navigator Logic ---
                const currentTrajectorySteps = activeTracker.getSteps();
                let detectedAlert: 'confusion' | 'stagnation' | null = null;
                let latestMetricStep = null;

                if (currentTrajectorySteps.length > 2) {
                    const trajectoryAnalysis = geometryService.analyzeTrajectory(currentTrajectorySteps);
                    latestMetricStep = trajectoryAnalysis.steps[trajectoryAnalysis.steps.length - 1];

                    if (latestMetricStep.curvature > activeThresholds.HIGH_CURVATURE_THRESHOLD) {
                        detectedAlert = 'confusion';
                    }
                    else if (currentTrajectorySteps.length > activeThresholds.STAGNATION_WINDOW) {
                        const recentSteps = trajectoryAnalysis.steps.slice(-activeThresholds.STAGNATION_WINDOW);
                        if (recentSteps.every(s => s.velocity < activeThresholds.LOW_VELOCITY_THRESHOLD)) {
                            detectedAlert = 'stagnation';
                        }
                    }
                }

                if (detectedAlert && !step.cognitiveAlert) {
                    const reason = detectedAlert === 'confusion' ? 'high cognitive curvature (confused reasoning)' : 'cognitive stagnation (stuck in a loop)';
                    log('WARN', `[Cognitive Navigator] Detected ${reason}. Flagging step for user review.`);
                    
                    step.cognitiveAlert = detectedAlert;
                    if (!modelMessage.navigatorAlerts) {
                        modelMessage.navigatorAlerts = [];
                    }
                    modelMessage.navigatorAlerts.push({
                        timestamp: Date.now(),
                        stepIndex: stepIndex,
                        stepDescription: step.description,
                        reason: detectedAlert,
                        metrics: {
                            velocity: latestMetricStep?.velocity || 0,
                            curvature: latestMetricStep?.curvature || 0,
                        },
                        userAction: 'pending',
                    });

                    notifyCognitiveProcess();
                }
                // --- End Cognitive Navigator ---

                try {
                    if (step.tool === 'google_search') {
                        const searchResponse = await ai.models.generateContent({ model: appSettings.model, contents: step.query || query, config: { tools: [{ googleSearch: {} }] } });
                        if (isCancelled) return;
                        step.result = searchResponse.text;
                        step.citations = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                    } else if (step.tool === 'code_interpreter') {
                        const codeToRun = `"use strict"; return (() => { ${step.code} })();`;
                        const result = new Function(codeToRun)();
                        step.result = JSON.stringify(result, null, 2);
                    } else if (step.tool === 'code_sandbox') {
                        const context_data = JSON.stringify(cognitiveProcess.history, null, 2);
                        const codeToRun = `"use strict"; return ((context_data) => { ${step.code} })(context_data);`;
                        const result = new Function('context_data', codeToRun)(context_data);
                        step.result = JSON.stringify(result, null, 2);
                    } else if (step.tool === 'peek_context') {
                        const context_data = JSON.stringify(cognitiveProcess.history, null, 2);
                        const charCount = parseInt(step.query || '500', 10);
                        if (isNaN(charCount) || charCount <= 0) {
                           throw new Error(`Invalid character count provided for 'peek_context'. Must be a positive integer.`);
                        }
                        step.result = `First ${charCount} chars of context_data:\n${context_data.substring(0, charCount)}...`;
                    } else if (step.tool === 'search_context') {
                        const context_data = JSON.stringify(cognitiveProcess.history, null, 2);
                        const searchTerm = step.query || '';
                        if (!searchTerm) {
                            throw new Error("No search term provided for search_context tool.");
                        }
                        const lines = context_data.split('\n');
                        const matches = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
                        const MAX_MATCHES_TO_SHOW = 15;
                        let resultText = `Found ${matches.length} matching line(s) for "${searchTerm}".`;
                        if (matches.length > 0) {
                            resultText += `\nShowing the first ${Math.min(matches.length, MAX_MATCHES_TO_SHOW)}:\n${matches.slice(0, MAX_MATCHES_TO_SHOW).join('\n')}`;
                        }
                        step.result = resultText;
                    } else if (step.tool === 'spawn_cognitive_clone') {
                        const task = step.query || 'No task provided.';
                        const subContext = step.code || 'No context provided.';
                        step.childProcess = { state: 'Idle', history: [], activeAffectiveState: null };
                        log('AI', `Spawning recursive cognitive clone for task: "${task.substring(0, 70)}..."`);
                        notifyCognitiveProcess();
                        const result = await _executeRecursiveCognitiveCycle(step, task, subContext, 1);
                        step.result = result;
                    } else if (step.tool === 'delegate_task_to_replica') {
                        const replicaId = step.replicaId;
                        const taskDescription = step.task || "No task specified";
                        if (!replicaId) {
                            throw new Error(`No replicaId specified for delegation.`);
                        }
                        const replicaResult = findReplica(replicaId, replicaState);
                        if (replicaResult) {
                            const originalStatus = replicaResult.node.status;
                            replicaResult.node.status = 'Executing Task';
                            log('REPLICA', `Orchestrator delegated task "${taskDescription}" to ${replicaResult.node.name}.`);
                            notifyReplicas();
                            
                            await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay * 2)); // Simulate work
                            
                            const freshReplicaResult = findReplica(replicaId, replicaState);
                            if (freshReplicaResult) {
                                freshReplicaResult.node.status = originalStatus; // Return to original status
                                step.result = `Sub-Agent ${freshReplicaResult.node.name} completed task: "${taskDescription}". Awaiting synthesis.`;
                                log('REPLICA', `${freshReplicaResult.node.name} has completed its delegated task.`);
                                await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                                notifyReplicas();
                            } else {
                                 throw new Error(`Delegated replica ${replicaId} was not found after task execution.`);
                            }
                        } else {
                           throw new Error(`Could not find replica with ID "${replicaId}" for task delegation.`);
                        }
                    } else if (step.tool === 'recall_memory') {
                        const memoryQuery = step.query?.toLowerCase() || '';
                        const relevantMemories = archivedTracesState
                            .filter(trace => 
                                trace.userQuery?.toLowerCase().includes(memoryQuery) || 
                                trace.text?.toLowerCase().includes(memoryQuery)
                            )
                            .slice(0, 3); // Take top 3 most recent
                        
                        if (relevantMemories.length > 0) {
                            step.result = relevantMemories.map(m => `Recalled memory: User asked "${m.userQuery}", and I responded "${m.text?.substring(0, 100)}..."`).join('\n');
                            log('AI', `Recalled ${relevantMemories.length} relevant memories for query "${memoryQuery}".`);
                        } else {
                            step.result = `No relevant memories found for query: "${memoryQuery}".`;
                            log('AI', `No memories found for query "${memoryQuery}".`);
                        }
                    } else if (step.tool === 'induce_emotion') {
                        const languageName = languageMap[appSettings.language] || 'English';
                        const prompt = `Translate the concept "${step.concept}" into an Affective State. The 'mood' property MUST be in ${languageName}. Respond ONLY with the JSON object.`;
                        const response = await ai.models.generateContent({
                            model: appSettings.model, contents: prompt,
                            config: { responseMimeType: 'application/json', responseSchema: affectiveStateSchema }
                        });
                        const affectiveState: AffectiveState = JSON.parse(response.text);
                        
                        cognitiveProcess.activeAffectiveState = {...affectiveState, lastUpdated: Date.now() };
                        modelMessage.affectiveStateSnapshot = cognitiveProcess.activeAffectiveState;
                        modelMessage.emotionTags = affectiveState.dominantEmotions;
                        modelMessage.salience = 0.8; 
    
                        step.result = `Cognitive state set to "${step.concept}". Mood: ${affectiveState.mood}`;
                        log('AI', `Induced emotion for "${step.concept}". Internal state and memory tags updated.`);
                    } else if (step.tool === 'generate_image') {
                        if (!step.concept) {
                            throw new Error('Image generation requires a concept prompt.');
                        }
                        const imageResponse = await ai.models.generateImages({
                            model: 'imagen-4.0-generate-001',
                            prompt: step.concept,
                            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
                        });
                        const base64ImageBytes = imageResponse.generatedImages[0]?.image.imageBytes;
                        if (base64ImageBytes) {
                            step.result = { id: `img-${Date.now()}`, concept: step.concept, base64Image: base64ImageBytes } as GeneratedImage;
                        } else {
                            throw new Error('Failed to generate image from API.');
                        }
                    } else if (step.tool === 'analyze_image_input') {
                        const inputStep = step.inputRef ? modelMessage.plan[step.inputRef - 1] : null;
                        const imageResult: GeneratedImage | null = inputStep?.result;
                        const imageToAnalyze = imageResult?.base64Image ? { data: imageResult.base64Image, mimeType: 'image/jpeg' } : userImage;
    
                        if (imageToAnalyze) {
                             const imagePart = {
                                inlineData: { mimeType: imageToAnalyze.mimeType, data: imageToAnalyze.data },
                            };
                            const textPart = { text: step.query || "Describe this image." };
                            
                            const analysisResponse = await ai.models.generateContent({
                                ...getCognitiveModelConfig(),
                                contents: { parts: [imagePart, textPart] }
                            });
                            step.result = analysisResponse.text;
                        } else {
                            throw new Error("No valid image found (neither user-provided nor from a previous step).");
                        }
                    } else if (step.tool === 'forge_tool') {
                        const purpose = step.query || "No purpose specified";
                        const capabilities = step.code ? JSON.parse(step.code).capabilities : [];
                        const newTool = await service.forgeTool({ purpose, capabilities });
                        step.result = `Successfully forged new tool: "${newTool.name}". It is now available.`;
                    } else if (step.tool === 'spawn_replica') {
                        const parentId = step.query || "nexus-core";
                        const purpose = step.code || "AI-defined purpose";
                        const newReplica = await service.spawnReplica(parentId, purpose);
                        if (newReplica) {
                             step.result = `Successfully spawned new replica: "${newReplica.name}" with purpose "${purpose}".`;
                        } else {
                            throw new Error(`Parent replica with ID "${parentId}" not found.`);
                        }
                    } else if (step.tool === 'forge_constitution') {
                        const prompt = `You are a constitutional architect sub-routine. Based on the following goal, create a new Cognitive Constitution. Goal: "${step.query}". Return ONLY a valid JSON object matching the schema. The 'value' for rules must be a JSON string (e.g., '5' for a number, or '[\"induce_emotion\"]' for a string array).`;
                        const constitutionSchema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, rules: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['MAX_REPLICAS', 'MAX_PLAN_STEPS', 'FORBIDDEN_TOOLS', 'REQUIRED_TOOLS'] }, value: { type: Type.STRING, description: "JSON string representing the value." }, description: { type: Type.STRING } }, required: ['type', 'value', 'description'] } } }, required: ['name', 'description', 'rules'] };
                        
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig({ responseMimeType: "application/json", responseSchema: constitutionSchema }), contents: prompt });
                        const constData = JSON.parse(response.text);
                        
                        const newConstitution: CognitiveConstitution = {
                            id: `const-forged-${Date.now()}`,
                            name: constData.name,
                            description: constData.description,
                            rules: constData.rules.map((rule: any) => {
                                try { return { ...rule, value: JSON.parse(rule.value) }; } catch { return { ...rule, value: rule.value }; }
                            }),
                            version: 1,
                            status: 'PENDING_APPROVAL',
                            isDefault: false,
                        };
                        
                        constitutionsState.push(newConstitution);
                        await dbService.put('constitutions', newConstitution);
                        notifyConstitutions();
                        step.result = `Successfully forged new constitution: "${newConstitution.name}". It is now available in Settings.`;
                        log('AI', step.result);
                    } else if (step.tool === 'world_model') {
                        if (!step.query) {
                            throw new Error('The world_model tool requires a query.');
                        }
                        if (!worldModelState) {
                           throw new Error('World model is not initialized.');
                        }
                        const worldModelContext = `Entities: ${JSON.stringify(worldModelState.entities, null, 2)}\nRelationships: ${JSON.stringify(worldModelState.relationships, null, 2)}\nPrinciples: ${JSON.stringify(worldModelState.principles, null, 2)}`;
                        const prompt = `You are a sub-routine that answers questions based *only* on the provided World Model context.\n\nWorld Model Context:\n---\n${worldModelContext}\n---\n\nQuestion: "${step.query}"\n\nBased strictly on the context, provide a concise answer. If the information is not in the context, state that clearly.`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `World Model queried with: "${step.query}". Result obtained.`);
                    } else if (step.tool === 'update_world_model') {
                        if (!step.code) throw new Error("No data provided to update world model.");
                        if (!worldModelState) throw new Error("World model not initialized.");
            
                        const updates = JSON.parse(step.code);
                        const { entities: updatedEntities, relationships: updatedRelationships } = updates;
                        let updateCount = 0;
            
                        if (Array.isArray(updatedEntities)) {
                            updatedEntities.forEach((newEntity: WorldModelEntity) => {
                                const existingIndex = worldModelState.entities.findIndex(e => e.id === newEntity.id || e.name.toLowerCase() === newEntity.name.toLowerCase());
                                const entityToSave = { ...newEntity, lastUpdated: Date.now() };
                                if (existingIndex > -1) {
                                    const existingEntity = worldModelState.entities[existingIndex];
                                    worldModelState.entities[existingIndex] = { ...existingEntity, ...entityToSave, properties: {...existingEntity.properties, ...entityToSave.properties} };
                                } else {
                                    worldModelState.entities.push(entityToSave);
                                }
                                updateCount++;
                            });
                        }
                        
                        if (Array.isArray(updatedRelationships)) {
                            updatedRelationships.forEach((newRel: WorldModelRelationship) => {
                                 const existingIndex = worldModelState.relationships.findIndex(r => r.id === newRel.id);
                                 const relToSave = { ...newRel, lastUpdated: Date.now() };
                                 if (existingIndex > -1) {
                                    worldModelState.relationships[existingIndex] = { ...worldModelState.relationships[existingIndex], ...relToSave };
                                 } else {
                                    worldModelState.relationships.push(relToSave);
                                 }
                                 updateCount++;
                            });
                        }
            
                        worldModelState.lastUpdated = Date.now();
                        await dbService.put('worldModel', worldModelState);
                        notifyWorldModel();
                        step.result = `Successfully updated world model with ${updateCount} item(s).`;
                        log('AI', `World Model updated with new knowledge.`);
                    } else if (step.tool === 'knowledge_graph_synthesizer') {
                        const textToAnalyze = step.query || '';
                        if (!textToAnalyze) {
                            throw new Error('No text provided to the knowledge_graph_synthesizer tool.');
                        }
                        if (!worldModelState) {
                           throw new Error('World Model is not initialized.');
                        }
                        const knowledgeGraphSchema = {
                            type: Type.OBJECT, properties: {
                                entities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING, description: "A unique, descriptive ID in snake_case (e.g., 'artificial_intelligence')." }, name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['CONCEPT', 'PERSON', 'PLACE', 'OBJECT', 'EVENT', 'ORGANIZATION'] }, properties: { type: Type.STRING, description: "A JSON STRING of key-value pairs for relevant attributes. Example: '{\"color\":\"blue\",\"size\":10}'" }, summary: { type: Type.STRING, description: "A concise, one-sentence summary of the entity." } }, required: ['id', 'name', 'type', 'summary'] } },
                                relationships: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING, description: "A unique ID for the relationship (e.g., 'ai_is_a_concept')." }, sourceId: { type: Type.STRING, description: "The ID of the source entity." }, targetId: { type: Type.STRING, description: "The ID of the target entity." }, type: { type: Type.STRING, enum: ['IS_A', 'HAS_A', 'PART_OF', 'CAUSES', 'RELATED_TO', 'LOCATED_IN', 'INTERACTS_WITH'] }, description: { type: Type.STRING, description: "A sentence describing the relationship (e.g., 'Artificial Intelligence is a concept within computer science')." }, strength: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0." } }, required: ['id', 'sourceId', 'targetId', 'type', 'description', 'strength'] } }
                            }, required: ['entities', 'relationships']
                        };
                        const prompt = `You are a knowledge extraction engine. Analyze the following text and extract all relevant entities and their relationships. Create unique IDs for each entity and relationship. Ensure that the 'sourceId' and 'targetId' in relationships correctly reference the IDs of the entities you've extracted.\n\nText to analyze:\n---\n${textToAnalyze}\n---\n\nReturn ONLY the JSON object matching the schema.`;
                        
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig({ responseMimeType: "application/json", responseSchema: knowledgeGraphSchema }), contents: prompt, });
                        const { entities: extractedEntities, relationships: extractedRelationships } = JSON.parse(response.text);

                        let updateCount = 0;
                        if (Array.isArray(extractedEntities)) {
                            extractedEntities.forEach((newEntity: any) => {
                                let parsedProperties = {};
                                if (typeof newEntity.properties === 'string' && newEntity.properties.trim()) {
                                    try { parsedProperties = JSON.parse(newEntity.properties); } catch (e) { log('WARN', `Could not parse properties JSON for entity "${newEntity.name}": ${newEntity.properties}`); }
                                } else if (typeof newEntity.properties === 'object' && newEntity.properties !== null) {
                                    parsedProperties = newEntity.properties;
                                }
                        
                                const entityToProcess: WorldModelEntity = { ...newEntity, properties: parsedProperties };
                        
                                const existingIndex = worldModelState.entities.findIndex(e => e.id === entityToProcess.id || e.name.toLowerCase() === entityToProcess.name.toLowerCase());
                                const entityToSave = { ...entityToProcess, lastUpdated: Date.now() };
                                if (existingIndex > -1) {
                                    const existingEntity = worldModelState.entities[existingIndex];
                                    worldModelState.entities[existingIndex] = { ...existingEntity, ...entityToSave, properties: { ...existingEntity.properties, ...entityToSave.properties } };
                                } else {
                                    worldModelState.entities.push(entityToSave);
                                }
                                updateCount++;
                            });
                        }
                        if (Array.isArray(extractedRelationships)) {
                             extractedRelationships.forEach((newRel: WorldModelRelationship) => {
                                 const existingIndex = worldModelState.relationships.findIndex(r => r.id === newRel.id);
                                 const relToSave = { ...newRel, lastUpdated: Date.now() };
                                 if (existingIndex > -1) {
                                    worldModelState.relationships[existingIndex] = { ...worldModelState.relationships[existingIndex], ...relToSave };
                                 } else {
                                    worldModelState.relationships.push(relToSave);
                                 }
                                 updateCount++;
                            });
                        }
                        worldModelState.lastUpdated = Date.now();
                        await dbService.put('worldModel', worldModelState);
                        notifyWorldModel();

                        step.result = `Successfully synthesized and updated world model with ${updateCount} items.`;
                        log('AI', `Knowledge Graph Synthesizer updated the World Model from text.`);
                    } else if (step.tool === 'causal_inference_engine') {
                        const textToAnalyze = step.query || '';
                        if (!textToAnalyze) {
                            throw new Error('No text/data provided to the causal_inference_engine tool.');
                        }
                        const prompt = `You are a specialized Causal Inference Engine. Analyze the following data or text to distinguish correlation from causation. Identify potential causal links, confounding variables, and provide a structured analysis. Do not simply state correlations.\n\nData to analyze:\n---\n${textToAnalyze}\n---\n\nProvide your analysis in well-formatted markdown.`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Causal Inference Engine analyzed the provided data.`);
                    } else if (step.tool === 'validate_against_world_model') {
                        if (!step.query) {
                            throw new Error('The validate_against_world_model tool requires a query (the claim to validate).');
                        }
                        if (!worldModelState) {
                            throw new Error('World model is not initialized for validation.');
                        }
                        const worldModelContext = `Entities: ${JSON.stringify(worldModelState.entities.slice(0, 20), null, 2)}\nRelationships: ${JSON.stringify(worldModelState.relationships.slice(0, 20), null, 2)}\nPrinciples: ${JSON.stringify(worldModelState.principles, null, 2)}`;
                        const prompt = `You are a fact-checker sub-routine. Your ONLY knowledge source is the provided World Model Context.\n\nWorld Model Context:\n---\n${worldModelContext}\n---\n\nClaim to validate: "${step.query}"\n\nBased strictly on the context, respond with your validation. Your response must be in Markdown format and include one of the following verdicts, followed by a brief explanation:\n- **Verdict: CONFIRMED**\n- **Verdict: CONTRADICTED**\n- **Verdict: UNKNOWN**\n\nFor example:\n**Verdict: CONFIRMED**\nThe World Model contains the entity 'Market Volatility' which is linked to 'Political Events' by a CAUSES relationship.`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Reality Check performed for: "${step.query}".`);
                    } else if (step.tool === 'apply_behavior') {
                        const item = playbookState.find(b => b.description === step.query || b.id === step.query);
                        if (item) {
                            item.helpfulCount += 1;
                            item.lastUsed = Date.now();
                            step.result = `(Simulated) Successfully applied learned strategy: "${item.description}".`;
                            log('AI', `Applying learned strategy: ${item.description}`);
                            await dbService.put('playbookItems', item);
                            notifyPlaybook();
                        } else {
                            throw new Error(`Strategy "${step.query}" not found in the playbook.`);
                        }
                    } else if (step.tool === 'replan') {
                        log('AI', `Executing explicit replan due to step: "${step.description}"`);
                        step.result = `Replanning initiated. Reason: ${step.query || 'Plan determined to be suboptimal.'}`;
                        notifyCognitiveProcess();
                        await new Promise(res => setTimeout(res, 500));
                        await _regeneratePlan(modelMessage.id, 'revise');
                        return; // Exit the execution loop
                    } else if (step.tool === 'summarize_text') {
                        const textToSummarize = step.query || '';
                        if (!textToSummarize) {
                            throw new Error('No text provided to summarize.');
                        }
                        const prompt = `Summarize the following text concisely:\n\n---\n${textToSummarize}\n---`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Summarized text provided in step ${stepIndex + 1}.`);
                    } else if (step.tool === 'translate_text') {
                        const textToTranslate = step.query || '';
                        if (!textToTranslate) {
                            throw new Error('No text provided to translate.');
                        }
                        const prompt = `Perform the following translation task based on the step description. Description: "${step.description}". Text to translate: "${textToTranslate}". Return ONLY the translated text.`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Translated text in step ${stepIndex + 1}.`);
                    } else if (step.tool === 'analyze_sentiment') {
                        const textToAnalyze = step.query || '';
                        if (!textToAnalyze) {
                            throw new Error('No text provided for sentiment analysis.');
                        }
                        const prompt = `Analyze the sentiment of the following text. Respond with one word: 'Positive', 'Negative', or 'Neutral', followed by a brief explanation.\nText: "${textToAnalyze}"`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Analyzed sentiment in step ${stepIndex + 1}.`);
                    } else if (step.tool === 'execute_toolchain') {
                        const toolchain = toolchainsState.find(tc => tc.name === step.query);
                        if (toolchain) {
                            const toolNames = toolchain.toolIds.map(id => toolsState.find(t => t.id === id)?.name || 'Unknown Tool').join(' -> ');
                            step.result = `(Simulated) Executed toolchain "${toolchain.name}". Sequence: ${toolNames}. The conceptual result of this chain is now available in the execution context for synthesis.`;
                            log('AI', `Executed toolchain "${toolchain.name}"`);
                        } else {
                            throw new Error(`Toolchain "${step.query}" not found.`);
                        }
                    } else if (step.tool === 'run_simulation') {
                        const scenario = step.query || 'No scenario provided.';
                        const strategies = step.code || 'No strategies provided.';
                        const prompt = `You are a simulation engine. Based on the following, provide a concise summary of the likely outcome.\nScenario: "${scenario}"\nStrategies/Inputs: "${strategies}"\n\nProvide a summary and a predicted outcome in markdown.`;
                        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
                        step.result = response.text;
                        log('AI', `Ran simulation for scenario: "${scenario.substring(0, 50)}..."`);
                    }
                } catch (e) {
                    step.status = 'error';
                    step.result = e instanceof Error ? e.message : `Unknown error executing tool: ${step.tool}`;
                    log('ERROR', `Tool '${step.tool}' failed at step ${stepIndex + 1}: ${step.result}`);
                }
                
                if (step.status !== 'error') step.status = 'complete';

                let contextResult = step.result;
                if (typeof contextResult === 'object') {
                    if ('id' in contextResult && (contextResult.id as string).startsWith('img-')) {
                        contextResult = `Generated image object for "${(contextResult as GeneratedImage).concept}"`;
                    } else {
                        contextResult = JSON.stringify(contextResult);
                    }
                }
                executionContext.push(`Step ${stepIndex + 1} (${step.description}) Result: ${contextResult}`);
                
                notifyCognitiveProcess();
                await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay));
            }
            
            if (isCancelled) return;
            modelMessage.currentStep = undefined;
            modelMessage.text = ''; 
            cognitiveProcess.state = 'Synthesizing';
            modelMessage.state = 'synthesizing';
            log('AI', 'All steps complete. Synthesizing final answer.');
            notifyCognitiveProcess();

            const historyString = cognitiveProcess.history.slice(0, -1).map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`).join('\n');
            
            let synthesisPrompt = `You have executed a plan. Now synthesize the final answer.
            --- CONVERSATION HISTORY ---
            ${historyString}
            --- EXECUTION CONTEXT ---
            The user's most recent query was: "${query}".
            You gathered the following information:\n${executionContext.join('\n\n')}
            ---
            Based on all of this information, provide a comprehensive, final answer to the user in well-formatted markdown.`;

            if (cognitiveProcess.activeAffectiveState) {
                synthesisPrompt += `\n\nIMPORTANT: Synthesize your answer through the lens of your current cognitive state: ${JSON.stringify(cognitiveProcess.activeAffectiveState)}. This must influence your tone and style, but not the factual accuracy of the information.`
                modelMessage.affectiveStateSnapshot = cognitiveProcess.activeAffectiveState;
            }

            if(activeTracker) await activeTracker.addStep('Synthesis Phase', synthesisPrompt);

            const stream = await ai.models.generateContentStream({
                ...getCognitiveModelConfig({ systemInstruction: getSystemInstruction(activeExpert) }),
                contents: synthesisPrompt,
            });

            for await (const chunk of stream) {
                if (isCancelled) {
                    log('WARN', 'Synthesis cancelled during streaming.');
                    break;
                }
                const chunkText = chunk.text;
                if (typeof chunkText === 'string') {
                    modelMessage.text += chunkText;
                    notifyCognitiveProcess();
                }
            }

            if (isCancelled) return;

            if (!modelMessage.text) {
                log('ERROR', `AI synthesis returned a completely empty response.`);
                modelMessage.text = `[SYSTEM_ERROR: AI returned an empty response.]`;
            }

            modelMessage.state = 'done';
            modelMessage.groundingMetadata = { groundingChunks: modelMessage.plan.flatMap(p => p.citations || []) };
            if(activeTracker) {
                modelMessage.cognitiveTrajectory = activeTracker.finalize();
                activeTracker = null;
            }
            cognitiveProcess.state = 'Done';
            
            log('AI', 'Cognitive task complete. Result synthesized.');
            notifyCognitiveProcess();
            currentController = null;
            
            if (isTtsEnabled && modelMessage.text) {
                service.playTextAsSpeech(modelMessage.text);
            }

        } catch (error) {
            console.error("Error during AI communication:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log('ERROR', `Failed to get a response: ${errorMessage}`);
            modelMessage.text = `An error occurred during the '${cognitiveProcess.state}' stage: ${errorMessage}`;
            modelMessage.state = 'error';
            if(activeTracker) {
                modelMessage.cognitiveTrajectory = activeTracker.finalize();
                activeTracker = null;
            }
            cognitiveProcess.state = 'Error';
            notifyCognitiveProcess();
            currentController = null;
        }
    },

    submitQuery: async (query: string, image?: { mimeType: string, data: string }) => {
        if (!API_KEY) {
            log('ERROR', 'API Key is not configured.');
            return;
        }
        if (cognitiveProcess.state !== 'Idle' && cognitiveProcess.state !== 'Done' && cognitiveProcess.state !== 'Cancelled' && cognitiveProcess.state !== 'Error') {
             log('WARN', `Cannot submit query while system state is ${cognitiveProcess.state}.`);
            return;
        }
        
        isCancelled = false;
        currentController = new AbortController();
        activeTracker = new TrajectoryTracker(`task-${Date.now()}`, query);

        let selectedExpert: ExpertPersona = 'Generalist Expert';
        let usedLearnedPreference = false;

        // --- NEW: Apply Learned Preferences ---
        try {
            const categoryPrompt = `Categorize this user query into ONE of the following: 'LOGIC', 'CREATIVE', 'DATA', 'GENERAL'. Query: "${query}". Respond with only a JSON object: {"category": "CATEGORY"}`;
            const categorySchema = { type: Type.OBJECT, properties: { category: { type: Type.STRING, enum: ['LOGIC', 'CREATIVE', 'DATA', 'GENERAL'] }}, required: ['category'] };
            
            const categoryResponse = await ai.models.generateContent({
                model: appSettings.model,
                contents: categoryPrompt,
                config: { responseMimeType: 'application/json', responseSchema: categorySchema }
            });
            const { category } = JSON.parse(categoryResponse.text) as { category: ProblemCategory };

            if (expertPreferencesState.has(category)) {
                selectedExpert = expertPreferencesState.get(category)!;
                usedLearnedPreference = true;
                log('AI', `[RL] Applying learned preference for '${category}' problems. Selecting expert: ${selectedExpert}`);
            }
        } catch (e) {
            log('WARN', `[RL] Could not categorize query for preference check. Defaulting to Cognitive Router. Error: ${e instanceof Error ? e.message : 'Unknown AI error'}`);
        }
        // --- END: Apply Learned Preferences ---
        
        // --- Cognitive Router (now with a fallback) ---
        if (!usedLearnedPreference) {
            const expertSelectionPrompt = `Given the user query, select the best expert persona to handle it. Choose one of: 'Logic Expert', 'Creative Expert', 'Data Analysis Expert', 'Generalist Expert'. User Query: "${query}" Respond with a single JSON object: {"expert": "EXPERT_NAME"}`;
            const expertSchema = { type: Type.OBJECT, properties: { expert: { type: Type.STRING, enum: ['Logic Expert', 'Creative Expert', 'Data Analysis Expert', 'Generalist Expert'] } }, required: ['expert'] };
            
            try {
                const expertResponse = await ai.models.generateContent({
                    model: appSettings.model,
                    contents: expertSelectionPrompt,
                    config: { responseMimeType: "application/json", responseSchema: expertSchema }
                });
                selectedExpert = (JSON.parse(expertResponse.text) as { expert: ExpertPersona }).expert;
                log('AI', `[Cognitive Router] Selected expert: ${selectedExpert} for the query.`);
            } catch (e) {
                log('WARN', `[Cognitive Router] Could not select expert. Defaulting to Generalist. Error: ${e instanceof Error ? e.message : 'Unknown AI error'}`);
                selectedExpert = 'Generalist Expert';
            }
        }
        // --- END: Cognitive Router ---

        cognitiveProcess.state = 'Planning';
        notifyCognitiveProcess();

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: query, image };
        cognitiveProcess.history.push(userMessage);

        const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: '', state: 'planning', userQuery: userMessage.id, activeExpert: selectedExpert, navigatorAlerts: [] };
        cognitiveProcess.history.push(modelMessage);

        let strategicGuidance = '';
        if (appSettings.cognitiveStyle !== 'analytical') {
            try {
// FIX: Corrected internal call from `service.findSimilarProcesses` to just `findSimilarProcesses` to avoid circular dependency before the service object is fully constructed.
                const similarProcesses = await findSimilarProcesses(userMessage.id, 0.85, 3);
                const trajectories = similarProcesses.map(p => p.cognitiveTrajectory).filter((t): t is CognitiveTrajectory => !!t);
                if (trajectories.length > 0) {
                    strategicGuidance = _generateStrategicGuidance(trajectories);
                }
            } catch (e) {
                log('WARN', `[Cognitive Navigator] Failed to find similar processes for strategic guidance: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        }

        const planningPrompt = `${strategicGuidance}\n\nUser query: "${query}"`.trim();

        try {
            const params: GenerateContentParameters = {
                ...getCognitiveModelConfig({ systemInstruction: getSystemInstruction(selectedExpert), responseMimeType: 'application/json', responseSchema: planSchema }),
                contents: planningPrompt,
            };
            
            const response = await ai.models.generateContent(params);

            if (isCancelled) return;

            const planData = JSON.parse(response.text);
            modelMessage.plan = planData.plan.map((p: any) => ({ ...p, status: 'pending' }));

            if (modelMessage.plan.length === 0) {
                log('WARN', "AI generated an empty plan. Attempting to synthesize a direct answer.");
                modelMessage.state = 'awaiting_execution';
                cognitiveProcess.state = 'AwaitingExecution';
            } else {
                modelMessage.state = 'awaiting_execution';
                modelMessage.constitutionId = replicaState.activeConstitutionId; // Capture constitution at time of planning
                cognitiveProcess.state = 'AwaitingExecution';
            }
            log('AI', `Generated a ${modelMessage.plan?.length || 0}-step plan. Awaiting user approval or automatic execution.`);
            notifyCognitiveProcess();

        } catch (error) {
            console.error("Error during AI communication:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log('ERROR', `Failed to get a response: ${errorMessage}`);
            modelMessage.text = `An error occurred during planning: ${errorMessage}`;
            modelMessage.state = 'error';
            cognitiveProcess.state = 'Error';
            notifyCognitiveProcess();
            currentController = null;
        }
    },
    runEvaluation: async () => {
        if (evaluationState.isEvaluating) return;
        evaluationState.isEvaluating = true;
        notifyEvaluation();
        log('SYSTEM', 'Starting system-wide cognitive evaluation...');
    
        // Simulate a multi-step evaluation process
        await new Promise(res => setTimeout(res, 1500));
        log('AI', 'Evaluating inference accuracy on benchmark dataset...');
        await new Promise(res => setTimeout(res, 2000));
        log('AI', 'Assessing planning quality and self-correction rates from recent traces...');
        await new Promise(res => setTimeout(res, 2000));
        log('AI', 'Calculating tool innovation score based on forged tools and playbook growth...');
    
        // --- Calculate Tool Innovation Score ---
        const allUsedTools = new Set<string>();
        let forgeToolCount = 0;
        archivedTracesState.forEach(trace => {
            trace.plan?.forEach(step => {
                allUsedTools.add(step.tool);
                if (step.tool === 'forge_tool' && step.status === 'complete') {
                    forgeToolCount++;
                }
            });
        });
    
        const uniqueToolsUsed = allUsedTools.size;
        const totalAvailableTools = toolsState.length;
        const diversityScore = totalAvailableTools > 0 ? (uniqueToolsUsed / totalAvailableTools) * 70 : 0;
        const forgingScore = forgeToolCount * 10;
        const toolInnovationScore = Math.min(100, diversityScore + forgingScore);
        // --- End Calculation ---
    
        const metrics: EvaluationMetrics = {
            inferenceAccuracy: 92.5 + Math.random() * 5,
            flowEfficiency: 5.2 + Math.random() * 2,
            selfCorrectionRate: 15.0 + Math.random() * 10,
            planningQuality: 88.0 + Math.random() * 10,
            toolInnovationScore: toolInnovationScore,
            confidenceScore: 85.0 + Math.random() * 15,
        };
    
        evaluationState = {
            ...evaluationState,
            isEvaluating: false,
            lastRun: Date.now(),
            metrics: metrics,
        };
        log('SYSTEM', 'Cognitive evaluation complete. Metrics updated.');
        notifyEvaluation();
    },

    // FIX: Implemented the `runCuriosityEvaluation` method to support the curiosity evaluation feature.
    runCuriosityEvaluation: async () => {
        if (evaluationState.isEvaluatingCuriosity) return;
        evaluationState.isEvaluatingCuriosity = true;
        notifyEvaluation();
        log('SYSTEM', 'Starting curiosity evaluation...');

        // Simulate a multi-step evaluation process
        await new Promise(res => setTimeout(res, 2000));
        log('AI', 'Analyzing information-seeking patterns from logs...');
        await new Promise(res => setTimeout(res, 2000));
        log('AI', 'Assessing novelty preference from memory exploration and dreaming cycles...');
        
        const metrics: CuriosityMetrics = {
            infoSeeking: 75 + Math.random() * 20,
            thrillSeeking: 30 + Math.random() * 15,
            socialCuriosity: 5 + Math.floor(Math.random() * 10),
            compositeScore: 65 + Math.random() * 25,
        };
        
        evaluationState = {
            ...evaluationState,
            isEvaluatingCuriosity: false,
            curiosityMetrics: metrics,
        };
        log('SYSTEM', 'Curiosity evaluation complete. Metrics updated.');
        notifyEvaluation();
    },
    
    initializeEvolution: (problem: string, newConfig: EvolutionConfig) => {
        evolutionState = {
            ...evolutionState,
            problemStatement: problem,
            config: newConfig,
            statusMessage: "Initializing population...",
            population: [],
            progress: [],
            finalEnsembleResult: null,
        };
        notifyEvolution();
        // Simulate population initialization
        setTimeout(() => {
            const newPopulation: IndividualPlan[] = Array.from({ length: newConfig.populationSize }).map((_, i) => ({
                id: `ind-${Date.now()}-${i}`,
                plan: [{ step: 1, description: `Initial thought for problem: ${problem.substring(0, 50)}...`, tool: 'synthesize_answer', status: 'pending' }],
                fitness: Math.random() * 30,
                generation: 0,
                status: 'new'
            }));
            evolutionState.population = newPopulation;
            evolutionState.statusMessage = `${newPopulation.length} individuals initialized. Ready to start.`;
            notifyEvolution();
        }, 2000);
    },
    startEvolution: () => {
        if (evolutionState.isRunning || evolutionState.population.length === 0) return;
        evolutionState.isRunning = true;
        log('AI', `[Evolution] Starting evolutionary process for "${evolutionState.problemStatement.substring(0, 50)}..."`);
        
        let generation = 1;
        evolutionInterval = setInterval(() => {
            if (!evolutionState.isRunning || generation > evolutionState.config.generations) {
                service.stopEvolution();
                return;
            }

            // Simulate a generation
            let totalFitness = 0;
            evolutionState.population.forEach(p => {
                p.fitness += (Math.random() - 0.45) * 10; // Fitness drift
                p.fitness = Math.max(0, Math.min(100, p.fitness));
                p.generation = generation;
                totalFitness += p.fitness;
            });
            
            evolutionState.population.sort((a, b) => b.fitness - a.fitness);
            const eliteCount = Math.floor(evolutionState.config.elitism * evolutionState.population.length);
            evolutionState.population.forEach((p, i) => {
                p.status = i < eliteCount ? 'elite' : 'survived';
            });

            const bestFitness = evolutionState.population[0].fitness;
            const averageFitness = totalFitness / evolutionState.population.length;

            evolutionState.progress.push({ generation, bestFitness, averageFitness });
            evolutionState.statusMessage = `Generation ${generation}/${evolutionState.config.generations} | Best Fitness: ${bestFitness.toFixed(2)}`;
            notifyEvolution();
            generation++;
        }, 2000);
    },
    stopEvolution: () => {
        if (!evolutionState.isRunning) return;
        evolutionState.isRunning = false;
        if (evolutionInterval) {
            clearInterval(evolutionInterval);
            evolutionInterval = null;
        }
        evolutionState.statusMessage = `Evolution paused at generation ${evolutionState.progress.length}.`;
        log('AI', '[Evolution] Process stopped.');
        notifyEvolution();
    },
    ensembleAndFinalize: async () => {
        log('AI', '[Evolution] Finalizing... Ensembling top plans.');
        const topIndividuals = [...evolutionState.population].sort((a,b)=>b.fitness-a.fitness).slice(0, 5);
        const context = topIndividuals.map((ind, i) => `--- Option ${i+1} (Fitness: ${ind.fitness.toFixed(2)}) ---\n${planToText(ind.plan)}`).join('\n\n');
        
        const prompt = `You are a meta-cognition AI. You have run an evolutionary algorithm to find the best plan for the following problem: "${evolutionState.problemStatement}".
        
        Here are the top 5 evolved plans:
        ${context}
        
        Your task is to synthesize these plans into a single, superior final answer. Combine the best ideas, smooth out the logic, and provide a comprehensive response to the original problem.`;

        try {
            const response = await ai.models.generateContent({
                ...getCognitiveModelConfig(),
                contents: prompt,
            });
            const finalTrace: ChatMessage = {
                id: `evo-final-${Date.now()}`,
                role: 'model',
                text: response.text,
                state: 'done',
                userQuery: evolutionState.problemStatement,
                evolutionProblemStatement: evolutionState.problemStatement,
            };
            evolutionState.finalEnsembleResult = finalTrace;
            log('AI', '[Evolution] Ensemble complete. Final answer synthesized.');
        } catch (error) {
            log('ERROR', `[Evolution] Ensemble failed: ${error instanceof Error ? error.message : 'Unknown AI error'}`);
        } finally {
            notifyEvolution();
        }
    },
    getArchivedTraceDetails: (traceId: string) => {
        if (!traceDetailsCache.has(traceId)) {
            traceDetailsCache.set(traceId, {});
        }
        return traceDetailsCache.get(traceId)!;
    },
    generateReflectionResponse: async (trace: ChatMessage): Promise<string> => {
        const prompt = `You are a meta-cognitive reflection AI. Analyze the following completed cognitive trace and provide a brief reflection on its effectiveness.
        - Was the plan logical?
        - Were the tools used appropriately?
        - Was the final answer satisfactory?
        - What could have been done differently?

        Trace:
        User Query: "${trace.userQuery}"
        Final Plan: ${planToText(trace.plan || [])}
        Final Answer: "${trace.text}"`;

        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: prompt });
        return response.text;
    },
    generateDiscussionResponse: async (trace: ChatMessage, newQuery: string): Promise<{ role: 'user' | 'model', text: string }[]> => {
        let details = service.getArchivedTraceDetails(trace.id);
        const history = details.discussion || [];
        const context = `
            You are a sub-routine AI specialized in analyzing and discussing a *past* cognitive trace.
            The user is asking you questions about this specific trace.
            
            --- Original Trace Context ---
            User Query: "${trace.userQuery}"
            Final Answer: "${trace.text}"
            --- End Trace Context ---

            --- Current Discussion History ---
            ${history.map(m => `${m.role}: ${m.text}`).join('\n')}
            --- End Discussion History ---

            New User Question: "${newQuery}"

            Based on ALL the context above, provide your response.
        `;
        const response = await ai.models.generateContent({ ...getCognitiveModelConfig(), contents: context });
        const newModelMessage = { role: 'model' as const, text: response.text };
        const newHistory = [...history, { role: 'user' as const, text: newQuery }, newModelMessage];
        traceDetailsCache.set(trace.id, { ...details, discussion: newHistory });
        return newHistory;
    },
    generateVideo: async (params: { prompt: string; config: { aspectRatio: '16:9' | '9:16'; resolution: '720p' | '1080p'; } }) => {
        // ... implementation
    },
    runSimulation: async (config: SimulationConfig, isWargaming: boolean) => {
        // ... implementation
    },
    generateSimulationStrategies: async (scenario: string, criteria: string): Promise<{ name: string; description: string; }[] | null> => {
        // ... implementation
        return null;
    },
    // FIX: Added all missing subscription and service methods to the exported service object.
    subscribeToLogs: (cb: (log: LogEntry) => void) => {
        logSubscribers.push(cb);
        return { unsubscribe: () => { logSubscribers = logSubscribers.filter(s => s !== cb); } };
    },
    subscribeToPerformance: (cb: (dataPoint: PerformanceDataPoint) => void) => {
        performanceSubscribers.push(cb);
        return { unsubscribe: () => { performanceSubscribers = performanceSubscribers.filter(s => s !== cb); } };
    },
    subscribeToReplicas: (cb: (replicaState: Replica) => void) => {
        replicaSubscribers.push(cb);
        return { unsubscribe: () => { replicaSubscribers = replicaSubscribers.filter(s => s !== cb); } };
    },
    subscribeToCognitiveProcess: (cb: (process: CognitiveProcess) => void) => {
        cognitiveProcessSubscribers.push(cb);
        return { unsubscribe: () => { cognitiveProcessSubscribers = cognitiveProcessSubscribers.filter(s => s !== cb); } };
    },
    subscribeToTools: (cb: (tools: MentalTool[]) => void) => {
        toolsSubscribers.push(cb);
        return { unsubscribe: () => { toolsSubscribers = toolsSubscribers.filter(s => s !== cb); } };
    },
    subscribeToToolchains: (cb: (toolchains: Toolchain[]) => void) => {
        toolchainSubscribers.push(cb);
        return { unsubscribe: () => { toolchainSubscribers = toolchainSubscribers.filter(s => s !== cb); } };
    },
    subscribeToPlaybook: (cb: (playbook: PlaybookItem[]) => void) => {
        playbookSubscribers.push(cb);
        return { unsubscribe: () => { playbookSubscribers = playbookSubscribers.filter(s => s !== cb); } };
    },
    subscribeToConstitutions: (cb: (constitutions: CognitiveConstitution[]) => void) => {
        constitutionSubscribers.push(cb);
        return { unsubscribe: () => { constitutionSubscribers = constitutionSubscribers.filter(s => s !== cb); } };
    },
    subscribeToEvolution: (cb: (evolutionState: EvolutionState) => void) => {
        evolutionSubscribers.push(cb);
        return { unsubscribe: () => { evolutionSubscribers = evolutionSubscribers.filter(s => s !== cb); } };
    },
    subscribeToSimulation: (cb: (state: SimulationState) => void) => {
        simulationSubscribers.push(cb);
        return { unsubscribe: () => { simulationSubscribers = simulationSubscribers.filter(s => s !== cb); } };
    },
    subscribeToEvaluation: (cb: (state: EvaluationState) => void) => {
        evaluationSubscribers.push(cb);
        return { unsubscribe: () => { evaluationSubscribers = evaluationSubscribers.filter(s => s !== cb); } };
    },
    subscribeToArchives: (cb: (archives: ChatMessage[]) => void) => {
        archiveSubscribers.push(cb);
        return { unsubscribe: () => { archiveSubscribers = archiveSubscribers.filter(s => s !== cb); } };
    },
    subscribeToDreamProcess: (cb: (update: DreamProcessUpdate) => void) => {
        dreamProcessSubscribers.push(cb);
    },
    unsubscribeFromDreamProcess: (cb: (update: DreamProcessUpdate) => void) => {
        dreamProcessSubscribers = dreamProcessSubscribers.filter(s => s !== cb);
    },
    subscribeToWorldModel: (cb: (worldModel: WorldModel) => void) => {
        worldModelSubscribers.push(cb);
        return { unsubscribe: () => { worldModelSubscribers = worldModelSubscribers.filter(s => s !== cb); } };
    },
    subscribeToCognitiveNetwork: (cb: (state: CognitiveNetworkState) => void) => {
        cognitiveNetworkSubscribers.push(cb);
        return { unsubscribe: () => { cognitiveNetworkSubscribers = cognitiveNetworkSubscribers.filter(s => s !== cb); } };
    },
    subscribeToLiveTranscription: (cb: (state: LiveTranscriptionState) => void) => {
        liveTranscriptionSubscribers.push(cb);
        return { unsubscribe: () => { liveTranscriptionSubscribers = liveTranscriptionSubscribers.filter(s => s !== cb); } };
    },
    subscribeToVideoGeneration: (cb: (state: VideoGenerationState) => void) => {
        videoGenerationSubscribers.push(cb);
        return { unsubscribe: () => { videoGenerationSubscribers = videoGenerationSubscribers.filter(s => s !== cb); } };
    },
    subscribeToAutonomousState: (cb: (state: AutonomousState) => void) => {
        autonomousStateSubscribers.push(cb);
        return { unsubscribe: () => { autonomousStateSubscribers = autonomousStateSubscribers.filter(s => s !== cb); } };
    },
    subscribeToUICommands: (cb: (command: UICommand) => void) => {
        uiCommandSubscribers.push(cb);
        return { unsubscribe: () => { uiCommandSubscribers = uiCommandSubscribers.filter(s => s !== cb); } };
    },
    unsubscribeFromAll: () => {
        logSubscribers = [];
        performanceSubscribers = [];
        replicaSubscribers = [];
        cognitiveProcessSubscribers = [];
        toolsSubscribers = [];
        toolchainSubscribers = [];
        playbookSubscribers = [];
        constitutionSubscribers = [];
        evolutionSubscribers = [];
        simulationSubscribers = [];
        evaluationSubscribers = [];
        archiveSubscribers = [];
        dreamProcessSubscribers = [];
        worldModelSubscribers = [];
        cognitiveNetworkSubscribers = [];
        liveTranscriptionSubscribers = [];
        videoGenerationSubscribers = [];
        autonomousStateSubscribers = [];
        uiCommandSubscribers = [];
    },
    toggleAutonomousMode: () => {
        autonomousState.isActive = !autonomousState.isActive;
        if (autonomousState.isActive) {
            log('AUTONOMOUS', 'Autonomous mode ACTIVATED.');
            autonomousState.goal = "Monitor and improve system performance.";
            autonomousState.action = "Initializing...";
            autonomousAgentService.init(service); // Ensure it has the latest service object
            autonomousAgentService.runMetaCognitiveCycle(); // Run immediately
            autonomousInterval = setInterval(autonomousAgentService.runMetaCognitiveCycle, 30000); // Run every 30 seconds
        } else {
            log('AUTONOMOUS', 'Autonomous mode DEACTIVATED.');
            if (autonomousInterval) {
                clearInterval(autonomousInterval);
                autonomousInterval = null;
            }
            autonomousState.goal = '';
            autonomousState.action = '';
        }
        notifyAutonomousState();
    },
    archiveTrace: async (messageId: string): Promise<ChatMessage | null> => {
        const traceIndex = cognitiveProcess.history.findIndex(m => m.id === messageId);
        if (traceIndex > -1) {
            const userQueryId = cognitiveProcess.history[traceIndex].userQuery;
            const userMessage = cognitiveProcess.history.find(m => m.id === userQueryId);
            const [traceToArchive] = cognitiveProcess.history.splice(traceIndex, 1);
            if (userMessage) {
                const userMessageIndex = cognitiveProcess.history.findIndex(m => m.id === userQueryId);
                if (userMessageIndex > -1) {
                    cognitiveProcess.history.splice(userMessageIndex, 1);
                }
            }

            if (traceToArchive) {
                traceToArchive.archivedAt = Date.now();
                if (userMessage) {
                    traceToArchive.userQuery = userMessage.text; 
                }

                const details = traceDetailsCache.get(traceToArchive.id);
                if (details) {
                    traceToArchive.traceDetails = details;
                    traceDetailsCache.delete(traceToArchive.id);
                }
                
                await dbService.put('archivedTraces', traceToArchive);
                archivedTracesState.push(traceToArchive);

                log('SYSTEM', `Cognitive trace ${traceToArchive.id} archived successfully.`);
                notifyArchives();
                notifyCognitiveProcess();
                return traceToArchive;
            }
        }
        log('WARN', `Could not find trace with ID ${messageId} to archive.`);
        return null;
    },
    triggerACECycle: async (trace: ChatMessage) => {
        log('AI', 'Triggering Autonomous Cognitive Enhancement (ACE) cycle...');
        const prompt = `Analyze the following user-AI interaction trace. Extract a single, reusable insight as a strategy, code snippet, pitfall, or API usage example.
        Interaction Trace:
        User Query: "${trace.userQuery}"
        AI Plan:
        ${planToText(trace.plan || [])}
        AI Final Answer:
        ${trace.text}
        
        Return ONLY a JSON object based on the schema.`;

        try {
            const response = await ai.models.generateContent({
                ...getCognitiveModelConfig({ responseMimeType: "application/json", responseSchema: insightExtractionSchema }),
                contents: prompt,
            });

            const rawInsight = JSON.parse(response.text) as RawInsight;
            const newPlaybookItem: PlaybookItem = {
                id: `pb-${Date.now()}`,
                category: rawInsight.category,
                content: rawInsight.suggestion,
                description: rawInsight.description,
                extractedFromTraceId: trace.id,
                helpfulCount: 1,
                harmfulCount: 0,
                lastUsed: Date.now(),
                lastValidated: Date.now(),
                version: 1,
                tags: rawInsight.tags,
            };
            playbookState.push(newPlaybookItem);
            await dbService.put('playbookItems', newPlaybookItem);
            log('AI', `[ACE] New playbook item created: "${newPlaybookItem.description}"`);
            notifyPlaybook();
        } catch (error) {
            log('ERROR', `[ACE] Cycle failed: ${error instanceof Error ? error.message : 'Unknown AI error'}`);
        }
    },
    rerunTrace: (trace: ChatMessage) => {
        if (trace.userQuery) {
            log('SYSTEM', `Rerunning trace for query: "${trace.userQuery}"`);
            service.submitQuery(trace.userQuery, trace.image);
        }
    },
    archiveEvolvedAnswer: async (trace: ChatMessage) => {
        trace.archivedAt = Date.now();
        await dbService.put('archivedTraces', trace);
        archivedTracesState.push(trace);
        log('SYSTEM', `Evolved answer archived successfully.`);
        notifyArchives();
    },
    learnFromEvolvedAnswer: async (trace: ChatMessage) => {
        log('AI', `Learning from evolved answer...`);
        await service.triggerACECycle(trace);
    },
    rerunEvolutionProblem: (problem: string) => {
        log('SYSTEM', `Rerunning evolution for problem: "${problem}"`);
        service.initializeEvolution(problem, evolutionState.config);
        setTimeout(() => service.startEvolution(), 1000);
    },
    updateWorldModelEntity: async (entity: WorldModelEntity) => {
        if (!worldModelState) return;
        const index = worldModelState.entities.findIndex(e => e.id === entity.id);
        if (index > -1) {
            worldModelState.entities[index] = { ...entity, lastUpdated: Date.now() };
            worldModelState.lastUpdated = Date.now();
            await dbService.put('worldModel', worldModelState);
            log('SYSTEM', `World Model entity "${entity.name}" updated by user.`);
            notifyWorldModel();
        }
    },
    updateWorldModelFromText: async (text: string) => {
        log('AI', 'Updating World Model from text...');
        if (!text) {
            log('WARN', 'Cannot update world model from empty text.');
            return;
        }
        if (!worldModelState) {
            log('ERROR', 'World Model not initialized, cannot update.');
            return;
        }

        try {
            const knowledgeGraphSchema = {
                type: Type.OBJECT, properties: {
                    entities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING, description: "A unique, descriptive ID in snake_case (e.g., 'artificial_intelligence')." }, name: { type: Type.STRING }, type: { type: Type.STRING, enum: ['CONCEPT', 'PERSON', 'PLACE', 'OBJECT', 'EVENT', 'ORGANIZATION'] }, properties: { type: Type.STRING, description: "A JSON STRING of key-value pairs for relevant attributes. Example: '{\"color\":\"blue\",\"size\":10}'" }, summary: { type: Type.STRING, description: "A concise, one-sentence summary of the entity." } }, required: ['id', 'name', 'type', 'summary'] } },
                    relationships: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING, description: "A unique ID for the relationship (e.g., 'ai_is_a_concept')." }, sourceId: { type: Type.STRING, description: "The ID of the source entity." }, targetId: { type: Type.STRING, description: "The ID of the target entity." }, type: { type: Type.STRING, enum: ['IS_A', 'HAS_A', 'PART_OF', 'CAUSES', 'RELATED_TO', 'LOCATED_IN', 'INTERACTS_WITH'] }, description: { type: Type.STRING, description: "A sentence describing the relationship (e.g., 'Artificial Intelligence is a concept within computer science')." }, strength: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0." } }, required: ['id', 'sourceId', 'targetId', 'type', 'description', 'strength'] } }
                }, required: ['entities', 'relationships']
            };
            const prompt = `You are a knowledge extraction engine. Analyze the following text and extract all relevant entities and their relationships. Create unique IDs for each entity and relationship. Ensure that the 'sourceId' and 'targetId' in relationships correctly reference the IDs of the entities you've extracted.\n\nText to analyze:\n---\n${text}\n---\n\nReturn ONLY the JSON object matching the schema.`;
            
            const response = await ai.models.generateContent({ ...getCognitiveModelConfig({ responseMimeType: "application/json", responseSchema: knowledgeGraphSchema }), contents: prompt });
            const { entities: extractedEntities, relationships: extractedRelationships } = JSON.parse(response.text);

            let updateCount = 0;
            if (Array.isArray(extractedEntities)) {
                extractedEntities.forEach((newEntity: any) => {
                    let parsedProperties = {};
                    if (typeof newEntity.properties === 'string' && newEntity.properties.trim()) {
                        try { parsedProperties = JSON.parse(newEntity.properties); } catch (e) { log('WARN', `Could not parse properties JSON for entity "${newEntity.name}": ${newEntity.properties}`); }
                    } else if (typeof newEntity.properties === 'object' && newEntity.properties !== null) {
                        parsedProperties = newEntity.properties;
                    }
            
                    const entityToProcess: WorldModelEntity = { ...newEntity, properties: parsedProperties };
            
                    const existingIndex = worldModelState!.entities.findIndex(e => e.id === entityToProcess.id || e.name.toLowerCase() === entityToProcess.name.toLowerCase());
                    const entityToSave = { ...entityToProcess, lastUpdated: Date.now() };
                    if (existingIndex > -1) {
                        const existingEntity = worldModelState!.entities[existingIndex];
                        worldModelState!.entities[existingIndex] = { ...existingEntity, ...entityToSave, properties: { ...existingEntity.properties, ...entityToSave.properties } };
                    } else {
                        worldModelState!.entities.push(entityToSave);
                    }
                    updateCount++;
                });
            }
            if (Array.isArray(extractedRelationships)) {
                 extractedRelationships.forEach((newRel: WorldModelRelationship) => {
                     const existingIndex = worldModelState!.relationships.findIndex(r => r.id === newRel.id);
                     const relToSave = { ...newRel, lastUpdated: Date.now() };
                     if (existingIndex > -1) {
                        worldModelState!.relationships[existingIndex] = { ...worldModelState!.relationships[existingIndex], ...relToSave };
                     } else {
                        worldModelState!.relationships.push(relToSave);
                     }
                     updateCount++;
                });
            }
            worldModelState.lastUpdated = Date.now();
            await dbService.put('worldModel', worldModelState);
            notifyWorldModel();

            log('AI', `Successfully synthesized and updated world model with ${updateCount} items from text.`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown AI error during knowledge synthesis.";
            log('ERROR', `Failed to update World Model from text: ${errorMessage}`);
            throw error; // Re-throw to be caught by the UI handler if necessary
        }
    },
    approveConstitution: async (constitutionId: string) => {
        const constitution = constitutionsState.find(c => c.id === constitutionId);
        if (constitution && constitution.status === 'PENDING_APPROVAL') {
            constitution.status = 'ACTIVE';
            await dbService.put('constitutions', constitution);
            log('SYSTEM', `Constitution "${constitution.name}" approved and is now active.`);
            notifyConstitutions();
        }
    },
   rejectConstitution: async (constitutionId: string) => {
        const constitution = constitutionsState.find(c => c.id === constitutionId);
        if (constitution && constitution.status === 'PENDING_APPROVAL') {
            constitutionsState = constitutionsState.filter(c => c.id !== constitutionId);
            await dbService.deleteItem('constitutions', constitutionId);
            log('SYSTEM', `Pending constitution "${constitution.name}" was rejected and deleted.`);
            notifyConstitutions();
        }
    },
    archiveConstitution: async (constitutionId: string) => {
        const constitution = constitutionsState.find(c => c.id === constitutionId);
        if (constitution && constitution.status === 'ACTIVE' && !constitution.isDefault) {
            constitution.status = 'ARCHIVED';
            await dbService.put('constitutions', constitution);
            log('SYSTEM', `Constitution "${constitution.name}" has been archived.`);
            notifyConstitutions();
        }
    },
    updatePlaybookItem: async (itemId: string, updates: Partial<Pick<PlaybookItem, 'description' | 'tags'>>) => {
        const item = playbookState.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
            await dbService.put('playbookItems', item);
            log('SYSTEM', `Playbook item "${item.description}" updated.`);
            notifyPlaybook();
        }
    },
    deletePlaybookItem: async (itemId: string) => {
        const itemName = playbookState.find(i => i.id === itemId)?.description || 'Unknown';
        playbookState = playbookState.filter(i => i.id !== itemId);
        await dbService.deleteItem('playbookItems', itemId);
        log('SYSTEM', `Playbook item "${itemName}" deleted.`);
        notifyPlaybook();
    },
    deleteTrace: async (traceId: string) => {
        archivedTracesState = archivedTracesState.filter(t => t.id !== traceId);
        await dbService.deleteItem('archivedTraces', traceId);
        log('SYSTEM', `Archived trace ${traceId} deleted.`);
        notifyArchives();
    },
    findSimilarProcesses,
    semanticSearchInMemory: async (query: string): Promise<ChatMessage[]> => {
        if (!query.trim()) return [];
        const queryEmbedding = await getEmbedding(query);
        const candidates = await Promise.all(
            archivedTracesState.map(async t => {
                if (!t.embedding) {
                    const textToEmbed = t.userQuery || t.text || '';
                    if (textToEmbed) {
                        t.embedding = await getEmbedding(textToEmbed);
                    }
                }
                return t;
            })
        );
        return candidates
            .map(t => ({
                ...t,
                similarity: t.embedding ? cosineSimilarity(queryEmbedding, t.embedding) : 0,
            }))
            .filter(t => t.similarity > 0.7) // Hardcoded threshold for semantic search
            .sort((a, b) => b.similarity - a.similarity);
    },
    setAutonomousState: (action: string, goal: string) => {
        if (goal) autonomousState.goal = goal;
        if (action) autonomousState.action = action;
        notifyAutonomousState();
    },
    getSnapshot: () => ({
        replicaState,
        toolsState,
        playbookState,
        archivedTracesState,
        cognitiveProcess,
        appSettings
    }),
    getLastAutonomousAction: () => lastAutonomousAction,
    setLastAutonomousAction: (name: string, args: any) => {
        lastAutonomousAction = { name, args, timestamp: Date.now() };
    },
    navigateTo: (view: ActiveView) => {
        log('AUTONOMOUS', `AI is navigating to the ${view} view.`);
        notifyUICommand({ type: 'navigateTo', payload: view });
    },
};

// FIX: Exported the `service` object as `nexusAIService` to make it accessible to other modules.
export const nexusAIService = service;