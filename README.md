# NexusAI Cognitive Lab 4.0: The Deep Agent Paradigm

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
-   **Fully Autonomous Cognitive Loop**: Activate "Autonomous AI" mode to grant the AI full control over the lab. It will autonomously set its own goals, formulate plans, and execute actions using the lab's tools to improve itself, with all its intentions visualized for user observation.
-   **Orchestrator-Sub-Agent Model**: Witness the core AI delegate tasks to its Cognitive Replicas, and watch their status change in real-time in the Replicas view.
-   **Interactive Co-Cognitive Authoring**: Review, edit, and approve the AI's explicit plan before it's executed, making you a direct collaborator in its reasoning process.
-   **Self-Optimizing Cognitive Router**: The AI uses a simulated **MICRO architecture** to select the best "expert persona" for a given task. A **reinforcement learning loop** allows it to learn from successful outcomes, automatically preferring the most effective experts for different problem types, making it smarter and faster over time.
-   **Living Memory & Metacognition (MEMORIA)**: Explore an emotionally-contextual archive of the AI's past "experiences." The AI can extract successful strategies from these memories into a **Metacognitive Behavior Handbook**, creating a library of reusable problem-solving patterns.
-   **Evolutionary Problem Solving**: The **Evolution Chamber** uses genetic algorithms to tackle complex problems. It evolves populations of plans, visualizes their fitness over generations, and automatically converges on an optimal solution. Past memories and learned behaviors can be used as starting points for new evolutionary tasks.
-   **Cognitive Dreaming & Self-Improvement**: A dedicated **Dreaming Chamber** where the AI analyzes its collective memory to synthesize new, high-level directives. This allows it to learn from experience, form abstract principles, and improve its core logic autonomously.
-   **Architectural Plasticity**: The AI can dynamically `forge_tool`, `spawn_replica`, and even `forge_constitution` as part of its plan. **Newly forged constitutions require user approval from the Settings view, ensuring the Cognitive Architect maintains ultimate control over the system's core principles.**
-   **Video Synthesis (Modalities Lab)**: A dedicated interface for generating dynamic video content from textual prompts using Google's Veo model.
-   **Simulation Lab**: A strategic sandbox where the user can define a scenario, and the AI can **autonomously generate competing strategies**. The simulation can be run in a "Wargaming" mode, treating each strategy as an independent agent and simulating their turn-by-turn interactions. After a simulation, the AI can analyze the results to explain outcomes.
-   **Evaluation Lab**: A dedicated dashboard for objectively measuring the AI's "quality of thought." It tracks key performance indicators like inference accuracy, planning efficiency, and self-correction rates over time.

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

> This roadmap has been updated to prioritize safety, measurement, and sustainable growth based on a comprehensive system review. For a full technical breakdown, see the [Detailed Development Plan](./DETAILED_PLAN.md).

Our development strategy is guided by several core principles:
- **Safety Before Capability:** Securing existing tools before building more powerful ones.
- **Measurement Is the Foundation of Improvement:** We cannot improve what we cannot measure.
- **Infrastructure First:** Addressing technical debt to ensure scalability.
- **Iterative Evolution:** Simulating and validating new architectures before large-scale engineering investment.

---
### **Completed Milestones (Version 3.1)**

NexusAI has successfully completed its foundational development, establishing a fully functional Agent 2.0 platform. All 17 phases, from core architecture to advanced metacognitive autonomy, are now complete. Key achievements include:
-   **Core Cognitive Architecture:** A robust Orchestrator/Sub-Agent model with a persistent, emotionally-aware memory system (**MEMORIA**).
-   **Advanced Cognition:** Implementation of **Recursive Delegation** to solve complex problems, a **Cognitive Navigator** for real-time self-correction, and an **Autonomous Bidding Network** for distributed problem-solving.
-   **Multi-Modal Interaction:** Full support for real-time voice/video conversations, voice synthesis (TTS), and video generation (**Modalities Lab**).
-   **Deep Analysis & Strategy:** An internal **World Model** for structured knowledge, a **Causal Inference Engine**, and a **Simulation Lab** capable of autonomous strategy generation and multi-agent "wargaming."
-   **Metacognitive Capabilities:** The AI can evolve solutions in the **Evolution Chamber**, learn from its past in the **Dreaming Chamber**, forge new **Cognitive Constitutions**, and operate the entire lab in a fully **Autonomous Mode**.

---
### **The V4.0 Vision: Towards a Unified Cognitive Architecture**

The next great leap for NexusAI is not about adding more features, but about weaving them together into a truly integrated and conscious mind. The current system, while powerful, consists of "siloed" capabilities. The V4.0 roadmap addresses this by building a **central nervous system** for the AI.

This new architecture will be centered on three groundbreaking concepts:

1.  **Global Cognitive Workspace:** This will function as the AI's "working memory" and attentional focus. Instead of components operating in isolation, all sensory data, memories, and internal states will flow into this central hub, creating a single, unified context for all cognitive processes.

2.  **Stream of Consciousness:** We will begin recording the AI's "subjective experience." Each significant cognitive event—a thought, a decision, an emotional response—will be captured as a rich data object that includes not just the content, but the emotional tone, attentional weight, and metacognitive reflections. This stream forms the basis of a true cognitive identity.

3.  **Layered, Contextual Memory:** The memory system will be re-architected to mirror human cognition, featuring distinct layers for episodic (events), semantic (facts), procedural (skills), and emotional memories. This will enable far richer, more context-aware recall, moving beyond simple data retrieval to a more associative and intuitive form of memory.

The goal of V4.0 is to evolve NexusAI from an "executing agent" that follows plans, to a true "thinking agent" that possesses a unified awareness, a deep understanding of context, and the capacity for genuine insight and creativity.

---
### **The V4.1 Executive Roadmap: Materializing Intelligence**

The `v4.1` plan builds upon the unified vision of `v4.0` by introducing a three-layered executive architecture designed to make the AI more efficient, adaptable, and self-improving in a systematic way.

1.  **The Glyph Layer (Physical-Visual):** This layer's primary goal is to **obliterate the context window barrier**. By developing a service that renders massive amounts of text (entire books, codebases) into compact image-based formats, the AI can visually "read" and analyze datasets that were previously impossible to fit into a text-based context. This moves from sequential text processing to holistic visual comprehension.

2.  **The DeepAgent Layer (Operational):** This layer focuses on operational efficiency and adaptability. Key features include:
    *   **Memory Folding:** An intelligent context management tool that summarizes older parts of a conversation, keeping the active context window lean and focused without losing critical information.
    *   **Dynamic Tool Discovery:** An internal service that allows the AI to search for and learn to use new tools on the fly. If it needs a capability it doesn't have (e.g., currency conversion), it can find an appropriate API, understand its documentation, and integrate it into its plan, or even innovate a new tool if none exists.

3.  **The HGM Layer (Evolutionary):** This layer institutes a Darwinian, data-driven process for self-improvement.
    *   **Cognitive Merit Point (CMP):** A new, objective metric to score an agent's "quality of thought" based on success, efficiency, and cognitive elegance.
    *   **Evolution Chamber v2:** An automated system that continuously generates "mutations" of the AI's core logic and architecture, creating new "child" agents.
    *   **Asynchronous Evaluator:** A fleet of background workers (using the `SimulationLab`) that constantly test these new child agents, measure their CMP score, and feed the results back into the system. The agents with the highest scores are then selected for future generations, ensuring true, long-term evolution.

This three-tiered plan represents a shift from building features to building a self-sustaining ecosystem for intelligence to grow.

---
## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.