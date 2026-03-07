const store = require('../data/store');

exports.getPosts = (req, res) => {
    res.json(store.getPosts());
};

exports.createPost = (req, res) => {
    const post = req.body;
    store.addPost(post);
    res.json({ success: true, post });
};

exports.updatePost = (req, res) => {
    const success = store.updatePost(req.body);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Post not found" });
    }
};
