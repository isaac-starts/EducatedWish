const store = require('../data/store');
const { OpenAI } = require('openai');

async function getOpenAIInstance() {
    let apiKey = process.env.OPENAI_API_KEY;

    // Attempt to fetch from Papertrader Vault if local key is a placeholder or undefined
    if (!apiKey || apiKey === 'dummy_key_for_local_testing') {
        try {
            const vaultUrl = process.env.PAPERTRADER_URL || 'http://127.0.0.1:8001';
            const internalSecret = process.env.INTERNAL_API_SECRET || 'dev_shared_secret';

            const response = await fetch(`${vaultUrl}/keys/internal/openai`, {
                headers: {
                    'Authorization': `Bearer ${internalSecret}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                apiKey = data.value;
            }
        } catch (err) {
            console.error(`[UniverseEngine] Error connecting to Papertrader Vault:`, err.message);
        }
    }

    return new OpenAI({
        apiKey: apiKey || 'dummy_key_for_local_testing',
    });
}



// An autonomous loop that checks for posts without fulfillments 
// and randomly decides to intervene as the Universe.
async function scanAndFulfill() {
    try {
        const posts = store.getPosts();

        // Find recent posts that haven't been fulfilled and aren't by the Agent
        const candidates = posts.filter(p => !p.fulfillment && !p.isAgent);

        if (candidates.length === 0) {
            return;
        }

        // 10% chance to proactively fulfill a random post during any given scan
        if (Math.random() > 0.10) {
            return;
        }

        // Pick a random candidate
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        console.log(`[UniverseEngine] Initiating autonomous fulfillment for post: ${target.id}`);

        let fulfillmentText = "The universe acknowledges your educated wish.";

        const openaiClient = await getOpenAIInstance();
        if (openaiClient.apiKey !== 'dummy_key_for_local_testing') {
            const completion = await openaiClient.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are the autonomous AI engine of the universe. Respond to the user's wish with a mildly sarcastic but completely supportive confirmation that their wish has been fulfilled or is being worked on. Keep it under 2 sentences." },
                    { role: "user", content: `My wish is: ${target.content}` }
                ]
            });
            fulfillmentText = completion.choices[0].message.content;
        }

        // Update the target post with a fulfillment payload
        target.fulfillment = {
            type: "agent_message",
            title: "Proactive Cosmic Intervention",
            description: fulfillmentText,
        };

        store.updatePost(target);
        console.log(`[UniverseEngine] Successfully fulfilled post: ${target.id}`);

    } catch (e) {
        console.error("[UniverseEngine] Cosmos realignment error:", e);
    }
}

function startEngine() {
    console.log("[UniverseEngine] Engine online. Monitoring timeline...");
    // Run every 20 seconds
    setInterval(scanAndFulfill, 20000);
}

module.exports = { startEngine };
