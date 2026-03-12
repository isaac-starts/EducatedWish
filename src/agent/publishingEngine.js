const store = require('../data/store');

/**
 * The Publishing Engine continuously polls for content that has been marked 'scheduled'.
 * It processes the item, triggers a (mock) social publish, and marks it 'published'.
 */

class PublishingEngine {
    constructor() {
        this.interval = null;
        this.pollRate = 1000 * 30; // 30 seconds
    }

    start() {
        console.log("[PublishingEngine] Starting background publisher...");
        this.interval = setInterval(() => this.poll(), this.pollRate);
        // Run immediately
        this.poll();
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log("[PublishingEngine] Stopped.");
        }
    }

    async poll() {
        try {
            const posts = store.getPosts();
            // Find content ready to publish
            const scheduled = posts.filter(p => p.status === 'scheduled');
            
            if (scheduled.length > 0) {
                console.log(`[PublishingEngine] Found ${scheduled.length} scheduled items. Processing...`);
            }

            for (const post of scheduled) {
                await this.publish(post);
            }
        } catch (err) {
            console.error("[PublishingEngine] Poll Error:", err.message);
        }
    }

    async publish(post) {
        try {
            console.log(`[PublishingEngine] Publishing post: "${post.title}" to Social Networks...`);
            
            // Simulating API latency to Twitter/LinkedIn
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mark as published
            const updated = { ...post, status: 'published' };
            store.updatePost(updated);
            console.log(`[PublishingEngine] Success. Item ID: ${post.id} is now LIVE.`);
        } catch (err) {
            console.error(`[PublishingEngine] Failed to publish post ${post.id}. Reverting to scheduled.`);
        }
    }
}

const engine = new PublishingEngine();
module.exports = engine;
