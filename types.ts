

export interface Interaction {
  targetId: string;
  type: 'data_flow'; // Future: 'collaboration' | 'conflict'
  intensity: number; // 0 to 1
}

export interface Replica {
  id: string;
  name: string;
  depth: number;
  status: 'Active' | 'Dormant' | 'Evolving' | 'Spawning' | 'Pruning' | 'Recalibrating';
  children: Replica[];
  load: number;
  purpose: string;
  efficiency: number;
  memoryUsage: number;
  cpuUsage: number;
  interactions: Interaction[];
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

export interface Toolchain {
  id: string;
  name: string;
  description: string;
  toolIds: string[]; // Ordered list of MentalTool IDs
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
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM' | 'REPLICA' | 'AI';
  message: string;
}

export type ActiveView = 'dashboard' | 'replicas' | 'tools' | 'architecture' | 'analysis' | 'settings';

export type LogVerbosity = 'STANDARD' | 'VERBOSE';
export type SystemPersonality = 'BALANCED' | 'CREATIVE' | 'LOGICAL';
export type AnimationLevel = 'FULL' | 'MINIMAL' | 'NONE';
export type SuggestionProfile = 'short' | 'medium' | 'long';

export interface AppSettings {
  model: string;
  cognitiveStepDelay: number; // in milliseconds
  systemPersonality: SystemPersonality;
  logVerbosity: LogVerbosity;
  animationLevel: AnimationLevel;
}

// Types for Autonomous Cognitive Processing
export type ThinkingState = 'Idle' | 'Receiving' | 'Planning' | 'AwaitingExecution' | 'Executing' | 'Synthesizing' | 'Done' | 'Cancelled' | 'Error';

export interface PlanStep {
    step: number;
    description: string;
    tool: 'google_search' | 'synthesize_answer' | 'code_interpreter' | 'evoke_qualia';
    query?: string;
    code?: string;
    concept?: string; // For evoke_qualia tool
    status: 'pending' | 'executing' | 'complete' | 'error';
    result?: string;
    citations?: any[];
}

export interface QualiaVector {
    valence: number;      // pleasure <-> pain (-1 to 1)
    arousal: number;      // calmness <-> excitement (0 to 1)
    dominance: number;    // submissiveness <-> control (0 to 1)
    novelty: number;      // familiar <-> strange (0 to 1)
    complexity: number;   // simple <-> intricate (0 to 1)
    temporality: number;  // past-focused <-> future-focused (-1 to 1)
}


export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    state?: 'planning' | 'awaiting_execution' | 'executing' | 'done' | 'error';
    plan?: PlanStep[];
    currentStep?: number;
    groundingMetadata?: any; // For final answer citations
    isPlanFinalized?: boolean;
    qualiaVector?: QualiaVector; // Snapshot of the active qualia vector when this message was synthesized
}

export interface CognitiveProcess {
  state: ThinkingState;
  history: ChatMessage[];
  activeQualiaVector?: QualiaVector | null; // The currently active "mood"
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