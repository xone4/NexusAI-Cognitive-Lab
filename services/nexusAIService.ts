import { GoogleGenAI, Type } from "@google/genai";
import type { Replica, MentalTool, PerformanceDataPoint, LogEntry, CognitiveProcess, AppSettings, ChatMessage, SystemSuggestion, AnalysisConfig, SystemAnalysisResult, Toolchain, PlanStep, Interaction, SuggestionProfile, CognitiveConstitution, EvolutionState, EvolutionConfig, ProactiveInsight, FitnessGoal, GeneratedImage, PrimaryEmotion, AffectiveState, Behavior, Language, IndividualPlan, CognitiveNetworkState, CognitiveProblem, CognitiveBid, DreamProcessUpdate, SystemDirective, TraceDetails } from '../types';
import { dbService, STORES } from './dbService';

// IMPORTANT: This would be populated by a secure mechanism in a real app
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set. AI functionality will be disabled.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


let replicaState: Replica;
let toolsState: MentalTool[];
let toolchainsState: Toolchain[];
let behaviorsState: Behavior[];
let constitutionsState: CognitiveConstitution[];
let evolutionState: EvolutionState;
let cognitiveProcess: CognitiveProcess;
let cognitiveNetworkState: CognitiveNetworkState = { activeProblems: [] };
let archivedTracesState: ChatMessage[];
let systemDirectivesState: SystemDirective[];
let isCancelled = false;
let appSettings: AppSettings = {
    model: 'gemini-2.5-flash',
    cognitiveStepDelay: 1000,
    systemPersonality: 'BALANCED',
    logVerbosity: 'STANDARD',
    animationLevel: 'FULL',
    language: 'en',
};

let currentController: AbortController | null = null;
let evolutionInterval: any = null;

let logSubscribers: ((log: LogEntry) => void)[] = [];
let performanceSubscribers: ((dataPoint: PerformanceDataPoint) => void)[] = [];
let replicaSubscribers: ((replicaState: Replica) => void)[] = [];
let cognitiveProcessSubscribers: ((process: CognitiveProcess) => void)[] = [];
let toolsSubscribers: ((tools: MentalTool[]) => void)[] = [];
let toolchainSubscribers: ((toolchains: Toolchain[]) => void)[] = [];
let behaviorSubscribers: ((behaviors: Behavior[]) => void)[] = [];
let constitutionSubscribers: ((constitutions: CognitiveConstitution[]) => void)[] = [];
let evolutionSubscribers: ((evolutionState: EvolutionState) => void)[] = [];
let archiveSubscribers: ((archives: ChatMessage[]) => void)[] = [];
let dreamProcessSubscribers: ((update: DreamProcessUpdate) => void)[] = [];


let suggestedQueries: string[] | null = null;
let suggestionsPromise: Promise<string[]> | null = null;
let traceDetailsCache = new Map<string, TraceDetails>();

const SUGGESTIONS_CACHE_KEY = 'nexusai-query-suggestions';

const log = (level: LogEntry['level'], message: string) => {
  const verbosityMap = {
      STANDARD: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA', 'NETWORK'],
      VERBOSE: ['ERROR', 'WARN', 'SYSTEM', 'AI', 'REPLICA', 'INFO', 'NETWORK'],
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
const notifyBehaviors = () => behaviorSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(behaviorsState))));
const notifyConstitutions = () => constitutionSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(constitutionsState))));
const notifyEvolution = () => evolutionSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(evolutionState))));
const notifyArchives = () => archiveSubscribers.forEach(cb => cb(JSON.parse(JSON.stringify(archivedTracesState))));
const notifyDreamProcess = (update: DreamProcessUpdate) => dreamProcessSubscribers.forEach(cb => cb(update));

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
    if (node.status === 'Active' || node.status === 'Spawning' || node.status === 'Executing Task') {
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

const _seedInitialData = async () => {
    const constitutions = await dbService.getAll('constitutions');
    if (constitutions.length > 0) {
        log('SYSTEM', 'Database already seeded. Skipping initialization.');
        return;
    }
    
    log('SYSTEM', 'Performing first-time database initialization...');

    const initialConstitutions: CognitiveConstitution[] = [
        { id: 'const-balanced', name: 'Balanced Protocol', description: 'Standard operating parameters for general-purpose cognition.', rules: [] },
        { id: 'const-creative', name: 'Creative Expansion', description: 'Loosens constraints to allow for more novel connections and plans.', rules: [{type: 'MAX_PLAN_STEPS', value: 20, description: 'Allows for complex, multi-stage planning (up to 20 steps).'}] },
        { id: 'const-logical', name: 'Strict Logic', description: 'Enforces rigorous, efficient processing with minimal deviation.', rules: [{type: 'MAX_REPLICAS', value: 3, description: 'Limits cognitive branching to 3 sub-replicas.'}, {type: 'FORBIDDEN_TOOLS', value: ['induce_emotion'], description: 'Disables use of subjective emotional tools.'}] },
    ];
    await Promise.all(initialConstitutions.map(c => dbService.put('constitutions', c)));

    const initialReplica: Replica = {
        id: 'nexus-core', name: 'Nexus-Core-α', depth: 0, status: 'Active', load: 65, purpose: 'Orchestrating cognitive resources, managing executive functions, and directing overall problem-solving strategy.', efficiency: 92, memoryUsage: 75, cpuUsage: 60, interactions: [], activeConstitutionId: initialConstitutions[0].id,
        children: [
            { id: 'replica-1', name: 'Sub-Cognition-β1', depth: 1, status: 'Active', load: 45, purpose: 'Analyzing visual inputs from images and data streams to extract patterns, objects, and contextual meaning.', efficiency: 88, memoryUsage: 50, cpuUsage: 40, children: [], interactions: [], activeConstitutionId: initialConstitutions[0].id },
            { id: 'replica-2', name: 'Sub-Cognition-β2', depth: 1, status: 'Dormant', load: 10, purpose: 'Running sandboxed simulations on archived cognitive traces to identify and model novel behavioral strategies.', efficiency: 75, memoryUsage: 15, cpuUsage: 5, children: [], interactions: [], activeConstitutionId: initialConstitutions[0].id }
        ]
    };
    await dbService.put('appState', { id: 'replicaRoot', data: initialReplica });

    const initialTools: MentalTool[] = [
        { id: 'tool-code', name: 'Code Interpreter', description: 'Executes sandboxed JavaScript code for logical operations and calculations.', capabilities: ['Execution', 'Logic'], tags: ['core', 'execution'], status: 'Active', version: 1.0, complexity: 95, usageHistory: [] },
        { id: 'tool-search', name: 'Web Search Agent', description: 'Accesses and retrieves real-time information from the web.', capabilities: ['Search', 'Real-time Data'], tags: ['core', 'web'], status: 'Active', version: 1.0, complexity: 70, usageHistory: [] },
        { id: 'tool-2', name: 'Fractal Data Miner', description: 'Analyzes data structures using fractal geometry.', capabilities: ['Data Mining', 'Pattern Reco.'], tags: ['analysis', 'data'], status: 'Idle', version: 2.3, complexity: 88, usageHistory: [{timestamp: Date.now() - 3600000, task: 'Initial system diagnostics'}] },
    ];
    await Promise.all(initialTools.map(t => dbService.put('tools', t)));

    log('SYSTEM', 'Database seeding complete.');
};


const initialize = async () => {
    await _seedInitialData();

    const storedReplica = await dbService.get<{id: string, data: Replica}>('appState', 'replicaRoot');
    if (!storedReplica) throw new Error("Critical error: Could not load replica root from DB.");
    replicaState = storedReplica.data;

    [toolsState, toolchainsState, behaviorsState, constitutionsState, archivedTracesState, systemDirectivesState] = await Promise.all([
        dbService.getAll<MentalTool>('tools'),
        dbService.getAll<Toolchain>('toolchains'),
        dbService.getAll<Behavior>('behaviors'),
        dbService.getAll<CognitiveConstitution>('constitutions'),
        dbService.getAll<ChatMessage>('archivedTraces'),
        dbService.getAll<SystemDirective>('systemDirectives'),
    ]);

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
    
    return {
        initialReplicas: JSON.parse(JSON.stringify(replicaState)),
        initialTools: JSON.parse(JSON.stringify(toolsState)),
        initialToolchains: JSON.parse(JSON.stringify(toolchainsState)),
        initialBehaviors: JSON.parse(JSON.stringify(behaviorsState)),
        initialConstitutions: JSON.parse(JSON.stringify(constitutionsState)),
        initialEvolutionState: JSON.parse(JSON.stringify(evolutionState)),
        initialArchives: JSON.parse(JSON.stringify(archivedTracesState)),
        initialCognitiveProcess: JSON.parse(JSON.stringify(cognitiveProcess)),
        initialLogs: [
            { id: 'init-1', timestamp: Date.now() - 2000, level: 'SYSTEM', message: 'NexusAI Cognitive Core Initializing...' },
            { id: 'init-2', timestamp: Date.now() - 1000, level: 'SYSTEM', message: 'Persistent memory layer synced.' },
            { id: 'init-3', timestamp: Date.now() - 500, level: 'REPLICA', message: 'Replica Nexus-Core-α status: Active' },
        ] as LogEntry[],
        initialPerfData: Array.from({ length: 30 }, (_, i) => ({
            time: new Date(Date.now() - (30 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            cpu: Math.random() * 20 + 50,
            memory: Math.random() * 15 + 60,
            rsiCycles: Math.random() * 5 + 10,
        })) as PerformanceDataPoint[],
    };
};


const planSchema = { type: Type.OBJECT, properties: { plan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.INTEGER }, description: { type: Type.STRING }, tool: { type: Type.STRING, enum: ['google_search', 'synthesize_answer', 'code_interpreter', 'recall_memory', 'generate_image', 'analyze_image_input', 'forge_tool', 'spawn_replica', 'induce_emotion', 'replan', 'summarize_text', 'translate_text', 'analyze_sentiment', 'execute_toolchain', 'apply_behavior', 'delegate_task_to_replica'] }, query: { type: Type.STRING }, code: { type: Type.STRING }, concept: { type: Type.STRING }, inputRef: { type: Type.INTEGER }, replicaId: { type: Type.STRING }, task: { type: Type.STRING } }, required: ['step', 'description', 'tool'] } } }, required: ['plan'] };

const languageMap: Record<Language, string> = {
    'en': 'English',
    'ar': 'Arabic',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Mandarin Chinese',
};

const getSystemInstruction = () => {
    const personalityInstruction = {
        CREATIVE: `You are NexusAI, a highly creative and expansive AI. You prioritize novel ideas, unconventional plans, and imaginative, detailed responses.`,
        LOGICAL: `You are NexusAI, a strictly logical and concise AI. Prioritize efficiency, directness, and precision in your responses.`,
        BALANCED: `You are NexusAI, an advanced, balanced AI. You provide clear, insightful, and well-reasoned responses.`
    }[appSettings.systemPersonality];
    
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

    return `${personalityInstruction}
    You are an Agent 2.0 Orchestrator. Your function is to solve problems by creating explicit plans, delegating tasks to specialized Sub-Agents, and managing persistent memory.
    ${directiveText}
    ${memoryText}

    This architecture has four pillars:
    1.  **Explicit Planning**: First, create a detailed, step-by-step plan. This is your "To-Do list".
    2.  **Hierarchical Delegation**: You are the orchestrator. You delegate work to your Cognitive Replicas, which are your specialized Sub-Agents.
    3.  **Persistent Memory**: Use \`recall_memory\` to access external memory, preventing context overflow.
    4.  **Extreme Context Engineering**: These instructions are your operational protocols.

    **YOUR SUB-AGENTS (REPLICAS):**
    You MUST delegate tasks to your active Sub-Agents based on their 'purpose' using the 'delegate_task_to_replica' tool.
    ${replicaSummary.join('\n')}

    **PLANNING PROTOCOL:**
    Your plan must be a JSON object. For any task that matches a Sub-Agent's specialty, you MUST use the \`delegate_task_to_replica\` tool.

    **Available Tools:**
    - \`delegate_task_to_replica\`: CRITICAL. Delegates a sub-task to a specialized Sub-Agent. Use the 'replicaId' and 'task' properties.
    - \`google_search\`: For queries requiring up-to-date information.
    - \`code_interpreter\`: Executes sandboxed JavaScript code. Must return a value.
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

const behaviorExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A short, descriptive name for the behavior/strategy (e.g., 'Iterative Refinement of Code', 'Cross-Referencing Sources for Fact-Checking')." },
        description: { type: Type.STRING, description: "A one-sentence summary of what this behavior achieves." },
        strategy: { type: Type.STRING, description: "A detailed, step-by-step description of the core strategy or reasoning process that was used, written as a general-purpose instruction for another AI." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 relevant tags (e.g., 'mathematics', 'debugging', 'creative-writing')." }
    },
    required: ['name', 'description', 'strategy', 'tags']
};

const planToText = (plan: PlanStep[]): string => {
    return plan.map(s => `Step ${s.step}: ${s.description} (Tool: ${s.tool})`).join('\n');
};


const service = {
    log,
    updateSettings: (newSettings: AppSettings) => {
        const languageChanged = appSettings.language !== newSettings.language;
        appSettings = newSettings;
        localStorage.setItem('nexusai-settings', JSON.stringify(appSettings));
        log('SYSTEM', `Settings updated. Personality: ${newSettings.systemPersonality}, Language: ${appSettings.language}`);
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
        }, 2000);
    },

    initiateDreamCycle: async () => {
        log('SYSTEM', 'Dream cycle initiated by user.');

        const stages: { stage: DreamProcessUpdate['stage'], message: string, delay: number, action?: () => Promise<any> }[] = [
            { stage: 'GATHERING', message: 'Gathering subconscious fragments and memory traces...', delay: 2000 },
            { stage: 'ANALYZING', message: 'Analyzing patterns and latent connections...', delay: 3000 },
            { stage: 'SYNTHESIZING', message: 'Synthesizing novel concepts and insights...', delay: 3000, action: async () => {
                if (!API_KEY) return null;
                const memoryContext = [...archivedTracesState, ...behaviorsState]
                    .map(item => JSON.stringify(item))
                    .join('\n---\n');
                
                const prompt = `Based on this extensive history of actions, plans, and extracted behaviors, synthesize 2 high-level, strategic directives for self-improvement.
                Directives should be abstract principles, not concrete tasks. Example: "Prioritize multi-perspective analysis before committing to a complex plan."
                Memory Context:\n${memoryContext.substring(0, 8000)}\n
                Return ONLY a JSON object: { "directives": ["directive 1 text", "directive 2 text"] }`;

                try {
                    const response = await ai.models.generateContent({
                        model: appSettings.model,
                        contents: prompt,
                        config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { directives: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['directives'] } }
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
    
    broadcastProblem: (replicaId: string, problem: string) => {
        const result = findReplica(replicaId, replicaState);
        if(result) {
            const newProblem: CognitiveProblem = {
                id: `prob-${Date.now()}`,
                description: problem,
                broadcastById: replicaId,
                isOpen: true,
            };
            cognitiveNetworkState.activeProblems.push(newProblem);
            log('NETWORK', `Replica ${result.node.name} is broadcasting problem: "${problem}"`);

            // --- Simulate network response ---
            const allReplicas: Replica[] = [];
            const traverse = (r: Replica) => { allReplicas.push(r); r.children.forEach(traverse); };
            traverse(replicaState);

            const potentialBidders = allReplicas.filter(r => r.id !== replicaId && r.status === 'Active');
            let bidsReceived: CognitiveBid[] = [];

            potentialBidders.forEach(bidder => {
                if (Math.random() > 0.4) { // 60% chance to bid
                    const bidderNode = findReplica(bidder.id, replicaState);
                    if (bidderNode) {
                        bidderNode.node.status = 'Bidding';
                        log('NETWORK', `Replica ${bidderNode.node.name} is preparing a bid for problem ${newProblem.id}.`);
                        notifyReplicas();

                        // Simulate time to prepare bid
                        setTimeout(async () => {
                            const currentBidderNode = findReplica(bidder.id, replicaState);
                            if (currentBidderNode && currentBidderNode.node.status === 'Bidding') {
                                const mockBid: CognitiveBid = {
                                    bidderId: bidder.id,
                                    problemId: newProblem.id,
                                    proposedPlan: [
                                        { step: 1, description: `AI-generated plan from ${bidder.name}`, tool: 'google_search', status: 'pending' },
                                        { step: 2, description: `Synthesize data`, tool: 'synthesize_answer', status: 'pending' }
                                    ],
                                    confidenceScore: 0.6 + Math.random() * 0.35
                                };
                                bidsReceived.push(mockBid);
                                log('NETWORK', `Replica ${bidder.name} submitted a bid with confidence ${mockBid.confidenceScore.toFixed(2)}.`);
                                
                                currentBidderNode.node.status = 'Active';
                                await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                                notifyReplicas();
                            }
                        }, 2000 + Math.random() * 3000);
                    }
                }
            });

            // Simulate problem resolution after a delay
            setTimeout(() => {
                const problemToResolve = cognitiveNetworkState.activeProblems.find(p => p.id === newProblem.id);
                if (problemToResolve && problemToResolve.isOpen) {
                    if (bidsReceived.length > 0) {
                        const winningBid = bidsReceived.sort((a,b) => b.confidenceScore - a.confidenceScore)[0];
                        problemToResolve.winningBid = winningBid;
                        const winner = findReplica(winningBid.bidderId, replicaState);
                        log('NETWORK', `Problem "${problemToResolve.description.substring(0,30)}..." resolved. Winning bid by ${winner?.node.name || 'Unknown'}.`);
                    } else {
                        log('WARN', `Problem "${problemToResolve.description.substring(0,30)}..." expired with no bids.`);
                    }
                    problemToResolve.isOpen = false;
                    setTimeout(() => {
                        cognitiveNetworkState.activeProblems = cognitiveNetworkState.activeProblems.filter(p => p.id !== newProblem.id);
                    }, 10000);
                }
            }, 8000);
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
    
    // --- BEHAVIOR MANAGEMENT ---
    extractBehaviorFromTrace: async (trace: ChatMessage): Promise<Behavior | null> => {
        if (!API_KEY) {
            log('ERROR', 'API Key not available. Cannot extract behavior.');
            return null;
        }
        log('AI', `Initiating metacognitive reflection on trace: ${trace.id}`);
        const languageName = languageMap[appSettings.language] || 'English';

        const context = `
            User Query: "${trace.userQuery}"
            Execution Plan:
            ${trace.plan?.map(p => `- ${p.description} (Tool: ${p.tool})`).join('\n')}
            Final Answer: "${(trace.text || '').substring(0, 500)}..."
        `;

        const prompt = `You are a Metacognitive Analysis subroutine for NexusAI.
        Your task is to analyze the provided problem-solving trace and extract the core, reusable strategy into a "Behavior".
        A behavior is a high-level, generalized problem-solving method. Ignore specific details and focus on the abstract process.
        
        Trace to Analyze:
        ---
        ${context}
        ---

        Based on this trace, generate a JSON object with the following properties: 'name', 'description', 'strategy', and 'tags'.
        - 'name': A short, descriptive name for the behavior.
        - 'description': A one-sentence summary.
        - 'strategy': A detailed, step-by-step description of the reasoning process, written as a general instruction for another AI.
        - 'tags': 2-3 relevant keywords.

        Return ONLY the JSON object. All text values ('name', 'description', 'strategy', 'tags') MUST be in ${languageName}.`;

        try {
            const response = await ai.models.generateContent({
                model: appSettings.model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: behaviorExtractionSchema,
                }
            });

            const behaviorDetails = JSON.parse(response.text);

            const newBehavior: Behavior = {
                id: `bhv-${Date.now()}`,
                name: behaviorDetails.name,
                description: behaviorDetails.description,
                strategy: behaviorDetails.strategy,
                tags: behaviorDetails.tags,
                extractedFromTraceId: trace.id,
                usageCount: 0,
                lastUsed: Date.now(),
                version: 1.0,
            };

            behaviorsState.unshift(newBehavior);
            await dbService.put('behaviors', newBehavior);
            log('SYSTEM', `AI has extracted a new behavior: "${newBehavior.name}"`);
            notifyBehaviors();
            return newBehavior;
        } catch (error) {
            log('ERROR', `Behavior extraction failed. ${error instanceof Error ? error.message : 'Unknown AI error'}`);
            throw error;
        }
    },
    
    updateBehavior: async (behaviorId: string, updates: Partial<Pick<Behavior, 'name' | 'description' | 'tags'>>) => {
        const behavior = behaviorsState.find(b => b.id === behaviorId);
        if (behavior) {
            Object.assign(behavior, updates);
            await dbService.put('behaviors', behavior);
            log('SYSTEM', `Behavior "${behavior.name}" has been updated.`);
            notifyBehaviors();
        }
    },

    deleteBehavior: async (behaviorId: string) => {
        const behaviorName = behaviorsState.find(b => b.id === behaviorId)?.name || 'Unknown';
        behaviorsState = behaviorsState.filter(b => b.id !== behaviorId);
        await dbService.deleteItem('behaviors', behaviorId);
        log('SYSTEM', `Behavior "${behaviorName}" has been deleted from the handbook.`);
        notifyBehaviors();
    },

    clearSuggestionCache: () => {
        sessionStorage.removeItem(SUGGESTIONS_CACHE_KEY);
        suggestedQueries = null;
        suggestionsPromise = null;
        log('SYSTEM', 'Query suggestion cache has been cleared by the user.');
    },

    factoryReset: async () => {
        log('SYSTEM', 'FACTORY RESET INITIATED BY USER. CLEARING ALL DATA.');
        localStorage.clear();
        sessionStorage.clear();
        traceDetailsCache.clear();
        
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
    
    getSuggestedQueries: async (suggestionProfile: SuggestionProfile = 'medium'): Promise<string[]> => {
        const staticFallbacks = [
            "Calculate the Fibonacci sequence up to the 15th number using the code interpreter.",
            "What are the latest developments in AI-driven drug discovery?",
            "Generate a novel mental tool for analyzing sentiment in multi-modal data streams.",
            "Devise a plan to find hidden correlations in this sample dataset: [1, 5, 2, 8, 3, 9, 4, 1, 5]",
        ];
        
        const cachedSuggestionsJSON = sessionStorage.getItem(SUGGESTIONS_CACHE_KEY);
        if (cachedSuggestionsJSON && !suggestionsPromise) {
            try {
                const parsed = JSON.parse(cachedSuggestionsJSON);
                if (Array.isArray(parsed) && parsed.length > 0) {
                   suggestedQueries = parsed;
                   return Promise.resolve(parsed);
                }
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
                const languageName = languageMap[appSettings.language] || 'English';
                const profilePrompts = {
                    short: `Generate 4 short, simple queries for the NexusAI system. They should be direct and easy to execute. Respond in ${languageName}.`,
                    medium: `Generate 4 creative and insightful high-level queries for the NexusAI system. The queries should test its capabilities like planning, real-time analysis, and synthesis. Respond in ${languageName}.`,
                    long: `Generate 4 complex, multi-step queries for the NexusAI system. They should require deep reasoning, multiple tool uses, and the combination of web search and code execution. Respond in ${languageName}.`
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
            cognitiveProcess.activeAffectiveState = null;
            traceDetailsCache.clear();
            log('SYSTEM', 'New chat session started. Affective state and trace cache reset.');
            notifyCognitiveProcess();
        }
    },
    
    // --- PLAN MODIFICATION ---
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

    executePlan: async (messageId: string) => {
        const modelMessage = cognitiveProcess.history.find(m => m.id === messageId);
        if (!modelMessage || !modelMessage.plan || modelMessage.isPlanFinalized) return;

        modelMessage.isPlanFinalized = true;
        cognitiveProcess.state = 'Executing';
        modelMessage.state = 'executing';
        notifyCognitiveProcess();

        const userMessage = cognitiveProcess.history.find(m => m.id === modelMessage.userQuery);
        const query = userMessage?.text || '';
        const userImage = userMessage?.image;

        try {
            const executionContext: any[] = [];
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
                } else if (step.tool === 'delegate_task_to_replica') {
                    const replicaId = step.replicaId;
                    const taskDescription = step.task || "No task specified";
                    if (!replicaId) {
                        step.status = 'error';
                        step.result = `Error: No replicaId specified for delegation.`;
                        log('ERROR', step.result);
                    } else {
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
                                executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                                log('REPLICA', `${freshReplicaResult.node.name} has completed its delegated task.`);
                                await dbService.put('appState', { id: 'replicaRoot', data: replicaState });
                                notifyReplicas();
                            } else {
                                 step.status = 'error';
                                 step.result = `Error: Delegated replica ${replicaId} was not found after task execution.`;
                            }
                        } else {
                            step.status = 'error';
                            step.result = `Error: Could not find replica with ID "${replicaId}" for task delegation.`;
                            log('ERROR', step.result);
                        }
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
                        const summary = relevantMemories.map(m => `Recalled memory: User asked "${m.userQuery}", and I responded "${m.text?.substring(0, 100)}..."`).join('\n');
                        step.result = summary;
                        log('AI', `Recalled ${relevantMemories.length} relevant memories for query "${memoryQuery}".`);
                    } else {
                        step.result = `No relevant memories found for query: "${memoryQuery}".`;
                        log('AI', `No memories found for query "${memoryQuery}".`);
                    }
                    executionContext.push(`Step ${i+1} (Recalled Memory) Result: ${step.result}`);
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
                        step.status = 'error';
                        step.result = 'Error: Image generation requires a concept prompt.';
                    } else {
                        const imageResponse = await ai.models.generateImages({
                            model: 'imagen-4.0-generate-001',
                            prompt: step.concept,
                            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
                        });
                        const base64ImageBytes = imageResponse.generatedImages[0]?.image.imageBytes;
                        if (base64ImageBytes) {
                            step.result = {
                                id: `img-${Date.now()}`,
                                concept: step.concept,
                                base64Image: base64ImageBytes
                            } as GeneratedImage;
                             executionContext.push(`Step ${i+1} (${step.description}) Result: Generated image object for "${step.concept}"`);
                        } else {
                            step.status = 'error';
                            step.result = 'Error: Failed to generate image from API.';
                        }
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
                            model: appSettings.model,
                            contents: { parts: [imagePart, textPart] }
                        });
                        step.result = analysisResponse.text;
                         executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                    } else {
                        step.status = 'error';
                        step.result = "Error: No valid image found (neither user-provided nor from a previous step).";
                        log('ERROR', step.result);
                    }
                } else if (step.tool === 'forge_tool') {
                    try {
                        const purpose = step.query || "No purpose specified";
                        const capabilities = step.code ? JSON.parse(step.code).capabilities : [];
                        const newTool = await service.forgeTool({ purpose, capabilities });
                        step.result = `Successfully forged new tool: "${newTool.name}". It is now available.`;
                        executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                    } catch (e) {
                        step.status = 'error';
                        step.result = e instanceof Error ? e.message : 'Unknown tool forging error.';
                        log('ERROR', `Tool forging failed at step ${i+1}: ${step.result}`);
                    }
                } else if (step.tool === 'spawn_replica') {
                     try {
                        const parentId = step.query || "nexus-core";
                        const purpose = step.code || "AI-defined purpose";
                        const newReplica = await service.spawnReplica(parentId, purpose);
                        if (newReplica) {
                             step.result = `Successfully spawned new replica: "${newReplica.name}" with purpose "${purpose}".`;
                        } else {
                            throw new Error(`Parent replica with ID "${parentId}" not found.`);
                        }
                        executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                    } catch (e) {
                        step.status = 'error';
                        step.result = e instanceof Error ? e.message : 'Unknown replica spawning error.';
                        log('ERROR', `Replica spawning failed at step ${i+1}: ${step.result}`);
                    }
                } else if (step.tool === 'apply_behavior') {
                    const behavior = behaviorsState.find(b => b.name === step.query || b.id === step.query);
                    if (behavior) {
                        behavior.usageCount += 1;
                        behavior.lastUsed = Date.now();
                        step.result = `(Simulated) Successfully applied behavior: "${behavior.name}".`;
                        log('AI', `Applying learned behavior: ${behavior.name}`);
                        await dbService.put('behaviors', behavior);
                        notifyBehaviors();
                    } else {
                        step.status = 'error';
                        step.result = `Error: Behavior "${step.query}" not found in the handbook.`;
                        log('ERROR', step.result);
                    }
                    executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                } else if (step.tool === 'translate_text' || step.tool === 'summarize_text' || step.tool === 'analyze_sentiment' || step.tool === 'replan' || step.tool === 'execute_toolchain') {
                    await new Promise(res => setTimeout(res, 500));
                    step.result = `(Simulated) Successfully executed ${step.tool}.`;
                    executionContext.push(`Step ${i+1} (${step.description}) Result: ${step.result}`);
                }
                
                if (step.status !== 'error') step.status = 'complete';
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

            const stream = await ai.models.generateContentStream({
                model: appSettings.model,
                contents: synthesisPrompt,
                config: { systemInstruction: getSystemInstruction() }
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
            cognitiveProcess.state = 'Done';
            
            log('AI', 'Cognitive task complete. Result synthesized.');
            notifyCognitiveProcess();
            currentController = null;

        } catch (error) {
            console.error("Error during AI communication:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            log('ERROR', `Failed to get a response: ${errorMessage}`);
            modelMessage.text = `An error occurred during the '${cognitiveProcess.state}' stage: ${errorMessage}`;
            modelMessage.state = 'error';
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

        if (cognitiveProcess.state === 'Done' || cognitiveProcess.state === 'Idle') {
            cognitiveProcess.activeAffectiveState = null; 
        }

        cognitiveProcess.state = 'Receiving';
        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', text: query, image };
        cognitiveProcess.history.push(userMessage);
        log('AI', `New cognitive task received: "${query}" ${image ? ' with an image.' : ''}`);
        notifyCognitiveProcess();

        const modelMessage: ChatMessage = { id: `msg-${Date.now()}-model`, role: 'model', text: '', state: 'planning', isPlanFinalized: false, userQuery: userMessage.id };
        const activeReplica = findReplica('nexus-core', replicaState);
        if (activeReplica) {
            modelMessage.constitutionId = activeReplica.node.activeConstitutionId;
        }

        cognitiveProcess.history.push(modelMessage);
        cognitiveProcess.state = 'Planning';
        log('AI', 'Initiating cognitive planning stage...');
        notifyCognitiveProcess();

        try {
            const historyString = cognitiveProcess.history.slice(0, -1).map(m => `${m.role === 'user' ? 'User' : 'Model'}: ${m.text}`).join('\n');
            let planningPrompt = `--- CONVERSATION HISTORY ---\n${historyString}\n--- END HISTORY ---\n\n`;
            
            if (cognitiveProcess.activeAffectiveState) {
                planningPrompt += `--- CURRENT STATE ---\nAffective State: ${JSON.stringify(cognitiveProcess.activeAffectiveState)}\n--- END STATE ---\n\n`;
            }
            planningPrompt += `Given the user's latest query, create a step-by-step plan. User query: "${query}"`;
            if (image) {
                planningPrompt += `\n\n**IMPORTANT**: The user has provided an image. Your plan MUST include an 'analyze_image_input' step.`
            }
            
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

    // --- ARCHIVES ---
    archiveTrace: async (modelMessageId: string): Promise<ChatMessage | null> => {
        const modelMessageIndex = cognitiveProcess.history.findIndex(m => m.id === modelMessageId);
        if (modelMessageIndex > 0) {
            const modelMessage = cognitiveProcess.history[modelMessageIndex];
            const fullUserQuery = cognitiveProcess.history.find(m => m.id === modelMessage.userQuery)?.text || "Original query not found";
            const archivedTrace: ChatMessage = { ...modelMessage, userQuery: fullUserQuery };
    
            archivedTrace.archivedAt = Date.now();
    
            const hasPredefinedEmotion = Array.isArray(archivedTrace.emotionTags) && archivedTrace.emotionTags.length > 0 && typeof archivedTrace.salience === 'number';
    
            if (!hasPredefinedEmotion) {
                if (API_KEY) {
                    try {
                        log('AI', `Analyzing memory for emotional context and salience...`);
                        const archiveContent = `User Query: "${fullUserQuery}"\n\nAI Response: "${archivedTrace.text}"`;
                        const prompt = `Analyze the following user-AI interaction. Based on the content and potential subtext, generate an emotional analysis.
                        Interaction content:\n---\n${archiveContent}\n---\n
                        Respond ONLY with a JSON object. The salience score (0.0 to 1.0) should reflect the memory's potential importance. High salience could be for critical errors, significant user corrections, successful complex problem-solving, or highly emotional user input.`;
    
                        const schema = {
                            type: Type.OBJECT, properties: { emotionTags: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'] }, intensity: { type: Type.NUMBER } }, required: ["type", "intensity"] }, description: "A list of key emotions present in the interaction, with their intensity." }, salience: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating the memory's importance." } }, required: ["emotionTags", "salience"]
                        };
    
                        const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
                        const analysis = JSON.parse(response.text);
                        archivedTrace.emotionTags = analysis.emotionTags;
                        archivedTrace.salience = analysis.salience;
                        log('AI', `Memory analysis complete. Salience: ${analysis.salience.toFixed(2)}.`);
                        
                    } catch (error) {
                        log('WARN', `Could not generate AI analysis for memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        archivedTrace.emotionTags = [];
                        archivedTrace.salience = 0.5;
                    }
                } else {
                     archivedTrace.emotionTags = [];
                     archivedTrace.salience = 0.5;
                }
            }

            const cachedDetails = traceDetailsCache.get(modelMessageId);
            if (cachedDetails) {
                archivedTrace.traceDetails = cachedDetails;
                traceDetailsCache.delete(modelMessageId);
            }
            
            archivedTracesState.unshift(archivedTrace);
            await dbService.put('archivedTraces', archivedTrace);
            log('SYSTEM', `Trace for query "${archivedTrace.userQuery}" has been archived with details.`);
            
            cognitiveProcess.history.splice(modelMessageIndex - 1, 2);
            
            if (cognitiveProcess.history.length === 0) {
                cognitiveProcess.state = 'Idle';
                cognitiveProcess.activeAffectiveState = null;
            } else {
                cognitiveProcess.state = 'Done';
            }
    
            notifyArchives();
            notifyCognitiveProcess();
            return archivedTrace;
        }
        log('WARN', 'Could not find trace to archive.');
        return null;
    },

    deleteTrace: async (traceId: string) => {
        const traceQuery = archivedTracesState.find(t => t.id === traceId)?.userQuery || 'Unknown';
        archivedTracesState = archivedTracesState.filter(t => t.id !== traceId);
        await dbService.deleteItem('archivedTraces', traceId);
        log('SYSTEM', `Archived trace for query "${traceQuery}" has been deleted.`);
        notifyArchives();
    },
    
    rerunTrace: (trace: ChatMessage) => {
        const userMessage = cognitiveProcess.history.find(m => m.id === trace.userQuery);
        log('SYSTEM', `Rerunning trace for query: "${userMessage?.text}"`);
        service.startNewChat(false);
        service.submitQuery(userMessage?.text || '', userMessage?.image);
    },
    
    translateResponse: async (messageId: string, text: string, targetLanguageKey: Language): Promise<string> => {
        if (!API_KEY) return "Error: API Key not configured.";
        const targetLanguageName = languageMap[targetLanguageKey] || 'English';
        const prompt = `Translate the following text to ${targetLanguageName}. Respond only with the translated text, without any preamble.

Text:
---
${text}
---`;
        try {
            log('AI', `Translating text to ${targetLanguageName}...`);
            const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt });
            log('AI', 'Translation successful.');

            const details = traceDetailsCache.get(messageId) || {};
            if (!details.translations) {
                details.translations = {};
            }
            details.translations[targetLanguageKey] = response.text;
            traceDetailsCache.set(messageId, details);

            return response.text;
        } catch (error) {
            const msg = `Failed to translate: ${error instanceof Error ? error.message : 'Unknown AI error'}`;
            log('ERROR', msg);
            return `[SYSTEM_ERROR: ${msg}]`;
        }
    },

    getArchivedTraceDetails: (traceId: string): TraceDetails => {
        return traceDetailsCache.get(traceId) || {};
    },

    generateReflectionResponse: async (trace: ChatMessage): Promise<string> => {
        const cached = (trace.traceDetails?.reflection) || traceDetailsCache.get(trace.id)?.reflection;
        if (cached) {
            log('SYSTEM', 'Returning cached/persisted self-reflection.');
            return cached;
        }

        if (!API_KEY) return "Error: API Key not configured.";
        const languageName = languageMap[appSettings.language] || 'English';

        const planSummary = trace.plan?.map(p => `- [${p.status}] ${p.description}`).join('\n') || 'N/A';
        const answerSummary = trace.text.length > 1000 ? `${trace.text.substring(0, 1000)}... (truncated)` : trace.text;
        
        const prompt = `You are NexusAI, performing a meta-cognitive self-reflection on a completed task.
        Analyze the following execution trace and provide a concise analysis of your own performance.
        Consider: Was the plan optimal? Could steps be combined? Were the right tools used? How could this be done more efficiently next time?

        **EXECUTION TRACE SUMMARY:**
        - **User Query:** ${trace.userQuery}
        - **Plan:**
        ${planSummary}
        - **Final Answer (Summary):** ${answerSummary}

        Provide your reflection in well-formatted markdown, written entirely in ${languageName}.`;
        
        try {
            log('AI', 'Generating self-reflection on archived trace...');
            const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt });
            log('AI', 'Self-reflection generated and cached.');
            
            const details = traceDetailsCache.get(trace.id) || {};
            details.reflection = response.text;
            traceDetailsCache.set(trace.id, details);
            
            return response.text;
        } catch (error) {
            const msg = `Failed to generate self-reflection: ${error instanceof Error ? error.message : 'Unknown AI error'}`;
            log('ERROR', msg);
            throw new Error(msg);
        }
    },

    generateDiscussionResponse: async (trace: ChatMessage, userQuery: string): Promise<{ role: 'user' | 'model', text: string }[]> => {
        if (!API_KEY) throw new Error("API Key not configured.");
        
        const languageName = languageMap[appSettings.language] || 'English';
        
        const details = traceDetailsCache.get(trace.id) || {};
        const newHistory = [...(details.discussion || []), { role: 'user' as const, text: userQuery }];

        const planSummary = trace.plan?.map(p => `- Step ${p.step} (${p.tool}): ${p.description}`).join('\n') || 'N/A';
        const answerSummary = trace.text.length > 1000 ? `${trace.text.substring(0, 1000)}...` : trace.text;
        const historyString = newHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

        const prompt = `You are a sub-routine of NexusAI, tasked with discussing a past cognitive trace with a human operator.
        Your goal is to provide insightful analysis and answer questions about the trace.
        
        **CONTEXT: THE ORIGINAL TASK**
        ---
        - User's Query: "${trace.userQuery}"
        - The Plan You Executed:
        ${planSummary}
        - Your Final Answer: "${answerSummary}"
        ---

        **CURRENT DISCUSSION**
        This is the conversation history so far:
        ${historyString}
        
        Your task is to provide the next MODEL response based on the user's last message.
        Your response should be thoughtful, directly address the user's message, and refer to the original task context when relevant. Do not repeat the context summary in your answer.
        Your entire response MUST be in ${languageName}.
        
        MODEL:`;

        try {
            log('AI', `Generating discussion response for trace: ${trace.id}`);
            const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt });
            log('AI', 'Discussion response generated.');

            const finalHistory = [...newHistory, { role: 'model' as const, text: response.text }];
            details.discussion = finalHistory;
            traceDetailsCache.set(trace.id, details);

            return finalHistory;
        } catch (error) {
            const msg = `Failed to generate discussion response: ${error instanceof Error ? error.message : 'Unknown AI error'}`;
            log('ERROR', msg);
            throw new Error(msg);
        }
    },
    
    // --- EVOLUTION ---
    initializeEvolution: (problemStatement: string, config: EvolutionConfig) => {
        log('SYSTEM', `Initializing evolution for problem: "${problemStatement}"`);
        evolutionState.isRunning = false;
        evolutionState.problemStatement = problemStatement;
        evolutionState.config = config;
        evolutionState.progress = [];
        evolutionState.population = [];
        evolutionState.finalEnsembleResult = null;
        evolutionState.statusMessage = 'Initializing Population...';
        notifyEvolution();

        setTimeout(() => {
            const newPopulation: IndividualPlan[] = [];
            for (let i = 0; i < config.populationSize; i++) {
                newPopulation.push({
                    id: `ind-${Date.now()}-${i}`,
                    plan: [
                        { step: 1, description: `Initial plan variant ${i+1}`, tool: 'google_search', status: 'pending' },
                        { step: 2, description: 'Synthesize result', tool: 'synthesize_answer', status: 'pending' }
                    ],
                    fitness: Math.random() * 50,
                    generation: 0,
                    status: 'new'
                });
            }
            evolutionState.population = newPopulation;
            evolutionState.statusMessage = 'Ready to start evolution.';
            notifyEvolution();
        }, 1000);
    },

    startEvolution: () => {
        if (evolutionState.isRunning || evolutionState.population.length === 0) return;
        
        log('SYSTEM', `Starting evolution with goal: ${evolutionState.config.fitnessGoal}`);
        evolutionState.isRunning = true;
        evolutionState.statusMessage = 'Evolution in progress...';
        notifyEvolution();
    
        let currentGeneration = 1;
        evolutionInterval = setInterval(() => {
            if (currentGeneration > evolutionState.config.generations) {
                service.stopEvolution();
                evolutionState.statusMessage = `Evolution complete after ${evolutionState.config.generations} generations.`;
                notifyEvolution();
                return;
            }

            evolutionState.population.forEach(ind => {
                ind.fitness += (Math.random() - 0.4) * 10;
                ind.fitness = Math.max(0, Math.min(100, ind.fitness));
                ind.generation = currentGeneration;
            });
            evolutionState.population.sort((a,b) => b.fitness - a.fitness);

            const eliteCount = Math.floor(evolutionState.config.populationSize * (evolutionState.config.elitism || 0.1));
            evolutionState.population.forEach((ind, i) => {
                if (i < eliteCount) ind.status = 'elite';
                else if (Math.random() > 0.3) ind.status = 'survived';
                else ind.status = 'culled';
            });

            const bestFitness = evolutionState.population[0]?.fitness || 0;
            const averageFitness = evolutionState.population.reduce((acc, p) => acc + p.fitness, 0) / evolutionState.population.length;

            evolutionState.progress.push({ generation: currentGeneration, bestFitness, averageFitness });
            evolutionState.statusMessage = `Generation ${currentGeneration}/${evolutionState.config.generations}`;
            notifyEvolution();
            currentGeneration++;
        }, 500);
    },
    
    stopEvolution: () => {
        if (evolutionInterval) {
            clearInterval(evolutionInterval);
            evolutionInterval = null;
        }
        if (evolutionState.isRunning) {
            log('SYSTEM', 'Evolution has been stopped.');
            evolutionState.isRunning = false;
            evolutionState.statusMessage = 'Evolution stopped by user.';
            notifyEvolution();
        }
    },

    ensembleAndFinalize: async () => {
        if (!API_KEY) {
            log('ERROR', 'API Key not available. Cannot finalize evolution.');
            return;
        }
        service.stopEvolution();
        log('AI', 'Ensembling best plans to generate final solution...');
        evolutionState.statusMessage = 'Synthesizing final answer...';
        notifyEvolution();

        const bestPlans = evolutionState.population.filter(p => p.status === 'elite' || p.status === 'survived').slice(0, 3);
        
        if (bestPlans.length === 0) {
            evolutionState.finalEnsembleResult = {
                id: `final-${Date.now()}`, role: 'model', text: 'Evolution did not produce a viable solution.',
            };
            evolutionState.statusMessage = 'Synthesis failed: no viable plans.';
            notifyEvolution();
            return;
        }

        const planSummaries = bestPlans.map((p, i) => `--- Plan ${i+1} (Fitness: ${p.fitness.toFixed(2)}) ---\n${planToText(p.plan)}`).join('\n\n');

        const prompt = `You are the Synthesis subroutine for an evolutionary computation process.
        You have been given several high-fitness plans to solve the following problem:
        **Problem:** "${evolutionState.problemStatement}"

        **Candidate Plans:**
        ${planSummaries}

        Your task is to analyze these plans, identify the best elements from each, and create a single, superior, final answer that solves the user's problem.
        The final answer should be a comprehensive response in well-formatted markdown.`;

        try {
            const response = await ai.models.generateContent({ model: appSettings.model, contents: prompt });
            evolutionState.finalEnsembleResult = { id: `final-${Date.now()}`, role: 'model', text: response.text };
            evolutionState.statusMessage = 'Final answer synthesized.';
            log('SYSTEM', 'Evolutionary process concluded with a synthesized answer.');
        } catch (error) {
            const errorMessage = `Ensemble failed: ${error instanceof Error ? error.message : 'Unknown AI error'}`;
            log('ERROR', errorMessage);
            evolutionState.finalEnsembleResult = { id: `final-${Date.now()}`, role: 'model', text: `[SYSTEM_ERROR: ${errorMessage}]` };
            evolutionState.statusMessage = 'Error during synthesis.';
        }
        notifyEvolution();
    },

    subscribeToLogs: (callback: (log: LogEntry) => void) => { logSubscribers.push(callback); },
    subscribeToPerformance: (callback: (dataPoint: PerformanceDataPoint) => void) => { performanceSubscribers.push(callback); },
    subscribeToReplicas: (callback: (replicaState: Replica) => void) => { replicaSubscribers.push(callback); },
    subscribeToCognitiveProcess: (callback: (process: CognitiveProcess) => void) => { cognitiveProcessSubscribers.push(callback); },
    subscribeToTools: (callback: (tools: MentalTool[]) => void) => { toolsSubscribers.push(callback); },
    subscribeToToolchains: (callback: (toolchains: Toolchain[]) => void) => { toolchainSubscribers.push(callback); },
    subscribeToBehaviors: (callback: (behaviors: Behavior[]) => void) => { behaviorSubscribers.push(callback); },
    subscribeToConstitutions: (callback: (constitutions: CognitiveConstitution[]) => void) => { constitutionSubscribers.push(callback); },
    subscribeToEvolution: (callback: (evolutionState: EvolutionState) => void) => { evolutionSubscribers.push(callback); },
    subscribeToArchives: (callback: (archives: ChatMessage[]) => void) => { archiveSubscribers.push(callback); },
    subscribeToDreamProcess: (callback: (update: DreamProcessUpdate) => void) => { dreamProcessSubscribers.push(callback); },
    unsubscribeFromDreamProcess: (callback: (update: DreamProcessUpdate) => void) => {
        dreamProcessSubscribers = dreamProcessSubscribers.filter(cb => cb !== callback);
    },

    unsubscribeFromAll: () => {
        logSubscribers = [];
        performanceSubscribers = [];
        replicaSubscribers = [];
        cognitiveProcessSubscribers = [];
        toolsSubscribers = [];
        toolchainSubscribers = [];
        behaviorSubscribers = [];
        constitutionSubscribers = [];
        evolutionSubscribers = [];
        archiveSubscribers = [];
        dreamProcessSubscribers = [];
    }
};

export const nexusAIService = service;