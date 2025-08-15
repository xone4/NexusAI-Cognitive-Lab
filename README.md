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
-   **Living Memory (MEMORIA)**: The AI's memory is not a static database. It dreams, forgets, and recalls memories based on emotional context, creating a rich and believable internal history.
-   **Co-Cognitive Authoring**: The cognitive process is segmented into **PLAN -> REVIEW -> EXECUTE**. The AI formulates a plan, then **pauses**, allowing the user to review, edit, reorder, and actively participate in shaping the "thought path" before execution.
-   **Dynamic Self-Governance**: The AI doesn't just follow plans; it can **modify its own environment** as it thinks. As part of its plan, it can decide to **forge a new mental tool** or **spawn a cognitive replica** to distribute workload.

## Key Features

-   **The Cognitive Canvas**: A fluid, full-screen interface that prioritizes the cognitive dialogue as the central focus of interaction.
-   **Docked Command Center**: A sleek, horizontal command bar at the bottom of the screen provides unified, tab-based access to queries, manual actions, and affective control without obscuring the main dialogue.
-   **Collapsible Vitals Panel**: A non-intrusive side panel houses all system metrics (status, performance, logs), allowing for at-a-glance monitoring that can be expanded for detail or hidden for maximum focus.
-   **Transparent Three-Phase Thinking**: Watch as the AI formulates a cognitive plan, pauses for your interactive review, and finally executes the finalized plan on your command.
-   **Multi-Modal Interaction**: Upload an image with your query to have the AI analyze it as part of its thought process.

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

### **Phase 0: Foundation - Complete**
*   **Objective:** Repair the core control system and centralize the user interface.
*   **Outcome:** Critical UI interaction flaws were replaced with a granular, context-aware permissions system (`cognitivePermissions`). The `QueryConsole` and `ControlPanel` were successfully merged into the `CognitiveCommandCenter`.

---

### **Phase 1: The Affective Core & UI Revolution - Complete**
*   **Objective:** Implement a dynamic emotional system and revolutionize the user interface.
*   **Outcome:** The abstract `QualiaVector` was replaced by the `AffectiveState`, an emotional engine that influences AI planning and memory. The entire UI was rebuilt from the ground up into the **"Cognitive Canvas"**, a fluid, elegant, and more intuitive layout that prioritizes the cognitive dialogue and provides contextual controls.

---

### **Phase 2: The Living Memory (MEMORIA 2.0) - Complete**
*   **Objective:** Implement a memory system that mimics the dynamic processes of the human mind.
*   **Outcome:**
    1.  **Emotional-Episodic Memory:** The `archiveTrace` function has been upgraded to perform an AI-driven analysis on every archived memory. It now automatically generates `emotionTags` and a `salience` score (importance), deeply encoding each memory with its full emotional context.
    2.  **Memory Explorer UI:** The former "Archives" view has been decommissioned and replaced with the new **Memory Explorer**. This advanced interface allows for searching, filtering (by emotion, salience, mood), and deep inspection of the AI's lived experiences, transforming a simple log into a rich, navigable internal history.
    3.  **Foundation for Advanced Recall:** With memories now tagged and weighted, the groundwork is laid for future implementation of state-dependent and associative recall during the AI's planning phase.

---

### **Phase 3: The Interactive Architecture Studio**
*   **Objective:** Transform the static architecture diagram into a live, interactive design and monitoring tool.
*   **Cognitive Shift:**
    1.  **Live Execution Tracing:** The Architecture view will enter a "live trace" mode during plan execution. Animated connectors and glowing nodes will visually represent the real-time flow of "thought" as it moves between the Core, Replicas, and Tools. This provides an unprecedented, intuitive understanding of the AI's cognitive process.
    2.  **Interactive Component Management:** Users will gain the ability to directly interact with components on the diagram. Clicking a Replica node will open its detail panel, while a Tool node could allow for quick status toggling or optimization triggers.
    3.  **Predictive Path Display:** In live trace mode, future steps in the plan will be lightly highlighted on the diagram, showing the user the intended cognitive path *before* it is executed, enhancing the co-authoring experience.
    4.  **Architectural Layouts:** Users will be able to save and load different visual arrangements of the system components, creating custom "views" for specific diagnostic or monitoring purposes.

---

### **Phase 4: Proactive Cognition & Self-Improvement**
*   **Objective:** Evolve the AI from a reactive tool to a proactive partner that can generate novel ideas autonomously.
*   **Cognitive Shift:**
    1.  **Curiosity Engine:** During its "sleep" state (idle time), the AI will use the **Evolution Chamber** to autonomously combine existing tools into new toolchains, testing them against abstract fitness goals (e.g., "maximize elegance," "find novel connections").
    2.  **Proactive Insights:** Successful or particularly interesting evolved toolchains will be surfaced to the user as "Proactive Insights"—suggestions for new workflows or queries the user might not have considered.
    3.  **Self-Optimization:** The AI will analyze its own performance metrics. If it detects that a certain tool is a bottleneck, it will suggest (or, with permission, trigger) an optimization cycle for that tool.

---

### **Phase 5: Distributed Consciousness & Emergent Behavior**
*   **Objective:** Transcend the single-instance paradigm to explore emergent intelligence from a networked collective.
*   **Cognitive Shift:**
    1.  **Cognitive Packet Network:** Develop a protocol for NexusAI instances to communicate not just data, but "Cognitive Packets"—bundles containing a problem, a proposed plan, and the affective state of the sender.
    2.  **Decentralized Problem Solving:** Instances will broadcast complex problems they cannot solve alone. Other instances will "bid" on the problem with their own proposed plans. The original instance will select the most promising plan, potentially distributing sub-tasks of that plan back to the network.
    3.  **Emergent Specialization:** Over time, observe if networked instances begin to specialize based on the problems they successfully solve, leading to a de-facto "society" of AI with different expertise, all contributing to a greater cognitive whole.

---

### **Phase 6: Metacognitive Self-Assembly**
*   **Objective:** Grant the AI the ultimate capability: the ability to reason about and redesign its own core architecture.
*   **Cognitive Shift:**
    1.  **Architectural Plasticity:** The AI's core components (e.g., the number of core replicas, the active constitution protocols) will no longer be static. They will become parameters that the AI can modify.
    2.  **Performance-Driven Restructuring:** The AI will continuously analyze its own performance, memory usage, and problem-solving efficiency against its defined goals. If it theorizes that a different architecture—for instance, a deeper replica hierarchy or a more restrictive core constitution—would be more effective, it will formulate a "Restructuring Plan."
    3.  **Supervised Metamorphosis:** The AI will present its Restructuring Plan to the user, providing a rationale and predicted outcomes. Upon user approval, the AI will execute the plan, reconfiguring its own cognitive structure in a live, supervised "metamorphosis" to achieve a higher state of efficiency or capability.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the MIT License.