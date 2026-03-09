const express = require('express');
const router = express.Router();
const engine = require('../agent/universeEngine');

// ContentGenerationAPI explicit endpoints as dictated by ArchitectureManifest.md

router.post('/generate', async (req, res) => {
    try {
        const { prompts, count, targetAudience } = req.body;
        console.log(`[ContentGenerationAPI] Request to generate content. Target: ${targetAudience}`);

        // Dispatch to internal universeEngine
        const results = await engine.generateBatch(prompts || [], count || 1);

        res.status(200).json({ status: "success", data: results });
    } catch (err) {
        console.error("[ContentGenerationAPI] Error:", err.message);
        res.status(500).json({ error: "Content generation failed" });
    }
});

router.post('/ingest', async (req, res) => {
    try {
        const { datasetUrl, context } = req.body;
        console.log(`[ContentGenerationAPI] Request to ingest new dataset from: ${datasetUrl}`);

        // This simulates dataset ingestion and updating the generation pool
        engine.updateContext(context);

        res.status(200).json({ status: "success", message: "Dataset ingested successfully" });
    } catch (err) {
        console.error("[ContentGenerationAPI] Error:", err.message);
        res.status(500).json({ error: "Ingestion failed" });
    }
});

module.exports = router;
