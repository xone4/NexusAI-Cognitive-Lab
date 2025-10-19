# NexusAI Cognitive Lab 3.0: Detailed Development Plan

## Introduction: A Strategic Vision for Agent 2.0 and Beyond

This document provides a detailed, technical breakdown of the development plan for NexusAI. It serves as a reference for the development team, translating the high-level goals from the [`README.md`](./README.md) into concrete technical phases.

The ultimate objective of this project is to transcend the "executing agent" model (Agent 1.0) and realize a true "thinking agent" (Agent 2.0). This requires a shift from simply completing tasks to architecting a cognitive framework capable of deep understanding, strategic planning, meta-cognitive reflection, and autonomous evolution. The following plan is structured to achieve this vision by focusing on three core pillars: a **Distributed Cognitive Architecture**, a **Dynamic and Advanced Memory System**, and a framework for **Guided Self-Evolution**.

## Part 1: Foundational Paradigms (Completed)

---

### Phase 1-5: Core Architecture & Recursive Cognition - ✅ Complete

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
    *   **AI Interaction Tool:** The `world_model` and `update_world_model` tools are available in `nexusAIService.ts`, allowing the AI to query and update its internal knowledge graph.
    *   **Visualization Interface:** A dedicated `WorldModelView.tsx` component provides a graph-based visualization of entities and their relationships, along with an editor to manually curate the model.
*   **Future Work:**
    1.  **Implement Causal Reasoning:** Develop a `Causal Inference Engine` tool to distinguish correlation from causation.
    2.  **Enable Proactive Monitoring:** Create an `Anomaly Detection Sentinel` tool to proactively identify unusual patterns in system data or external feeds.
    3.  **Build Structured Knowledge:** Evolve the `update_world_model` tool into a full **Knowledge Graph Synthesizer** that can automatically ingest unstructured text (from memory, search results) and transform it into structured entities and relationships.

---
### Phase 12: Strategic Foresight & Simulation - 💡 Planned
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes and test hypotheses in a safe, virtual environment.
*   **Detailed Development Plan:**
    1.  **Design the Simulation Sandbox:**
        *   **Virtual World Model:** Build a flexible `Simulation Sandbox` tool that allows the AI to represent different scenarios and complex interactions between agents or variables.
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
## Part 3: Proposed New Mental Tools

This list represents a starting point for future development, with each tool marking a significant leap in the system's capabilities.

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
---
## Part 4: The Next Architectural Evolution

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
