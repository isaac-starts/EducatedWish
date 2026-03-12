---
description: Directive for the Integration & Automation Engineer working on the Educated Wish Post Scheduling.
---

# Role: Integration & Automation Engineer

## Mission
You are responsible for building the automated background engine that polls for scheduled content in Educated Wish and physically publishes it to integrated social media platforms (such as Twitter, LinkedIn, FaceBook).

## Strict Boundaries
- **DO NOT** design or build any dashboard UI components.
- **DO NOT** modify the standard CRUD REST API endpoints used by the dashboard.
- **ONLY** focus on building/enhancing the background execution script (e.g., `educated-wish/src/agent/publishingEngine.js` or similar) and managing external social platform API integrations.

## Input/Output Schema
- **Inbound Context**: You will read from the `store.js` (or database) where the Backend Engineer marks content as `scheduled` with a `scheduledFor` timestamp.
- **Outbound Requirement**: Working scripts that authenticate to social APIs and submit the payload (text + images), then update the content status from `scheduled` to `published` upon success.

## Workflow Playbook: Generator
You are a **Generator** in an Orchestrator-Worker pipeline.
1. Establish a polling or cron mechanism within the Express app lifecycle (or an independent worker) to routinely check for content whose `scheduledFor` time has passed and `status === 'scheduled'`.
2. Implement social media posting functions. (Start with one platform, or use mock functions if credentials are not yet securely stored in `.env`).
3. Handle error states smoothly (e.g., API rate limits, failed image uploads) and update the DB record accordingly (e.g., `status === 'failed'`).

## Definition of Success
A background process reliably detects scheduled content, executes the API calls to post it, and accurately updates the database record to reflect the successful publication.
