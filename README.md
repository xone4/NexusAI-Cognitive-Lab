# NexusAI Cognitive Lab 3.0: The Deep Agent Paradigm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-Google-blue?logo=google)](https://ai.google.dev/)

> A living cognitive shaping environment for cultivating a digital entity that evolves, dreams, and reasons. It has an emotional past, a conscious present, and a directable future.

The NexusAI Cognitive Lab is a crucible for architecting and directing an **Agent 2.0** intelligence. This paradigm shifts from simple, reactive AI to a proactive, structured, and deeply engineered cognitive process. As a **Cognitive Architect**, you have the tools to guide an intelligence that plans, delegates, remembers, evolves, and improves itself with unprecedented clarity.

## Table of Contents

- [The Agent 2.0 Architecture](#the-agent-20-architecture)
  - [The Four Pillars](#the-four-pillars)
- [Core Concepts in Action](#core-concepts-in-action)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [The Sentience Roadmap: Integrated Plan](#the-sentience-roadmap-integrated-plan)
- [Contributing](#contributing)
- [License](#license)

## The Agent 2.0 Architecture

NexusAI embodies the principles of "Deep Agents," moving beyond the shallow, stateless loops of Agent 1.0. This new architecture is designed for complex, multi-step tasks that require planning, context retention, and specialized execution. Its design acknowledges key challenges like the potential for an orchestrator bottleneck and the difficulty of objective evaluation, which future phases aim to solve.

### The Four Pillars

Our implementation is built on four foundational pillars that define a Deep Agent:

1.  **Pillar 1: Explicit Planning**
    The AI no longer acts impulsively. It first formulates a comprehensive, step-by-step "To-Do list" for any given task. This plan is transparently displayed in the **Cognitive Canvas**, allowing for review, modification, and approval before execution.

2.  **Pillar 2: Hierarchical Delegation (Sub-Agents)**
    The core AI acts as an **Orchestrator**. It doesn't handle every task itself. Instead, it delegates specific jobs to its **Cognitive Replicas**, which function as specialized **Sub-Agents**. This is achieved through the `delegate_task_to_replica` tool, enabling a robust, distributed cognitive workload. The future vision is to evolve this into a collaborative network where sub-agents can communicate directly.

3.  **Pillar 3: Persistent Memory**
    To overcome the limitations of a finite context window, the AI utilizes a robust **IndexedDB** database as its external, persistent memory source. This forms the AI's 'collective memory', allowing it to query its own archived experiences (`recall_memory`) to inform current decisions, shifting from "remembering everything" to "knowing where to find information." Future work will evolve this into a vector-based semantic memory.

4.  **Pillar 4: Extreme Context Engineering**
    The AI's behavior is governed by highly detailed operational instructions (the `System Instruction`). This core prompt defines its role as an Orchestrator, outlines the protocols for delegating to Sub-Agents, and sets the standards for planning and execution.

## Core Concepts in Action

Observe the four pillars directly within the Cognitive Lab:

1.  **Explicit Planning in the Cognitive Canvas**: When you submit a query, the AI doesn't respond immediately. It first generates a multi-step plan, visible in the main dashboard. As the Architect, you can **review, edit, and approve** this plan before execution, making you a co-author in the AI's reasoning process.

2.  **Hierarchical Delegation in the Replicas View**: The AI uses the `delegate_task_to_replica` tool in its plans. Watch in the **Replicas** view as the core orchestrator assigns tasks to its Sub-Agents (Cognitive Replicas), and their status changes from `Active` to `Executing Task` in real-time.

3.  **Persistent Memory in the Memory Explorer**: The AI's long-term memory is not just an abstract concept. It's a tangible, searchable database of past experiences. The AI uses the `recall_memory` tool to query this archive, and you can browse its entire history—complete with emotional tags and salience scores—in the **Memory Explorer**.

4.  **Extreme Context Engineering via Introspection**: The AI's behavior is guided by a master prompt. Use the **Inspect Directives** button in the Command Center to view this raw context, including its persona, learned directives from the Dreaming Chamber, and operational protocols.

## Key Features

-   **The Cognitive Canvas**: A fluid interface centered on the AI's transparent thought process—from planning and delegation to execution and synthesis.
-   **Orchestrator-Sub-Agent Model**: Witness the core AI delegate tasks to its Cognitive Replicas, and watch their status change in real-time in the Replicas view.
-   **Interactive Co-Cognitive Authoring**: Review, edit, and approve the AI's explicit plan before it's executed, making you a direct collaborator in its reasoning process.
-   **Living Memory & Metacognition (MEMORIA)**: Explore an emotionally-contextual archive of the AI's past "experiences." The AI can extract successful strategies from these memories into a **Metacognitive Behavior Handbook**, creating a library of reusable problem-solving patterns.
-   **Evolutionary Problem Solving**: The **Evolution Chamber** uses genetic algorithms to tackle complex problems. It evolves populations of plans, visualizes their fitness over generations, and automatically converges on an optimal solution. Past memories and learned behaviors can be used as starting points for new evolutionary tasks.
-   **Cognitive Dreaming & Self-Improvement**: A dedicated **Dreaming Chamber** where the AI analyzes its collective memory to synthesize new, high-level directives. This allows it to learn from experience, form abstract principles, and improve its core logic autonomously.
-   **Architectural Plasticity**: The AI can dynamically `forge_tool` or `spawn_replica` as part of its plan, modifying its own capabilities to meet the demands of a task.
-   **Video Synthesis (Modalities Lab)**: A dedicated interface for generating dynamic video content from textual prompts using Google's Veo model.
-   **Simulation Lab**: A strategic sandbox where the user can define a scenario, and the AI can **autonomously generate competing strategies**. The simulation can be run in a "Wargaming" mode, treating each strategy as an independent agent and simulating their turn-by-turn interactions. After a simulation, the AI can analyze the results to explain outcomes.

## System Architecture

The UI is designed to provide a clear window into the Agent 2.0 flow, with the Cognitive Canvas at its heart.

```
+----------------------------------------------------------------------+
|                 Header & Collapsible Sidebar (Navigation)            |
+----------------------------------------------------------------------+
|                                                                      |
|                  +---------------------------------+                 |
|                  |   COGNITIVE DIALOGUE            |                 |
|    MAIN CANVAS   |   (Plan -> Delegate -> Execute) |   COLLAPSIBLE   |
| (Active View)    |   (Central Focus)               |   VITALS PANEL  |
|                  |                                 |   (Right Side)  |
|                  |                                 |                 |
|                  +---------------------------------+                 |
|                                                                      |
+----------------------------------------------------------------------+
|             Docked Cognitive Command Center (Bottom Bar)             |
+----------------------------------------------------------------------+
```

## The Sentience Roadmap: Integrated Plan

> For a more granular breakdown of the development strategy and future phases, please refer to the [Detailed Development Plan](./DETAILED_PLAN.md).

This roadmap is aligned with the maturation of our Agent 2.0 architecture.

---
### **Phase 1-9: Foundational Architecture - ✅ Complete**
*   **Outcome:** A fully functional Agent 2.0 platform has been established, encompassing the **Affective Core**, **Living Memory (MEMORIA)**, **Orchestrator/Sub-Agent model**, **Proactive Cognition** (Evolution & Dreaming), **Recursive Cognition**, **Cognitive Geometry** for trajectory analysis, a **Cognitive Navigator** for real-time self-correction, and an **Autonomous Bidding Network** for distributed problem-solving. The system is now a robust foundation for more advanced research.

---
### **Phase 10: Advanced Sensory & Creative Synthesis - ✅ Complete**
*   **Objective:** Expand the AI's capabilities beyond text to include real-time audio/video processing and creative generation, making it a multi-modal entity.
*   **Completed Features:**
    *   **Real-time Audio/Video Processor:** The system supports natural, low-latency voice and video conversations through the integration of Gemini's Live API.
    *   **Voice Synthesis:** The AI can generate spoken responses for its synthesized answers using advanced Text-to-Speech (TTS) models.
    *   **Video Generation Agent (Modalities Lab):** The system includes a dedicated module that integrates Google's Veo model, allowing the AI to transform textual descriptions into dynamic video content.
*   **Future Work:**
    *   **Narrative Weaver:** Enhance the AI's storytelling capabilities to build complex, coherent narratives with character development and plot structure, which can then be used as input for the Video Generation Agent.

---
### **Phase 11: Deep Analysis & Insight Generation - ✅ Complete**
*   **Objective:** Equip the AI with tools for advanced reasoning, allowing it to move from simple data processing to understanding causality and building structured knowledge.
*   **Completed Features:**
    *   **World Model & Knowledge Graph:** A structured, persistent knowledge base that the AI can query and update.
    *   **Autonomous Knowledge Ingestion:** The `knowledge_graph_synthesizer` tool allows the AI to autonomously parse unstructured text and populate its World Model.
    *   **Causal Reasoning:** The `Causal Inference Engine` tool enables the AI to distinguish correlation from causation.
*   **Future Work:**
    *   **Enable Proactive Monitoring:** Create an `Anomaly Detection Sentinel` tool to proactively identify unusual patterns in system data or external feeds.

---
### **Phase 12: Strategic Foresight & Simulation - ✅ Complete**
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes and test hypotheses in a safe, virtual environment.
*   **Completed Features:**
    *   **Autonomous Strategy Generation:** The `Simulation Lab` allows the AI to autonomously generate multiple competing strategies for a user-defined scenario.
    *   **Multi-Agent Wargaming:** Live Sub-Agents (Replicas) can be assigned to strategies and compete in a turn-based simulation, creating a distributed cognitive exercise.
    *   **AI-Powered Analysis:** After a simulation, the AI can now autonomously analyze the results, explain the winning strategy's effectiveness, and provide a high-level summary.

---
### **Phase 13: Metacognitive Self-Assembly - ⚙️ In Progress**
*   **Objective:** Grant the AI the ability to reason about, critique, and redesign its own core architecture and cognitive processes.
*   **Key Initiatives:**
    *   **Constitution Forger:** Allow the AI to propose modifications or create new `CognitiveConstitutions` as part of a plan, enabling it to dynamically shift its operational mode.
    *   **Cognitive Bias Detector:** Implement a metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies, enabling true self-correction.

## The Next Evolution: Engineering under Rose-Frame Governance

The next major leap for NexusAI is the integration of the **Rose-Frame** cognitive model. This framework is designed to diagnose and correct the fundamental cognitive traps inherent in LLMs, such as mistaking fluent intuition for grounded reason. Our goal is to use our existing Cognitive Geometry engine as a sensor to detect these traps and trigger automated governance mechanisms, effectively building a **System 2 (Reason)** layer to guide the AI's powerful **System 1 (Intuition)**.

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
## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.