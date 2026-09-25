# MEI EventHub

Unified Institutional Events Management & Smart Scheduling Ecosystem for Mahendra Educational Institutions (MEI).

## MEI EventHub Platform Features

- **Role-Based Portals**: Dedicated operational workspaces for HOD & Management, Staff & Faculty, Event Organizers, MEI Students, External Participants, and Volunteer Desks.
- **Event Lifecycle Automation**: Event discovery, multi-session schedules, hall & venue booking with conflict detection, and QR code digital ticketing.
- **Volunteer & QR Check-in**: Live QR scanner for registration desk check-ins with synchronized attendance counters.
- **Institutional Analytics & CSV Export**: Real-time performance metrics and feedback survey analytics with instant one-click CSV export.
- **Firebase Authentication & Firestore Persistence**: Google Sign-in with role mapping and live real-time Firestore database synchronization.

## Development

Run locally:

```sh
npm install
npm run dev
```

---

© 2026 MEI EventHub — Mahendra Educational Institutions. All Rights Reserved. | Version 2.4.0

1. Frontend Core
React 18: Component-based UI architecture with hooks and functional components.
TypeScript: Strict type-safety across models, state stores, and Firebase documents.
Vite: Ultra-fast build tool, local dev server, and module bundler.
React Router (v6): Client-side routing with role-based route parameters (/dashboard/:role/*).

2. Styling & UI Components
Tailwind CSS: Utility-first responsive styling with custom institutional color palettes (MEI navy, blue, gold accents).
shadcn/ui & Radix UI Primitives: Accessible UI components (Dialog, Tabs, Dropdowns, Popovers, Tooltips, Accordion, Progress, Slider, Badges).
Lucide React: Vector iconography for dashboards, roles, and action triggers.
Sonner: High-performance toast notification system.
Tailwind CSS Animate: Transitions, smooth entrance animations, and micro-interactions.

3. Backend & Cloud Infrastructure
Firebase Authentication: User identity management supporting Google OAuth and institutional role credentials.
Cloud Firestore: Real-time NoSQL cloud database storing:
Event metadata, schedules, approvals, and venues.
Registrations, volunteer tasks, attendee logs, and notifications.
Firestore Security Rules: Role-based access control (RBAC) ensuring data protection across HODs, faculty, organizers, students, and external guests.

4. State Management & Data Fetching
Zustand: Lightweight global state management for events, notifications, offline sync, and app preferences.
TanStack React Query: Asynchronous server state caching, background refetching, and query invalidation.

5. Specialized Feature Libraries
Recharts: Data visualization for registration trends, venue utilization heatmaps, and budget analytics.
Canvas Confetti: Celebration effects upon registration and certificate claims.
QR Generation & Validation: Ticket issuance and check-in workflows for event entry.

6. Testing, Quality & Tooling
Vitest: Unit testing suite (including automated tests for security rules and state logic).
React Testing Library & jsdom: DOM and component-level testing.
ESLint: Code quality and syntax compliance.

Team Name : Digital Innovators
Team Member : Arjun S
              Abishek A
Department : B.E - CSE
College : Mahendra Institute of Technology 
