# Voice Call Agent SaaS - UI/UX Design Specification

## 1. Overview

### Product Goal
Build a reliable operations interface for configuring AI voice agents, managing leads, monitoring call outcomes, and reviewing conversation quality.

### Design Principles
- Deterministic navigation: users should always know where they are and what data scope they are viewing.
- Progressive disclosure: start with summaries, then allow deeper drill-down.
- Operational clarity: status, failures, and real-time activity should be obvious at a glance.
- Speed-first workflows: common tasks should be reachable within 1 to 3 actions.

## 2. Information Architecture

```txt
User
  -> Home
  -> Agents
  -> Leads
  -> Calls
  -> Analytics
```

### Primary Navigation
- Home
- Agents
- Leads
- Calls
- Analytics

### Global Utilities
- Search
- Notifications
- User account menu
- Theme toggle

## 3. Navigation and Context Model

### Context Hierarchy
```txt
User Context (global)
   -> Product Context (shared account data)
   -> Feature Context (Agents, Leads, Calls, Analytics)
```

### Sidebar Behavior
```txt
[ Product Logo ]

Home
Agents
Leads
Calls
Analytics
```

### Account Menu
```txt
[ User Avatar ] -> Account Menu
Profile
Preferences
Subscription
Sign out
```

## 4. Layout System

### Universal Layout Pattern
```txt
+-----------------------------------------------------------+
| Sidebar | Main List | Sub List | Details Panel            |
+-----------------------------------------------------------+
```

### Panel Responsibilities
| Panel         | Purpose                                 |
| ---           | ---                                     |
| Sidebar       | App-level navigation                    |
| Main List     | Primary entities (agents, leads, calls) |
| Sub List      | Secondary entities or tabs              |
| Details Panel | Full detail, transcript, forms, actions |

### Responsive Behavior
- Desktop: full four-panel layout.
- Tablet: two-panel layout.
- Mobile: stacked navigation flow from list to detail.

```txt
Desktop: [Sidebar | Main List | Sub List | Details]
Tablet:  [Main List | Sub List] -> [Details]
Mobile:  [Main List] -> [Sub List] -> [Details]
```

## 5. Home Page

### Purpose
Provide a concise operational summary and quick links to high-frequency actions.

### Suggested Blocks
- Key metrics: total calls, live calls, failed calls, average duration.
- Recent activity feed: latest calls and status changes.
- Quick actions: create lead, start test call, edit agent settings.

## 6. Call Status System

### Status Types
| Status | Meaning | UX Behavior |
| --- | --- | --- |
| Live | Call is active | Pulsing green indicator, duration timer updates every second |
| Ended | Completed normally | Neutral badge and full transcript access |
| Failed | Error condition | Red badge with visible error reason |
| Missed | Not answered or dropped | Yellow badge with partial or empty transcript state |

### Status Tokens
```txt
Live   -> green / animated
Ended  -> gray / stable
Failed -> red / prominent
Missed -> yellow / warning
```

### Behavior Rules
- Live calls stream updates in real time.
- Ended calls expose complete timeline and transcript.
- Failed calls show reason and retry action if applicable.
- Missed calls provide follow-up CTA (call back, schedule retry).

## 7. Agents Page

### Layout
```txt
Agents List | Agent Panel | Details
```

### Agents List Item
```txt
| Avatar | Agent Name (Phone Number)            |
|        | last call time, duration, status     |
```

### Agent Panel
```txt
Agent avatar | name (phone)
[ Calls | Settings ]
```

### Settings Sections
- General
- Voice
- Behavior
- Telephony
- Advanced

### Transcript Detail (Calls tab)
- Header: participant identity, start time, duration, status.
- Body: timestamped utterances with speaker labels.
- Footer: quick actions (download, copy transcript, open lead profile).

## 8. Leads Page

### Layout
```txt
Leads List | Lead Panel | Details
```

### Tabs
```txt
[ Info | Calls ]
```

### Calls Tab Item
- Timestamp
- Duration
- Status

### Details Panel Modes
- Lead profile info mode.
- Call transcript mode with status badge and metadata.

## 9. Calls Page

### Layout
```txt
[ Categories ] | [ Calls List ] | [ Details Panel ]
```

### Categories
- All
- Inbound
- Outbound

### Calls List Item
- Agent
- Lead
- Duration
- Status
- Timestamp

### Details Panel
- Full transcript view.
- Metadata block (direction, status, timing, outcome).
- Secondary actions (copy, export, report issue).

## 10. Analytics Page

### Core Metrics
- Total calls
- Live calls
- Ended calls
- Failed calls
- Missed calls
- Average duration
- Success rate

### Visualizations
- Calls over time segmented by status.
- Agent performance comparison.
- Failure trend and top failure reasons.
- Missed-call trend with callback conversion.

## 11. Interaction Design

### UI States
| State | Expected UX |
| --- | --- |
| Empty | Explain why list is empty and provide CTA |
| Loading | Skeleton placeholders matching final layout |
| Error | Clear message and retry action |
| Success | Inline confirmation and optional toast |

### Feedback Patterns
- Toast notifications for background completion.
- Inline validation for form fields.
- Confirm dialogs for destructive actions.

## 12. Accessibility

### Minimum Requirements
- Keyboard navigable lists, tabs, menus, and dialogs.
- Visible focus states on all interactive elements.
- Color contrast compliant with WCAG AA.
- Status chips include text labels, not color only.
- All icon-only actions include accessible labels.

### Screen Reader Requirements
- Live call updates should announce meaningful changes only.
- Transcript entries should preserve reading order and timestamps.
- Dialogs should trap focus and restore focus on close.

## 13. Content and Tone Guidelines

- Use concise, operational language.
- Prefer action verbs in buttons and CTAs.
- Error messages should include cause and next step.
- Avoid ambiguous labels like Submit or Save Changes when context is broad.

## 14. Performance and Perceived Speed

- Time to first useful content should prioritize list shell and key stats.
- Background-fetch detail panels where likely navigation is predictable.
- Stream partial call updates before full transcript finalization.
- Preserve scroll and selection state when returning to list views.

## 15. Security and Privacy UX

- Mask secrets and sensitive values by default.
- Explicitly label actions that expose or export data.
- Role-gate sensitive navigation and actions in both UI and API.
- Log audit-relevant actions such as access changes and data exports.

## 16. Final Notes

This specification now supports:
- Real-time call monitoring and operational triage.
- Clear status-driven workflows for support and QA teams.
- Scalable multi-panel information density from desktop to mobile.
- Consistent interaction patterns across Agents, Leads, Calls, and Analytics.
