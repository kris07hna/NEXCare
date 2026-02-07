# NexCare-5G Edge Server

NexCare-5G is an offline-first edge healthcare monitoring platform focused on neonatal and geriatric care. It combines real-time monitoring, AI-assisted reporting, and clinician workflows in a single Next.js application.

## Architecture (Standardized)

Layered view:

1. Presentation layer
   - Next.js App Router UI for dashboards, registry, alerts, and operations
2. Application layer
   - API routes for reports, rooms, patients, consultations, and signaling
3. Data layer
   - Drizzle ORM with SQLite for offline-first storage and optional cloud sync
4. Real-time layer
   - WebRTC signaling and peer connections
   - Polling hooks for room status and reports
5. Edge AI layer
   - Python agents (NeoCare and GeriCare) push reports to the API

Data flow:

Edge AI agent -> API reports -> database -> UI dashboards
Clinician -> UI -> API -> database -> dashboards

### Architecture Diagram (Industry Grade)

```mermaid
flowchart TB
   classDef edge fill:#0f172a,color:#e2e8f0,stroke:#334155,stroke-width:1px
   classDef app fill:#111827,color:#e5e7eb,stroke:#374151,stroke-width:1px
   classDef data fill:#0b1f2a,color:#e2e8f0,stroke:#155e75,stroke-width:1px
   classDef net fill:#0a1220,color:#e2e8f0,stroke:#6366f1,stroke-width:1px
   classDef ops fill:#0b1220,color:#e2e8f0,stroke:#22c55e,stroke-width:1px

   subgraph EdgeLayer[Edge AI Devices]
      NA[NeoCare Agent\nVision + Pose]:::edge
      GA[GeriCare Agent\nFall Detection]:::edge
   end

   subgraph EdgeServer[Edge Server Runtime]
      UI[Next.js UI\nDashboards + Registry]:::app
      API[API Routes\nReports, Rooms, Patients]:::app
      RTC[WebRTC Signaling\nPeer Sessions]:::app
      VAL[Validation Layer\nZod + Types]:::app
   end

   subgraph DataLayer[Offline Data Layer]
      DB[(SQLite\nDrizzle ORM)]:::data
      SYNC[Optional Sync\nCloud Bridge]:::data
   end

   subgraph Ops[Operational Controls]
      MON[Room Monitoring\nStatus + Alerts]:::ops
      REG[Patient Registry\nCRUD]:::ops
      CON[Consultations\nVideo Sessions]:::ops
   end

   subgraph Network[Local 5G/LAN Network]
      CLIN[Clinician Console]:::net
      ROOM[Room Device\nCamera + Sensors]:::net
   end

   NA --> API
   GA --> API
   API --> VAL --> DB
   UI <--> API
   UI --> MON
   UI --> REG
   UI --> CON
   CON --> RTC --> ROOM
   CLIN --> UI
   DB --> SYNC
```

## Proposed Solution

- Deploy the Edge Server on a local network with offline-first storage.
- Run NeoCare and GeriCare AI agents on edge devices to stream reports.
- Provide clinician dashboards for monitoring, alerts, and consultations.
- Support WebRTC video sessions for clinician-to-room consultations.

## Novelties

- Offline-first edge monitoring with local persistence.
- Dual-domain AI workflow (neonatal and geriatric) under one platform.
- Integrated WebRTC consultations without external cloud dependencies.
- Structured AI reporting pipeline with validation and alerting.

## Present Work

- NeoCare dashboard with registry, alerts, and clinical units
- GeriCare monitoring views and activity tracking
- Room monitoring and diagnostics pages
- Patient registry with CRUD workflows
- WebRTC consultation sessions and signaling
- API validation with Zod and typed models
- Drizzle ORM schema for core entities

## Quick Start

Prerequisites:
- Node.js 18+
- npm or pnpm

Install and run:

```bash
npm install
npx tsx scripts/seed.ts
npm run dev
```

App runs at: http://localhost:3000

## Key Routes

- /neocare
- /gericare
- /room-monitoring
- /patients
- /consultations
- /analytics
- /diagnostics

## Project Structure

```
app/                UI and API routes
components/         Reusable UI components
drizzle/            Database schema
hooks/              Client hooks
lib/                Data, validation, and WebRTC utilities
ai_agents/          Python edge AI agents
scripts/            Seeds and utilities
```

## Notes

- The system is designed for local networks and offline operation.
- AI agents are optional for UI exploration; mock data is available in some pages.

## License

Proprietary. All rights reserved.
