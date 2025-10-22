export interface Interaction {
  targetId: string;
  type: 'data_flow'; // Future: 'collaboration' | 'conflict'
  intensity: number; // 0 to 1
}

// --- Personality Types ---
export type EnergyFocus = 'INTROVERSION' | 'EXTROVERSION';
export type InformationProcessing = 'SENSING' | 'INTUITION';
export type DecisionMaking = 'THINKING' | 'FEELING';
export type WorldApproach = 'JUDGING' | 'PERCEIVING';

export interface Personality {
    energyFocus: EnergyFocus;
    informationProcessing: InformationProcessing;
    decisionMaking: DecisionMaking;
    worldApproach: WorldApproach;
}


export interface Replica {
  id: string;
  name: string;
  depth: number;
  status: 'Active' | 'Dormant' | 'Evolving' | 'Spawning' | 'Pruning' | 'Recalibrating' | 'Bidding' | 'Executing Task';
  children: Replica[];
  load: number;
  purpose: string;
  efficiency: number;
  memoryUsage: number;
  cpuUsage: number;
  interactions: Interaction[];
  personality: Personality;
  activeConstitutionId: string;
  internalTick: number;
  tempo: number;
  biddingForProblemId?: string;
}

export interface MentalTool {
  id: string;
  name:string;
  description: string;
  capabilities: string[];
  tags: string[];
  status: 'Idle' | 'Active' | 'Optimizing' | 'Archived';
  version: number;
  complexity: number;
  usageHistory: {
    timestamp: number;
    task: string;
  }[];
}

// --- ACE Playbook Types ---
export type PlaybookItemCategory = 'STRATEGY' | 'CODE_SNIPPET' | 'PITFALL' | 'API_USAGE';

export interface PlaybookItem {
  id: string;
  category: PlaybookItemCategory;
  content: string; // The core strategy, snippet, or pitfall description
  description: string; // A short, AI-generated summary
  extractedFromTraceId: string;
  
  // ACE-specific metadata
  helpfulCount: number;
  harmfulCount: number;
  lastUsed: number;
  lastValidated: number; // Timestamp of the last time it was confirmed helpful/harmful
  
  // For semantic search and refinement
  embedding?: number[]; 
  version: number;
  tags: string[];
}

export interface Toolchain {
  id: string;
  name: string;
  description: string;
  toolIds: string[]; // Ordered list of MentalTool IDs
}

// --- Cognitive Constitution Types ---
export type RuleType = 'MAX_REPLICAS' | 'MAX_PLAN_STEPS' | 'FORBIDDEN_TOOLS' | 'REQUIRED_TOOLS';

export interface ConstitutionRule {
    type: RuleType;
    value: any; // Can be number, string[], etc.
    description: string;
}

export interface CognitiveConstitution {
    id:string;
    name: string;
    description: string;
    rules: ConstitutionRule[];
    version: number;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'ARCHIVED';
    isDefault: boolean;
    parentId?: string;
}

export interface PerformanceDataPoint {
  time: string;
  cpu: number;
  memory: number;
  rsiCycles: number;
  networkLatency: number;

  renderTime: number;
  memoryBreakdown: {
    replicas: number;
    tools: number;
    system: number;
  };
}

export interface LogEntry {
  id:string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM' | 'REPLICA' | 'AI' | 'NETWORK';
  message: string;
  source?: string; // Optional Replica ID
}

export type ActiveView = 'dashboard' | 'replicas' | 'tools' | 'architecture' | 'analysis' | 'settings' | 'evolution' | 'memory' | 'dreaming' | 'world_model' | 'modalities_lab' | 'simulation_lab';

export type LogVerbosity = 'STANDARD' | 'VERBOSE';
export type AnimationLevel = 'FULL' | 'MINIMAL' | 'NONE';
export type SuggestionProfile = 'short' | 'medium' | 'long';
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh';
export type ModelProfile = 'lite' | 'flash' | 'pro';
export type CognitiveStyle = 'balanced' | 'analytical' | 'creative';

export interface AppSettings {
  model: string;
  modelProfile: ModelProfile;
  enableThinkingMode?: boolean;
  cognitiveStepDelay: number; // in milliseconds
  coreAgentPersonality: Personality;
  logVerbosity: LogVerbosity;
  animationLevel: AnimationLevel;
  language: Language;
  cognitiveStyle: CognitiveStyle;
}

// Types for Autonomous Cognitive Processing
export type ThinkingState = 'Idle' | 'Receiving' | 'Planning' | 'AwaitingExecution' | 'Executing' | 'Synthesizing' | 'Done' | 'Cancelled' | 'Error';

export interface PlanStep {
    step: number;
    description: string;
    tool: 'google_search' | 'synthesize_answer' | 'code_interpreter' | 'code_sandbox' | 'recall_memory' | 'generate_image' | 'analyze_image_input' | 'forge_tool' | 'spawn_replica' | 'induce_emotion' | 'replan' | 'summarize_text' | 'translate_text' | 'analyze_sentiment' | 'execute_toolchain' | 'apply_behavior' | 'delegate_task_to_replica' | 'spawn_cognitive_clone' | 'peek_context' | 'search_context' | 'world_model' | 'update_world_model' | 'knowledge_graph_synthesizer' | 'causal_inference_engine' | 'run_simulation' | 'forge_constitution';
    query?: string;
    code?: string;
    concept?: string; // For induce_emotion & generate_image
    inputRef?: number; // References the step number for input, e.g., for analyze_image_input
    status: 'pending' | 'executing' | 'complete' | 'error';
    result?: any; // Can be complex objects like images or text
    citations?: any[];
    replicaId?: string; // For delegate_task_to_replica
    task?: string; // For delegate_task_to_replica
    personalityOverride?: Partial<Personality>;
    childProcess?: CognitiveProcess; // For recursive delegation state management
}

// --- Affective Core Types ---
export type PrimaryEmotion = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';

export interface EmotionInstance {
    type: PrimaryEmotion;
    intensity: number; // 0 (none) to 1 (max)
}

export interface AffectiveState {
    dominantEmotions: EmotionInstance[];
    mood: string; // A descriptive label like 'Optimistic', 'Anxious', 'Curious'
    lastUpdated: number;
}

export interface TraceDetails {
    reflection?: string;
    discussion?: { role: 'user' | 'model', text: string }[];
}

// --- Cognitive Geometry Types ---
export interface CognitiveMetricStep {
  step: number;
  thought: string;
  position: number[]; // embedding
  velocity: number; // norm
  curvature: number;
}

export interface CognitiveTrajectorySummary {
  avgVelocity: number;
  avgCurvature: number;
  maxCurvature: number;
  totalDistance: number;
  pathLength: number;
}

export interface CognitiveTrajectory {
  steps: CognitiveMetricStep[];
  summary: CognitiveTrajectorySummary;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: { mimeType: string; data: string; };
    state?: 'planning' | 'awaiting_execution' | 'executing' | 'synthesizing' | 'done' | 'error';
    plan?: PlanStep[];
    currentStep?: number;
    groundingMetadata?: any; // For final answer citations
    isPlanFinalized?: boolean;
    constitutionId?: string; // Track which constitution was active for this plan
    userQuery?: string; // On model messages, store the user query that prompted it
    archivedAt?: number; // Timestamp for when it was archived
    
    // Emotional Memory
    affectiveStateSnapshot?: AffectiveState;
    emotionTags?: EmotionInstance[]; // Key emotions tagged to this memory
    salience?: number; // How prominent the memory is, 0-1
    
    // Persisted Metadata
    traceDetails?: TraceDetails;
    
    // For evolved answers
    evolutionProblemStatement?: string;

    // For semantic search
    embedding?: number[];
    similarity?: number;
    trajectorySimilarity?: number;

    // For Cognitive Geometry
    cognitiveTrajectory?: CognitiveTrajectory;
}

export interface CognitiveProcess {
  state: ThinkingState;
  history: ChatMessage[];
  activeAffectiveState?: AffectiveState | null; // REPLACES activeQualiaVector
}

export interface LiveTranscriptionState {
  isLive: boolean;
  isVideoActive: boolean;
  userTranscript: string;
  modelTranscript: string;
  history: { role: 'user' | 'model', text: string }[];
}


export interface SystemSuggestion {
  type: 'query' | 'action';
  description: string;
  reason: string;
  command?: string;
  targetId?: string;
  queryString?: string;
}

export interface AnalysisConfig {
    scope: {
        replicas: boolean;
        tools: boolean;
        logs: boolean;
    };
    depth: 'Quick' | 'Standard' | 'Deep';
}

export interface SystemAnalysisResult {
    summary: string;
    suggestions: SystemSuggestion[];
}

// Type for a generated image result
export interface GeneratedImage {
    id: string;
    concept: string;
    base64Image: string;
}


// Types for The Evolution Chamber
export type FitnessGoal = 'EFFICIENCY' | 'CREATIVITY' | 'ROBUSTNESS' | 'CONCISENESS';

export interface EvolutionConfig {
    populationSize: number;
    mutationRate: number; // 0 to 1
    generations: number;
    fitnessGoal: FitnessGoal;
    elitism: number; // 0 to 1, percentage of top individuals to keep
}

export interface IndividualPlan {
    id: string;
    plan: PlanStep[];
    fitness: number; // 0 to 100
    generation: number;
    parents?: string[];
    status: 'elite' | 'survived' | 'new' | 'culled';
}

export interface EvolutionProgress {
    generation: number;
    bestFitness: number;
    averageFitness: number;
}

export interface EvolutionState {
    isRunning: boolean;
    config: EvolutionConfig;
    progress: EvolutionProgress[];
    population: IndividualPlan[];
    problemStatement: string;
    statusMessage: string; // e.g., "Initializing Population...", "Generation 5/100"
    finalEnsembleResult: ChatMessage | null;
}


// Types for Proactive Insights & Curiosity
export interface CuriosityConstitution extends CognitiveConstitution {
    // This is a marker interface for now, but could have unique properties later
    // e.g., preferred_goals: FitnessGoal[]
}

export interface ProactiveInsight {
    id: string;
    timestamp: number;
    title: string;
    summary: string; // AI-generated summary of why this is interesting
    relevanceScore: number; // 0 to 1, how confident the AI is about this insight
    originatingGoal: FitnessGoal;
    actionableToolchain: Toolchain; // The evolved toolchain that produced the insight
}

export interface ProactiveExplorationState {
    isActive: boolean; // Is the background "dreaming" process running?
    lastCycleTimestamp: number;
    generatedInsights: ProactiveInsight[];
}

// --- Cognitive Packet for inter-replica communication ---
export interface CognitiveBid {
    bidderId: string; // Replica ID making the bid
    bidderName: string;
    problemId: string; // ID of the problem being bid on
    proposedPlan: PlanStep[]; // The plan the replica thinks will solve the problem
    confidenceScore: number; // 0-1, how confident the replica is
}

export interface CognitiveProblem {
    id: string;
    description: string;
    broadcastById: string; // Who is asking
    broadcastByName: string;
    winningBid?: CognitiveBid;
    bids: CognitiveBid[];
    isOpen: boolean;
}

export interface CognitiveNetworkState {
    activeProblems: CognitiveProblem[];
}

// --- Dreaming Types ---
export interface SystemDirective {
    id: string;
    text: string;
    createdAt: number;
}

export interface DreamProcessUpdate {
    stage: 'IDLE' | 'GATHERING' | 'ANALYZING' | 'SYNTHESIZING' | 'INTEGRATING' | 'DONE' | 'ERROR';
    message: string;
    newDirectives?: SystemDirective[];
}

export interface UserKeyword {
  id: string;
  keyword: string;
  timestamp: number;
}

// --- ACE Service Types ---
export interface RawInsight {
  analysis: string;
  category: PlaybookItemCategory;
  suggestion: string;
  description: string;
  tags: string[];
}

export type DeltaAction = 'ADD' | 'UPDATE' | 'NO_CHANGE';

export interface DeltaUpdate {
  action: DeltaAction;
  payload?: any;
}

// --- World Model Types ---
export type WorldModelEntityType = 'CONCEPT' | 'PERSON' | 'PLACE' | 'OBJECT' | 'EVENT' | 'ORGANIZATION';
export type WorldModelRelationshipType = 'IS_A' | 'HAS_A' | 'PART_OF' | 'CAUSES' | 'RELATED_TO' | 'LOCATED_IN' | 'INTERACTS_WITH';

export interface WorldModelEntity {
  id: string;
  name: string;
  type: WorldModelEntityType;
  properties: Record<string, any>;
  summary: string; // AI-generated summary
  lastUpdated: number;
}

export interface WorldModelRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: WorldModelRelationshipType;
  description: string;
  strength: number; // 0 to 1
  lastUpdated: number;
}

export interface WorldModelPrinciple {
  id: string;
  statement: string; // e.g., "Market volatility increases with unexpected political events."
  confidence: number; // 0 to 1
  sourceTraceId?: string; // ID of the ChatMessage it was derived from
}

export interface WorldModel {
  id: string;
  entities: WorldModelEntity[];
  relationships: WorldModelRelationship[];
  principles: WorldModelPrinciple[];
  lastUpdated: number;
}

export interface VideoGenerationState {
  isGenerating: boolean;
  statusMessage: string;
  videoUrl: string | null;
  error: string | null;
}

// --- Simulation Lab Types ---
export interface SimulationConfig {
    name: string;
    scenario: string;
    strategies: { name: string; description: string; assignedReplicaId?: string; }[];
    maxSteps: number;
    evaluationCriteria: string;
}

export interface SimulationStep {
    step: number;
    strategy: string; // Can be a composite of strategies in wargaming
    action: string;
    outcome: string;
    state: Record<string, any> | string;
}

export interface SimulationResult {
    summary: string;
    winningStrategy: string;
    stepByStepTrace: SimulationStep[];
    analysis: string | null;
}

export interface SimulationState {
    isRunning: boolean;
    isAnalyzing: boolean;
    statusMessage: string;
    config: SimulationConfig | null;
    result: SimulationResult | null;
    error: string | null;
}


// FIX: To resolve type collision errors, defined the AIStudio interface locally and used it to augment the global Window object, ensuring a consistent type signature.
// FIX: Moved AIStudio interface into declare global to resolve declaration conflicts across modules.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  
  interface Window {
// FIX: Made 'aistudio' optional to resolve modifier conflicts with other global Window augmentations.
    aistudio?: AIStudio;
  }
}
