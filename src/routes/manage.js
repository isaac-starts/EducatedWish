const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET all content (with optional generic status filter if needed)
router.get('/content', (req, res) => {
    try {
        let posts = store.getPosts();
        
        // Optional filter by status
        if (req.query.status) {
            posts = posts.filter(p => p.status === req.query.status);
        }

        res.status(200).json({ status: "success", data: posts });
    } catch (err) {
        console.error("[ManageAPI] Error fetching content:", err.message);
        res.status(500).json({ error: "Failed to fetch content" });
    }
});

// GET single content
router.get('/content/:id', (req, res) => {
    try {
        const post = store.getPost(req.params.id);
        if (post) {
            res.status(200).json({ status: "success", data: post });
        } else {
            res.status(404).json({ error: "Content not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch content" });
    }
});

// POST to create new draft content manually via dashboard
router.post('/content', (req, res) => {
    try {
        const newPost = {
            id: 'post_' + Date.now(),
            title: req.body.title || 'Untitled',
            content: req.body.content || '',
            author: req.body.author || 'Admin',
            color: req.body.color || '#ffffff',
            status: req.body.status || 'draft',
            scheduledFor: req.body.scheduledFor || null,
            date: new Date().toISOString(),
            imageUrl: req.body.imageUrl || null,
            fulfillment: req.body.fulfillment || null,
            likes: 0,
            comments: []
        };
        store.addPost(newPost);
        res.status(201).json({ status: "success", data: newPost });
    } catch (err) {
        console.error("[ManageAPI] Error creating content:", err.message);
        res.status(500).json({ error: "Failed to create content" });
    }
});

// PUT/PATCH to update content (e.g. edit draft, approve for scheduling, update status)
router.put('/content/:id', (req, res) => {
    try {
        const post = store.getPost(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Content not found" });
        }

        const updatedPost = { ...post, ...req.body, id: post.id }; // ensure ID doesn't change
        store.updatePost(updatedPost);
        res.status(200).json({ status: "success", data: updatedPost });
    } catch (err) {
        console.error("[ManageAPI] Error updating content:", err.message);
        res.status(500).json({ error: "Failed to update content" });
    }
});

// DELETE content
router.delete('/content/:id', (req, res) => {
    try {
        const success = store.deletePost(req.params.id);
        if (success) {
            res.status(200).json({ status: "success", message: "Content deleted" });
        } else {
            res.status(404).json({ error: "Content not found" });
        }
    } catch (err) {
        console.error("[ManageAPI] Error deleting content:", err.message);
        res.status(500).json({ error: "Failed to delete content" });
    }
});

module.exports = router;
