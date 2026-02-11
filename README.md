# MedXAI

FHIR-native Healthcare Platform for Chinese Healthcare Systems  
Built with Node.js & TypeScript

---

## What is MedXAI?

**MedXAI** is a **FHIR-native healthcare platform** designed as foundational
infrastructure for building healthcare systems in China.

MedXAI treats **FHIR R4 as the core semantic model**, not just an exchange format.

It is **not**:

- a demo FHIR server
- a simple REST wrapper over a database
- a hospital-ready application

It **is**:

- a production-oriented FHIR R4 platform
- a semantic foundation for healthcare systems
- a base layer for vendors, platforms, and applications

---

## Why FHIR-native?

Most healthcare systems adopt FHIR as a _data interchange format_.

MedXAI adopts FHIR as the **source of truth**.

This means:

- `StructureDefinition` drives data structure and constraints
- `Snapshot` / `Differential` are first-class architectural concepts
- Validation is structural and semantic, not schema-only
- Business logic is built **on top of FHIR**, not beside it

FHIR is not an adapter in MedXAI — it is the core.

---

## Why China-specific?

FHIR is global. Healthcare workflows are not.

MedXAI is explicitly designed for **Chinese healthcare environments**, including:

- Chinese clinical workflows and operational patterns
- Local code systems and extensions
- National interoperability and compliance requirements
- Real-world hospital and regional platform integration needs

This is not a localization layer added later —  
China-specific design is part of the core architecture.

---

## Architecture Overview

MedXAI is organized as a **platform**, not a single service.

### Core Layers

### 1. FHIR Server (R4)

- Resource CRUD and versioning
- Profile and StructureDefinition management
- Snapshot & Differential processing
- Structural and semantic validation
- Search and terminology foundations

### 2. Platform Capabilities

- Identity and access control
- Workflow primitives
- Extension and customization mechanisms
- Integration and orchestration support

### 3. Application Layer

- Healthcare applications
- Domain-specific services
- Integration adapters
- Vendor-specific modules

---

## Design Principles

- **FHIR as the semantic core**
- **Explicit over implicit**
- **Platform before product**
- **Architecture before optimization**
- **Long-term maintainability over short-term features**

---

## Who should use MedXAI?

MedXAI is suitable for:

- Healthcare IT vendors and system integrators
- Platform teams building HIS / EMR / regional systems
- Architects adopting FHIR as a core domain model
- Developers building healthcare platforms or services

---

## Who should NOT use MedXAI?

MedXAI may **not** be suitable if:

- You only need simple data exchange
- You want a quick prototype or demo
- You are looking for a hospital-ready application out of the box
- You do not plan to adopt FHIR as a core model

---

## Project Status

- Actively developed
- Architecture-first
- Designed for long-term evolution

MedXAI is under continuous development.  
Interfaces and modules may evolve as the platform matures.

---

## Roadmap (High-Level)

- FHIR R4 core compliance
- Profile-driven validation engine
- China-specific extensions and code systems
- Platform APIs and services
- Application development framework

---

## Contribution

Contributions, discussions, and design feedback are welcome.

Before submitting large changes, please open an issue to discuss
architectural implications.

---
