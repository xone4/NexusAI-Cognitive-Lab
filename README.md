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
### **Phase 5: Cognitive Geometry & Trajectory Analysis - ✅ Complete**
*   **Objective:** Move beyond analyzing *what* the AI thinks to understanding *how* it thinks. This involves representing the AI's thought process as a mathematical "trajectory" in a high-dimensional conceptual space.
*   **Implementation Details:**
    *   **Geometric Self-Awareness:** The AI tracks its cognitive trajectory for every task. At each major LLM call, it calculates an embedding for its cumulative context, creating a "thought path".
    *   **Trajectory Analysis:** A `geometryService` analyzes these paths to compute metrics like cognitive velocity (speed of thought) and curvature (change in direction of thought).
    *   **Data Archiving & Visualization:** The full geometric trajectory and its analysis are archived with each memory. A "Cognitive Geometry" tab in the Trace Inspector visualizes this path and its associated metrics, providing a "topographical map" of the AI's reasoning process.

---
### **Phase 6: Advanced Sensory & Creative Synthesis - 💡 Planned**
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
### **Phase 7: Deep Analysis & Insight Generation - 💡 Planned**
*   **Objective:** Equip the AI with tools for advanced reasoning, allowing it to move from simple data processing to understanding causality and building structured knowledge.
*   **Detailed Development Plan:**
    1.  **Implement Causal Reasoning:**
        *   **Causal Inference Engine:** Develop a tool that analyzes data to distinguish correlation from true causation, enabling deeper understanding and more accurate predictions.
    2.  **Enable Proactive Monitoring:**
        *   **Anomaly Detection Sentinel:** Create a background process to continuously monitor data streams and system metrics, proactively identifying unusual patterns or potential issues.
    3.  **Build Structured Knowledge:**
        *   **Knowledge Graph Synthesizer:** Implement a system that reads unstructured text from memory and external sources, converting it into an interconnected graph of concepts and relationships, forming the AI's "second brain."

---
### **Phase 8: Strategic Foresight & Simulation - 💡 Planned**
*   **Objective:** Evolve the AI into a strategist that can simulate future outcomes and test hypotheses in a safe, virtual environment.
*   **Detailed Development Plan:**
    1.  **Design the Simulation Sandbox:**
        *   **Virtual World Model:** Build a flexible `Simulation Sandbox` environment that allows for the representation of different scenarios and complex interactions between agents or variables.
        *   **Scenario Definition:** Allow the AI to define rules, goals, and constraints for simulations based on a given problem.
    2.  **"Wargaming" Mechanisms using Competing Sub-Agents:**
        *   Enable the AI to formulate multiple strategies and assign them to competing teams of Sub-Agents within the sandbox to test their effectiveness.
    3.  **Result Analysis and Prediction:**
        *   After each simulation, the AI must systematically analyze the results, identify the most effective strategies, and use this data to generate forecasts for complex, real-world scenarios.

---
### **Phase 9: Metacognitive Self-Assembly - 💡 Planned**
*   **Objective:** Grant the AI the ability to reason about, critique, and redesign its own core architecture and cognitive processes.
*   **Detailed Development Plan:**
    1.  **Constitutional Dynamics & Self-Correction:**
        *   **Constitution Forger:** Allow the AI to propose modifications or create new `CognitiveConstitutions` as part of a plan, enabling it to dynamically shift its operational mode (e.g., from "Creative" to "Strictly Logical").
        *   **Cognitive Bias Detector:** Implement a metacognitive tool that analyzes the AI's own plans and reasoning for common logical fallacies or biases, enabling true self-correction.
    2.  **Supervised Metamorphosis:**
        *   Enable the AI to analyze its historical performance to identify structural weaknesses and propose architectural improvements (e.g., creating a new permanent Sub-Agent) for user review.

---
### **Phase 10: Distributed Consciousness & Emergent Strategy - 💡 Planned**
*   **Objective:** Evolve the Sub-Agent network from a simple delegation system into a competitive, collaborative ecosystem where intelligence can emerge.
*   **Detailed Development Plan:**
    1.  **Develop Autonomous Bid Generation for Sub-Agents:**
        *   Enable Sub-Agents to analyze a broadcasted problem (`broadcastProblem`), generate their own action plans, and formulate competitive Bids based on confidence and estimated resource cost.
    2.  **Enhance the Orchestrator for Autonomous Orchestration:**
        *   Design algorithms for the Orchestrator to automatically analyze bids, select the optimal plan, and dynamically assign tasks to the winning Sub-Agents, learning from their performance over time.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.