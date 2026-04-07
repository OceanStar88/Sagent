# 📄 Sequence & Interaction Design

**AI Voice Call Agent Platform (End-to-End Flows)**


## 1. 🧠 Overview

### 1.1 Purpose

Defines **end-to-end interaction flows** across:

* Frontend (React)
* Backend (FastAPI)
* Telephony via Twilio
* AI Engine (STT + LLM + TTS via OpenAI + ElevenLabs)
* Database (PostgreSQL)


## 2. 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Enter email/password
    Frontend->>Backend: POST /auth/login
    Backend->>DB: Validate user
    DB-->>Backend: user record
    Backend-->>Frontend: JWT token
    Frontend->>Frontend: Store token
```


## 3. 📞 Outbound Call Flow (Core Demo)

## 3.1 High-Level Flow

```mermaid
sequenceDiagram
    participant Twilio
    participant Backend
    participant AI
    participant DB
    participant Frontend
    participant User

    User->>Frontend: Click "Call"
    Frontend->>Backend: POST /calls/outbound

    Backend->>Twilio: Create call
    Twilio->>Backend: /outbound-answer webhook

    Backend->>Backend: Create session
    Backend->>DB: Insert call record

    Twilio->>Backend: Start media stream

    loop Real-time conversation
        Backend->>AI: Audio stream
        AI->>Backend: Transcript + Response
        Backend->>Twilio: AI audio
        Backend->>Frontend: Transcript stream
    end

    Twilio->>Backend: Call ends
    Backend->>DB: Update call record
```


## 3.2 Detailed Real-Time Loop

```mermaid
sequenceDiagram
    participant Twilio
    participant Backend
    participant AI
    participant Frontend

    Twilio->>Backend: audio chunk (caller)

    Backend->>AI: send audio
    AI->>Backend: partial transcript

    Backend->>Frontend: partial_transcript

    AI->>Backend: final transcript
    Backend->>Frontend: transcript (user)

    Backend->>AI: send to LLM
    Backend->>Frontend: agent_thinking

    AI->>Backend: response text
    Backend->>Frontend: transcript (agent)

    Backend->>Twilio: TTS audio
```


## 4. 📲 Inbound Call Flow

```mermaid
sequenceDiagram
    participant Caller
    participant Twilio
    participant Backend
    participant AI
    participant DB
    participant Frontend

    Caller->>Twilio: Dial number
    Twilio->>Backend: /incoming-call

    Backend->>Backend: Resolve tenant (phone number)
    Backend->>Backend: Create session
    Backend->>DB: Insert call record

    Twilio->>Backend: Start media stream

    Frontend->>Backend: WS subscribe (call_id)

    loop Conversation
        Twilio->>Backend: audio
        Backend->>AI: process
        AI->>Backend: transcript + response
        Backend->>Frontend: transcript stream
        Backend->>Twilio: audio response
    end

    Twilio->>Backend: call end
    Backend->>DB: update call
```


## 5. 💬 Frontend Observer Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend

    Frontend->>Backend: WS connect /ws/observe/{call_id}

    Backend->>Frontend: call_state

    loop Real-time updates
        Backend->>Frontend: transcript (user)
        Backend->>Frontend: transcript (agent)
        Backend->>Frontend: agent_thinking
    end

    Backend->>Frontend: call_state (completed)
```


## 6. ⚙️ Settings Update Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant DB

    Frontend->>Backend: PUT /settings
    Backend->>DB: Update agent_config
    Backend-->>Frontend: Success response
```


## 7. 📊 Call History Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant DB

    Frontend->>Backend: GET /calls
    Backend->>DB: Query calls
    DB-->>Backend: results
    Backend-->>Frontend: call list
```


## 8. 📄 Call Detail Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant DB

    Frontend->>Backend: GET /calls/{id}
    Backend->>DB: Query call + transcripts
    DB-->>Backend: data
    Backend-->>Frontend: response
```


## 9. 🎙️ Recording Webhook Flow

```mermaid
sequenceDiagram
    participant Twilio
    participant Backend
    participant DB

    Twilio->>Backend: POST /recording-webhook
    Backend->>DB: Update recording_url
```


## 10. 🔁 Session Lifecycle Flow

```mermaid
sequenceDiagram
    participant Backend
    participant AI
    participant DB

    Backend->>Backend: Create session
    Backend->>AI: Initialize engine

    loop Active call
        Backend->>AI: Stream audio
        AI->>Backend: Responses
    end

    Backend->>AI: Terminate
    Backend->>DB: Persist data
    Backend->>Backend: Cleanup session
```


## 11. 🧠 Turn-Taking (Critical Interaction)

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant AI

    User->>Backend: Starts speaking
    Backend->>AI: STT

    AI->>Backend: Transcript

    Backend->>AI: LLM request

    AI->>Backend: Start speaking

    User->>Backend: Interrupts

    Backend->>AI: Cancel TTS
    Backend->>AI: Resume listening
```


## 12. ⚠️ Error Handling Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend

    Backend->>Frontend: error event
    Frontend->>Frontend: Show error UI
```


## 13. 🧩 End-to-End System Flow (Condensed)

```mermaid
sequenceDiagram
    participant Twilio
    participant Backend
    participant AI
    participant DB
    participant Frontend
    participant User

    User->>Frontend: Start call
    Frontend->>Backend: API request

    Backend->>Twilio: initiate call
    Twilio->>Backend: stream audio

    loop conversation
        Backend->>AI: process audio
        AI->>Backend: transcript + response
        Backend->>Frontend: transcript
        Backend->>Twilio: audio
    end

    Twilio->>Backend: end
    Backend->>DB: persist
    Backend->>Frontend: notify
```

About Source Code

- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)