const EXPECTED_SECRET = process.env.INTERNAL_API_SECRET || 'dev_shared_secret';

exports.requireInternalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== EXPECTED_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Secret' });
    }

    next();
};
