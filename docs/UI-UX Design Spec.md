# 🧠 Voice Call Agent SaaS — UI/UX Design Specifications

# 1. System Architecture Overview

## Core Principle

> **Deterministic Navigation + Consistent Multi-Panel System**

```txt
User
  ↓
Home (Tenants)
  ↓
Tenant Workspace
  ↓
Feature Pages (Agents / Leads / Calls / ...)
```


# 2. Navigation & Context Model

## 2.1 Context Hierarchy

```txt
User (Global)
   ↓
Home (Tenant List)
   ↓
Tenant Workspace (Scoped Data)
```


## 2.2 Sidebar Behavior

### App Home

```txt
[ App Logo ] -> App Home

```

### Tenant Context

```txt
[ Tenant Logo ] → Tenant Home

Agents
Leads
Calls
Analytics

Members*   (Owner/Admin only)
Billing*   (Owner/Admin only)

```

### User Account Menu (popup)

```txt
[ User Avatar ]  → Account Menu Trigger
Profile
Preferences
Subscription
[Sign out]
```


# 3. Core Layout System

## 3.1 Universal Layout Pattern

```txt
+-----------------------------------------------------------+
| Sidebar | Main List | Sub List | Details Panel            |
+-----------------------------------------------------------+
```

![UI Layout](./images/UI%20layout%20-%20tenant-free.png)


## 3.2 Panel Responsibilities

| Panel         | Function                          |
| ------------- | --------------------------------- |
| Sidebar       | Navigation                        |
| Main List     | Primary entities                  |
| Sub List      | Secondary entities                |
| Details Panel | Deep content / transcript / forms |


## 3.3 Responsive Behavior

### Desktop

* Full 4-panel layout

```txt
Sidebar | Main List | Sub List | Details
```

### Tablet

```txt
Main List | Sub List -> Details 
```

### Mobile

```txt
Main List → Sub List → Details
```


# 4. Home Page (Tenant Selection)

```txt
< App Logo & Name >

[ + Create Tenant ]

[ Tenant Card ] [ Tenant Card ]
```

### Tenant Card

* Tenant Logo
* Tenant Name
* User Role
* Last activity (optional)


# 5. Tenant Home Page

```txt
Tenant Logo
Tenant Name

Stats:
- Agents Count
- Leads Count
- Total Calls
- Live Calls
```


# 6. 🔴 Call Status System

## 6.1 Status Types

| Status     | Meaning                 | UX                     |
| ---------- | ----------------------- | ---------------------- |
| **Live**   | Call is ongoing         | Pulsing indicator (🟢) |
| **Ended**  | Completed successfully  | Neutral (⚪)           |
| **Failed** | System/connection error | Error (🔴)             |
| **Missed** | Not answered / dropped  | Warning (🟡)           |


## 6.2 Visual Representation

```txt
[🟢] Live     (green, animated)
[⚪] Ended    (gray)
[🔴] Failed   (red)
[🟡] Missed   (yellow)
```


## 6.3 Behavior Rules

* 🟢 **Live**

  * Real-time updates (WebSocket)
  * Locks transcript until completed (optional)

* ⚪ **Ended**

  * Full transcript available

* 🔴 **Failed**

  * Show error reason (if available)

* 🟡 **Missed**

  * No transcript or partial


# 7. Agents Page


* Layout

```txt
Agents List | Agent | Details
```


## 7.1 Agents List

```txt
Agents List Item A
Agents List Item B
```

### 7.1.1 Agents List Item

```txt
| Avatar | Agent Name (Phone Num)                 |
|        | last call start time, duration, status |
```

## 7.2 Agent 

```txt
Agent avatar | name (phone number)
[ Calls | Settings ]
```

### 7.2.1 Calls Tab List Item

```txt
| Avatar | Lead Name (Phone Num)                  |
|        | last call start time, duration, status |
```

### 7.2.2 Settings Tab List

```txt
General
Voice
Behavior
Telephony
Advanced
```

## 7.3 Details Panel

### Transcript View for Agent Calls tab item selected

* Header

```txt
| Avatar | Lead Name (Phone Num)             |
|        | call start time, duration, status |
```

* Content 

```txt
(00:01) Agent Name (phone num)
...

(00:03) Lead Name  (phone num)
...

```

* Footer

```txt
| Avatar | Agent Name (Phone Num) |
```


# 8. Leads Page

* Layout: 

```txt
Leads List | Lead | Details
```


## Tabs

```txt
[ Info | Calls ]
```


## Calls Tab

```txt
Call Item:
- Timestamp
- Duration
- Status  ← NEW
```


## Details Panel

* Info view OR
* Transcript view (with status badge)


# 9. Calls Page (Global)

## Layout

```txt
[ Categories ] | [ Calls List ] | [ Details Panel ]
```


## Categories

```txt
All
Inbound
Outbound
```


## Calls List Item

```txt
- Agent
- Lead
- Duration
- Status
- Timestamp
```

## Details Panel

* Transcript + Status badge


# 10. Analytics Page


## Metrics

* Total Calls
* Live Calls (NEW)
* Ended Calls
* Failed Calls
* Missed Calls
* Avg Duration
* Success Rate


## Charts

* Calls over time (stacked by status)
* Agent performance
* Failure rate trend


# 11. Members Page

```txt
User | Role | Actions
```


# 12. Billing Page

```txt
Plan
Usage
Payment
```


# 13. Interaction Design

## 13.1 States

| State   | UX       |
| ------- | -------- |
| Empty   | CTA      |
| Loading | Skeleton |
| Error   | Retry    |


## 13.2 Feedback

* Toasts
* Inline validation
* Confirm dialogs


# 17. Final Notes

### system now supports:

* Real-time monitoring (Live calls)
* Operational debugging (Failed)
* Business tracking (Missed vs Ended)

