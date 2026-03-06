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
