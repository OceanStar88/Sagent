# 📄 System Architecture Design

**AI Voice Call Agent Platform (Multi-Tenant, Real-Time)**


## 1. 🧠 Overview

### 1.1 Purpose

This document defines the **high-level architecture** of a multi-tenant AI voice call platform that supports:

* Outbound AI-driven calls (cold calling)
* Inbound AI-powered reception
* Real-time voice interaction (streaming)
* Configurable AI agents per tenant


### 1.2 Design Goals

* **Low latency** (<1–1.5s perceived response)
* **Real-time streaming pipeline**
* **Multi-tenant isolation**
* **Modular architecture**
* **Production-aligned design (but demo-friendly)**


### 1.3 Technology Stack

* Telephony: Twilio
* AI:  
  * LLM → OpenAI
  * STT/TTS → ElevenLabs
* Backend: FastAPI
* Frontend: React (TypeScript)
* Database: PostgreSQL
* Hosting: Render


# 2. 🏗️ High-Level Architecture

```mermaid
flowchart LR
    User[(End User Caller)]
    Admin[(Platform User)]

    Twilio[Twilio Telephony]
    Backend[FastAPI Backend]
    AI[Voice AI Engine]
    DB[(PostgreSQL)]
    Frontend[React Dashboard]

    User <--> Twilio
    Admin <--> Frontend

    Frontend --> Backend
    Backend --> DB

    Twilio <--> Backend
    Backend --> AI
    AI --> Backend
```


## 2.1 Component Responsibilities

| Component         | Responsibility                             |
| ----------------- | ------------------------------------------ |
| Twilio            | Call handling, media streaming, recordings |
| Backend (FastAPI) | Orchestration, session management, APIs    |
| Voice AI Engine   | STT → LLM → TTS processing                 |
| PostgreSQL        | Persistent storage                         |
| Frontend          | Admin UI, real-time visualization          |
|||

# 3. 🔁 Call Flow Architecture

## 3.1 Inbound Call Flow

```mermaid
sequenceDiagram
    participant Caller
    participant Twilio
    participant Backend
    participant AI
    participant DB

    Caller->>Twilio: Dial number
    Twilio->>Backend: Webhook (/incoming-call)
    Backend->>Backend: Resolve tenant
    Backend->>Twilio: Return TwiML (start stream)

    Twilio->>Backend: Media Stream (WebSocket)
    Backend->>AI: Stream audio

    AI->>Backend: Response audio + text
    Backend->>Twilio: Stream audio back

    Twilio->>Caller: Play response

    Twilio->>Backend: Recording webhook
    Backend->>DB: Save call data
```


## 3.2 Outbound Call Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Twilio
    participant AI
    participant DB

    Admin->>Frontend: Click "Call"
    Frontend->>Backend: POST /call/outbound

    Backend->>Twilio: Create call
    Twilio->>Backend: Webhook (/outbound-answer)

    Backend->>Twilio: Start Media Stream
    Twilio->>Backend: Audio stream

    Backend->>AI: Process conversation
    AI->>Backend: Response

    Backend->>Twilio: Audio response
    Twilio->>Caller: Play

    Twilio->>Backend: Recording webhook
    Backend->>DB: Persist call
```


# 4. ⚡ Real-Time Voice Pipeline Architecture

```mermaid
flowchart LR
    A[Caller Audio Stream]
    B[Streaming STT]
    C[LLM Processing]
    D[Streaming TTS]
    E[Audio Output]

    A --> B --> C --> D --> E
```


## 4.1 Pipeline Characteristics

* Streaming-based (chunk processing)
* Partial transcript handling
* Incremental response generation
* Low-latency audio feedback loop


# 5. 🏢 Multi-Tenant Architecture


## 5.1 Tenant Isolation Model

```mermaid
flowchart TB
    Tenant1[Tenant A]
    Tenant2[Tenant B]

    Backend
    DB[(PostgreSQL)]

    Tenant1 --> Backend
    Tenant2 --> Backend

    Backend --> DB
```


## 5.2 Key Principles

* Single database, shared schema
* Isolation via `tenant_id`
* Per-tenant configuration:

  * API keys
  * agent profiles
  * phone numbers


## 5.3 Request Flow with Tenant Context

```mermaid
flowchart LR
    Request --> Auth[JWT Decode]
    Auth --> Extract[Extract tenant_id]
    Extract --> BackendLogic
    BackendLogic --> DBQuery
```


# 6. 🧠 AI Agent Integration Architecture

```mermaid
flowchart LR
    Input[User Speech]
    STT[Speech-to-Text]
    Prompt[Prompt Builder]
    LLM[LLM]
    TTS[Text-to-Speech]
    Output[Voice Response]

    Input --> STT --> Prompt --> LLM --> TTS --> Output
```


## 6.1 Prompt Composition Layer

* Combines:

  * agent role
  * goal
  * system instructions
  * conversation context


# 7. 🔌 External Integrations


## 7.1 Telephony Integration

* Twilio Media Streams (WebSocket)
* Twilio Webhooks:

  * inbound call
  * outbound answer
  * recording completion


## 7.2 AI Services Integration

* STT/TTS via ElevenLabs
* LLM via OpenAI


# 8. 🗄️ Data Flow Architecture

```mermaid
flowchart LR
    Call[Call Session]
    Transcript[Transcript Buffer]
    Recording[Recording URL]
    DB[(PostgreSQL)]

    Call --> Transcript
    Call --> Recording

    Transcript --> DB
    Recording --> DB
```


## 8.1 Data Types

* Real-time (in-memory):

  * transcripts
  * audio chunks

* Persistent:

  * call metadata
  * transcript
  * recording URL


# 9. 🖥️ Frontend Interaction Architecture

```mermaid
flowchart LR
    UI[React UI]
    WS[WebSocket]
    API[REST API]
    Backend

    UI --> API --> Backend
    UI --> WS --> Backend
```


## 9.1 Communication Types

| Type      | Usage             |
| --------- | ----------------- |
| REST API  | CRUD operations   |
| WebSocket | real-time updates |
|||

# 10. 🚀 Deployment Architecture

```mermaid
flowchart TB
    Internet
    Render[Render Hosting]

    Backend[FastAPI Service]
    Frontend[React App]
    DB[(PostgreSQL)]

    Internet --> Frontend
    Internet --> Backend

    Backend --> DB
```


## 10.1 Deployment Characteristics

* Single-region deployment (demo scope)
* Backend + frontend hosted on Render
* Managed PostgreSQL instance on Render


# 11. ⚠️ Constraints & Tradeoffs


## 11.1 Constraints

* Third-party dependency (Twilio, ElevenLabs, OpenAI)
* Network latency (region-dependent)
* Real-time streaming complexity


## 11.2 Tradeoffs

| Decision               | Tradeoff                |
| ---------------------- | ----------------------- |
| Single DB multi-tenant | simpler, less isolation |
| External audio storage | added dependency        |
| Streaming pipeline     | higher complexity       |


# 12. 🔮 Future Architecture Extensions


* Multi-region deployment (latency optimization)
* Dedicated AI worker services
* Queue system (Redis/Kafka)
* Advanced analytics pipeline
* Multi-agent orchestration


# 13. ✅ Summary

This architecture provides:

* Real-time AI voice interaction
* Multi-tenant SaaS structure
* Clean separation of concerns
* Production-aligned design

It balances:

* **engineering rigor**
* **demo simplicity**
* **scalability readiness**


## ✔️ Next Recommended Document

Proceed with:

👉 [**Voice AI Engine Design**](./2__Voice-AI-Engine-Design.md)

This is where the system becomes truly differentiated.