export interface Interaction {
  targetId: string;
  type: 'data_flow'; // Future: 'collaboration' | 'conflict'
  intensity: number; // 0 to 1
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
  activeConstitutionId: string;
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

export interface Behavior {
  id: string;
  name: string;
  description: string; // AI-generated summary of the strategy
  extractedFromTraceId: string; // The trace it originated from
  strategy: string; // The core logic/strategy extracted by the AI
  usageCount: number;
  lastUsed: number;
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
}

export interface PerformanceDataPoint {
  time: string;
  cpu: number;
  memory: number;
  rsiCycles: number;
}

export interface LogEntry {
  id:string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM' | 'REPLICA' | 'AI' | 'NETWORK';
  message: string;
  source?: string; // Optional Replica ID
}

export type ActiveView = 'dashboard' | 'replicas' | 'tools' | 'architecture' | 'analysis' | 'settings' | 'evolution' | 'memory' | 'dreaming';

export type LogVerbosity = 'STANDARD' | 'VERBOSE';
export type SystemPersonality = 'BALANCED' | 'CREATIVE' | 'LOGICAL';
export type AnimationLevel = 'FULL' | 'MINIMAL' | 'NONE';
export type SuggestionProfile = 'short' | 'medium' | 'long';
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh';

export interface AppSettings {
  model: string;
  cognitiveStepDelay: number; // in milliseconds
  systemPersonality: SystemPersonality;
  logVerbosity: LogVerbosity;
  animationLevel: AnimationLevel;
  language: Language;
}

// Types for Autonomous Cognitive Processing
export type ThinkingState = 'Idle' | 'Receiving' | 'Planning' | 'AwaitingExecution' | 'Executing' | 'Synthesizing' | 'Done' | 'Cancelled' | 'Error';

export interface PlanStep {
    step: number;
    description: string;
    tool: 'google_search' | 'synthesize_answer' | 'code_interpreter' | 'recall_memory' | 'generate_image' | 'analyze_image_input' | 'forge_tool' | 'spawn_replica' | 'induce_emotion' | 'replan' | 'summarize_text' | 'translate_text' | 'analyze_sentiment' | 'execute_toolchain' | 'apply_behavior' | 'delegate_task_to_replica';
    query?: string;
    code?: string;
    concept?: string; // For induce_emotion & generate_image
    inputRef?: number; // References the step number for input, e.g., for analyze_image_input
    status: 'pending' | 'executing' | 'complete' | 'error';
    result?: any; // Can be complex objects like images or text
    citations?: any[];
    replicaId?: string; // For delegate_task_to_replica
    task?: string; // For delegate_task_to_replica
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
}

export interface CognitiveProcess {
  state: ThinkingState;
  history: ChatMessage[];
  activeAffectiveState?: AffectiveState | null; // REPLACES activeQualiaVector
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
    problemId: string; // ID of the problem being bid on
    proposedPlan: PlanStep[]; // The plan the replica thinks will solve the problem
    confidenceScore: number; // 0-1, how confident the replica is
}

export interface CognitiveProblem {
    id: string;
    description: string;
    broadcastById: string; // Who is asking
    winningBid?: CognitiveBid;
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