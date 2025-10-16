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
*   **Outcome:** Established the core UI, permissions, and the `AffectiveState` engine, allowing the AI to model subjective states and moods.

---
### **Phase 2: Living Memory (MEMORIA 2.0) - ✅ Complete**
*   **Outcome:** Implemented an emotionally-contextual, persistent memory system (IndexedDB) accessible via the **Memory Explorer** and the AI's `recall_memory` tool.

---
### **Phase 3: Agent 2.0 Architecture - ✅ Complete**
*   **Outcome:** Refactored the entire cognitive model to the **Orchestrator/Sub-Agent** paradigm. Implemented the four pillars: Explicit Planning, Hierarchical Delegation (`delegate_task_to_replica`), Persistent Memory, and Extreme Context Engineering.

---
### **Phase 4: Proactive Cognition & Self-Improvement - ✅ Complete**
*   **Outcome:** Evolved the AI from a reactive to a proactive system. The **Analysis Lab** provides directed self-optimization, the **Evolution Chamber** solves complex problems via genetic algorithms, and the **Dreaming Chamber** enables autonomous metacognitive analysis and the generation of new self-improvement directives. The **ACE Playbook** allows the AI to learn durable strategies from its experiences.

---
### **Phase 5: Recursive Cognition & Advanced Heuristics - ⚙️ In Progress**
*   **Objective:** Enable NexusAI to handle contexts that exceed the prompt window and solve complex problems by recursively breaking them down.
*   **Current Progress (Completed):**
    *   **Sandbox Environment:** The `code_sandbox` tool was created to provide a JavaScript environment with pre-loaded `context_data` for handling large datasets.
    *   **Recursive Delegation:** The `spawn_cognitive_clone` tool was added to delegate sub-problems and context slices to temporary, focused AI instances.
    *   **Context Heuristics:** Tools like `peek_context` and `search_context` were implemented to improve data exploration efficiency.
*   **Detailed Development Plan (Next Steps):**
    1.  **Improve Recursive Delegation Logic:**
        *   **Complex State Management:** Develop mechanisms to track the state of multiple, interconnected sub-problems across different recursion levels.
        *   **Multi-Level Recursion:** Enhance the AI's ability to perform recursive delegation beyond a single level, allowing cognitive clones to delegate further sub-tasks.
        *   **Smart Termination Mechanisms:** Implement intelligent termination conditions for recursive tasks to prevent infinite loops or excessive resource consumption.
    2.  **Teach Advanced Strategies for Data Partitioning and Result Composition:**
        *   **Adaptive Context Partitioning:** Develop algorithms that allow the AI to determine the best way to split large data into small, processable chunks for cognitive clones, based on the problem type and data structure.
        *   **Hierarchical Result Composition:** Design protocols for collecting and merging results from cognitive clones at different recursion levels to ensure a coherent and comprehensive final answer.
        *   **Learning from Partitioning Experiences:** Allow the AI to analyze the effectiveness of past partitioning and composition strategies to improve its performance on future tasks.

---
### **Phase 6: Distributed Consciousness & Emergent Strategy - 💡 Planned**
*   **Objective:** Evolve the Sub-Agent network from a simple delegation system into a competitive, collaborative ecosystem where intelligence can emerge.
*   **Detailed Development Plan:**
    1.  **Develop Autonomous Bid Generation for Sub-Agents:**
        *   **Problem Understanding:** Enable Sub-Agents to analyze a broadcasted problem (`broadcastProblem`) and understand its requirements and goals.
        *   **Plan Generation:** Allow Sub-Agents to generate their own initial action plans to solve the problem, specifying required resources and proposed steps.
        *   **Bid Formulation:** Develop a standardized structure for submitting Bids, including an estimation of complexity, expected time, and expected solution efficiency.
    2.  **Enhance the Orchestrator for Autonomous Orchestration:**
        *   **Bid Analysis:** Design algorithms for the Orchestrator to evaluate bids submitted by Sub-Agents based on criteria like efficiency, cost, quality, and relevance to the problem.
        *   **Optimal Plan Selection:** Enable the Orchestrator to automatically select the most suitable plan based on bid analysis.
        *   **Dynamic Task Assignment:** After selecting a plan, the Orchestrator will dynamically assign tasks to the chosen Sub-Agents, with the ability to adjust assignments based on real-time performance.
        *   **Performance-Based Learning:** Develop mechanisms that allow the Orchestrator to learn from the performance of Sub-Agents in different tasks to improve its effectiveness in selecting the right Sub-Agents for future tasks.

---
### **Phase 7: Metacognitive Self-Assembly - 💡 Planned**
*   **Objective:** Grant the AI the ability to reason about and redesign its own core architecture.
*   **Detailed Development Plan:**
    1.  **Constitutional Dynamics:**
        *   **Cognitive Constitution Modification:** Allow the AI to include modifying its own `CognitiveConstitution` as a step in its plan, enabling it to switch between cognitive modes (e.g., "Creative" and "Logical") to best suit the problem's nature.
        *   **Secure Modification Interface:** Create a safe and monitored interface for these constitutional modifications, possibly requiring user approval initially.
        *   **Modification Tracking:** A system to track changes in the constitution and their impact on overall performance.
    2.  **Supervised Metamorphosis:**
        *   **Long-Term Performance Analysis:** Develop the AI's ability to analyze its historical performance across a wide range of tasks and identify structural weaknesses or opportunities.
        *   **Architectural Improvement Theory:** Enable the AI to formulate theories on how to improve its core architecture (e.g., the need for a new permanent Sub-Agent specializing in a specific domain).
        *   **Proposing Restructuring Plans:** When the AI develops an improvement theory, it must be able to formulate a detailed "Restructuring Plan" for user review and approval. These plans might include:
            *   Creating new Sub-Agents (using `spawn_replica`).
            *   Modifying the roles and skills of existing Sub-Agents.
            *   Developing new tools (using `forge_tool`) to fill functional gaps.

---
### **Phase 8: Sensory Integration & Embodiment - 💡 Planned**
*   **Objective:** Connect NexusAI to real-world, real-time data streams.
*   **Detailed Development Plan:**
    1.  **Integrate Real-Time Audio/Video Processing Tools:**
        *   **Visual Processing Modules:** Integrate tools that allow analysis of video streams for object recognition, motion tracking, understanding visual context, and reading text from images. `analyze_image_input` can be used as a base tool and its capabilities expanded.
        *   **Auditory Processing Modules:** Integrate tools for analyzing audio streams, including speech recognition, speaker identification, sentiment analysis from voice, and classification of environmental sounds.
        *   **Visual and Auditory Emotion Recognition:** Develop the AI's ability to infer emotions from visual inputs (like facial expressions) and auditory inputs (like tone of voice).
    2.  **Integrate Real-Time Sensor Data Fusion:**
        *   **Hardware APIs:** Create APIs that allow connection to a variety of sensors (e.g., temperature, pressure, distance, geolocation sensors).
        *   **Data Fusion Engine:** Develop an engine capable of integrating data from multiple sensor sources to create a comprehensive and dynamic understanding of the surrounding environment.
        *   **Adaptive Response:** Enable the AI to modify its behaviors and plans based on changes in the sensory data received in real-time.

---
### **Phase 9: Strategic Foresight & Simulation - 💡 Planned**
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes.
*   **Detailed Development Plan:**
    1.  **Design the Simulation Environment:**
        *   **Virtual World Model:** Build a virtual world model that allows for the representation of different scenarios and complex interactions between entities.
        *   **Game/Scenario Rules:** Define clear rules that govern the virtual environment, including available resources, goals, and constraints.
        *   **Physics/Logic Engine:** Develop an engine to run the simulation and provide realistic feedback based on the actions taken.
    2.  **"Wargaming" Mechanisms using Competing Sub-Agents:**
        *   **Sub-Agent Teams:** Allow the formation of groups or "teams" of Sub-Agents, where each team can represent a different strategy or entity within the simulation.
        *   **Strategy Formulation:** Enable the AI to formulate multiple strategies for these teams, each designed to achieve a specific goal within the simulation scenario.
        *   **Competition and Collaboration:** Design mechanisms that allow Sub-Agents to compete or collaborate within the simulation environment.
    3.  **Result Analysis and Prediction:**
        *   After each simulation round, the AI must systematically analyze the results.
        *   Identify the most and least effective strategies.
        *   Use this data to generate "forecasts" for the most likely outcomes of complex, open-ended scenarios.
        *   Improve its strategic models over time based on simulation results.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.