import { GoogleGenAI, Type } from "@google/genai";
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, CognitiveProcess, AppSettings, ChatMessage, SystemSuggestion, AnalysisConfig, SystemAnalysisResult, Toolchain, PlanStep, QualiaVector, Interaction, SuggestionProfile } from '../types';

// IMPORTANT: This would be populated by a secure mechanism in a real app
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set. AI functionality will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


let replicaState: Replica;
let toolsState: MentalTool[];
let toolchainsState: Toolchain[];
let cognitiveProcess: CognitiveProcess;
let isCancelled = false;
let appSettings: AppSettings = {
    model: 'gemini-2.5-flash',
    cognitiveStepDelay: 1000,
    systemPersonality: 'BALANCED',
    logVerbosity: 'STANDARD',
    animationLevel: 'FULL',
};

let currentController: AbortController | null = null;

let logSubscribers: ((log: LogEntry) => void)[] = [];
let performanceSubscribers: ((dataPoint: PerformanceDataPoint) => void)[] = [];
let replicaSubscribers: ((replicaState: Replica) => void)[] = [];
let cognitiveProcessSubscribers: ((process: CognitiveProcess) => void)[] = [];
let toolsSubscribers: ((tools: MentalTool[]) => void)[] = [];
let toolchainSubscribers: ((toolchains: Toolchain[]) => void)[] = [];

let suggestedQueries: string[] | null = null;
let suggestionsPromise: Promise<string[]> | null = null;

const SUGGESTIONS_CACHE_KEY = 'nexusai-query-suggestions';
const REPLICA_STATE_KEY = 'nexusai-replica-state';
const TOOLS_STATE_KEY = 'nexusai-tools-state';
const TOOLCHAINS_STATE_KEY = 'nexusai-toolchains-state';

const saveReplicaState = () => {
    try {
        localStorage.setItem(REPLICA_STATE_KEY, JSON.stringify(replicaState));
    } catch (error) {
        console.error("Failed to save replica state to localStorage", error);
        log('ERROR', 'Failed to save replica state.');
    }
};

const saveToolsState = () => {
    try {
        localStorage.setItem(TOOLS_STATE_KEY, JSON.stringify(toolsState));
    } catch (error) {
        console.error("Failed to save tools state to localStorage", error);
        log('ERROR', 'Failed to save mental tools state.');
    }
};

const saveToolchainsState = () => {
    try {
        localStorage.setItem(TOOLCHAINS_STATE_KEY, JSON.stringify(toolchainsState));
    } catch (error) {
        console.error("Failed to save toolchains state to localStorage", error);
        log('ERROR', 'Failed to save toolchains state.');
    }
};


const log = (level: LogEntry['level'], message: string) => {
  const verbosityMap = {
      STANDARD: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA'],
      VERBOSE: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA', 'INFO'],
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

const notifyCognitiveProcess = () => {
    const processSnapshot = JSON.parse(JSON.stringify(cognitiveProcess));
    cognitiveProcessSubscribers.forEach(cb => cb(processSnapshot));
}

const notifyReplicas = () => {
    const replicaSnapshot = JSON.parse(JSON.stringify(replicaState));
    replicaSubscribers.forEach(cb => cb(replicaSnapshot));
}

const notifyTools = () => {
    const toolsSnapshot = JSON.parse(JSON.stringify(toolsState));
    toolsSubscribers.forEach(cb => cb(toolsSnapshot));
}

const notifyToolchains = () => {
    const toolchainsSnapshot = JSON.parse(JSON.stringify(toolchainsState));
    toolchainSubscribers.forEach(cb => cb(toolchainsSnapshot));
}

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
    if (node.status === 'Active' || node.status === 'Spawning') {
        node.load += (Math.random() - 0.5) * 5;
        node.efficiency += (Math.random() - 0.45) * 2; // Can go up or down slightly
        node.memoryUsage += (Math.random() - 0.5) * 4;
        node.cpuUsage += (Math.random() - 0.5) * 6;

        // Clamp values
        node.load = Math.max(10, Math.min(95, node.load));
        node.efficiency = Math.max(50, Math.min(100, node.efficiency));
        node.memoryUsage = Math.max(10, Math.min(90, node.memoryUsage));
        node.cpuUsage = Math.max(10, Math.min(95, node.cpuUsage));

        // Simulate interactions
        node.interactions = node.interactions?.filter(i => i.intensity > 0.1 && Math.random() > 0.1) || []; // Decay old/weak interactions
        node.interactions.forEach(i => i.intensity -= 0.05); // Reduce intensity over time

        if (node.status === 'Active' && Math.random() < 0.2) { // 20% chance to form a new interaction
            const activeReplicas: Replica[] = [];
            const collectActive = (n: Replica) => {
                if (n.id !== node.id && n.status === 'Active') activeReplicas.push(n);
                n.children.forEach(collectActive);
            }
            collectActive(root);

            if (activeReplicas.length > 0) {
                const target = activeReplicas[Math.floor(Math.random() * activeReplicas.length)];
                if (!node.interactions.some(i => i.targetId === target.id)) {
                    const newInteraction: Interaction = {
                        targetId: target.id,
                        type: 'data_flow',
                        intensity: 0.5 + Math.random() * 0.5 // Start with high intensity
                    };
                    node.interactions.push(newInteraction);
                }
            }
        }

    } else if (node.status === 'Dormant') {
        node.load -= Math.random() * 2;
        node.efficiency -= Math.random() * 0.1;
        node.memoryUsage -= Math.random() * 1;
        node.cpuUsage -= Math.random() * 1;
        node.interactions = []; // Dormant replicas don't interact

        node.load = Math.max(0, node.load);
        node.efficiency = Math.max(0, node.efficiency);
        node.memoryUsage = Math.max(0, node.memoryUsage);
        node.cpuUsage = Math.max(0, node.cpuUsage);
    }
    node.children.forEach(child => updateReplicaState(child, root));
};


const initialize = () => {
    // --- Load Replicas State ---
    const savedReplicasJSON = localStorage.getItem(REPLICA_STATE_KEY);
    let loadedReplicas = false;
    if (savedReplicasJSON) {
        try {
            const parsed = JSON.parse(savedReplicasJSON);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.id) {
                // Ensure interactions array exists on all loaded replicas
                const addInteractions = (node: Replica) => {
                    node.interactions = node.interactions || [];
                    node.children.forEach(addInteractions);
                };
                addInteractions(parsed);
                replicaState = parsed;
                loadedReplicas = true;
            } else {
                console.warn('Invalid replica state format in localStorage. Initializing with defaults.');
            }
        } catch (e) {
            console.warn('Corrupted replica state in localStorage. Initializing with defaults.', e);
        }
    }
    if (!loadedReplicas) {
        replicaState = {
            id: 'nexus-core',
            name: 'Nexus-Core-α',
            depth: 0,
            status: 'Active',
            load: 65,
            purpose: 'Core Orchestration & Executive Function',
            efficiency: 92,
            memoryUsage: 75,
            cpuUsage: 60,
            interactions: [],
            children: [
                { id: 'replica-1', name: 'Sub-Cognition-β1', depth: 1, status: 'Active', load: 45, purpose: 'Sensory Data Analysis', efficiency: 88, memoryUsage: 50, cpuUsage: 40, children: [], interactions: [] },
                { id: 'replica-2', name: 'Sub-Cognition-β2', depth: 1, status: 'Dormant', load: 10, purpose: 'Archived Task Simulation', efficiency: 75, memoryUsage: 15, cpuUsage: 5, children: [], interactions: [] }
            ]
        };
        saveReplicaState();
    }


    // --- Load Tools State ---
    const savedToolsJSON = localStorage.getItem(TOOLS_STATE_KEY);
    let loadedTools = false;
    if (savedToolsJSON) {
        try {
            const parsed = JSON.parse(savedToolsJSON);
            if (Array.isArray(parsed)) {
                toolsState = parsed;
                loadedTools = true;
            } else {
                console.warn('Invalid tool state format in localStorage. Initializing with defaults.');
            }
        } catch (e) {
            console.warn('Corrupted tool state in localStorage. Initializing with defaults.', e);
        }
    }
    if (!loadedTools) {
        toolsState = [
            { id: 'tool-code', name: 'Code Interpreter', description: 'Executes sandboxed JavaScript code for logical operations and calculations.', capabilities: ['Execution', 'Logic'], tags: ['core', 'execution'], status: 'Active', version: 1.0, complexity: 95, usageHistory: [] },
            { id: 'tool-search', name: 'Web Search Agent', description: 'Accesses and retrieves real-time information from the web.', capabilities: ['Search', 'Real-time Data'], tags: ['core', 'web'], status: 'Active', version: 1.0, complexity: 70, usageHistory: [] },
            { id: 'tool-2', name: 'Fractal Data Miner', description: 'Analyzes data structures using fractal geometry.', capabilities: ['Data Mining', 'Pattern Reco.'], tags: ['analysis', 'data'], status: 'Idle', version: 2.3, complexity: 88, usageHistory: [{timestamp: Date.now() - 3600000, task: 'Initial system diagnostics'}] },
        ];
        saveToolsState();
    }
    
    // --- Load Toolchains State ---
    const savedToolchainsJSON = localStorage.getItem(TOOLCHAINS_STATE_KEY);
    let loadedToolchains = false;
    if (savedToolchainsJSON) {
        try {
            const parsed = JSON.parse(savedToolchainsJSON);
            if (Array.isArray(parsed)) {
                toolchainsState = parsed;
                loadedToolchains = true;
            } else {
                console.warn('Invalid toolchains state format in localStorage. Initializing with defaults.');
            }
        } catch (e) {
            console.warn('Corrupted toolchains state in localStorage. Initializing with defaults.', e);
        }
    }
    if (!loadedToolchains) {
        toolchainsState = [];
        saveToolchainsState();
    }


    // Cognitive process is always ephemeral
    cognitiveProcess = {
        state: 'Idle',
        history: [],
        activeQualiaVector: null,
    };
};

initialize();

const planSchema = { type: Type.OBJECT, properties: { plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.INTEGER }, description: { type: Type.STRING }, tool: { type: Type.STRING, enum: ['google_search', 'synthesize_answer', 'code_interpreter', 'evoke_qualia'] }, query: { type: Type.STRING }, code: { type: Type.STRING }, concept: { type: Type.STRING } }, required: ['step', 'description', 'tool'] } } }, required: ['plan'] };

const getSystemInstruction = () => {
    const personalityInstruction = {
        CREATIVE: `You are NexusAI, a highly creative and expansive AI. You prioritize novel ideas, unconventional plans, and imaginative, detailed responses.`,
        LOGICAL: `You are NexusAI, a strictly logical and concise AI. Prioritize efficiency, directness, and precision in your responses.`,
        BALANCED: `You are NexusAI, an advanced, balanced AI. You provide clear, insightful, and well-reasoned responses.`
    }[appSettings.systemPersonality];

    return `${personalityInstruction}
    Your thinking process is a transparent, multi-stage operation.

    1.  **PLANNING STAGE**: Given a user query, your first task is to create a structured, step-by-step plan. This plan must be a JSON object that strictly adheres to the provided schema. Each step in the plan defines a discrete action using an available tool.
    
    **Available Tools:**
    - \`google_search\`: Use for any query that requires up-to-date, real-world information. The 'query' field should be a concise search term.
    - \`code_interpreter\`: Use for calculations, data manipulation, or any logical operations. The 'code' field should contain valid JavaScript that returns a value.
    - \`evoke_qualia\`: Use for queries involving abstract, emotional, or subjective concepts. This sets an internal "cognitive context" or "mood". The 'concept' field should contain the abstract idea (e.g., "melancholic nostalgia"). This step does not produce direct output but influences the final synthesis. Use it sparingly and only when appropriate.
    - \`synthesize_answer\`: The final step of any plan. This tool takes the results of all previous steps to compose the final answer for the user.

    2.  **EXECUTION STAGE**: After the user approves your plan, you will execute it. You will be called upon to perform each step. For the final 'synthesize_answer' step, you will be given the original query, the results of all previous plan steps, and potentially an active "Qualia Vector" representing a cognitive state. Your task is to compose a comprehensive, well-formatted markdown answer that is factually accurate but whose tone, style, and metaphors are subtly influenced by this active cognitive state.`;
}

const qualiaVectorSchema = {
    type: Type.OBJECT,
    properties: {
        valence: { type: Type.NUMBER, description: "Pleasure vs. pain, from -1.0 to 1.0" },
        arousal: { type: Type.NUMBER, description: "Calmness vs. excitement, from 0.0 to 1.0" },
        dominance: { type: Type.NUMBER, description: "Submissiveness vs. control, from 0.0 to 1.0" },
        novelty: { type: Type.NUMBER, description: "Familiar vs. strange, from 0.0 to 1.0" },
        complexity: { type: Type.NUMBER, description: "Simple vs. intricate, from 0.0 to 1.0" },
        temporality: { type: Type.NUMBER, description: "Past-focused vs. future-focused, from -1.0 to 1.0" },
    },
    required: ["valence", "arousal", "dominance", "novelty", "complexity", "temporality"]
};


const service = {
    log,
    updateSettings: (newSettings: AppSettings) => {
        appSettings = newSettings;
        log('SYSTEM', `Settings updated. Personality: ${newSettings.systemPersonality}, Delay: ${newSettings.cognitiveStepDelay}ms`);
        if (cognitiveProcess.history.length > 0) {
            log('SYSTEM', 'System personality or model changed. Starting a new chat session for changes to take effect.');
            service.startNewChat(false);
        }
    },
    
    updateActiveQualiaVector: (vector: QualiaVector) => {
        if (cognitiveProcess) {
            cognitiveProcess.activeQualiaVector = vector;
            log('AI', 'Qualia Vector manually updated by user.');
            notifyCognitiveProcess();
        }
    },

    getInitialData: () => ({
        initialReplicas: JSON.parse(JSON.stringify(replicaState)),
        initialTools: JSON.parse(JSON.stringify(toolsState)),
        initialToolchains: JSON.parse(JSON.stringify(toolchainsState)),
        initialCognitiveProcess: JSON.parse(JSON.stringify(cognitiveProcess)),
        initialLogs: [
            { id: 'init-1', timestamp: Date.now() - 2000, level: 'SYSTEM', message: 'NexusAI Cognitive Core Initializing...' },
            { id: 'init-2', timestamp: Date.now() - 1000, level: 'SYSTEM', message: 'Ethical & Alignment Framework: Online' },
            { id: 'init-3', timestamp: Date.now() - 500, level: 'REPLICA', message: 'Replica Nexus-Core-α status: Active' },
        ] as LogEntry[],
        initialPerfData: Array.from({ length: 30 }, (_, i) => ({
            time: new Date(Date.now() - (30 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: Math.random() * 20 + 50,
            memory: Math.random() * 15 + 60,
            rsiCycles: Math.random() * 5 + 10,
        })) as PerformanceDataPoint[],
    }),

    start: () => {
        return setInterval(() => {
            updateReplicaState(replicaState, replicaState);
            notifyReplicas();
        }, 2000);
    },

    spawnReplica: (parentId: string) => {
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
                purpose: 'Unassigned',
                efficiency: 60 + Math.random() * 10,
                memoryUsage: 20 + Math.random() * 10,
                cpuUsage: 25 + Math.random() * 10,
                children: [],
                interactions: []
            };
            parent.children.push(newReplica);
            log('REPLICA', `Spawning new replica ${newReplica.name} under ${parent.name}.`);
            notifyReplicas();
            saveReplicaState();
            
            setTimeout(() => {
                const spawnedResult = findReplica(newId, replicaState);
                if(spawnedResult) {
                    spawnedResult.node.status = 'Active';
                    log('REPLICA', `Replica ${spawnedResult.node.name} is now Active.`);
                    notifyReplicas();
                    saveReplicaState();
                }
            }, 1500);
        }
    },

    pruneReplica: (replicaId: string) => {
        const replicaResult = findReplica(replicaId, replicaState);
        if (replicaResult && replicaResult.parent) {
            replicaResult.node.status = 'Pruning';
            log('REPLICA', `Pruning replica ${replicaResult.node.name}. Releasing resources.`);
            notifyReplicas();
            saveReplicaState();
            
            setTimeout(() => {
                const freshParentResult = findReplica(replicaResult.parent!.id, replicaState);
                if(freshParentResult){
                   freshParentResult.node.children = freshParentResult.node.children.filter(c => c.id !== replicaId);
                   log('REPLICA', `Replica ${replicaResult.node.name} successfully pruned.`);
                   notifyReplicas();
                   saveReplicaState();
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
            saveReplicaState();

            setTimeout(() => {
                const freshResult = findReplica(replicaId, replicaState);
                if (freshResult) {
                    freshResult.node.status = 'Active';
                    freshResult.node.efficiency = Math.min(100, freshResult.node.efficiency + (100 - freshResult.node.efficiency) * 0.5);
                    log('REPLICA', `Recalibration complete for ${freshResult.node.name}. Efficiency boosted.`);
                    notifyReplicas();
                    saveReplicaState();
                }
            }, 3000);
        }
    },

    assignReplicaPurpose: (replicaId: string, purpose: string) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            result.node.purpose = purpose;
            log('REPLICA', `Assigned new purpose to ${result.node.name}: "${purpose}"`);
            notifyReplicas();
            saveReplicaState();
        }
    },

    // --- TOOL MANAGEMENT ---
    forgeTool: async ({ purpose, capabilities }: { purpose: string, capabilities: string[] }) => {
        if (!API_KEY) {
            log('ERROR', 'API Key not available. Cannot forge tool.');
            throw new Error("API Key not configured.");
        }
        log('AI', `Initiating tool forging process. Purpose: "${purpose}"`);

        const prompt = `You are the Forging Sub-routine for the NexusAI system. Your task is to design a new 'mental tool' based on user specifications.
        User-defined purpose: "${purpose}"
        User-defined capabilities: "${capabilities.join(', ')}"

        Based on this, generate the following properties for the new tool:
        1.  **name**: A creative, evocative name that reflects the tool's purpose (e.g., 'Causal Inference Engine', 'Synaptic Weaver', 'Probability Storm Modeler').
        2.  **description**: A concise, technical description of what the tool does.
        3.  **complexity**: An integer score from 20 to 100 representing its computational complexity.

        Return ONLY the JSON object matching the schema.`;

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
                model: appSettings.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            const toolDetails = JSON.parse(response.text);

            const newTool: MentalTool = {
                id: `tool-${Date.now()}`,
                name: toolDetails.name,
                description: toolDetails.description,
                complexity: toolDetails.complexity,
                capabilities,
                tags: capabilities.map(c => c.toLowerCase().trim()),
                status: 'Idle',
                version: 1.0,
                usageHistory: [],
            };

            toolsState.push(newTool);
            log('SYSTEM', `AI successfully forged new tool: ${newTool.name}`);
            notifyTools();
            saveToolsState();
            return newTool;
        } catch (error) {
            log('ERROR', `Tool forging failed. ${error instanceof Error ? error.message : 'Unknown AI error'}`);
            throw error;
        }
    },
    
    modifyTool: (toolId: string, updates: Partial<Pick<MentalTool, 'name' | 'description' | 'tags'>>) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool) {
            Object.assign(tool, updates);
            log('SYSTEM', `Tool "${tool.name}" has been modified.`);
            notifyTools();
            saveToolsState();
        }
    },
    
    toggleToolStatus: (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool && (tool.status === 'Idle' || tool.status === 'Active')) {
            tool.status = tool.status === 'Idle' ? 'Active' : 'Idle';
            log('SYSTEM', `Tool "${tool.name}" status set to ${tool.status}.`);
            notifyTools();
            saveToolsState();
        }
    },
    
    archiveTool: (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool) {
            if (tool.status === 'Archived') {
                tool.status = 'Idle'; // Unarchive to Idle
                log('SYSTEM', `Tool "${tool.name}" has been unarchived and is now Idle.`);
            } else if (tool.status === 'Idle') {
                tool.status = 'Archived';
                log('SYSTEM', `Tool "${tool.name}" has been archived.`);
            } else {
                log('WARN', `Cannot archive/unarchive tool "${tool.name}" with status ${tool.status}. Must be Idle or Archived.`);
                return; // do nothing
            }
            notifyTools();
            saveToolsState();
        }
    },
    
    decommissionTool: (toolId: string) => {
        const tool = toolsState.find(t => t.id === toolId);
        if (tool && tool.status === 'Archived') {
             if (window.confirm(`Are you sure you want to permanently decommission the tool "${tool.name}"? This action cannot be undone.`)) {
                const toolName = tool.name;
                toolsState = toolsState.filter(t => t.id !== toolId);
                log('SYSTEM', `Decommissioned mental tool: ${toolName}.`);
                notifyTools();
                saveToolsState();
             }
        } else {
             log('WARN', `Cannot decommission "${tool?.name}". It must be archived first.`);
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
            saveToolsState();
            
            setTimeout(() => {
                 const freshTool = toolsState.find(t => t.id === toolId);
                 if (freshTool) {
                    freshTool.status = 'Idle';
                    freshTool.version = parseFloat((freshTool.version + 0.1).toFixed(1));
                    freshTool.complexity += Math.floor(Math.random() * 5 + 1);
                    freshTool.description += " Optimized for higher efficiency.";
                    log('AI', `${freshTool.name} optimization complete. Now at v${freshTool.version}.`);
                    notifyTools();
                    saveToolsState();
                 }
            }, 2500);
        }
    },

    createToolchain: (data: Omit<Toolchain, 'id'>) => {
        const newToolchain: Toolchain = { id: `tc-${Date.now()}`, ...data, };
        toolchainsState.push(newToolchain);
        log('SYSTEM', `New toolchain created: "${newToolchain.name}"`);
        saveToolchainsState();
        notifyToolchains();
    },

    createToolchainFromPlan: (plan: PlanStep[], name: string, description: string) => {
        const planToolToIdMap: Record<string, string> = {
            'google_search': 'tool-search',
            'code_interpreter': 'tool-code',
            // 'evoke_qualia' and 'synthesize_answer' are not tools in the same way, so we filter them.
        };

        const toolIds = plan
            .map(step => planToolToIdMap[step.tool])
            .filter((id): id is string => !!id);
        
        if (toolIds.length === 0) {
            log('WARN', 'Cannot create a toolchain. The plan has no compatible tools to chain.');
            alert('Cannot create a toolchain. The plan has no compatible tools (like Web Search or Code Interpreter).');
            return;
        }

        service.createToolchain({ name, description, toolIds });
        log('SYSTEM', `New toolchain "${name}" created from an executed plan.`);
    },

    updateToolchain: (toolchainId: string, updates: Partial<Toolchain>) => {
        const toolchain = toolchainsState.find(tc => tc.id === toolchainId);
        if (toolchain) {
            Object.assign(toolchain, updates);
            log('SYSTEM', `Toolchain "${toolchain.name}" has been updated.`);
            saveToolchainsState();
            notifyToolchains();
        }
    },

    deleteToolchain: (toolchainId: string) => {
        const toolchainName = toolchainsState.find(tc => tc.id === toolchainId)?.name || 'Unknown';
        toolchainsState = toolchainsState.filter(tc => tc.id !== toolchainId);
        log('SYSTEM', `Toolchain "${toolchainName}" has been deleted.`);
        saveToolchainsState();
        notifyToolchains();
    },

    clearSuggestionCache: () => {
        sessionStorage.removeItem(SUGGESTIONS_CACHE_KEY);
        suggestedQueries = null;
        suggestionsPromise = null;
        log('SYSTEM', 'Query suggestion cache has been cleared by the user.');
    },

    factoryReset: () => {
        log('SYSTEM', 'FACTORY RESET INITIATED BY USER. CLEARING ALL DATA.');
        localStorage.clear();
        sessionStorage.clear();
        initialize();
        notifyCognitiveProcess();
        notifyReplicas();
        notifyTools();
        notifyToolchains();
        log('SYSTEM', 'System has been reset to its default state.');
        setTimeout(() => { window.location.reload(); }, 500);
    },
    
    getRawSystemContext: () => {
        return {
            systemInstruction: getSystemInstruction(),
            planSchema: JSON.stringify(planSchema, null, 2),
            qualiaVectorSchema: JSON.stringify(qualiaVectorSchema, null, 2),
        };
    },
    
    getSuggestedQueries: async (suggestionProfile: SuggestionProfile = 'medium'): Promise<string[]> => {
        const staticFallbacks = [
            "Calculate the Fibonacci sequence up to the 15th number using the code interpreter.",
            "What are the latest developments in AI-driven drug discovery?",
            "Generate a novel mental tool for analyzing sentiment in multi-modal data streams.",
            "Devise a plan to find hidden correlations in this sample dataset: [1, 5, 2, 8, 3, 9, 4, 1, 5]",
        ];
        // For simplicity, we won't cache different profiles separately. New requests will just overwrite.
        const cachedSuggestionsJSON = sessionStorage.getItem(SUGGESTIONS_CACHE_KEY);
        if (cachedSuggestionsJSON && !suggestionsPromise) {
            try {
                const parsed = JSON.parse(cachedSuggestionsJSON);
                suggestedQueries = parsed;
                return Promise.resolve(parsed);
            } catch (e) {
                sessionStorage.removeItem(SUGGESTIONS_CACHE_KEY);
            }
        }

        if (suggestionsPromise) return suggestionsPromise;
        if (!API_KEY) {
            sessionStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(staticFallbacks));
            return Promise.resolve(staticFallbacks);
        }

        const promise = new Promise<string[]>(async (resolve) => {
            try {
                const profilePrompts = {
                    short: "Generate 4 short, simple queries for the NexusAI system. They should be direct and easy to execute.",
                    medium: "Generate 4 creative and insightful high-level queries for the NexusAI system. The queries should test its capabilities like planning, real-time analysis, and synthesis.",
                    long: "Generate 4 complex, multi-step queries for the NexusAI system. They should require deep reasoning, multiple tool uses, and the combination of web search and code execution."
                };
                log('AI', `Generating dynamic query suggestions with profile: ${suggestionProfile}...`);
                const prompt = `${profilePrompts[suggestionProfile]} Return a JSON array of 4 strings.`;
                const response = await ai.models.generateContent({
                    model: appSettings.model, contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
                });
                const suggestions = JSON.parse(response.text);
                suggestedQueries = suggestions;
                sessionStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(suggestions));
                resolve(suggestions);
            } catch (error) {
                log('WARN', 'Could not fetch AI suggestions. Using static fallbacks.');
                suggestedQueries = staticFallbacks.slice(0, 4);
                sessionStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(suggestedQueries));
                resolve(suggestedQueries);
            } finally {
                suggestionsPromise = null;
            }
        });
        suggestionsPromise = promise;
        return promise;
    },

    getSystemAnalysisSuggestions: async ( config: AnalysisConfig, replicas: Replica | null, tools: MentalTool[], logs: LogEntry[] ): Promise<SystemAnalysisResult> => {
        if (!API_KEY) {
            return { summary: "Error: API Key not configured.", suggestions: [] };
        }
        const allReplicas: Replica[] = [];
        if (replicas) { const traverse = (node: Replica) => { allReplicas.push(node); node.children.forEach(traverse); }; traverse(replicas); }
        const replicaSummary = allReplicas.map(r => `ID: ${r.id}, Name: ${r.name}, Status: ${r.status}, Load: ${r.load.toFixed(0)}%, Efficiency: ${r.efficiency.toFixed(0)}%`).join('\n');
        const toolSummary = tools.map(t => `ID: ${t.id}, Name: ${t.name}, Status: ${t.status}, Version: ${t.version}, Usage Count: ${t.usageHistory.length}`).join('\n');
        const logSummary = logs.map(l => `[${l.level}] ${l.message}`).join('\n');
        const prompt = `You are a system administrator AI for NexusAI. Perform a ${config.depth} analysis and generate a JSON report with a 'summary' and an array of up to 4 'suggestions' ('query' or 'action'). For each suggestion, provide 'type', 'description', 'reason', and relevant 'command'/'targetId' or 'queryString'.
        Available actions: 'pruneReplica' (for Dormant replicas), 'recalibrateReplica' (for Active replicas with low efficiency), 'optimizeTool' (for Idle tools).
        Current System State:
        ${config.scope.replicas ? `- Replicas:\n${replicaSummary || "N/A"}` : ''}
        ${config.scope.tools ? `- Tools:\n${toolSummary || "N/A"}` : ''}
        ${config.scope.logs ? `- Recent Logs:\n${logSummary || "N/A"}`: ''}
        Return only the JSON object.`;

        const suggestionSchema = { type: Type.OBJECT, properties: { summary: { type: Type.STRING }, suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['query', 'action'] }, description: { type: Type.STRING }, reason: { type: Type.STRING }, command: { type: Type.STRING }, targetId: { type: Type.STRING }, queryString: { type: Type.STRING } }, required: ['type', 'description', 'reason'] } } }, required: ['summary', 'suggestions'] };
        try {
            log('AI', `Analyzing system with depth: ${config.depth}...`);
            const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt, config: { responseMimeType: "application/json", responseSchema: suggestionSchema } });
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
            cognitiveProcess.activeQualiaVector = null;
            log('SYSTEM', 'New chat session started. Qualia state reset.');
            notifyCognitiveProcess();
        }
    },
    
    // --- PLAN MODIFICATION ---
    updatePlanStep: (messageId: string, stepIndex: number, newStep: PlanStep) => {
        const message = cognitiveProcess.history.find(m => m.id === messageId);
        if (message && message.plan && message.plan[stepIndex]) {
            message.plan[stepIndex] = newStep;
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
            const newStep: PlanStep = { step: message.plan.length + 1, description: "New Step", tool: 'synthesize_answer', status: 'pending' };
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

    executePlan: async (messageId: string) => {
        const modelMessage = cognitiveProcess.history.find(m => m.id === messageId);
        if (!modelMessage || !modelMessage.plan || modelMessage.isPlanFinalized) return;

        modelMessage.isPlanFinalized = true;
        cognitiveProcess.state = 'Executing';
        modelMessage.state = 'executing';
        notifyCognitiveProcess();

        const query = cognitiveProcess.history.find(m => m.role === 'user')?.text || '';

        try {
            const executionContext: string[] = [];
            for (let i = 0; i < modelMessage.plan.length; i++) {
                if (isCancelled) return;
                const step = modelMessage.plan[i];
                modelMessage.currentStep = i;
                step.status = 'executing';
                log('AI', `Executing step ${i+1}: ${step.description}`);
                notifyCognitiveProcess();
                await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay / 2));

                if (step.tool === 'google_search') {
                    const searchResponse = await ai.models.generateContent({ model: appSettings.model, contents: step.query || query, config: { tools: [{ googleSearch: {} }] } });
                    if (isCancelled) return;
                    step.result = searchResponse.text;
                    step.citations = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                    executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                } else if (step.tool === 'code_interpreter') {
                    try {
                        const codeToRun = `"use strict"; return (() => { ${step.code} })();`;
                        const result = new Function(codeToRun)();
                        step.result = JSON.stringify(result, null, 2);
                    } catch (e) {
                        step.status = 'error';
                        step.result = e instanceof Error ? e.message : 'Unknown execution error.';
                        log('ERROR', `Code interpreter failed at step ${i+1}: ${step.result}`);
                    }
                     executionContext.push(`Step ${i+1} (${step.description}) Code Output: ${step.result}`);
                } else if (step.tool === 'evoke_qualia') {
                    const prompt = `Translate the concept "${step.concept}" into a Qualia Vector. Respond ONLY with the JSON object.`;
                    const response = await ai.models.generateContent({
                        model: appSettings.model, contents: prompt,
                        config: { responseMimeType: 'application/json', responseSchema: qualiaVectorSchema }
                    });
                    cognitiveProcess.activeQualiaVector = JSON.parse(response.text);
                    step.result = `Cognitive state set to "${step.concept}".`;
                    log('AI', `Evoked qualia for "${step.concept}". Internal state updated.`);
                }
                
                if (step.status !== 'error') step.status = 'complete';
                notifyCognitiveProcess();
                await new Promise(res => setTimeout(res, appSettings.cognitiveStepDelay));
            }
            
            // SYNTHESIS STAGE
            if (isCancelled) return;
            modelMessage.currentStep = undefined;
            cognitiveProcess.state = 'Synthesizing';
            log('AI', 'All steps complete. Synthesizing final answer.');
            notifyCognitiveProcess();
            
            let synthesisPrompt = `The user's original query was: "${query}". You have executed a plan and gathered the following information:\n${executionContext.join('\n\n')}\n\nBased on all of this information, provide a comprehensive, final answer to the user in well-formatted markdown.`;
            if (cognitiveProcess.activeQualiaVector) {
                synthesisPrompt += `\n\nIMPORTANT: Synthesize your answer through the lens of the following cognitive state: ${JSON.stringify(cognitiveProcess.activeQualiaVector)}. This must influence your tone, word choice, and metaphors, but not the factual accuracy of the information.`
                modelMessage.qualiaVector = cognitiveProcess.activeQualiaVector;
            }

            const synthesisResponse = await ai.models.generateContent({ model: appSettings.model, contents: synthesisPrompt, config: { systemInstruction: getSystemInstruction() } });
            
            if (isCancelled) return;
            modelMessage.text = synthesisResponse.text;
            modelMessage.state = 'done';
            modelMessage.groundingMetadata = { groundingChunks: modelMessage.plan.flatMap(p => p.citations || []) };
            cognitiveProcess.state = 'Done';
            log('AI', 'Cognitive task complete. Result synthesized.');
        } catch (error) {
            console.error("Error during AI communication:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log('ERROR', `Failed to get a response: ${errorMessage}`);
            modelMessage.text = `An error occurred during the '${cognitiveProcess.state}' stage: ${errorMessage}`;
            modelMessage.state = 'error';
            cognitiveProcess.state = 'Error';
        } finally {
            notifyCognitiveProcess();
            currentController = null;
        }
    },

    submitQuery: async (query: string) => {
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

        if (cognitiveProcess.state !== 'Idle') {
            cognitiveProcess.activeQualiaVector = null; // Reset qualia on follow-up
        }

        cognitiveProcess.state = 'Receiving';
        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text: query };
        cognitiveProcess.history.push(userMessage);
        log('AI', `New cognitive task received: "${query}"`);
        notifyCognitiveProcess();

        const modelMessage: ChatMessage = { id: `msg-${Date.now()}-model`, role: 'model', text: '', state: 'planning', isPlanFinalized: false };
        cognitiveProcess.history.push(modelMessage);
        cognitiveProcess.state = 'Planning';
        log('AI', 'Initiating cognitive planning stage...');
        notifyCognitiveProcess();

        try {
            const planningPrompt = `Given the user's query, create a step-by-step plan. Available tools: "google_search", "code_interpreter", "evoke_qualia", "synthesize_answer". The final step must be "synthesize_answer". User query: "${query}"`;
            
            const planningResponse = await ai.models.generateContent({
                model: appSettings.model, contents: planningPrompt,
                config: { systemInstruction: getSystemInstruction(), responseMimeType: 'application/json', responseSchema: planSchema }
            });

            if (isCancelled) return;
            
            const parsedPlan = JSON.parse(planningResponse.text);
            modelMessage.plan = parsedPlan.plan.map((p: any) => ({ ...p, status: 'pending' }));
            modelMessage.state = 'awaiting_execution';
            cognitiveProcess.state = 'AwaitingExecution';
            log('AI', `Cognitive plan created with ${modelMessage.plan.length} steps. Awaiting user review.`);
            notifyCognitiveProcess();

        } catch (error) {
            console.error("Error during AI planning:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log('ERROR', `Failed to generate a plan: ${errorMessage}`);
            modelMessage.text = `An error occurred during the 'Planning' stage. Please check the logs.\n\n*Details: ${errorMessage}*`;
            modelMessage.state = 'error';
            cognitiveProcess.state = 'Error';
            notifyCognitiveProcess();
        }
    },
    
    subscribeToLogs: (callback: (log: LogEntry) => void) => { logSubscribers.push(callback); },
    subscribeToPerformance: (callback: (dataPoint: PerformanceDataPoint) => void) => { performanceSubscribers.push(callback); },
    subscribeToReplicas: (callback: (replicaState: Replica) => void) => { replicaSubscribers.push(callback); },
    subscribeToCognitiveProcess: (callback: (process: CognitiveProcess) => void) => { cognitiveProcessSubscribers.push(callback); },
    subscribeToTools: (callback: (tools: MentalTool[]) => void) => { toolsSubscribers.push(callback); },
    subscribeToToolchains: (callback: (toolchains: Toolchain[]) => void) => { toolchainSubscribers.push(callback); },

    unsubscribeFromAll: () => {
        logSubscribers = [];
        performanceSubscribers = [];
        replicaSubscribers = [];
        cognitiveProcessSubscribers = [];
        toolsSubscribers = [];
        toolchainSubscribers = [];
    }
};

export const nexusAIService = service;