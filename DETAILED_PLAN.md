# NexusAI Cognitive Lab 3.0: Detailed Development Plan

## Introduction: A Strategic Vision for Agent 2.0 and Beyond

This document provides a detailed, technical breakdown of the development plan for NexusAI. It serves as a reference for the development team, translating the high-level goals from the [`README.md`](./README.md) into concrete technical phases.

The ultimate objective of this project is to transcend the "executing agent" model (Agent 1.0) and realize a true "thinking agent" (Agent 2.0). This requires a shift from simply completing tasks to architecting a cognitive framework capable of deep understanding, strategic planning, meta-cognitive reflection, and autonomous evolution. The following plan is structured to achieve this vision by focusing on three core pillars: a **Distributed Cognitive Architecture**, a **Dynamic and Advanced Memory System**, and a framework for **Guided Self-Evolution**.

## Part 1: Foundational Paradigms (Completed)

---

### Phase 1-9: Core Architecture & Recursive Cognition - ✅ Complete

**Goal:** Establish the foundational pillars of the Agent 2.0 architecture and enable recursive problem-solving.

**Key Achievements:**
*   **Affective Core & Living Memory (MEMORIA):** Implemented an emotionally-contextual, persistent memory system in IndexedDB, forming the basis for long-term learning.
*   **Orchestrator/Sub-Agent Model:** Refactored the entire cognitive model to a hierarchical delegation system, a core strength of the project's design.
*   **Recursive Delegation & Context Heuristics:** Implemented tools like `spawn_cognitive_clone`, `code_sandbox`, and `peek_context`, allowing the AI to break down and solve problems that exceed standard context window limitations.

---

### Phase 6-8: Cognitive Navigation Paradigm - ✅ Complete

**Goal:** Transform the AI's thought process from abstract text generation into a mathematically measurable "cognitive trajectory," enabling real-time self-awareness and correction.

**Key Achievements:**
*   **Cognitive Geometry Integration:** The `ChatMessage` data structure now archives a `CognitiveTrajectory`, and a dedicated `geometryService` handles embedding simulation and metric calculation (velocity, curvature).
*   **Cognitive Navigator Implementation:** The `executePlan` loop now features a real-time monitoring unit that detects flawed reasoning patterns (stagnation, confusion) and triggers an autonomous `revise` plan, enabling self-correction.
*   **Geometric Memory & Style Engineering:** Memory retrieval has been enhanced to include "process similarity" via Dynamic Time Warping (DTW). Users can now select a `CognitiveStyle` ('Analytical', 'Creative', 'Balanced') which tunes the Navigator's sensitivity and the AI's reasoning approach.

---

### Phase 9: Temporal Synchronization & Distributed Consciousness - ✅ Complete

**Objective:** Evolve the sub-agent network from a simple delegation system into a coordinated, collective intelligence where entities can synchronize their internal clocks and compete or collaborate on tasks.

**Completed Implementation:**
1.  **Individual Internal Time:** Implemented a "Cognitive Tick" counter for each replica, where the tempo varies with cognitive load, creating a subjective sense of time.
2.  **Temporal Coordinator:** A central service acts as a conductor, tracking and enabling the synchronization of internal clocks via a "Global Tempo Pulse."
3.  **Autonomous Bidding Network:** The inter-replica network is now fully autonomous. When a problem is broadcast, active Sub-Agents analyze the task, generate a tailored action plan and a confidence score via the Gemini API, and submit them as a competitive bid. The Orchestrator selects the winning bid, completing the evolution from simple delegation to an autonomous, distributed problem-solving ecosystem.

---
## Part 2: Advanced Capabilities (Completed)

This plan outlines the upcoming phases to enhance NexusAI's capabilities further.

### Phase 10: Advanced Sensory & Creative Synthesis - ✅ Complete
*   **Objective:** Expand the AI's capabilities beyond text to include real-time audio/video processing and creative generation, making it a multi-modal entity.
*   **Completed Implementation:**
    *   **Real-time Audio Processor:** A full-duplex voice interface is fully implemented using Gemini's Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), enabling natural, low-latency voice conversations with real-time transcription.
    *   **Voice Synthesis:** A Text-to-Speech (TTS) module is integrated using the `gemini-2.5-flash-preview-tts` model, allowing the AI to generate a spoken voice for its final synthesized answers.
    *   **Video Generation Agent (Modalities Lab):** The `ModalitiesLab` component and `generateVideo` service function are operational, integrating `veo-3.1-fast-generate-preview` to create video from text prompts. The UI correctly handles API key selection, generation state, and video playback.
    *   **Multi-modal Sensory Input (Audio & Video):** The client-side logic for real-time video frame streaming is complete. The system can capture frames from the live video feed and send them as image blobs to the Gemini Live API session, enabling true multi-modal conversations.

---
### Phase 11: Deep Analysis & Insight Generation - ✅ Complete
*   **Objective:** Equip the AI with tools for advanced reasoning, allowing it to move from simple data processing to understanding causality and building structured knowledge.
*   **Completed Implementation:**
    *   **World Model Data Structures:** `types.ts` defines `WorldModelEntity`, `WorldModelRelationship`, and `WorldModelPrinciple`.
    *   **Persistent Storage:** `dbService.ts` includes a `worldModel` store to persist the AI's knowledge base.
    *   **AI Interaction Tools:** The `world_model` and `update_world_model` tools are fully available, allowing the AI to query and manually update its internal knowledge graph.
    *   **Visualization Interface:** A dedicated `WorldModelView.tsx` component provides an interactive, graph-based visualization of entities and their relationships, along with an editor to manually curate the model.
    *   **Autonomous Knowledge Ingestion:** The `knowledge_graph_synthesizer` tool is implemented. This pivotal tool uses the Gemini API to analyze unstructured text, extract entities and relationships according to a defined schema, and automatically updates the World Model, transforming it into a self-populating knowledge base.
    *   **Causal Reasoning:** The `Causal Inference Engine` tool is implemented, enabling the AI to analyze data for cause-and-effect relationships beyond simple correlation.

---
### Phase 12: Strategic Foresight & Simulation - ✅ Complete
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes and test hypotheses in a safe, virtual environment.
*   **Completed Implementation:**
    *   **Autonomous Strategy Generation:** The `SimulationLab` is fully functional and allows the AI to autonomously generate multiple competing strategies for a user-defined scenario.
    *   **Multi-Agent Wargaming:** The Wargaming mode now supports true multi-agent simulation. The UI allows assigning active Replicas to competing strategies, and the simulation service orchestrates an interactive loop, polling each assigned replica for its action at each step.
    *   **AI-Powered Analysis:** After a simulation, the AI can now autonomously analyze the results, explain the winning strategy's effectiveness, and provide a high-level summary.

---
### Phase 13: Metacognitive Self-Assembly - ✅ Complete
*   **Objective:** Grant the AI the ability to reason about, critique, and redesign its own core architecture and cognitive processes.
*   **Completed Implementation:**
    *   **Constitution Forger:** The AI can now propose and create new `CognitiveConstitutions` as part of a plan using the `forge_constitution` tool. This enables it to dynamically shift its operational mode (e.g., from "Creative" to "Strictly Logical") to best suit a given task. The Settings UI has been updated to allow for the management and deletion of these AI-forged constitutions.

---
## Part 3: The Next Evolution - The AGI Blueprint (MICRO, Rose-Frame & Knowledge Flow)

The next major leap for NexusAI is the integration of three interlocking paradigms: the **Mixture of Cognitive Reasoners (MICRO)** architecture, the **Rose-Frame** cognitive governance model, and the concept of **Knowledge Flow**. This combined approach provides not only the diagnostic tools to understand cognitive failures but also the fine-grained architectural control to correct them at the token level.

The goal is to evolve NexusAI from an agent that simply *thinks* to one that *thinks about its own thinking*. It's about building a robust **System 2 (Reason)** layer to govern the powerful but fallible **System 1 (Intuition)** of the underlying LLM. This directly addresses the core challenges of:
1.  **Map vs. Territory:** Distinguishing linguistic representation from grounded reality.
2.  **Intuition vs. Reason:** Separating fast, associative pattern-matching from slow, reflective logic.
3.  **Confirmation vs. Conflict:** Moving beyond self-confirmation to embrace critical falsification.

---

### Phase 14: The Self-Aware Agent (Architectural Re-Engineering) - 💡 Planned
*   **Objective:** Rebuild the AI's core with specialized reasoners and give it the ability to track its own internal thought processes.
*   **Key Initiatives:**
    *   **Adopt MICRO Architecture:** The core `LLM_Core` will transition from a dense model to a Mixture of Blocks (MoB) with four specialized reasoners: `Language`, `Logic`, `Social`, and `World`. Each layer will contain a `Router` to manage token distribution. This architecture is the first step towards enabling true peer-to-peer collaboration between reasoners, moving beyond the current Orchestrator bottleneck.
    *   **Implement the `CognitiveRouter`:** A new central module that provides a high-level API to control the internal routers of the MICRO model. It will expose functions like `set_expert_weights` and `ablate_expert`.
    *   **Implement the `FlowTracker`:** A new analysis module that processes token routing data from each cognitive step to generate a `Flow Matrix`. This matrix quantitatively represents how information flows between the different reasoners.
    *   **Extend `CognitiveTrajectory`:** The `CognitiveStep` data type will be updated to store the `Flow Matrix`, making knowledge flow a persistent, analyzable part of the AI's memory. This links geometric metrics (velocity `v`) to the underlying flow dynamics.

---

### Phase 15: The Self-Correcting Agent (Dynamic Governance) - 💡 Planned
*   **Objective:** Use the AI's new self-awareness to implement automated self-correction based on Rose-Frame principles.
*   **Key Initiatives:**
    *   **Implement the `FlowManager`:** A new cognitive module that receives diagnostic signals from the `Cognitive Monitor` (e.g., `INTUITION_JUMP_SIGNAL`) and translates them into `Flow Directives` for the `CognitiveRouter`.
    *   **Implement "Reality Check" Reflector (Map vs. Territory):** When a high-velocity intuitive leap is detected, the `FlowManager` will enforce a mandatory `Logic -> World -> Logic` knowledge flow. This forces the AI to exit a purely internal logic loop and validate its reasoning against its factual `World` reasoner before concluding.
    *   **Implement "Critical Falsification" Engine (Confirmation vs. Correctness):** When a confirmation bias signal (prolonged low curvature) is detected, the `FlowManager` will enforce a `Logic -> Social -> Language` flow. This forces the AI to consider alternative social perspectives and formulate counter-arguments, breaking the cycle of self-confirmation.

---

### Phase 16: The Strategic Agent (Flow-Based Learning & Control) - 💡 Planned
*   **Objective:** Enable the AI to learn from its past thought processes and allow for high-level, strategic control over its cognitive style.
*   **Key Initiatives:**
    *   **Flow-Aware Memory Retrieval:** Enhance the trajectory similarity algorithm (DTW) to compare sequences of `Flow Matrices` in addition to geometric metrics. The AI will now retrieve memories based on shared *cognitive processes* (e.g., tasks that required a similar shift from `Language` to `Logic` reasoning). **Implementation Note:** This will involve migrating the current key-value memory (`IndexedDB`) to a dedicated **Vector Database** (e.g., ChromaDB, Pinecone) to enable efficient, high-dimensional similarity search on `Flow Matrices`.
    *   **Strategic Planning with Flow Directives:** The `CognitivePlanner` will use retrieved flow patterns to generate an *initial token steering directive* for the `CognitiveRouter`, pre-configuring the AI's thought process for the task at hand.
    *   **Cognitive Style as a Flow Profile:** Define `CognitiveStyle`s (e.g., 'Analytical', 'Creative') not just as prompts, but as preferred `Flow Matrix` profiles. The `Style Modulator` will implement a selected style by applying persistent routing rules to the `CognitiveRouter`, providing true top-down control over the AI's mode of thinking.
    *   **Learning Efficient Thought:** Future reinforcement learning will reward the model not just for correct answers, but for arriving at them via an efficient and appropriate `Knowledge Flow`, pruning unnecessary cognitive steps. **Implementation Note:** This requires the development of an **Objective Evaluation Framework**—a suite of cognitive benchmarks to quantitatively measure performance and guide reinforcement learning.

---
## Part 4: Key Mental Tools & Their Development Status

This list represents a starting point for future development, with each tool marking a significant leap in the system's capabilities.

### 1. Advanced Analysis & Insight Generation Tools
These tools go beyond surface-level data processing to achieve a deeper understanding of patterns and causes.

*   **Tool Name:** `Causal Inference Engine` `[Status: ✅ Implemented in Phase 11]`
    *   **Description:** An tool that analyzes data to identify true cause-and-effect relationships, rather than just correlations. It uses advanced techniques like counterfactual analysis to understand "why" things happen.
    *   **Benefit:** Elevates the AI's ability from merely describing what happened to understanding the root causes, allowing it to predict future outcomes more accurately and provide more effective recommendations.

*   **Tool Name:** `Anomaly Detection Sentinel` `[Status: 💡 Planned]`
    *   **Description:** Continuously monitors data streams (like system logs, performance metrics, or even market data) and automatically detects any abnormal patterns or deviations from expected behavior.
    *   **Benefit:** Enables the AI to proactively identify problems before they escalate, making it a self-monitoring and self-healing system.

*   **Tool Name:** `Knowledge Graph Synthesizer` `[Status: ✅ Implemented in Phase 11]`
    *   **Description:** Reads and analyzes unstructured text (from memory, search results, documents) and transforms it into a structured knowledge graph that connects concepts, entities, and their relationships.
    *   **Benefit:** Builds an interconnected internal "brain" for the AI, allowing it to retrieve information faster and more context-aware, and to answer complex questions that require connecting information from multiple sources.

### 2. Creative & Generative Tools
Expanding the AI's creative abilities to include multiple media.

*   **Tool Name:** `Video Generation Agent` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Using advanced models like Google's `veo-3.1-fast-generate-preview`, this tool can transform text descriptions or images into short video clips.
    *   **Benefit:** A quantum leap in creative capabilities, as the AI can turn its ideas and plans into dynamic visual content, opening new horizons in storytelling and simulation.

*   **Tool Name:** `Narrative Weaver` `[Status: 💡 Planned]`
    *   **Description:** A specialized tool for constructing coherent stories and narratives. It understands narrative structure (beginning, middle, end), character development, and dramatic plot. It can generate scenarios based on specific plot points or characters.
    *   **Benefit:** Goes beyond simple storytelling to understand and apply the arts of creative writing, making it a powerful tool for writers and creators.

*   **Tool Name:** `Voice Synthesis & Cloning` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Using a text-to-speech API like `gemini-2.5-flash-preview-tts`, the AI can speak its answers instead of writing them. It could be developed to create unique voice personas.
    *   **Benefit:** Adds a whole new dimension to interaction, making the experience more natural and engaging, and opening the door for voice assistant applications.

### 3. Strategic & Metacognitive Tools
Tools that enable the AI to think about its own thinking and improve it.

*   **Tool Name:** `Simulation Sandbox` `[Status: ✅ Implemented in Phase 12]`
    *   **Description:** A virtual environment that allows the AI to test the potential outcomes of its plans before executing them in reality. It can run "what-if" scenarios to evaluate the effectiveness of different strategies.
    *   **Benefit:** Drastically reduces errors by allowing the AI to "practice" its strategies, making it more cautious and effective in complex decision-making. (Aligns with Phase 12 of the roadmap).

*   **Tool Name:** `Cognitive Bias Detector` `[Status: 💡 Planned]`
    *   **Description:** A metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies or biases (like confirmation bias or over-optimism).
    *   **Benefit:** Enables true self-correction, leading to more objective and reliable conclusions—a critical step toward a more mature intelligence.

*   **Tool Name:** `Constitution Forger` `[Status: ✅ Implemented in Phase 13]`
    *   **Description:** A tool that allows the AI to propose modifications or create new "Cognitive Constitutions" as part of its plan, based on its analysis of a problem's requirements.
    *   **Benefit:** Maximum architectural flexibility; the AI becomes capable of dynamically modifying its own core operating rules to adapt to different tasks (e.g., switching between "creative" and "strictly logical" modes).

### 4. Sensory & Real-World Interaction Tools
Connecting the AI to more than just text.

*   **Tool Name:** `Real-time Audio Processor` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Using Gemini's Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), the AI can listen to and process continuous audio streams for natural voice conversations.
    *   **Benefit:** Enables direct voice dialogue, making interaction smoother and opening up possibilities for advanced personal assistant applications.

*   **Tool Name:** `Real-time Video Stream Analyzer` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Processes a live video stream from a camera to identify objects, track movement, and describe the scene. This can be simulated by sending image frames sequentially to the Live API.
    *   **Benefit:** Gives the AI "eyes" to perceive and interact with the physical world, making it useful in robotics and intelligent monitoring applications.
