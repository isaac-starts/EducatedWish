require('dotenv').config();
const { OpenAI } = require('openai');

// Initialize with dummy key if missing so server doesn't crash locally
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_local_testing',
});

exports.fulfillWish = async (req, res) => {
    try {
        const { wishDescription } = req.body;

        if (!wishDescription) {
            return res.status(400).json({ error: 'Wish description is required' });
        }

        let fulfillmentText = "";

        // If we only have the dummy key, return a mock response
        if (process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === 'dummy_key_for_local_testing') {
            fulfillmentText = "The universe acknowledges your educated wish. (Mock API response - OpenAI key not configured locally).";
        } else {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Fast, capable model
                messages: [
                    { role: "system", content: "You are the universe, mysteriously and magically fulfilling the user's wish. Provide a slightly whimsical, supportive message explaining how their wish is being manifested. Keep it under 3 sentences." },
                    { role: "user", content: `My wish is: ${wishDescription}` }
                ]
            });
            fulfillmentText = completion.choices[0].message.content;
        }

        res.json({
            success: true,
            fulfillmentText
        });

    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "The universe is currently realigning... please try again later." });
    }
};

exports.generateContent = async (req, res) => {
    try {
        const { client_id, task_type, prompt_parameters, sync, callback_url } = req.body;

        if (!client_id || !task_type || !prompt_parameters) {
            return res.status(400).json({ error: "client_id, task_type, and prompt_parameters are required" });
        }

        console.log(`[EducatedWish API] Received generation request from ${client_id} for ${task_type}`);

        // Async path
        if (sync === false) {
            const job_id = require('crypto').randomUUID();

            // Background generation
            setTimeout(async () => {
                const content = await runLLMGeneration(task_type, prompt_parameters);
                if (callback_url) {
                    try {
                        const axios = require('axios'); // Requires axios in dependencies, or use fetch if Node > 18
                        await fetch(callback_url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ job_id, status: "completed", content })
                        });
                        console.log(`[EducatedWish API] Sent async callback to ${callback_url}`);
                    } catch (cbErr) {
                        console.error(`[EducatedWish API] Callback failed:`, cbErr.message);
                    }
                }
            }, 0);

            return res.status(202).json({
                status: "processing",
                job_id,
                message: "Content generation started. Will POST to callback_url upon completion."
            });
        }

        // Sync path
        const content = await runLLMGeneration(task_type, prompt_parameters);

        res.status(200).json({
            status: "success",
            content,
            meta: { model: "gpt-4o" }
        });

    } catch (error) {
        console.error("[EducatedWish API] Generate Error:", error);
        res.status(500).json({ error: "Internal Server Error during content generation" });
    }
};

async function runLLMGeneration(task_type, parameters) {
    if (process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === 'dummy_key_for_local_testing') {
        return `Mock generated content for ${task_type}. (Local testing without OpenAI Key). Topic: ${parameters.topic || 'Unknown'}`;
    }

    // Convert prompt parameters into a readable string
    const paramString = Object.entries(parameters)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

    let systemPrompt = "You are a versatile content generation AI.";
    if (task_type === "article") systemPrompt = "You are an expert article writer and journalist.";
    if (task_type === "email_campaign") systemPrompt = "You are a high-converting email copywriter.";
    if (task_type === "ad_copy") systemPrompt = "You are a master of short, punchy ad copywriting.";
    if (task_type === "speech") systemPrompt = "You are an experienced speechwriter for political campaigns.";

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Please generate content based on the following parameters:\n\n${paramString}` }
        ]
    });

    return completion.choices[0].message.content;
}
