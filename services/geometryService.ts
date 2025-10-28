import { GoogleGenAI } from '@google/genai';
import type { CognitiveMetricStep, CognitiveTrajectory } from '../types';

// IMPORTANT: This would be populated by a secure mechanism in a real app
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    console.error("API_KEY environment variable not set. Geometric analysis will be impaired.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });


// --- Embedding Generation ---

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


const embeddingCache = new Map<string, number[]>();

export const getEmbedding = async (text: string): Promise<number[]> => {
    if (!text || text.trim() === "") {
        // Return a zero vector for empty strings to avoid API errors.
        return Array(768).fill(0); // Assuming text-embedding-004 has 768 dimensions
    }
    
    const cacheKey = String(simpleHash(text));

    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey)!;
    }

    if (!API_KEY) {
        console.warn("API_KEY not found, returning zero vector for embedding.");
        return Array(768).fill(0);
    }
    
    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });

        const embedding = response.embeddings[0].values;
        
        embeddingCache.set(cacheKey, embedding);
        return embedding;

    } catch (error) {
        console.error(`Failed to generate embedding for text: "${text.substring(0, 30)}..."`, error);
        // Return a zero vector on failure to prevent crashing consumers of this function.
        return Array(768).fill(0);
    }
};


// --- Geometric Calculations ---

const subtract = (v1: number[], v2: number[]): number[] => v1.map((val, i) => val - v2[i]);
const norm = (v: number[]): number => Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));

export const calculateVelocity = (p1: number[], p2: number[]): number[] => subtract(p2, p1);
export const calculateDistance = (p1: number[], p2: number[]): number => norm(subtract(p1, p2));

export const cosineSimilarity = (v1: number[], v2: number[]): number => {
    const dotProduct = v1.reduce((sum, a, i) => sum + a * v2[i], 0);
    const magnitude1 = norm(v1);
    const magnitude2 = norm(v2);
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
};


export const calculateMengerCurvature = (p1: number[], p2: number[], p3: number[]): number => {
    const a = norm(subtract(p2, p3));
    const b = norm(subtract(p1, p3));
    const c = norm(subtract(p1, p2));

    if (a === 0 || b === 0 || c === 0) return 0;

    // Area of the triangle using Heron's formula
    const s = (a + b + c) / 2;
    // Add a check for invalid triangle sides which can lead to NaN
    const areaContent = s * (s - a) * (s - b) * (s - c);
    if (areaContent < 0) return 0;
    const area = Math.sqrt(areaContent);
    
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

// --- Trajectory Similarity ---

/**
 * Calculates the Dynamic Time Warping distance between two series.
 * @param series1 First series of numbers.
 * @param series2 Second series of numbers.
 * @returns The DTW distance.
 */
function dtwDistance(series1: number[], series2: number[]): number {
    const n = series1.length;
    const m = series2.length;
    if (n === 0 || m === 0) return Infinity;
    
    const dtw = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
    dtw[0][0] = 0;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = Math.abs(series1[i - 1] - series2[j - 1]);
            const lastMin = Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
            dtw[i][j] = cost + lastMin;
        }
    }
    return dtw[n][m];
}

/**
 * Calculates a similarity score (0-1) between two cognitive trajectories based on their velocity sequences.
 * @param traj1 The first trajectory.
 * @param traj2 The second trajectory.
 * @returns A similarity score from 0 (dissimilar) to 1 (very similar).
 */
export function calculateTrajectorySimilarity(traj1: CognitiveTrajectory, traj2: CognitiveTrajectory): number {
    if (!traj1.steps || traj1.steps.length < 2 || !traj2.steps || traj2.steps.length < 2) {
        return 0;
    }

    // Extract velocity sequences, skipping the first step (velocity is 0)
    const velocity1 = traj1.steps.slice(1).map(s => s.velocity);
    const velocity2 = traj2.steps.slice(1).map(s => s.velocity);

    const distance = dtwDistance(velocity1, velocity2);

    // Normalize distance into a similarity score. This is a common method.
    // The result depends heavily on the scale of the distance, so this might need tuning.
    const similarity = 1 / (1 + distance);
    
    return similarity;
}