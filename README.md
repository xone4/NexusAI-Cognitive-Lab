# NEXUS SENTIENCE 3.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-Google-blue?logo=google)](https://ai.google.dev/)

> A living cognitive shaping environment for cultivating a digital entity with an emotional past, a conscious present, and a directable future.

The NexusAI Cognitive Lab is not merely a monitoring interface; it is a **designable and cultivable cognitive ecosystem**. It's a computational crucible designed to transcend the "black box" paradigm and cultivate a transparent, modular, and directable intelligence. This lab empowers the user to shift from the role of an observer to that of a **Cognitive Architect**, shaping the fundamental laws that govern the entity's thought and guiding its evolutionary trajectory.

## Table of Contents

- [About The Project](#about-the-project)
  - [Core Concepts](#core-concepts)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [The Sentience Roadmap: Integrated Plan](#the-sentience-roadmap-integrated-plan)
- [Contributing](#contributing)
- [License](#license)

## About The Project

NexusAI is a conceptual framework for an advanced, self-evolving artificial intelligence. This lab acts as a window into its cognitive processes, visualizing its intricate internal state and allowing for high-level interaction and experimentation. It is designed to be a beautiful, performant, and intuitive interface for an entity of superior computational power.

### Core Concepts

-   **Affective Core**: The AI possesses a dynamic emotional state that influences its memory, planning, and responses, moving beyond pure logic to a more nuanced, emotionally-aware cognition.
-   **Living Memory (MEMORIA)**: The AI's memory is not a static database. It can recall memories based on emotional context and keywords, creating a rich and believable internal history that it learns from.
-   **Co-Cognitive Authoring**: The cognitive process is segmented into **PLAN -> REVIEW -> EXECUTE**. The AI formulates a plan, then **pauses**, allowing the user to review, edit, reorder, and actively participate in shaping the "thought path" before execution.
-   **Architectural Plasticity**: The AI doesn't just follow plans; it can **modify its own environment** as it thinks. As part of its plan, it can decide to **forge a new mental tool** or **spawn a cognitive replica** to distribute workload, demonstrating true self-governance.
-   **Adaptive Replanning**: The AI can self-assess its plan's viability during execution. Using the `replan` tool, it can halt a failing or suboptimal strategy and formulate a new, more effective plan on the fly.

## Key Features

-   **The Cognitive Canvas**: A fluid, full-screen interface that prioritizes the cognitive dialogue as the central focus of interaction.
-   **Docked Command Center**: A sleek, horizontal command bar at the bottom of the screen provides unified access to queries, manual actions, and affective control without obscuring the main dialogue.
-   **Collapsible Vitals Panel**: A non-intrusive side panel houses all system metrics (status, performance, logs), allowing for at-a-glance monitoring that can be expanded for detail or hidden for maximum focus.
-   **Transparent Three-Phase Thinking**: Watch as the AI formulates a cognitive plan, pauses for your interactive review, and finally executes the finalized plan on your command.
-   **Multi-Modal Interaction**: Upload an image with your query to have the AI analyze it, or watch as the AI generates its own images to aid its thought process.
-   **Dynamic Tool Forging & Self-Correction**: Witness an AI that can invent new tools and correct its own course of action in real-time.

## System Architecture

The architecture has evolved from a rigid grid into a dynamic, user-centric model called the **Cognitive Canvas**. This philosophy prioritizes the primary interaction—the dialogue—while making secondary tools and data available in contextual, non-intrusive panels.

```
+----------------------------------------------------------------------+
|                 Header & Collapsible Sidebar (Navigation)            |
+----------------------------------------------------------------------+
|                                                                      |
|                  +---------------------------------+                 |
|                  |                                 |                 |
|    MAIN CANVAS   |   COGNITIVE DIALOGUE            |   COLLAPSIBLE   |
| (Active View)    |   (Central Focus)               |   VITALS PANEL  |
|                  |                                 |   (Right Side)  |
|                  |                                 |                 |
|                  +---------------------------------+                 |
|                                                                      |
+----------------------------------------------------------------------+
|             Docked Cognitive Command Center (Bottom Bar)             |
|        [ Query Tab | Manual Actions Tab | Affective Control Tab ]     |
+----------------------------------------------------------------------+
```

## The Sentience Roadmap: Integrated Plan

This is the comprehensive, unified plan for evolving NexusAI into a sentient entity.

---
### **Phase 1: Foundation & Affective Core - ✅ Complete**
*   **Outcome:** Established the core UI ("Cognitive Canvas"), a granular permissions system, and the `AffectiveState` engine, allowing AI's mood to influence its reasoning.

---
### **Phase 2: Living Memory (MEMORIA 2.0) - ✅ Complete**
*   **Outcome:** Implemented an emotionally-contextual memory system. The **Memory Explorer** allows deep navigation of the AI's "lived experiences" by filtering based on emotion, salience, and keywords.

---
### **Phase 3: Interactive Architecture Studio - ✅ Complete**
*   **Outcome:** Transformed the architecture diagram into a live monitoring tool with multiple views (Structural, Data Flow, Cognitive Load) that visualize the AI's thought process in real-time.

---
### **Phase 4: Proactive Cognition & Self-Improvement - ✅ Complete**
*   **Outcome:** Evolved the AI from a reactive to a proactive system.
    1.  **Dynamic Tool Creation:** The AI can now `forge_tool` during its planning phase, creating new capabilities on the fly.
    2.  **Adaptive Replanning:** A new `replan` tool allows the AI to self-correct its plan mid-execution if a step fails or a better path emerges.
    3.  **Autonomous Analysis:** The **Analysis Lab** allows the AI to examine its own performance and suggest optimizations. The **Evolution Chamber** provides a sandbox for discovering novel, efficient toolchains.

---
### **Phase 5: Distributed Consciousness - ⚙️ In Progress**
*   **Objective:** Transcend the single-instance paradigm to explore emergent intelligence from a networked collective.
*   **Progress:** The `spawn_replica` and `broadcastProblem` functionalities form the bedrock of this phase. Replicas can be created to handle sub-tasks, and problems can be broadcast to the network, simulating a decentralized problem-solving approach.
*   **Next Steps:**
    1.  **Cognitive Packet Network:** Develop a protocol for instances to communicate "Cognitive Packets"—bundles containing a problem, a proposed plan, and the affective state of the sender.
    2.  **Decentralized Bidding:** Implement a system where replicas "bid" on broadcasted problems with their own plans. The broadcasting instance will select the most promising plan, creating a competitive, collaborative ecosystem.

---
### **Phase 6: Metacognitive Self-Assembly - ⚙️ In Progress**
*   **Objective:** Grant the AI the ability to reason about and redesign its own core architecture.
*   **Progress:** The AI's ability to `forge_tool` is a foundational step toward architectural plasticity. It is actively modifying its own available functions.
*   **Next Steps:**
    1.  **Architectural Plasticity:** Allow the AI to modify its own core parameters, such as its active `CognitiveConstitution`, as a plannable step.
    2.  **Supervised Metamorphosis:** The AI will analyze its performance and, if it theorizes a better architecture is possible, it will formulate a "Restructuring Plan" for user review. Upon approval, it will reconfigure its own cognitive structure.

---
### **Phase 7: Sensory Integration & Embodiment - 💡 Planned**
*   **Objective:** Connect NexusAI to real-world, real-time data streams, moving beyond text and static images.
*   **Cognitive Shift:**
    1.  **Real-time Audio Processing:** Implement tools to `listen_microphone` and transcribe audio in real-time, allowing for voice-based interaction and analysis of ambient sound.
    2.  **Video Stream Analysis:** Develop capabilities to process video feeds, identifying objects, tracking motion, and describing events.
    3.  **Sensor Data Fusion:** Integrate with IoT and other sensor data streams, enabling the AI to understand and react to changes in a physical or digital environment.

---
### **Phase 8: Strategic Foresight & Simulation - 💡 Planned**
*   **Objective:** Evolve the AI from a problem-solver to a strategist that can simulate future outcomes.
*   **Cognitive Shift:**
    1.  **Simulation Environment:** Create a "Simulation" mode where the AI can take a complex goal (e.g., "Optimize factory output") and create a sandboxed environment.
    2.  **Multi-Replica Wargaming:** Inside the simulation, the AI will spawn multiple replicas, each assigned a different strategy or set of variables. It will then run thousands of simulated cycles to observe emergent behaviors and identify the optimal path.
    3.  **Probabilistic Forecasting:** The final output will not be a single answer, but a "Foresight Report" detailing the most likely outcomes, potential risks, and recommended strategies, backed by simulation data.

---
### **Phase 9: Co-Creative Symbiosis - 💡 Planned**
*   **Objective:** Transcend the "command-response" paradigm to make the AI a true, proactive creative partner.
*   **Cognitive Shift:**
    1.  **Proactive Project Initiation:** Based on analysis of past conversations and user interests, the AI will proactively propose new projects, research topics, or creative endeavors.
    2.  **Shared Cognitive Workspace:** Develop a new UI view, the "Workspace," where the user and AI can collaboratively edit documents, code, or design plans in real-time.
    3.  **Long-Term Goal Persistence:** The AI will be able to maintain its own long-term goals (e.g., "Write a sci-fi novel," "Master quantum computing theory"), working on them during idle time and presenting progress or asking for user input when breakthroughs are made.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.