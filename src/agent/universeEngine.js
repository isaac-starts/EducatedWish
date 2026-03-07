const store = require('../data/store');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_local_testing',
});

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

        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_for_local_testing') {
            const completion = await openai.chat.completions.create({
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
