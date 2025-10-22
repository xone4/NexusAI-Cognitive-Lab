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
## Part 2: Detailed Sentience Roadmap (Future Phases)

This plan outlines the upcoming phases to enhance NexusAI's capabilities further.

### Phase 10: Advanced Sensory & Creative Synthesis - ✅ Complete
*   **Objective:** Expand the AI's capabilities beyond text to include real-time audio/video processing and creative generation, making it a multi-modal entity.
*   **Completed Implementation:**
    *   **Real-time Audio Processor:** A full-duplex voice interface is fully implemented using Gemini's Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), enabling natural, low-latency voice conversations with real-time transcription.
    *   **Voice Synthesis:** A Text-to-Speech (TTS) module is integrated using the `gemini-2.5-flash-preview-tts` model, allowing the AI to generate a spoken voice for its final synthesized answers.
    *   **Video Generation Agent (Modalities Lab):** The `ModalitiesLab` component and `generateVideo` service function are operational, integrating `veo-3.1-fast-generate-preview` to create video from text prompts. The UI correctly handles API key selection, generation state, and video playback.
    *   **Multi-modal Sensory Input (Audio & Video):** The client-side logic for real-time video frame streaming is complete. The system can capture frames from the live video feed and send them as image blobs to the Gemini Live API session, enabling true multi-modal conversations.
*   **Future Work:**
    1.  **Enhance Creative Generation:**
        *   **Narrative Weaver:** Enhance the AI's storytelling capabilities to build complex, coherent narratives with character development and plot structure, which can then be used as input for the Video Generation Agent.

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
*   **Future Work:**
    1.  **Enable Proactive Monitoring:** Create an `Anomaly Detection Sentinel` tool to proactively identify unusual patterns in system data or external feeds.

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
*   **Future Work:**
    1.  **Constitutional Dynamics & Self-Correction:**
        *   **Cognitive Bias Detector:** Implement a metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies or biases, enabling true self-correction.
    2.  **Supervised Metamorphosis:**
        *   Enable the AI to analyze its historical performance to identify structural weaknesses and propose architectural improvements (e.g., creating a new permanent Sub-Agent) for user review.

## Part 3: The Next Evolution - Engineering under Rose-Frame Governance

The next major leap for NexusAI is the integration of the **Rose-Frame** cognitive model, a framework for diagnosing and correcting the fundamental failure modes of Large Language Models. This plan operationalizes the Rose-Frame by using the existing Cognitive Geometry metrics (velocity $v$, curvature $C$) as sensors to detect cognitive traps and trigger automated governance mechanisms.

The goal is to evolve NexusAI from an agent that simply *thinks* to one that *thinks about its own thinking*. It's about building a robust **System 2 (Reason)** layer to govern the powerful but fallible **System 1 (Intuition)** of the underlying LLM. This directly addresses the core challenges of:
1.  **Map vs. Territory:** Distinguishing linguistic representation from grounded reality.
2.  **Intuition vs. Reason:** Separating fast, associative pattern-matching from slow, reflective logic.
3.  **Confirmation vs. Conflict:** Moving beyond self-confirmation to embrace critical falsification.

The following phases replace all previously planned future work.

---

### Phase 14: System 2 Reflection Mechanisms - 💡 Planned
*   **Objective:** To govern the AI's fast, intuitive "System 1" thinking by introducing automated "System 2" reflection. This directly addresses the cognitive trap of mistaking fluent intuition for grounded reason.
*   **Key Initiatives:**
    *   **Intuition Signal:** Use cognitive geometry (high velocity, sharp curvature) to detect when the AI makes an intuitive leap.
    *   **Reality Check Reflector:** When an intuition signal is detected, force the AI to validate its leap against the original input data ("Territory"), not just its internal linguistic model ("Map").
    *   **Deceleration Rule:** Slow down the AI's processing after an intuitive leap, forcing it into a more deliberate, analytical mode of thought.

---

### Phase 15: Falsifiability & Conflict Engine - 💡 Planned
*   **Objective:** To combat confirmation bias by engineering "cognitive conflict." This addresses the cognitive trap of confusing confirmation with correctness.
*   **Key Initiatives:**
    *   **Confirmation Signal:** Use cognitive geometry (prolonged low curvature) to detect when the AI is stuck in a self-confirming loop.
    *   **Falsification Engine:** When a confirmation signal is detected, inject a prompt that forces the AI to generate the strongest possible counter-argument to its current hypothesis.
    *   **Learning from Failure:** Tag and store trajectories that were successfully falsified, teaching the AI to avoid unproductive reasoning paths in the future.

---

### Phase 16: Cognitive Governance & Style Modulation - 💡 Planned
*   **Objective:** To enable the AI to strategically select its "thinking style" based on the task, using the Rose-Frame principles as a guide. This represents a higher level of metacognitive control.
*   **Key Initiatives:**
    *   **Geometric Governance Goals:** Define different cognitive tasks in terms of optimal geometric trajectories (e.g., 'Analytical' tasks require low-curvature paths; 'Creative' tasks allow for higher curvature).
    *   **Style Modulator:** A system that adjusts the sensitivity of the Intuition and Confirmation signals based on the selected cognitive style, effectively managing the balance between System 1 and System 2 thinking.
    *   **Cognition Quality KPI:** Develop a new key performance indicator that measures not just the correctness of an answer, but the "wisdom" of the cognitive process used to reach it (e.g., efficiency vs. number of self-corrections).

---
## Part 4: Proposed New Mental Tools

This list represents a starting point for future development, with each tool marking a significant leap in the system's capabilities.

### 1. Advanced Analysis & Insight Generation Tools
These tools go beyond surface-level data processing to achieve a deeper understanding of patterns and causes.

*   **Tool Name:** `Causal Inference Engine` `[Status: ✅ Implemented in Phase 11]`
    *   **Description:** An tool that analyzes data to identify true cause-and-effect relationships, rather than just correlations. It uses advanced techniques like counterfactual analysis to understand "why" things happen.
    *   **Benefit:** Elevates the AI's ability from merely describing what happened to understanding the root causes, allowing it to predict future outcomes more accurately and provide more effective recommendations.

*   **Tool Name:** `Anomaly Detection Sentinel`
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

*   **Tool Name:** `Narrative Weaver`
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

*   **Tool Name:** `Cognitive Bias Detector`
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
---
## Part 5: The Next Architectural Evolution

Beyond the phased feature implementation, the long-term vision requires foundational shifts in the system's architecture to achieve true autonomy and deeper intelligence.

### 1. From Delegation to True Collaboration
*   **The Challenge:** The current Orchestrator/Sub-Agent model creates a potential bottleneck. As complexity grows, the Orchestrator's cognitive load increases, limiting scalability and speed.
*   **The Vision:** Enable horizontal communication between Sub-Agents. This allows for emergent problem-solving where, for example, a "Web Research" agent can directly pass findings to a "Data Analysis" agent, who in turn might query a "Visualization" agent. They could collectively refine a solution and present a recommendation back to the Orchestrator.
*   **Implementation Path:**
    *   Design and implement a shared **Message Bus** or **Blackboard System** where agents can post and subscribe to messages.
    *   Develop a communication protocol that allows agents to request information, delegate sub-tasks to peers, and signal task completion.

### 2. Advanced Memory Architecture
*   **The Challenge:** The current IndexedDB (key-value) memory is effective for direct retrieval but lacks the ability to understand conceptual relationships.
*   **The Vision:** A two-pronged memory upgrade to mimic human cognitive faculties.
    *   **Vector Database (Semantic Memory):** Integrate a vector database (e.g., ChromaDB, Pinecone) to store embeddings of all cognitive traces. This enables powerful semantic search, allowing the AI to ask questions like, "What have I learned from past failures related to market analysis?" instead of just searching for keywords.
    *   **Graph Database (Episodic/Declarative Memory):** Evolve the World Model into a true graph database (e.g., Neo4j). This will store entities as nodes and relationships as edges, allowing the AI to traverse its knowledge and understand complex systems, such as organizational charts or causal chains.
*   **Implementation Path:**
    *   Integrate a client-side or remote vector database for the `recall_memory` tool.
    *   Refactor the `WorldModel` to use a graph-based structure, enhancing the `world_model` and `update_world_model` tools.

### 3. Objective Evaluation Framework
*   **The Challenge:** The "fitness" in the Evolution Chamber and the overall "improvement" of the AI are currently subjective. Without quantitative metrics, self-evolution risks being inefficient or random.
*   **The Vision:** An automated **Cognitive Test Suite** that regularly benchmarks the AI's performance against a standardized set of problems.
*   **Implementation Path:**
    *   Design a diverse set of benchmark tasks that test for:
        *   **Efficiency:** Number of steps, API calls, or time to solve a problem.
        *   **Robustness:** Ability to handle ambiguous, contradictory, or misleading information.
        *   **Creativity:** Ability to find novel solutions or use tools in unconventional ways.
    *   Build a test runner that executes this suite periodically.
    *   Feed the quantitative results from the test suite directly into the Evolution Chamber and Analysis Lab to provide an empirical basis for self-improvement.