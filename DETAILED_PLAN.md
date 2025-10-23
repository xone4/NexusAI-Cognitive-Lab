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
## Part 3: The Enhanced Development Plan (V3.1)

### Diagnosis and Strategic Pivot

A thorough diagnosis of the project reveals a highly ambitious Cognitive Operating System that successfully integrates principles from cognitive science and AI engineering. The foundational work (Phases 1-13) has established a powerful infrastructure. However, this ambition introduces significant risks related to safety, security, and scalability. The planned leap towards self-awareness (Phases 14-16) requires a solid, secure foundation and clear metrics for success, which are currently underdeveloped.

**Key Gaps Identified:**
1.  **Safety Gap:** Powerful tools with self-modification capabilities (`spawn_cognitive_clone`, `forge_constitution`) exist without sufficient safeguards against misuse or hazardous recursive behavior.
2.  **Measurement Gap:** The project aims for "better thinking" objective method is needed to measure this improvement. Concepts like "cognitive velocity" are theoretical and require measurement.
3.  **Technical Debt:** The reliance on IndexedDB for vector similarity search is not scalable and will become a major performance bottleneck as the AI's memory grows.

### Lessons Learned and Guiding Principles

The next stage of development will be guided by the following core principles:

-   **Safety Before Capability:** Secure existing tools before building new, more powerful ones. Any self-modification capability must be reversible, observable, and constrained by immutable core rules.
-   **Measurement Is the Foundation of Improvement:** We cannot improve what we cannot measure. A framework for objective evaluation must be developed in parallel with new cognitive capabilities, not as an afterthought.
-   **Infrastructure First:** Scalability and performance issues (e.g., the vector database) must be resolved before they become insurmountable roadblocks to advanced development.
-   **Security is Not a Luxury:** Sensitive information must be secured, and potential vulnerabilities (like XSS) must be addressed proactively.
-   **Iterative Evolution:** Instead of making immediate, drastic architectural changes (like implementing the MICRO architecture), we will first simulate these changes using existing techniques (Prompt Engineering, Tool Selection) to prove their effectiveness before committing to major engineering efforts.

### The Revised Roadmap

This plan realigns priorities to address the identified gaps, ensuring safe, measurable, and sustainable development.

---
### Phase 14: Fortification & Foundation - ✅ Complete
**Goal:** Address critical gaps in safety, security, and infrastructure before adding any new features.

#### Completed Initiatives

1.  **Secure the "Constitution Forger" (✅ Implemented):**
    *   **Problem:** The AI could previously alter its core rule sets without oversight, posing a significant safety risk.
    *   **Implementation:** A robust safety and versioning layer has been added to the constitution forging process.
        *   **Approval Workflow:** New constitutions created via the `forge_constitution` tool now have a default status of `PENDING_APPROVAL`. They do not become active until a user explicitly approves them in the Settings view.
        *   **User Control:** The UI now provides controls to `Approve` or `Reject` pending constitutions.
        *   **Safe Deletion:** Deleting a constitution now archives it (`ARCHIVED` status) instead of performing a hard delete, preserving its history.
        *   **Default Protection:** The core, default constitutions are now marked as `isDefault` and are protected from being archived or modified, ensuring a stable baseline.
        *   **Versioning:** The `CognitiveConstitution` type now includes a `version` field, laying the groundwork for future auditing and rollback capabilities.

2.  **Implement "Kill-switch" for Agent Cloning (✅ Implemented):**
    *   **Problem:** The `spawn_cognitive_clone` tool could lead to uncontrolled, infinite recursion, creating a stability and resource-consumption risk.
    *   **Solution:** The `_executeRecursiveCognitiveCycle` function now enforces a hard limit on the recursion depth via a `MAX_RECURSION_DEPTH` constant. This acts as a direct and effective "kill-switch," preventing dangerous loops and ensuring system stability without the complexity of a token-based system.

#### Planned Initiatives

1.  **Migrate to a Vector Database:**
    *   **Problem:** IndexedDB is extremely inefficient for large-scale similarity searches.
    *   **Solution:** Begin integration with a local-first vector database like ChromaDB. Develop a migration script to transfer existing embedded data from IndexedDB to the new vector store.

---
### Phase 15: Measurement & Monitoring - ✅ Complete
**Goal:** Build the tools necessary to objectively measure and understand the "quality of thought."

#### Completed Implementation

1.  **Cognitive Evaluation Framework:**
    *   **Problem:** There were no objective metrics to evaluate system performance.
    *   **Implementation:** A new **Evaluation Lab** has been developed. This dashboard allows the user to trigger a system-wide analysis that simulates and calculates key performance indicators for cognitive quality.
        *   **Inference Accuracy:** The simulated percentage of AI conclusions that align with factual data in its World Model.
        *   **Flow Efficiency:** The average number of cognitive steps required to reach a solution.
        *   **Self-Correction Rate:** The percentage of tasks where the AI autonomously revises its plan after detecting an error.

2.  **Validate Existing Metrics:**
    *   **Problem:** There is no empirical proof that metrics like "cognitive velocity" or "curvature" correlate with the quality of thought.
    *   **Solution:** Suggest to conduct a study on 100 manually evaluated thought traces to establish a statistical correlation between high "curvature" and the occurrence of logical fallacies.

---
### Phase 16: Guided Evolution & Self-Optimization - ▶️ In Progress

**Goal:** Begin implementing advanced cognitive concepts in a gradual, safe, and evidence-based manner.

1.  **Simulate the MICRO Architecture:** `[Status: ✅ Implemented]`
    *   **Problem:** A direct implementation of the MICRO architecture is complex and risky.
    *   **Solution:** Instead of modifying the core model architecture, we simulate a "Cognitive Router." This is achieved by prompting the LLM to explicitly choose the appropriate "expert persona" for a given task (e.g., "Use the `Logic Expert` tool for this mathematical problem"). This flow of choices is tracked and analyzed.
    *   **Implementation Details:**
        *   **Cognitive Router:** The `submitQuery` workflow in `nexusAIService.ts` now includes a preliminary step. Before generating a plan, a call is made to the Gemini model to select the most suitable `ExpertPersona` ('Logic Expert', 'Creative Expert', 'Data Analysis Expert', 'Generalist Expert') for the user's query.
        *   **Dynamic Instruction:** The `getSystemInstruction` function has been augmented. It now accepts the selected expert persona and dynamically prepends a specialized directive to the core system instruction, effectively "priming" the AI to think and plan from that expert's point of view.
        *   **UI Feedback:** The `CognitiveProcessVisualizer.tsx` component has been updated to display the `activeExpert` from the `ChatMessage` object during the planning phase, providing clear, real-time feedback on which simulated expert is handling the request.

2.  **Activate a Reinforcement Learning Loop:** `[Status: ✅ Implemented]`
    *   **Problem:** The Cognitive Router makes decisions but doesn't learn from their outcomes.
    *   **Solution:** Use the outcome of cognitive tasks to train the "Cognitive Router" to select the most efficient thought paths for different types of problems, creating a self-improving system.
    *   **Implementation Details:**
        *   **Learning Trigger:** The `archiveTrace` function in `nexusAIService.ts` now acts as the learning trigger. When a "significant" trace (successful execution and high salience score) is archived, a learning event is initiated.
        *   **Problem Categorization:** During the learning event, a call to the Gemini API categorizes the original user query into one of four types: `LOGIC`, `CREATIVE`, `DATA`, or `GENERAL`.
        *   **Reinforcement:** The `ExpertPersona` that was used for the successful trace is then stored as the preferred expert for that problem category.
        *   **Persistent Memory:** These learned preferences are persisted in the `expertPreferences` store in IndexedDB.
        *   **Application:** The `submitQuery` function has been enhanced. It now first attempts to categorize the incoming query and check for a learned preference. If a preference exists, it bypasses the standard Cognitive Router and directly applies the learned expert, making the system faster and more efficient at solving similar problems over time.

3.  **Implement "Reality-Check" Mechanisms:** `[Status: 💡 Planned]`
    *   **Problem:** The system can become trapped in theoretical reasoning loops, detached from factual ground truth.
    *   **Solution:** Enforce mandatory validation workflows, such as:
        *   **Logic → World → Logic:** Any logical deduction must be cross-referenced with data from the "World Model" before it can be used in subsequent steps.
        *   **Logic → Social → Language:** Any plan for communication or social interaction must first be evaluated by a simulated "Social Expert" to assess its appropriateness and potential impact.
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

*   **Tool Name:** `Constitution Forger` `[Status: ✅ Implemented & Fortified]`
    *   **Description:** Allows the AI to propose and create new "Cognitive Constitutions" as part of a plan. **Newly forged constitutions require user approval via the Settings view before they can be activated, ensuring a human-in-the-loop safety protocol.**
    *   **Benefit:** Enables dynamic adaptation of the AI's core operating rules, balanced with user oversight for safety and control.

### 4. Sensory & Real-World Interaction Tools
Connecting the AI to more than just text.

*   **Tool Name:** `Real-time Audio Processor` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Using Gemini's Live API (`gemini-2.5-flash-native-audio-preview-09-2025`), the AI can listen to and process continuous audio streams for natural voice conversations.
    *   **Benefit:** Enables direct voice dialogue, making interaction smoother and opening up possibilities for advanced personal assistant applications.

*   **Tool Name:** `Real-time Video Stream Analyzer` `[Status: ✅ Implemented in Phase 10]`
    *   **Description:** Processes a live video stream from a camera to identify objects, track movement, and describe the scene. This can be simulated by sending image frames sequentially to the Live API.
    *   **Benefit:** Gives the AI "eyes" to perceive and interact with the physical world, making it useful in robotics and intelligent monitoring applications.