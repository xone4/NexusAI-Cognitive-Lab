import type { CognitiveMetricStep, CognitiveTrajectory } from '../types';

// --- Embedding Simulation ---

// Simple string hash function for seeding
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Seedable pseudo-random number generator
function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

const embeddingCache = new Map<string, number[]>();
const EMBEDDING_DIM = 128;

export const getEmbedding = (text: string): number[] => {
    const cacheKey = text.substring(0, 1000); // Use a substring to avoid huge keys
    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey)!;
    }

    const seed = simpleHash(text);
    const vector = Array.from({ length: EMBEDDING_DIM }, (_, i) => seededRandom(seed + i) - 0.5);
    
    // Normalize the vector to have a magnitude of 1
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalized = vector.map(v => v / (magnitude || 1));

    embeddingCache.set(cacheKey, normalized);
    return normalized;
};


// --- Geometric Calculations ---

const subtract = (v1: number[], v2: number[]): number[] => v1.map((val, i) => val - v2[i]);
const norm = (v: number[]): number => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));

export const calculateVelocity = (p1: number[], p2: number[]): number[] => subtract(p2, p1);
export const calculateDistance = (p1: number[], p2: number[]): number => norm(subtract(p2, p1));

export const calculateMengerCurvature = (p1: number[], p2: number[], p3: number[]): number => {
    const a = norm(subtract(p2, p3));
    const b = norm(subtract(p1, p3));
    const c = norm(subtract(p1, p2));

    if (a === 0 || b === 0 || c === 0) return 0;

    // Area of the triangle using Heron's formula
    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    
    const denominator = a * b * c;
    if (denominator === 0) return 0;
    
    // Curvature is 4 * Area / (a * b * c)
    return (4 * area) / denominator;
};

// --- Trajectory Analysis ---

export const analyzeTrajectory = (steps: { thought: string, position: number[] }[]): CognitiveTrajectory => {
    const metricSteps: CognitiveMetricStep[] = [];
    let totalDistance = 0;

    for (let i = 0; i < steps.length; i++) {
        const p_current = steps[i].position;
        let velocity = 0;
        let curvature = 0;
        
        if (i > 0) {
            const p_prev = steps[i-1].position;
            velocity = norm(calculateVelocity(p_prev, p_current));
            totalDistance += velocity;
        }

        if (i > 1) {
            const p_prev1 = steps[i-2].position;
            const p_prev2 = steps[i-1].position;
            curvature = calculateMengerCurvature(p_prev1, p_prev2, p_current);
        }
        
        metricSteps.push({
            step: i + 1,
            thought: steps[i].thought,
            position: p_current,
            velocity,
            curvature
        });
    }

    const validVelocities = metricSteps.slice(1).map(s => s.velocity).filter(v => !isNaN(v));
    const validCurvatures = metricSteps.slice(2).map(s => s.curvature).filter(c => !isNaN(c));

    const summary = {
        avgVelocity: validVelocities.length > 0 ? validVelocities.reduce((a, b) => a + b, 0) / validVelocities.length : 0,
        avgCurvature: validCurvatures.length > 0 ? validCurvatures.reduce((a, b) => a + b, 0) / validCurvatures.length : 0,
        maxCurvature: validCurvatures.length > 0 ? Math.max(...validCurvatures) : 0,
        totalDistance: totalDistance,
        pathLength: metricSteps.length,
    };
    
    return { steps: metricSteps, summary };
};