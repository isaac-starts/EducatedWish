# Educated Wish Central API Specification

## Overview
"Educated Wish" serves as the centralized content generation microservice for the ecosystem (Retail Politics, Directory, motifsupply, etc.). Clients send parameters to Educated Wish, which orchestrates the LLM interaction and returns the content.

## Authentication
All requests from internal clients must include a shared secret API key in the header.
`Authorization: Bearer <SHARED_INTERNAL_SECRET>`

## Base URL
Production: `https://api.educatedwish.example.com`
Local: `http://localhost:3009`

---

## Endpoint: `POST /api/v1/generate`

Generates structured content using the Educated Wish LLM engine.

### Request Body (JSON)
```json
{
  "client_id": "retail_politics | directory | motifsupply | other",
  "task_type": "article | email_campaign | ad_copy | speech | custom",
  "prompt_parameters": {
    "topic": "The topic or subject of the content",
    "tone": "Professional, casual, aggressive, etc.",
    "target_audience": "Who the content is for",
    "additional_instructions": "Any extra prompt text"
  },
  "sync": true, 
  "callback_url": "https://client-api-domain.com/webhooks/educated-wish-ready" 
}
```
*Note: If `sync` is `true`, the HTTP request will hold open until the LLM finishes and returns the content. If `sync` is `false`, the engine will return a `job_id` immediately and POST the final content to the provided `callback_url` when ready.*

### Response (Sync)
**200 OK**
```json
{
  "status": "success",
  "content": "The generated string from the LLM...",
  "meta": {
    "tokens_used": 1500,
    "model": "gpt-4o"
  }
}
```

### Response (Async)
**202 Accepted**
```json
{
  "status": "processing",
  "job_id": "uuid-1234-5678",
  "message": "Content generation started. Will POST to callback_url upon completion."
}
```

---

## Endpoint: `GET /api/v1/jobs/:job_id`

Check the status of an asynchronous generation job if webhooks are not preferred.

### Response
**200 OK**
```json
{
  "job_id": "uuid-1234-5678",
  "status": "completed | processing | failed",
  "content": "The generated string..." // Included if completed
}
```
