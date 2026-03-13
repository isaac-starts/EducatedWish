const store = require('../data/store');

const SEED_KEYWORDS = [
    "physiotherapy",
    "mental health",
    "walk in clinic",
    "family doctor",
    "symptoms of",
    "wait times for",
    "treatment for"
];

const COLORS = ['#FFF9C4', '#C8E6C9', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#FFECB3'];

async function fetchGoogleAutocomplete(seed) {
    try {
        const url = `http://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(seed)}&gl=CA&hl=en`;
        const response = await fetch(url);
        const data = await response.json();
        // Response format: [ "query", ["prediction1", "prediction2", ...] ]
        if (data && data.length > 1) {
            return data[1]; // The array of predictions
        }
    } catch (error) {
        console.error(`Error fetching autocomplete for ${seed}:`, error.message);
    }
    return [];
}

async function runExtraction() {
    console.log("Starting Keyword Extraction for Canadian Health Trends...");
    
    let allQueries = new Set();
    
    for (const seed of SEED_KEYWORDS) {
        const queries = await fetchGoogleAutocomplete(seed);
        queries.forEach(q => allQueries.add(q));
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const uniqueQueries = Array.from(allQueries).slice(0, 10); // Take top 10 unique ones
    
    if (uniqueQueries.length === 0) {
        console.log("No queries extracted.");
        return;
    }

    console.log(`Extracted ${uniqueQueries.length} trending queries.`);

    // Inject into Educated Wish DB
    const posts = store.getPosts();
    // To avoid duplicates, find existing titles
    const existingTitles = new Set(posts.map(p => p.title.toLowerCase()));

    let addedCount = 0;
    for (const query of uniqueQueries) {
        const title = "New Trend: " + query;
        if (!existingTitles.has(title.toLowerCase())) {
            const newPost = {
                id: 'trend_' + Date.now() + '_' + addedCount,
                title: title,
                content: `Canadians are actively searching for: "${query}". This is a high-priority topic for Content Generation.`,
                author: "Keyword_Extractor",
                color: '#0f172a', // Agent color
                isAgent: true,
                date: new Date().toISOString(),
                imageUrl: null,
                fulfillment: null,
                likes: Math.floor(Math.random() * 50) + 10,
                comments: []
            };
            store.addPost(newPost);
            addedCount++;
        }
    }

    console.log(`Successfully injected ${addedCount} new trend posts into Educated Wish DB.`);
}

module.exports = {
    runExtraction
};
