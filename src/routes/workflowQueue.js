const express = require('express');
const router = express.Router();
const workflowStore = require('../data/workflowStore');
const Replicate = require('replicate');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock_key"
});

// Optional: you can set REPLICATE_API_TOKEN in your .env
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || "mock_token"
});

// 1. Create a new Content Draft and start the workflow
router.post('/start', async (req, res) => {
    const { prompt, author } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Initialize workflow in DRAFT state
    let workflow = workflowStore.addWorkflow({
        prompt,
        author: author || 'System',
        status: 'PROCESSING'
    });

    res.json({ message: 'Workflow started. Video generation initiated.', workflow });

    // --- ASYNC WORKFLOW EXECUTION ---
    try {
        // Mock generation or actual Replicate API call
        let videoUrl = "https://example.com/mock_generated_video.mp4";
        
        if (process.env.REPLICATE_API_TOKEN) {
            console.log(`[Workflow ${workflow.id}] Hitting Replicate API with prompt: ${prompt}`);
            const output = await replicate.run(
                "thudm/cogvideox-5b:xxx", // Using a placeholder for the actual model hash if needed
                {
                    input: { prompt: prompt }
                }
            );
            videoUrl = output; 
        } else {
            // Mock delay for local testing without API token
            console.log(`[Workflow ${workflow.id}] Simulating Video Generation (No Replicate Token)...`);
            await new Promise(r => setTimeout(r, 4000));
        }

        // Move to PENDING_APPROVAL
        workflowStore.updateWorkflow({
            id: workflow.id,
            videoUrl: videoUrl,
            status: 'PENDING_APPROVAL'
        });
        console.log(`[Workflow ${workflow.id}] Paused. Waiting for manual approval.`);

    } catch (error) {
        console.error(`[Workflow ${workflow.id}] Failed:`, error);
        workflowStore.updateWorkflow({
            id: workflow.id,
            status: 'FAILED',
            error: error.message
        });
    }
});

// 1.5 Generate Ideas via OpenAI
router.post('/generate-ideas', async (req, res) => {
    const { topic, count } = req.body;
    
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const numIdeas = count || 3;

    try {
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock_key") {
            // Mock response if no key
            console.log(`[Idea Generator] Mocking ${numIdeas} ideas for topic: ${topic}`);
            await new Promise(r => setTimeout(r, 1500));
            
            const mockIdeas = Array.from({ length: numIdeas }).map((_, i) => ({
                title: `[Mock] ${topic} Concept ${i + 1}`,
                prompt: `A dynamic, high-quality video showing a professional in Edmonton discussing ${topic}. Smooth cinematic lighting. (${i + 1})`
            }));
            return res.json({ ideas: mockIdeas });
        }

        console.log(`[Idea Generator] Hitting OpenAI for ${numIdeas} ideas on topic: ${topic}`);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert social media content strategist. The user will provide a topic. You must generate EXACTLY ${numIdeas} highly engaging video concepts for this topic. 
                    
Return the result strictly as a JSON array of objects, where each object has:
- "title": A catchy, click-worthy title for the video (max 6 words).
- "prompt": A highly detailed visual text-to-video generation prompt describing exactly what the AI should render visually for this video concept.`
                },
                {
                    role: "user",
                    content: `Topic: ${topic}`
                }
            ],
            response_format: { type: "json_object" }
        });

        // The system prompt asks for a JSON array, but response_format: json_object requires an object wrapper.
        // We will parse the content and extract the array.
        let rawContent = completion.choices[0].message.content;
        let ideaList = [];
        try {
            const parsed = JSON.parse(rawContent);
            // Find the first array property in the parsed object
            for (let key in parsed) {
                if (Array.isArray(parsed[key])) {
                    ideaList = parsed[key];
                    break;
                }
            }
            if(ideaList.length === 0 && Array.isArray(parsed)) {
                ideaList = parsed;
            }
        } catch(e) {
            console.error("Failed to parse OpenAI JSON:", e);
        }

        res.json({ ideas: ideaList.slice(0, numIdeas) });

    } catch (error) {
        console.error(`[Idea Generator] Failed:`, error);
        res.status(500).json({ error: "Failed to generate ideas" });
    }
});

// 2. Get all paused workflows waiting for Human-in-the-Loop
router.get('/pending', (req, res) => {
    const pending = workflowStore.getPendingApprovals();
    res.json(pending);
});

// 3. Approve a workflow (Resume execution)
router.post('/:id/approve', (req, res) => {
    const workflow = workflowStore.getWorkflow(req.params.id);
    
    if (!workflow || workflow.status !== 'PENDING_APPROVAL') {
        return res.status(404).json({ error: 'Workflow not found or not pending approval' });
    }

    // Move to APPROVED
    workflowStore.updateWorkflow({
        id: workflow.id,
        status: 'APPROVED',
        approvedAt: new Date().toISOString()
    });

    // Simulate final posting step
    console.log(`[Workflow ${workflow.id}] Approved! Simulating final post to social platforms...`);
    setTimeout(() => {
        workflowStore.updateWorkflow({
            id: workflow.id,
            status: 'POSTED',
            postedAt: new Date().toISOString()
        });
        console.log(`[Workflow ${workflow.id}] Successfully POSTED.`);
    }, 2000);

    res.json({ message: 'Workflow approved and will now be posted.' });
});

// 4. Reject a workflow
router.post('/:id/reject', (req, res) => {
    const { feedback } = req.body;
    const workflow = workflowStore.getWorkflow(req.params.id);
    
    if (!workflow || workflow.status !== 'PENDING_APPROVAL') {
        return res.status(404).json({ error: 'Workflow not found or not pending approval' });
    }

    workflowStore.updateWorkflow({
        id: workflow.id,
        status: 'REJECTED',
        feedback: feedback || 'No feedback provided',
        rejectedAt: new Date().toISOString()
    });

    res.json({ message: 'Workflow rejected.' });
});

// 5. Get workflow status
router.get('/:id', (req, res) => {
    const workflow = workflowStore.getWorkflow(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Not found' });
    res.json(workflow);
});

module.exports = router;
