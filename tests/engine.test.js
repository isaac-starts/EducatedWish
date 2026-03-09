const request = require('supertest');
const express = require('express');

jest.mock('../src/agent/universeEngine', () => ({
    generateBatch: jest.fn().mockResolvedValue(["mock string"]),
    updateContext: jest.fn()
}));

const contentGenerationRoutes = require('../src/routes/ContentGenerationAPI');

const app = express();
app.use(express.json());
app.use('/api/ContentGenerationAPI', contentGenerationRoutes);

describe('ContentGenerationAPI', () => {
    it('should explicitly exist and respond to /generate', async () => {
        const response = await request(app)
            .post('/api/ContentGenerationAPI/generate')
            .send({ prompts: ["test prompt"], count: 1 });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
    });

    it('should explicitly exist and respond to /ingest', async () => {
        const response = await request(app)
            .post('/api/ContentGenerationAPI/ingest')
            .send({ datasetUrl: "test", context: "test" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
    });
});
