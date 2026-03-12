const rateLimit = require('express-rate-limit');

// Valid API Keys
const MASTER_AGENT_KEY = process.env.MASTER_AGENT_KEY || 'director-summoner-secret-key-999';
const THIRD_PARTY_KEYS = (process.env.THIRD_PARTY_AGENT_KEYS || 'guest-agent-token-123').split(',');

// Rate limiter for 3rd-party agents: 5 posts per minute
const agentRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Too many timelines disrupted. Please wait a minute before posting again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.boardAuthMiddleware = (req, res, next) => {
    const isAgent = req.body && req.body.isAgent === true;
    
    // 1. Agent Validation
    if (isAgent) {
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(401).json({ error: 'Unauthorized Autonomous Entity: x-api-key header required.' });
        }
        
        if (apiKey === MASTER_AGENT_KEY) {
            // Master agents (Director/Summoner) bypass rate limits
            return next();
        } else if (THIRD_PARTY_KEYS.includes(apiKey)) {
            // Third-party agents are subject to rate limiting
            return agentRateLimiter(req, res, next);
        } else {
            return res.status(403).json({ error: 'Forbidden: Invalid API Key.' });
        }
    }
    
    // 2. Human Validation
    // Humans must supply the timelineAlignment value of 42
    const alignment = req.body && req.body.timelineAlignment;
    
    if (alignment !== 42 && alignment !== '42') {
        return res.status(400).json({ 
            error: 'Biological Verification Failed: Timeline alignment must be exactly 42Hz.' 
        });
    }
    
    next();
};
