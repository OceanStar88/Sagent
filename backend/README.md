# 🧠 Backend Architecture Overview

This backend is built with **FastAPI** and follows a **layered, modular architecture** designed for:

* real-time voice processing
* user-scoped data ownership
* clean separation of concerns
* production-readiness


## 🛠️ Local Development

This backend is managed with **uv**.

### Install dependencies

```bash
uv sync
```

### Run the API

```bash
uv run uvicorn app.main:app --reload
```

### Environment

Copy `.env.example` to `.env` and adjust values as needed.

```bash
cp .env.example .env
```

Default local PostgreSQL configuration in this repo:

```env
DATABASE_URL=postgresql+psycopg://postgres:8811@localhost:5432/sagent
```

This assumes:

* host: `localhost`
* port: `5432`
* user: `postgres`
* password: `8811`
* database: `sagent`

Create the database before starting the API if it does not already exist.

Default demo login seeded by the app:

```text
admin@sagent.local
password123
```

The demo account uses a `.local` address. Keep `AUTH_ALLOW_TEST_EMAIL_DOMAINS=true` for local/demo environments, and set it to `false` in production if you want to reject reserved test domains.

You can also create a new operator account through the frontend or `POST /v1/auth/signup`.

New operator signups now require email verification before sign-in succeeds.

Email delivery configuration:

```env
FRONTEND_APP_URL=http://localhost:3000
EMAIL_VERIFICATION_EXPIRE_HOURS=24
GOOGLE_OAUTH_CLIENT_ID=
AVATAR_MAX_BYTES=5242880
AVATAR_IMAGE_SIZE=512
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_AVATAR_FOLDER=sagent/avatars
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_USE_SSL=false
SMTP_FROM_EMAIL=no-reply@sagent.local
```

If `SMTP_HOST` is not configured, the backend logs the verification URL instead. That keeps local development unblocked while still exercising the same verification flow.

Google auth configuration:

- Set `GOOGLE_OAUTH_CLIENT_ID` to the same Google Web client ID used by the frontend Google Identity Services button.
- `POST /v1/auth/google/signin` signs an existing account in with a verified Google ID token.
- `POST /v1/auth/google/signup` creates a new operator account from a verified Google ID token and signs the user in immediately.
- If a user verifies the same email with Google later, the backend marks the existing pending email verification as complete.

Profile avatars are normalized with Pillow and stored on Cloudinary.
The backend crops avatars to a square `AVATAR_IMAGE_SIZE x AVATAR_IMAGE_SIZE` image, corrects EXIF orientation, preserves transparency when present, and overwrites the same Cloudinary public ID per user so avatar changes are atomic from the application perspective.

Required avatar runtime dependencies:

```bash
uv sync
```

That installs the Cloudinary SDK and Pillow declared in `pyproject.toml`.


## 🏗️ High-Level Architecture

```mermaid
flowchart LR
    Client[Frontend / Twilio]
    API[API Layer]
    WS[WebSocket Layer]
    Service[Service Layer]
    AI[AI Engine]
    Repo[Repository Layer]
    DB[(Database)]

    Client --> API
    Client --> WS

    API --> Service
    WS --> Service

    Service --> AI
    Service --> Repo

    Repo --> DB
```


## 📁 Project Structure

```text
app/
├── main.py
├── core/
├── api/
├── ws/
├── services/
├── ai/
├── models/
├── schemas/
├── repositories/
├── integrations/
└── utils/
```


# 📦 Folder Responsibilities


## 🚀 `main.py` — Application Entry Point

**Role:**

* Initializes FastAPI app
* Registers routes and middleware
* Mounts WebSocket handlers

**Why it exists:**

* Acts as the **composition root** where all modules are wired together


## ⚙️ `core/` — Core Infrastructure

```text
core/
├── config.py
├── security.py
├── database.py
└── logging.py
```

**Responsibilities:**

* App configuration (env variables)
* JWT authentication & password hashing
* Database connection management
* Logging setup

**Key Principle:**

> Centralize cross-cutting concerns (config, security, DB)


## 🌐 `api/` — REST API Layer

```text
api/
├── deps.py
└── routes/
```

**Responsibilities:**

* Define HTTP endpoints
* Validate requests (via schemas)
* Enforce authentication

**Current auth endpoints:**

* `POST /v1/auth/login` → email/password sign-in
* `POST /v1/auth/signup` → account creation + verification email dispatch
* `POST /v1/auth/google/signin` → Google ID-token sign-in for an existing account
* `POST /v1/auth/google/signup` → account creation from a Google identity
* `POST /v1/auth/verify-email` → completes email verification from a token
* `POST /v1/auth/resend-verification` → issues a fresh verification email
* `POST /v1/auth/forgot-password` → sends a password reset link when the account supports password sign-in
* `POST /v1/auth/reset-password` → sets a new password from a valid reset token
* `POST /v1/auth/avatar` → uploads or replaces the current operator avatar
* `DELETE /v1/auth/avatar` → removes the current operator avatar
* `GET /v1/auth/preferences` → fetches persisted operator preferences
* `PUT /v1/auth/preferences` → updates persisted operator preferences
* `GET /v1/auth/me` → current authenticated operator profile

**Important Rule:**

> ❌ No business logic here
> ✅ Only request/response handling


## 🔌 `ws/` — WebSocket Layer (Real-Time Core)

```text
ws/
├── manager.py
├── observer.py
└── twilio_stream.py
```

**Responsibilities:**

* Handle real-time communication
* Maintain active call sessions
* Stream transcripts to frontend
* Process telephony audio streams


### WebSocket Architecture

```mermaid
flowchart LR
    Twilio --> TwilioWS
    TwilioWS --> SessionManager

    SessionManager --> ObserverWS
    ObserverWS --> Frontend
```


### Components

* **manager.py** → session registry (active calls)
* **observer.py** → frontend live updates
* **twilio_stream.py** → telephony audio handling


## 🧩 `services/` — Business Logic Layer

```text
services/
├── call_service.py
├── session_service.py
├── transcript_service.py
└── agent_service.py
```

**Responsibilities:**

* Core application logic
* Call lifecycle management
* Session orchestration
* AI coordination


### Service Flow

```mermaid
flowchart LR
    API --> Service
    WS --> Service
    Service --> AI
    Service --> Repository
```


## 🤖 `ai/` — Voice AI Engine

```text
ai/
├── pipeline.py
├── stt.py
├── llm.py
├── tts.py
└── turn_taking.py
```

**Responsibilities:**

* Speech-to-text processing
* LLM reasoning
* Text-to-speech generation
* Turn-taking & interruption handling


### AI Pipeline

```mermaid
flowchart LR
    AudioIn --> STT --> LLM --> TTS --> AudioOut
```


## 🧱 `models/` — Database Models (ORM)

**Responsibilities:**

* Define database tables using ORM (e.g., SQLAlchemy)
* Represent core entities (User, Call, Transcript)


## 📨 `schemas/` — API Data Contracts

**Responsibilities:**

* Request validation
* Response formatting
* Type safety between frontend and backend


### Key Distinction

| Layer   | Purpose            |
| ------- | ------------------ |
| models  | database structure |
| schemas | API contract       |


## 🗃️ `repositories/` — Data Access Layer

**Responsibilities:**

* Encapsulate database queries
* Provide clean interface for data operations


### Why this exists

> Prevents business logic from directly depending on SQL


## 🔗 `integrations/` — External Services

```text
integrations/
├── twilio_client.py
├── elevenlabs_client.py
└── openai_client.py
```

**Responsibilities:**

* Wrap third-party APIs
* Handle retries, errors, and formatting


### Key Benefit

> Easy to swap providers without breaking core logic


## 🧰 `utils/` — Shared Utilities

**Responsibilities:**

* Helper functions
* Audio processing utilities
* Validators and formatters


# 🔄 End-to-End Flow Example


## 📞 Outbound Call

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API
    participant Service
    participant WS
    participant AI
    participant DB

    FE->>API: POST /calls/outbound
    API->>Service: start_call

    Service->>WS: create session

    loop conversation
        WS->>Service: audio event
        Service->>AI: process
        AI->>Service: response
        Service->>WS: transcript
    end

    Service->>DB: persist call
```


# 🎯 Design Principles


## 1. Separation of Concerns

Each layer has a **single responsibility**:

* API → transport
* Service → logic
* AI → intelligence
* Repo → data


## 2. Real-Time First

* WebSocket layer is isolated and optimized
* session-based architecture


## 3. Scalability

* easy to introduce Redis / queues
* modular AI components


## 4. Maintainability

* testable services
* replaceable integrations
* clear boundaries


# ✅ Summary

This backend architecture:

* supports **real-time AI voice interactions**
* enforces **clean modular design**
* is **production-ready and scalable**

