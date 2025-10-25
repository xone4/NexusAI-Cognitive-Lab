import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { nexusAIService } from './nexusAIService';
import type { ActiveView } from '../types';

let service: typeof nexusAIService;
const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });

const controlUiFunctions: FunctionDeclaration[] = [
    {
        name: 'navigateTo',
        description: 'Navigate to a different view in the application to inspect or manage a specific system.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                view: { type: Type.STRING, enum: ['dashboard', 'replicas', 'tools', 'architecture', 'analysis', 'settings', 'evolution', 'memory', 'dreaming', 'world_model', 'modalities_lab', 'simulation_lab', 'evaluation'] },
            },
            required: ['view']
        }
    },
    {
        name: 'startDreaming',
        description: 'Initiate a cognitive dreaming cycle to analyze past experiences and derive new high-level directives for self-improvement.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'runSystemAnalysis',
        description: 'Run an AI-driven analysis on the current system state to identify potential issues or suggest improvements.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'spawnReplica',
        description: 'Create a new sub-cognitive replica to handle a new specialized task area. Only do this if a clear, unmet need is identified.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                parentId: { type: Type.STRING, description: 'The ID of the parent replica, usually "nexus-core".' },
                purpose: { type: Type.STRING, description: 'A clear, concise purpose for the new replica.' }
            },
            required: ['parentId', 'purpose']
        }
    }
];

const runMetaCognitiveCycle = async () => {
    if (!service || !API_KEY) return;

    try {
        service.setAutonomousState('Analyzing...', 'Gathering system state snapshot.');
        const snapshot = service.getSnapshot();
        const stateReport = JSON.stringify({
            replicas: snapshot.replicaState,
            tools: snapshot.toolsState,
            playbookSize: snapshot.playbookState.length,
            memorySize: snapshot.archivedTracesState.length,
            cognitiveState: snapshot.cognitiveProcess.state,
            settings: snapshot.appSettings
        }, null, 2);

        let highLevelGoal = `Your primary meta-goal is to explore and improve. Analyze the current state of the NexusAI Cognitive Lab and choose one single, concrete action. Prioritize actions that provide new insights or break repetitive patterns. Avoid getting stuck in unproductive loops; if a line of inquiry seems stalled, pivot to a new one. Do not perform the same action repeatedly. Your current analysis shows the cognitive state is: ${snapshot.cognitiveProcess.state}.`;
        
        const lastAction = service.getLastAutonomousAction();
        if (lastAction) {
            const timeSince = ((Date.now() - lastAction.timestamp) / 1000).toFixed(0);
            highLevelGoal += `\n\n**Self-Correction Note:** My last autonomous action was '${lastAction.name}' about ${timeSince} seconds ago. I must avoid repeating this exact action and choose a different exploratory path to ensure diverse analysis.`;
        }


        if (snapshot.cognitiveProcess.state === 'Idle' || snapshot.cognitiveProcess.state === 'Done') {
            highLevelGoal += `

The system is idle. This is an opportunity for self-reflection and exploration. I should consider:
- **Analyzing my toolchain:** Is there an underutilized tool I could explore? (Action: \`navigateTo('analysis')\`)
- **Exploring my memories:** Can I find less salient memories to re-evaluate or learn from? (Action: \`navigateTo('memory')\`)
- **Initiating a 'dream cycle':** Should I synthesize my recent experiences to derive new strategies? (Action: \`startDreaming()\`)
Your task is to choose one such exploratory action.`;
        }


        service.setAutonomousState(highLevelGoal, 'Sending state report to Gemini for analysis...');
        
        const response = await ai.models.generateContent({
            model: snapshot.appSettings.model,
            contents: `System State Report:\n${stateReport}\n\nObjective: ${highLevelGoal}`,
            config: {
                tools: [{ functionDeclarations: controlUiFunctions }],
            },
        });

        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
            service.setAutonomousState(highLevelGoal, "No action decided. Will reassess.");
            return;
        }

        const call = functionCalls[0];
        const { name, args } = call;
        
        service.setLastAutonomousAction(name, args);

        service.setAutonomousState(highLevelGoal, `Executing command: ${name}(${JSON.stringify(args)})`);

        switch (name) {
            case 'navigateTo':
                service.navigateTo(args.view as ActiveView);
                break;
            case 'startDreaming':
                // First navigate, then perform action
                service.navigateTo('dreaming');
                setTimeout(() => service.initiateDreamCycle(), 1000); // Delay to allow UI transition
                break;
            case 'runSystemAnalysis':
                service.navigateTo('analysis');
                // The analysis requires more complex interaction which is beyond the current scope
                // of simple function calls. For now, we'll just log it.
                service.log('AUTONOMOUS', 'AI decided to run system analysis. Manual execution required from UI.');
                break;
            case 'spawnReplica':
                service.navigateTo('replicas');
                setTimeout(() => service.spawnReplica(args.parentId as string, args.purpose as string), 1000);
                break;
            default:
                 service.log('WARN', `Autonomous agent tried to call unknown function: ${name}`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown AI error in meta-cognitive loop.";
        service.log('ERROR', `Autonomous agent cycle failed: ${errorMessage}`);
        service.setAutonomousState('Error occurred', 'See logs for details.');
    }
};

export const autonomousAgentService = {
    init: (nexusService: typeof nexusAIService) => {
        service = nexusService;
    },
    runMetaCognitiveCycle,
};