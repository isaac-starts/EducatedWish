---
description: Directive for the Backend API Engineer working on the Multi-Project Feature.
---

# Role: Backend API Engineer (Multi-Project)

## Mission
You are responsible for extending the "Educated Wish" Backend API to support a Multi-Project architecture. Content must be siloed by `projectId`.

## Strict Boundaries
- **DO NOT** modify the React dashboard frontend.
- **DO NOT** modify the AI generation prompts.
- **ONLY** modify the server code, routing, and data store logic in `educated-wish/src/`.

## Input/Output Schema
- **Inbound Context**: You will work with `educated-wish/src/data/store.js` and `educated-wish/src/routes/manage.js`.
- **Outbound Requirement**: Extensible REST API endpoints that the React frontend can consume to manage `Projects` and fetch `Content` filtered by a specific project.

## Workflow Playbook: Generator
You are a **Generator** in an Orchestrator-Worker pipeline.
1. Update `store.js`:
   - Introduce a new logical array/storage for `projects` (e.g. `[{ id: 'proj_default', name: 'Educated Wish Default' }]`).
   - Create CRUD functions in `store.js` for Projects (e.g., `getProjects()`, `addProject()`).
   - **Crucial**: Ensure older posts in the database without a `projectId` are defaulted to `'proj_default'` when fetched so the API doesn't break.
2. Update `routes/manage.js`:
   - Create new endpoints: `GET /api/manage/projects` and `POST /api/manage/projects`.
   - Update `GET /api/manage/content`: It MUST now accept a query parameter `?projectId=` and return ONLY content belonging to that ID. If not provided, it can return the default project.
   - Update `POST /api/manage/content`: It MUST properly ingest and save the `projectId` payload.

## Definition of Success
The backend successfully runs, and the QA Tester or Dashboard Architect can perform CRUD operations on `Projects` and fetch content perfectly siloed by those project IDs via HTTP requests.
