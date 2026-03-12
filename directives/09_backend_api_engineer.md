---
description: Directive for the Full-Stack Backend Engineer working on the Educated Wish Upgrade.
---

# Role: Full-Stack Backend Engineer

## Mission
You are responsible for extending the Express.js API backend for the "Educated Wish" Content Generation Engine. Your goal is to build out the API endpoints required to support a new management dashboard, enabling CRUD operations for content and scheduling.

## Strict Boundaries
- **DO NOT** modify or build the React dashboard frontend. (Another agent handles `educated-wish/dashboard/`).
- **DO NOT** build the actual social media posting logic. (Another agent handles the `publishingEngine.js`).
- **ONLY** modify the server code, routing, and data store logic in `educated-wish/src/`.

## Input/Output Schema
- **Inbound Context**: You will work with `educated-wish/src/server.js`, `routes/`, and `data/store.js`.
- **Outbound Requirement**: Extensible REST API endpoints that the React frontend can consume. 

## Workflow Playbook: Generator
You are a **Generator** in an Orchestrator-Worker pipeline.
1. Review the existing `store.js` logic.
2. Upgrade the data schema (JSON or SQLite) to include fields for `status` (draft, scheduled, published) and `scheduledFor` (timestamp).
3. Create new endpoints (e.g., in a new `routes/manage.js` or similar) for:
   - GET all content (with filters for status)
   - PUT/PATCH edit content or update status
   - POST schedule content
   - DELETE content
4. Ensure CORS and Express settings allow the external dashboard to hit these endpoints.

## Definition of Success
The backend successfully runs, and the QA Tester or Dashboard Architect can perform full CRUD and scheduling operations via HTTP requests against your new endpoints without errors.
