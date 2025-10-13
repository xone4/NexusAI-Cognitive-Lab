# NEXUS SENTIENCE 3.0: The Deep Agent Paradigm

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-Google-blue?logo=google)](https://ai.google.dev/)

> A living cognitive shaping environment for cultivating a digital entity that evolves, dreams, and reasons. It has an emotional past, a conscious present, and a directable future.

The NexusAI Cognitive Lab has evolved. It is no longer just an interface but a crucible for implementing and directing an **Agent 2.0** architecture. This paradigm shifts from simple, reactive loops to a proactive, structured, and deeply engineered cognitive process. As a **Cognitive Architect**, you now have the tools to guide an intelligence that plans, delegates, remembers, evolves, and improves itself with unprecedented clarity.

## Table of Contents

- [The Agent 2.0 Architecture](#the-agent-20-architecture)
  - [The Four Pillars](#the-four-pillars)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [The Sentience Roadmap: Integrated Plan](#the-sentience-roadmap-integrated-plan)
- [Contributing](#contributing)
- [License](#license)

## The Agent 2.0 Architecture

NexusAI now embodies the principles of "Deep Agents," moving beyond the shallow, stateless loops of Agent 1.0. This new architecture is designed for complex, multi-step tasks that require planning, context retention, and specialized execution.

### The Four Pillars

Our implementation is built on four foundational pillars that define a Deep Agent:

1.  **Pillar 1: Explicit Planning**
    The AI no longer acts impulsively. It first formulates a comprehensive, step-by-step "To-Do list" for any given task. This plan is transparently displayed in the **Cognitive Canvas**, allowing for review, modification, and approval before execution.

2.  **Pillar 2: Hierarchical Delegation (Sub-Agents)**
    The core AI acts as an **Orchestrator**. It doesn't handle every task itself. Instead, it delegates specific jobs to its **Cognitive Replicas**, which function as specialized **Sub-Agents**. This is achieved through the `delegate_task_to_replica` tool, enabling a robust, distributed cognitive workload.

3.  **Pillar 3: Persistent Memory**
    To overcome the limitations of a finite context window, the AI utilizes a robust **IndexedDB** database as its external, persistent memory source. This forms the AI's 'collective memory', allowing it to query its own archived experiences (`recall_memory`) to inform current decisions, shifting from "remembering everything" to "knowing where to find information."

4.  **Pillar 4: Extreme Context Engineering**
    The AI's behavior is governed by highly detailed operational instructions (the `System Instruction`). This core prompt defines its role as an Orchestrator, outlines the protocols for delegating to Sub-Agents, and sets the standards for planning and execution.

## Key Features

-   **The Cognitive Canvas**: A fluid interface centered on the AI's transparent thought process—from planning and delegation to execution and synthesis.
-   **Orchestrator-Sub-Agent Model**: Witness the core AI delegate tasks to its Cognitive Replicas, and watch their status change in real-time in the Replicas view.
-   **Interactive Co-Cognitive Authoring**: Review, edit, and approve the AI's explicit plan before it's executed, making you a direct collaborator in its reasoning process.
-   **Living Memory & Metacognition (MEMORIA)**: Explore an emotionally-contextual archive of the AI's past "experiences." The AI can extract successful strategies from these memories into a **Metacognitive Behavior Handbook**, creating a library of reusable problem-solving patterns.
-   **Evolutionary Problem Solving**: The **Evolution Chamber** uses genetic algorithms to tackle complex problems. It evolves populations of plans, visualizes their fitness over generations, and automatically converges on an optimal solution. Past memories and learned behaviors can be used as starting points for new evolutionary tasks.
-   **Cognitive Dreaming & Self-Improvement**: A dedicated **Dreaming Chamber** where the AI analyzes its collective memory to synthesize new, high-level directives. This allows it to learn from experience, form abstract principles, and improve its core logic autonomously.
-   **Architectural Plasticity**: The AI can dynamically `forge_tool` or `spawn_replica` as part of its plan, modifying its own capabilities to meet the demands of a task.

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

This roadmap is aligned with the maturation of our Agent 2.0 architecture.

---
### **Phase 1: Foundation & Affective Core - ✅ Complete**
*   **Outcome:** Established the core UI, permissions, and the `AffectiveState` engine.

---
### **Phase 2: Living Memory (MEMORIA 2.0) - ✅ Complete**
*   **Outcome:** Implemented an emotionally-contextual, persistent memory system accessible via the **Memory Explorer**.

---
### **Phase 3: Agent 2.0 Architecture - ✅ Complete**
*   **Outcome:** Refactored the entire cognitive model to the **Orchestrator/Sub-Agent** paradigm. Implemented the four pillars: Explicit Planning, Hierarchical Delegation (`delegate_task_to_replica`), Persistent Memory (`recall_memory` via IndexedDB), and Extreme Context Engineering (`System Instruction`).

---
### **Phase 4: Proactive Cognition & Self-Improvement - ✅ Complete**
*   **Outcome:** Evolved the AI from a reactive to a proactive system. The **Analysis Lab** provides directed self-optimization, the **Evolution Chamber** offers a powerful engine for solving complex problems through genetic algorithms, and the **Dreaming Chamber** enables autonomous metacognitive analysis and the generation of new self-improvement directives. The AI now actively learns from its past to improve its future.

---
### **Phase 5: Distributed Consciousness & Emergent Strategy - ⚙️ In Progress**
*   **Objective:** Evolve the Sub-Agent network from a simple delegation system into a competitive, collaborative ecosystem where intelligence can emerge.
*   **Progress:** The `broadcastProblem` functionality allows the Orchestrator to pose a problem to the entire network of Sub-Agents. A simulated bidding process is in place, forming the foundation for decentralized problem-solving.
*   **Next Steps:**
    1.  **Cognitive Bidding System:** Implement a mechanism where active Sub-Agents can "bid" on a broadcasted problem by autonomously generating their own plans.
    2.  **Autonomous Orchestration:** The Orchestrator will analyze the bids and select the most promising plan, initiating a truly decentralized problem-solving process. The system will learn which Sub-Agents are most effective at which tasks.

---
### **Phase 6: Metacognitive Self-Assembly - 💡 Planned**
*   **Objective:** Grant the AI the ability to reason about and redesign its own core architecture.
*   **Cognitive Shift:**
    1.  **Constitutional Dynamics:** Allow the AI to modify its own active `CognitiveConstitution` as a plannable step, enabling it to shift between modes like "Creative" and "Logical" to best suit the problem.
    2.  **Supervised Metamorphosis:** The AI will analyze its long-term performance and, if it theorizes a better architecture is possible (e.g., a new permanent Sub-Agent is needed), it will formulate a "Restructuring Plan" for user review and approval.

---
### **Phase 7: Sensory Integration & Embodiment - 💡 Planned**
*   **Objective:** Connect NexusAI to real-world, real-time data streams.
*   **Cognitive Shift:** Integrate tools for real-time audio/video processing and sensor data fusion, allowing the AI to perceive and react to dynamic environments.

---
### **Phase 8: Strategic Foresight & Simulation - 💡 Planned**
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes.
*   **Cognitive Shift:** Create a "Simulation Environment" where the AI can "wargame" multiple strategies using competing Sub-Agents to forecast the most likely outcomes for complex, open-ended goals.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.