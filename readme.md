# VOID SDK

> **Semantic instrumentation for AI agents built on OpenTelemetry.**

VOID SDK is an opinionated instrumentation framework that enables AI applications to produce rich, structured telemetry using OpenTelemetry.

Instead of manually creating spans and attaching arbitrary attributes, developers instrument agents through a high-level SDK that automatically generates consistent telemetry following VOID semantic conventions.

The SDK focuses on one responsibility:

> **Capture what the AI system is doing and describe it in a machine-understandable way.**

---

# Why VOID SDK?

Traditional OpenTelemetry knows about things like:

- HTTP requests
- Databases
- gRPC
- Queues

It does **not** understand AI concepts such as:

- Agent execution
- Tool calls
- Prompt versions
- Memory retrieval
- Reasoning loops
- Fallbacks
- Token usage

VOID SDK introduces these concepts as semantic telemetry while remaining fully compatible with OpenTelemetry.

---

# Architecture

```
Application
        │
        ▼
    VOID SDK
        │
        ▼
Tracer Manager
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Agent Wrapper     Tool Wrapper
        │              │
        └──────┬───────┘
               ▼
        Span Builder
               │
               ▼
    VOID Semantic Attributes
               │
               ▼
        OpenTelemetry API
               │
               ▼
        OTLP Exporter
               │
               ▼
            SigNoz
               │
               ▼
        VOID Server
```

---

# SDK Components

```
src/

instrumentation/
wrappers/
tracing/
config/
exporters/
```

### Instrumentation

Initializes the SDK and configures tracing.

### Wrappers

High-level APIs for instrumenting AI agents and tools.

### Tracing

Creates and manages OpenTelemetry spans.

### Config

Loads SDK configuration.

### Exporters

Integrates with OpenTelemetry exporters.

---

# Semantic Conventions

The SDK defines a consistent vocabulary for AI telemetry.

Examples include:

```
void.agent.name

void.agent.role

void.tool.name

void.tool.result

void.prompt.version

void.memory.hit

void.token.input

void.token.output
```

Every instrumented application emits telemetry using the same attribute names, making traces portable and consistent across projects.

---

# Responsibilities

The SDK is responsible for:

- Instrumenting agent execution
- Instrumenting tool execution
- Creating spans
- Recording events
- Applying VOID semantic attributes
- Exporting telemetry through OpenTelemetry

The SDK is **not** responsible for:

- Incident detection
- Risk analysis
- Fingerprinting
- Replay
- LLM evaluation
- GitHub integration
- Repair suggestions

These capabilities belong to **VOID Server**.

---

# Telemetry Flow

```
Application

        │

        ▼

VOID SDK

        │

        ▼

OpenTelemetry

        │

        ▼

SigNoz

        │

        ▼

VOID Server
```

---

# Design Principles

- OpenTelemetry-native
- Framework agnostic
- Vendor neutral
- Minimal runtime overhead
- Consistent semantic conventions
- Extensible instrumentation

---

# Vision

OpenTelemetry provides the telemetry infrastructure.

VOID SDK provides the language AI systems use to describe themselves.

By standardizing AI-specific telemetry, applications become easier to observe, analyze, and debug regardless of the underlying observability platform.

---

# License

MIT
