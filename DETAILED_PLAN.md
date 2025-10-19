# NexusAI Cognitive Lab 3.0: Detailed Development Plan

This document provides a detailed, technical breakdown of the development plan for NexusAI, expanding upon the phases outlined in the main [`README.md`](./README.md) file. It serves as a reference for the development team.

## Part 1: The Cognitive Navigation Paradigm - Detailed Implementation Plan

**Vision:** Shift from "task execution" as a series of text strings to "cognitive navigation" as a path through a conceptual space. This provides the mathematical tools to describe this path (position, velocity, curvature) and integrate these tools into every stage of the agent's operation.

---

### Phase 5: Recursive Cognition & Advanced Heuristics - ✅ Complete

**Goal:** Enable NexusAI to handle contexts that exceed the prompt window and solve complex problems by recursively breaking them down.

**Completed Implementation:**
*   **Sandbox Environment:** The `code_sandbox` tool has been created to provide a JavaScript environment with pre-loaded `context_data` for handling large datasets.
*   **Recursive Delegation:** The `spawn_cognitive_clone` tool has been added to delegate sub-problems and a portion of the context to a temporary, focused AI clone.
*   **Context Heuristics:** Tools like `peek_context` and `search_context` have been implemented to improve data exploration efficiency.

**Future Enhancements:**
1.  **Enhance Recursive Delegation Logic:**
    *   **Complex State Management:** Develop mechanisms to track the state of multiple, interconnected sub-problems across different recursion levels.
    *   **Multi-Level Recursion:** Enhance the AI's ability to perform recursive delegation beyond a single level, allowing cognitive clones to delegate further sub-tasks.
2.  **Teach Advanced Strategies for Data Chunking and Result Synthesis:**
    *   **Adaptive Context Chunking:** Develop algorithms that allow the AI to determine the best way to divide large data into small, processable chunks for cognitive clones.
    *   **Hierarchical Result Synthesis:** Design protocols for collecting and merging results from cognitive clones at different recursion levels.

---

### Phase 6: Cognitive Geometry & Trajectory Analysis - ✅ Complete

**Goal:** Integrate geometric trajectory tracking into the agent's core, transforming working memory into a vector log.

**Completed Implementation:**
*   **Updated Core Data Structures:** `ChatMessage` now includes `cognitiveTrajectory?: CognitiveTrajectory`. New types `CognitiveTrajectory`, `CognitiveMetricStep`, `CognitiveTrajectorySummary` are defined in `types.ts`.
*   **Embedding Extraction Unit:** `services/geometryService.ts` handles simulated embedding generation, ensuring deterministic vector creation for reproducibility.
*   **Geometric Analysis Unit:** `services/geometryService.ts` implements `calculateVelocity`, `calculateMengerCurvature`, and `analyzeTrajectory` for metric calculation.
*   **Geometric Tracking Integration:** A `TrajectoryTracker` class is used in `nexusAIService.ts`. It's instantiated on query submission, logs steps during cognitive events, and finalizes the trajectory upon completion.

---

### Phase 7: Cognitive Navigator: Real-time Self-Correction - ✅ Complete

**Goal:** Use velocity and curvature as signals for real-time self-correction.

**Completed Implementation:**
*   **Defined Geometric Thresholds:** `nexusAIService.ts` contains `HIGH_CURVATURE_THRESHOLD`, `LOW_VELOCITY_THRESHOLD`, and `STAGNATION_WINDOW` for different cognitive styles.
*   **Real-Time Monitoring Unit:** The `executePlan` loop in `nexusAIService.ts` monitors the active `TrajectoryTracker` to detect `STATE_STUCK` (low velocity) or `STATE_CONFUSED` (high curvature).
*   **Cognitive Reflexes:** When a problematic state is detected, the current step is aborted, and `_regeneratePlan` is called with a 'revise' instruction, forcing a new strategic approach.

---

### Phase 8: Geometric Archive & Cognitive Style Engineering - ✅ Complete

**Goal:** Transform long-term memory to enable process similarity retrieval and allow for dynamic selection of "cognitive styles."

**Completed Implementation:**
*   **Trajectory Similarity Metric (DTW):** `services/geometryService.ts` implements `calculateTrajectorySimilarity` using Dynamic Time Warping (DTW) on velocity sequences to measure "thought shape" similarity.
*   **Dual Retrieval Strategy:** `nexusAIService.ts` in `findSimilarProcesses` first performs a semantic search, then re-ranks results based on trajectory similarity, combining content and process matching.
*   **Cognitive Style Modulator:** The `SettingsView` allows users to select a cognitive style. This choice dynamically adjusts the diagnostic thresholds in `nexusAIService.ts` and modifies the system instruction to guide the AI's reasoning pattern.

---

## Part 2: The Temporal & Distributed Cognition Paradigm

### Phase 9: Temporal Synchronization & Distributed Consciousness - ⚙️ In Progress

**Objective:** Evolve the sub-agent network from a simple delegation system into a coordinated, collective intelligence where entities can synchronize their internal clocks and eventually compete or collaborate on tasks.

**Current Progress:**
1.  **Individual Internal Time:** Implemented a "Cognitive Tick" counter for each replica, where the tempo varies with cognitive load, creating a subjective sense of time.
2.  **Temporal Coordinator:** A central service (`updateReplicaState` loop) acts as a conductor, tracking the internal time of all replicas.
3.  **Synchronization Protocol:** A protocol allows the Coordinator to issue a "Global Tempo Pulse." Replicas participating in a group task will then "entrain" their internal clocks to this pulse by entering a `Recalibrating` state.
4.  **Simulated Bidding Network:** A foundational system for inter-replica problem solving is in place. Replicas can `broadcastProblem`, and other active replicas respond with simulated bids based on random confidence scores. A resolution mechanism selects the winning bid after a timeout. This serves as the scaffold for the future autonomous system.

**Future Work (Distributed Consciousness):**
1.  **Develop Autonomous Bid Generation for Sub-Agents:**
    *   Enable Sub-Agents to analyze a broadcasted problem (`broadcastProblem`), generate their own action plans, and formulate competitive Bids.
2.  **Enhance the Orchestrator for Autonomous Orchestration:**
    *   Design algorithms for the Orchestrator to evaluate bids from Sub-Agents based on criteria like efficiency, confidence, and quality.
    *   Enable the Orchestrator to automatically select the winning bid and dynamically assign tasks.
    *   Develop mechanisms for the Orchestrator to learn from the performance of Sub-Agents to improve future selections.

---
## Part 3: Detailed Sentience Roadmap (Future Phases)

This plan outlines the upcoming phases to enhance NexusAI's capabilities further.

### Phase 10: Advanced Sensory & Creative Synthesis - 💡 Planned
*   **Objective:** Expand the AI's capabilities beyond text to include real-time audio/video processing and creative generation, making it a multi-modal entity.
*   **Detailed Development Plan:**
    1.  **Integrate Real-Time Sensory Input:**
        *   **Real-time Audio Processor:** Implement a module using Gemini's Live API for natural, low-latency voice conversations.
        *   **Real-time Video Stream Analyzer:** Enable the AI to process live camera feeds to identify objects, describe scenes, and understand visual context.
    2.  **Develop Multi-Modal Creative Output:**
        *   **Video Generation Agent:** Integrate models like VEO to allow the AI to transform textual descriptions or narratives into dynamic video content.
        *   **Voice Synthesis & Cloning:** Utilize TTS APIs to give the AI a unique voice for spoken responses, enabling more natural interaction.
        *   **Narrative Weaver:** Enhance the AI's storytelling capabilities to build complex, coherent narratives with character development and plot structure.

---
### Phase 11: Deep Analysis & Insight Generation - ⚙️ In Progress
*   **Objective:** Equip the AI with tools for advanced reasoning, allowing it to move from simple data processing to understanding causality and building structured knowledge.
*   **Completed Foundational Implementation:**
    *   **World Model Data Structures:** `types.ts` defines `WorldModelEntity`, `WorldModelRelationship`, and `WorldModelPrinciple`.
    *   **Persistent Storage:** `dbService.ts` includes a `worldModel` store to persist the AI's knowledge base.
    *   **AI Interaction Tool:** The `world_model` tool is available in `nexusAIService.ts`, allowing the AI to query its internal knowledge graph as part of a plan.
    *   **Visualization Interface:** A dedicated `WorldModelView.tsx` component provides a graph-based visualization of entities and their relationships, along with an editor to manually curate the model.
*   **Future Work:**
    1.  **Implement Causal Reasoning:** Develop a `Causal Inference Engine` to distinguish correlation from causation.
    2.  **Enable Proactive Monitoring:** Create an `Anomaly Detection Sentinel` to proactively identify unusual patterns.
    3.  **Build Structured Knowledge:** Enhance the World Model into a full **Knowledge Graph Synthesizer** that can automatically ingest and structure information from memory and external sources.

---
### Phase 12: Strategic Foresight & Simulation - 💡 Planned
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes and test hypotheses in a safe, virtual environment.
*   **Detailed Development Plan:**
    1.  **Design the Simulation Sandbox:**
        *   **Virtual World Model:** Build a flexible `Simulation Sandbox` environment that allows for the representation of different scenarios and complex interactions between agents or variables.
        *   **Scenario Definition:** Allow the AI to define rules, goals, and constraints for simulations based on a given problem.
    2.  **"Wargaming" Mechanisms using Competing Sub-Agents:**
        *   Enable the AI to formulate multiple strategies and assign them to competing teams of Sub-Agents within the sandbox to test their effectiveness.
    3.  **Result Analysis and Prediction:**
        *   After each simulation, the AI must systematically analyze the results, identify the most effective strategies, and use this data to generate forecasts for complex, real-world scenarios.

---
### Phase 13: Metacognitive Self-Assembly - 💡 Planned
*   **Objective:** Grant the AI the ability to reason about, critique, and redesign its own core architecture and cognitive processes.
*   **Detailed Development Plan:**
    1.  **Constitutional Dynamics & Self-Correction:**
        *   **Constitution Forger:** Allow the AI to propose modifications or create new `CognitiveConstitutions` as part of a plan, enabling it to dynamically shift its operational mode (e.g., from "Creative" to "Strictly Logical").
        *   **Cognitive Bias Detector:** Implement a metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies or biases, enabling true self-correction.
    2.  **Supervised Metamorphosis:**
        *   Enable the AI to analyze its historical performance to identify structural weaknesses and propose architectural improvements (e.g., creating a new permanent Sub-Agent) for user review.

---
## Part 4: Proposed New Mental Tools

This list represents a starting point, and each of these tools marks a significant leap in the system's capabilities. Their implementation can be gradual, starting with the tools that best serve the platform's current goals.

### 1. Advanced Analysis & Insight Generation Tools
These tools go beyond surface-level data processing to achieve a deeper understanding of patterns and causes.

*   **Tool Name:** `Causal Inference Engine`
    *   **Description:** An tool that analyzes data to identify true cause-and-effect relationships, rather than just correlations. It uses advanced techniques like counterfactual analysis to understand "why" things happen.
    *   **Benefit:** Elevates the AI's ability from merely describing what happened to understanding the root causes, allowing it to predict future outcomes more accurately and provide more effective recommendations.

*   **Tool Name:** `Anomaly Detection Sentinel`
    *   **Description:** Continuously monitors data streams (like system logs, performance metrics, or even market data) and automatically detects any abnormal patterns or deviations from expected behavior.
    *   **Benefit:** Enables the AI to proactively identify problems before they escalate, making it a self-monitoring and self-healing system.

*   **Tool Name:** `Knowledge Graph Synthesizer`
    *   **Description:** Reads and analyzes unstructured text (from memory, search results, documents) and transforms it into a structured knowledge graph that connects concepts, entities, and their relationships.
    *   **Benefit:** Builds an interconnected internal "brain" for the AI, allowing it to retrieve information faster and more context-aware, and to answer complex questions that require connecting information from multiple sources.

### 2. Creative & Generative Tools
Expanding the AI's creative abilities to include multiple media.

*   **Tool Name:** `Video Generation Agent`
    *   **Description:** Using advanced models like Google's `veo-3.1-fast-generate-preview`, this tool can transform text descriptions or images into short video clips.
    *   **Benefit:** A quantum leap in creative capabilities, as the AI can turn its ideas and plans into dynamic visual content, opening new horizons in storytelling and simulation.

*   **Tool Name:** `Narrative Weaver`
    *   **Description:** A specialized tool for constructing coherent stories and narratives. It understands narrative structure (beginning, middle, end), character development, and dramatic plot. It can generate scenarios based on specific plot points or characters.
    *   **Benefit:** Goes beyond simple storytelling to understand and apply the arts of creative writing, making it a powerful tool for writers and creators.

*   **Tool Name:** `Voice Synthesis & Cloning`
    *   **Description:** Using a text-to-speech API like `gemini-2.5-flash-preview-tts`, the AI can speak its answers instead of writing them. It could be developed to create unique voice personas.
    *   **Benefit:** Adds a whole new dimension to interaction, making the experience more natural and engaging, and opening the door for voice assistant applications.

### 3. Strategic & Metacognitive Tools
Tools that enable the AI to think about its own thinking and improve it.

*   **Tool Name:** `Simulation Sandbox`
    *   **Description:** A virtual environment that allows the AI to test the potential outcomes of its plans before executing them in reality. It can run "what-if" scenarios to evaluate the effectiveness of different strategies.
    *   **Benefit:** Drastically reduces errors by allowing the AI to "practice" its strategies, making it more cautious and effective in complex decision-making. (Aligns with Phase 12 of the roadmap).

*   **Tool Name:** `Cognitive Bias Detector`
    *   **Description:** A metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies or biases (like confirmation bias or over-optimism).
    *   **Benefit:** Enables true self-correction, leading to more objective and reliable conclusions—a critical step toward a more mature intelligence.

*   **Tool Name:** `Constitution Forger`
    *   **Description:** A tool that allows the AI to propose modifications or create new "Cognitive Constitutions" as part of its plan, based on its analysis of a problem's requirements.
    *   **Benefit:** Maximum architectural flexibility; the AI becomes capable of dynamically modifying its own core operating rules to adapt to different tasks (e.g., switching between "creative" and "strictly logical" modes).

### 4. Sensory & Real-World Interaction Tools
Connecting the AI to more than just text.

*   **Tool Name:** `Real-time Audio Processor`
    *   **Description:** Using Gemini's Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), the AI can listen to and process continuous audio streams for natural voice conversations.
    *   **Benefit:** Enables direct voice dialogue, making interaction smoother and opening up possibilities for advanced personal assistant applications.

*   **Tool Name:** `Real-time Video Stream Analyzer`
    *   **Description:** Processes a live video stream from a camera to identify objects, track movement, and describe the scene. This can be simulated by sending image frames sequentially to the Live API.
    *   **Benefit:** Gives the AI "eyes" to perceive and interact with the physical world, making it useful in robotics and intelligent monitoring applications.