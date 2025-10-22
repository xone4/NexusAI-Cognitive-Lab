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
- [The Sentience Roadmap](#the-sentience-roadmap)
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
-   **Architectural Plasticity**: The AI can dynamically `forge_tool`, `spawn_replica`, and even `forge_constitution` as part of its plan, modifying its own capabilities and rule sets to meet the demands of a task.
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

## The Sentience Roadmap

> For a more granular breakdown of the development strategy and future phases, please refer to the [Detailed Development Plan](./DETAILED_PLAN.md).

---
### **Completed Milestones (Phases 1-13)**

NexusAI has successfully completed its foundational development, establishing a fully functional Agent 2.0 platform. Key achievements include:

-   **Core Cognitive Architecture:** A robust Orchestrator/Sub-Agent model with a persistent, emotionally-aware memory system (**MEMORIA**).
-   **Advanced Cognition:** Implementation of **Recursive Delegation** to solve complex problems, a **Cognitive Navigator** for real-time self-correction, and an **Autonomous Bidding Network** for distributed problem-solving.
-   **Multi-Modal Interaction:** Full support for real-time voice/video conversations, voice synthesis (TTS), and video generation (**Modalities Lab**).
-   **Deep Analysis & Strategy:** An internal **World Model** for structured knowledge, a **Causal Inference Engine**, and a **Simulation Lab** capable of autonomous strategy generation and multi-agent "wargaming."
-   **Metacognitive Capabilities:** The AI can evolve solutions in the **Evolution Chamber**, learn from its past in the **Dreaming Chamber**, and even modify its own rules by forging new **Cognitive Constitutions**.

---
### **The Next Evolution: The AGI Blueprint (Phases 14-16)**

The next major leap for NexusAI is the integration of a unified architectural blueprint designed to give the AI true self-awareness and self-correction capabilities. This blueprint combines three powerful concepts:

1.  **Mixture of Cognitive Reasoners (MICRO):** Re-architecting the core AI from a single monolithic model into a team of specialized "reasoners" (`Logic`, `Language`, `Social`, `World`), each expert in its domain.
2.  **Rose-Frame Governance:** A set of principles to diagnose and correct the fundamental cognitive traps of LLMs (e.g., mistaking fluent intuition for grounded reason, or confirmation bias for correctness).
3.  **Knowledge Flow:** A new technique to visualize and manage how information moves *between* the specialized reasoners, creating measurable and directable "patterns of thought."

Our goal is to use our existing Cognitive Geometry engine as a sensor to detect these cognitive traps and then use the MICRO architecture and Knowledge Flow controls to correct them in real-time. This builds an active **System 2 (Reason)** layer to guide the AI's powerful **System 1 (Intuition)**.

---

### Phase 14: The Self-Aware Agent (Architectural Re-Engineering) - 💡 Planned
*   **Objective:** Rebuild the AI's core with specialized reasoners and give it the ability to track its own internal thought processes.
*   **Key Initiatives:**
    *   **Mixture of Cognitive Reasoners (MICRO):** The core engine will be transformed into a modular team of experts, enabling fine-grained control over the AI's cognitive functions.
    *   **Knowledge Flow Tracking:** The AI will generate a "Flow Matrix" for every thought, creating a map of how information moves between its internal reasoners. This map is stored as part of its memory, allowing it to remember *how* it thought, not just *what* it thought.

---

### Phase 15: The Self-Correcting Agent (Dynamic Governance) - 💡 Planned
*   **Objective:** Use the AI's new self-awareness to implement automated self-correction based on Rose-Frame principles.
*   **Key Initiatives:**
    *   **Automated "Reality Checks":** When the system detects a fast, intuitive leap (a "System 1" action), it will automatically enforce a **Knowledge Flow** that forces a check against its factual "World" reasoner, preventing it from mistaking its internal map for the territory.
    *   **Engineered "Cognitive Conflict":** When the system detects it is stuck in a self-confirming loop (confirmation bias), it will enforce a Knowledge Flow that forces it to engage its "Social" reasoner to generate counter-arguments, ensuring a more robust and critical thought process.

---

### Phase 16: The Strategic Agent (Flow-Based Learning & Control) - 💡 Planned
*   **Objective:** Enable the AI to learn from its past thought processes and allow for high-level, strategic control over its cognitive style.
*   **Key Initiatives:**
    *   **Flow-Aware Memory:** The AI's memory retrieval will become far more powerful. It will be able to find past experiences not just by topic, but by the *pattern of thought* used, allowing it to recall "tasks that required a careful shift from creative to logical reasoning."
    *   **Cognitive Style as a Flow Profile:** An "Analytical" style will no longer be just a textual hint; it will become a direct command to prioritize knowledge flow through the `Logic` reasoner. This gives the Cognitive Architect unprecedented control over the AI's mode of thinking.
    *   **Learning Efficient Thought:** The AI will be trained to recognize and prefer efficient Knowledge Flows, learning to solve problems with the most direct and effective cognitive steps.

---
## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.