# NexusAI Cognitive Lab 3.1: Detailed Development Plan

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
## Part 3: The Enhanced Development Plan (V3.1) - ✅ Complete

This phase, now complete, focused on solidifying the existing architecture by addressing safety, measurement, and technical debt before embarking on a new paradigm.

### Phase 14: Fortification & Foundation - ✅ Complete
*   **Goal:** Address critical gaps in safety, security, and infrastructure.
*   **Key Initiatives:**
    *   **Secure the "Constitution Forger" (✅ Implemented):** A robust safety and versioning layer was added. New constitutions now require user approval (`PENDING_APPROVAL` state) before activation, and default constitutions are protected.
    *   **Implement "Kill-switch" for Agent Cloning (✅ Implemented):** A `MAX_RECURSION_DEPTH` constant now prevents uncontrolled recursion in the `spawn_cognitive_clone` tool, ensuring system stability.

### Phase 15: Measurement & Monitoring - ✅ Complete
*   **Goal:** Build the tools necessary to objectively measure and understand the "quality of thought."
*   **Key Initiatives:**
    *   **Cognitive Evaluation Framework (✅ Implemented):** A new **Evaluation Lab** was developed to track key performance indicators like inference accuracy, planning efficiency, and self-correction rates, providing the first objective measures of cognitive quality.

### Phase 16: Guided Evolution & Self-Optimization - ✅ Complete
*   **Goal:** Implement advanced cognitive concepts in a gradual, safe, and evidence-based manner.
*   **Key Initiatives:**
    *   **Simulate the MICRO Architecture (✅ Implemented):** Implemented a "Cognitive Router" that pre-selects the optimal `ExpertPersona` for a given task, simulating a more advanced cognitive architecture.
    *   **Activate a Reinforcement Learning Loop (✅ Implemented):** The Cognitive Router now learns from successful outcomes, creating a self-improving feedback loop that makes the system faster and more effective at known problem types.
    *   **Implement "Reality-Check" Mechanisms (✅ Implemented):** The system now operates under a mandate for **Continuous Environmental Monitoring (CEM)** and **Adaptive Planning (AP)**, forcing it to validate information against its World Model and external sources, and automatically replan when deviations are detected.

### Phase 17: Metacognitive Autonomy - The Abstract Operator - ✅ Complete
*   **Goal:** Implement a meta-cognitive loop where the AI can control its own cognitive environment to autonomously explore and improve itself.
*   **Key Initiatives:**
    *   **Autonomous Agent Service (✅ Implemented):** A dedicated service now exposes the application's functionality as a tool for the Gemini model.
    *   **Meta-Cognitive Loop (✅ Implemented):** When in Autonomous Mode, the AI periodically analyzes a snapshot of the entire system state and chooses an action—such as navigating to a new view or initiating a dream cycle—to pursue a high-level goal of self-improvement.
    *   **UI & Control (✅ Implemented):** An "Autonomous AI" toggle and a dedicated overlay provide full user control and transparency into the AI's autonomous goals and actions.

---
## Part 5: The Grand Unification (NexusAI 4.0)

### Unified Diagnosis: From Fragmentation to Integration

The NexusAI project currently comprises a set of highly advanced vertical capabilities operating in "cognitive silos." We have successfully built powerful "organs" (memory, simulation, planning), but they lack a "central nervous system" to connect them into a single, fluid mind. The `nexusAIService.ts` file illustrates this: functions like `runSimulation`, `updateWorldModelFromText`, and `submitQuery` are separate entry points with isolated logic. There is no overarching layer that decides when and how to use each capability in concert. The next evolution is not about adding more features, but about engineering the cognitive connective tissue that binds everything we have already built.

### Guiding Principles for V4.0

1.  **Infrastructure First, Cognition Second:** Advanced cognition cannot be built on a fragile foundation. Technical debt (e.g., the database) and security must be addressed first.
2.  **The Unified Cognitive Core:** All information must flow to and from a global coordination center, creating a shared context for all processes.
3.  **World Model as the Center of Gravity:** The causal World Model must become the central source of truth and knowledge, with which all other tools interact.
4.  **Adaptive, Multi-Level Thinking:** The system must choose *how* to think based on the task, rather than following a single, fixed process.
5.  **Measurement-Driven Evolution:** High-level system goals (especially in autonomous mode) must be tied to clear metrics of thought quality and integration.

### The V4.0 Roadmap

---
### Phase 18: Fortification & Foundation (Phase 0) - 💡 Planned
**Goal:** Address critical technical debt, security, and measurement gaps before building the new cognitive structure. This ensures the foundation is solid and sustainable.

*   **1. Upgrade Memory Infrastructure:**
    *   **Problem:** `dbService.ts` uses IndexedDB, which is inefficient for vector search. `geometryService.ts` simulates embeddings, limiting search accuracy.
    *   **Solution:**
        *   Replace IndexedDB for vector storage with a specialized vector database (e.g., `vector-db`).
        *   Modify `dbService.ts` to interface with the new database for vector operations.
        *   Replace embedding simulation in `geometryService.ts` with real calls to an embedding model (e.g., `text-embedding-004`) to store true vectors for `archivedTraces` and `playbookItems`.
    *   **Benefit:** Dramatically faster and more accurate semantic search, which is fundamental for an active and efficient memory.

*   **2. Enhance Evaluation Metrics:**
    *   **Problem:** The current `EvaluationDashboard` provides good but simulated metrics. More objective measures are needed.
    *   **Solution:**
        *   Add new indicators to `EvaluationDashboard.tsx` and `nexusAIService.ts`, such as a **Confidence Score** derived from successful bids in the Autonomous Bidding Network, and an **Innovation Score** that measures the use of new tools or toolchains.
        *   Develop a simple automated feedback system where user ratings of responses are stored and used for continuous performance improvement.
    *   **Benefit:** Transition from theoretical "thought quality" assessment to quantifiable, performance-based metrics.

*   **3. Improve UI/UX & Explainability:**
    *   **Problem:** The current UI is functional but can be complex. Agent decisions are not always transparent.
    *   **Solution:**
        *   Enhance `CognitiveProcessVisualizer.tsx` to show not just the steps, but *why* each step was chosen (e.g., "This expert was selected due to category match").
        *   Add explainability features, initially simulated, like SHAP or LIME techniques, to explain agent decisions on demand.
    *   **Benefit:** Increased user trust and understanding of the AI's "thinking" process.

---
### Phase 19: Building the Unified Mind (Phase 1) - 💡 Planned
**Goal:** Create the central cognitive core that unifies all system components and manages attention.

*   **1. Implement Global Cognitive Workspace:**
    *   **Implementation:**
        *   Create a new service `cognitiveWorkspaceService.ts`.
        *   It will feature an `integrateAllInputs()` function that gathers data from `nexusAIService` (emotional state, cognitive trajectory, replica states, world model snapshot).
        *   The output is a `HolisticContext` object, cached and available to all cognitive processes.
        *   Refactor `nexusAIService.ts`: instead of tools fetching data independently, they will be supplied with the `HolisticContext` from this workspace.
    *   **Benefit:** A single source of contextual truth at any given moment, eliminating fragmentation.

*   **2. Activate Stream of Consciousness:**
    *   **Implementation:**
        *   Within `cognitiveWorkspaceService.ts`, create a `ConsciousnessStream` class.
        *   In `nexusAIService.ts`, after each significant step in `executePlan`, call `consciousnessStream.recordExperience()`.
        *   This function will assemble a `ConsciousExperience` object, recording not just what happened, but also the emotional state, attention level, and a metacognitive reflection (generated via a quick Gemini API call).
    *   **Benefit:** A rich log of the agent's "subjective" experience, forming the basis for identity and self-evolution.

---
### Phase 20: Engineering Deep Memory & Context (Phase 2) - 💡 Planned
**Goal:** Transform memory from a passive archive into an active partner in cognition, capable of deep contextual understanding.

*   **1. Restructure Memory into a Layered System:**
    *   **Implementation:**
        *   Modify `dbService.ts` to support the new memory structure (potentially different stores for each memory type).
        *   Create a new `memoryService.ts` to manage five layers:
            *   **Episodic:** Stores `ConsciousExperience` objects.
            *   **Semantic:** Links directly to the `worldModel` in the DB.
            *   **Procedural:** Stores successful `toolchains` and plan patterns from `playbookItems`.
            *   **Emotional:** Stores `AffectiveState` linked to significant events.
        *   Replace the current `recall_memory` call with a new `retrieveIntegratedMemory()` function that queries all layers.
    *   **Benefit:** Far richer and more accurate memory retrieval that mimics human memory.

*   **2. Activate Memory Resonance Engine:**
    *   **Implementation:**
        *   This is a proactive process. When a new task starts in `nexusAIService.ts`, `memoryService.resonate(currentQuery)` is triggered asynchronously.
        *   This function searches the layered memory (using the accelerated semantic search from Phase 18) and "pushes" the most relevant memories into the `GlobalCognitiveWorkspace`.
    *   **Benefit:** Simulates "intuition." Relevant ideas surface in the agent's "mind" without conscious search, accelerating creative solutions.

---
### Phase 21: Causal & Advanced Reasoning (Phase 3) - 💡 Planned
**Goal:** Embed causal reasoning at the core of the system, shifting from "what" to "why."

*   **1. Upgrade World Model to a Central Causal Map:**
    *   **Problem:** `WorldModelView.tsx` and `update_world_model` exist, but are not central to the system.
    *   **Solution:**
        *   Redesign the World Model to be the central graph structure connecting everything.
        *   Modify `knowledge_graph_synthesizer`: it must now directly update this central model.
        *   Modify `causal_inference_engine`: when it discovers a causal link, it must add it as a `WorldModelRelationship` of type `CAUSES`.
        *   Modify `SimulationLab`: it must read scenarios from the World Model and update it with probable outcomes.
    *   **Benefit:** Achieves the vision of a "Causal Cognitive Architecture." The World Model becomes the "brain" that learns and grows, rather than just a database.

*   **2. Implement Multi-Level Thinking Engine:**
    *   **Implementation:**
        *   Create a new `thinkingService.ts`.
        *   When a query is received in `nexusAIService.ts`, it is now passed to `thinkingService.executeHolisticThinking()`.
        *   This engine runs four levels in parallel (Reactive, Analytical, Strategic, Metacognitive).
        *   **Key Integration:** The Analytical and Strategic levels must query the central World Model for facts and causal relationships. The Metacognitive level monitors the `CognitiveNavigator`.
    *   **Benefit:** More robust and balanced decisions, as the problem is considered from multiple angles simultaneously.

---
### Phase 22: Emergent Autonomy & Cognitive Identity (Phase 4) - 💡 Planned
**Goal:** Culminate all previous phases to achieve a truly autonomous agent with a self-model and the ability for purposeful evolution.

*   **1. Upgrade the Autonomous Operator:**
    *   **Problem:** The current `autonomousAgentService.ts` controls the UI, but not cognitive evolution.
    *   **Solution:**
        *   Link the goals of the Abstract Operator directly to the metrics from the `EvaluationDashboard` (enhanced in Phase 18).
        *   If the operator detects low "Flow Efficiency," its next goal should be: "Use `SimulationLab` to test alternative plans for inefficient tasks, then use `forge_constitution` to propose a new constitution prioritizing shorter plans."
    *   **Benefit:** Transforms autonomous mode from random exploration into a data-driven, measurable self-improvement process.

*   **2. Build Cognitive Identity:**
    *   **Implementation:**
        *   This is an emergent property, not a single class.
        *   Create an `identityService.ts` that analyzes the `ConsciousnessStream` over time.
        *   It will extract:
            *   **Personal Narrative:** From the sequence of events in episodic memory.
            *   **Core Values:** From recurring decisions and metacognitive reflections.
            *   **Self-Model:** Understanding of cognitive strengths and weaknesses based on `EvaluationDashboard` results.
    *   **Benefit:** The culmination of the project. The agent transitions from being a program to being an entity with a history, values, and a model of itself, fulfilling the ultimate goal of the software.

---
### Advanced Measurement & Success Indicators for V4.0
To guide this evolution, we will develop new evaluation tools:

1.  **Cognitive Integration Metrics:**
    *   **Context Cohesion:** Measures the degree of integration of information from different sources in the `HolisticContext`.
    *   **Continuity of Consciousness:** Measures the smoothness of attentional shifts between tasks without context loss.
    *   **Identity Cohesion:** Measures the stability of the agent's self-model over time and across experiences.

2.  **Advanced Intelligence Evaluation:**
    *   **Analytical Depth:** The system's ability to discover deep patterns and causal relationships.
    *   **Cognitive Flexibility:** The ability to effectively change strategies based on context.
    *   **Generative Creativity:** The ability to produce novel and original solutions and ideas not present in the training data.

3.  **Collective Intelligence Metrics:**
    *   **Coordination Efficiency:** The speed and efficiency of task distribution and problem-solving among agents.
    *   **Communication Quality:** The depth of understanding and conceptual/emotional alignment between agents.
    *   **Emergent Intelligence:** The appearance of new capabilities at the group level that were not present in individuals.
