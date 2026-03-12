// State
let posts = [];
let currentUsername = 'Anonymous';
let currentUserColor = '#FFF9C4';
let currentSort = 'newest';
let activeModalWishId = null;
let userAudacity = 0;

// DOM Elements
const El = {
    wishTitle: document.getElementById('wishTitle'),
    wishContent: document.getElementById('wishContent'),
    colorPicker: document.getElementById('colorPicker'),
    wishFile: document.getElementById('wishFile'),
    triggerFileBtn: document.getElementById('triggerFileBtn'),
    fileNameDisplay: document.getElementById('fileNameDisplay'),
    postWishBtn: document.getElementById('postWishBtn'),
    postsContainer: document.getElementById('postsContainer'),
    
    // Tuner
    timelineAlignment: document.getElementById('timelineAlignment'),
    tunerDisplay: document.getElementById('tunerDisplay'),
    topPostsContainer: document.getElementById('topPostsContainer'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    multiverseToggle: document.getElementById('multiverseToggle'),

    // User Elements
    userBadge: document.getElementById('userBadge'),
    usernameDisplay: document.getElementById('usernameDisplay'),
    userAvatar: document.getElementById('userAvatar'),
    userRankDisplay: document.getElementById('userRankDisplay'),

    // Modals
    usernameModal: document.getElementById('usernameModal'),
    usernameInput: document.getElementById('usernameInput'),
    saveUsernameBtn: document.getElementById('saveUsernameBtn'),
    clearUsernameBtn: document.getElementById('clearUsernameBtn'),

    commentModal: document.getElementById('commentModal'),
    modalWishContext: document.getElementById('modalWishContext'),
    commentsList: document.getElementById('commentsList'),
    newCommentInput: document.getElementById('newCommentInput'),
    addCommentBtn: document.getElementById('addCommentBtn'),

    fulfillmentModal: document.getElementById('fulfillmentModal'),
    fulfillmentTitle: document.getElementById('fulfillmentTitle'),
    fulfillmentDesc: document.getElementById('fulfillmentDesc'),
    fulfillmentContent: document.getElementById('fulfillmentContent'),
    fulfillmentActionBtn: document.getElementById('fulfillmentActionBtn'),

    closeBtns: document.querySelectorAll('.close-modal'),
    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view-section'),
};

// Initialize
async function init() {
    loadUser();
    await loadPosts();
    setupEventListeners();
    renderPosts();
    renderTopPosts();

    // The universe engine might be working in the background. Check occasionally.
    setInterval(async () => {
        const oldLength = posts.length;
        await loadPosts();
        renderPosts();
        renderTopPosts();
    }, 15000);
}

// Event Listeners
function setupEventListeners() {
    // Nav Navigation
    El.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            El.navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            El.views.forEach(v => {
                v.classList.remove('active');
                if (v.id === targetId) {
                    v.classList.add('active');
                    // simple fade-in reset
                    v.style.animation = 'none';
                    v.offsetHeight;
                    v.style.animation = null;
                }
            });
        });
    });
    // Color Picker
    El.colorPicker.addEventListener('click', (e) => {
        if (e.target.classList.contains('color-swatch')) {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            e.target.classList.add('active');
            currentUserColor = e.target.getAttribute('data-color');
        }
    });

    // File Upload Proxy
    El.triggerFileBtn.addEventListener('click', () => {
        El.wishFile.click();
    });

    El.wishFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            El.fileNameDisplay.textContent = e.target.files[0].name;
        } else {
            El.fileNameDisplay.textContent = '';
        }
    });

    // Timeline Tuner
    El.timelineAlignment.addEventListener('input', (e) => {
        El.tunerDisplay.textContent = `${e.target.value}Hz`;
        
        // Give visual feedback when aligned perfectly
        if (e.target.value === "42") {
            El.tunerDisplay.style.color = "var(--primary-color)";
            El.tunerDisplay.style.fontWeight = "bold";
        } else {
            El.tunerDisplay.style.color = "";
            El.tunerDisplay.style.fontWeight = "";
        }
    });

    // Post Wish
    El.postWishBtn.addEventListener('click', handlePostWish);

    // Search & Sort
    El.searchInput.addEventListener('input', renderPosts);
    El.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderPosts();
    });
    
    // Multiverse Toggle
    if (El.multiverseToggle) {
        El.multiverseToggle.addEventListener('change', () => {
            renderPosts();
            renderTopPosts(); 
        });
    }

    // Modals
    El.userBadge.addEventListener('click', () => openModal(El.usernameModal));

    El.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal-overlay'));
        });
    });

    // Clicking outside modal to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // User Operations
    El.saveUsernameBtn.addEventListener('click', () => {
        const val = El.usernameInput.value.trim();
        if (val) {
            currentUsername = val;
            saveUser();
            closeModal(El.usernameModal);
        }
    });

    El.clearUsernameBtn.addEventListener('click', () => {
        currentUsername = 'Anonymous';
        El.usernameInput.value = '';
        saveUser();
        closeModal(El.usernameModal);
    });

    // Comments
    El.addCommentBtn.addEventListener('click', handleAddComment);
}

// User Management
function loadUser() {
    const saved = localStorage.getItem('educated_user');
    if (saved) {
        currentUsername = saved;
        El.usernameInput.value = saved;
    }
    const savedAP = localStorage.getItem('educated_ap');
    if (savedAP) {
        userAudacity = parseInt(savedAP, 10) || 0;
    }
    updateUserUI();
}

function saveUser() {
    localStorage.setItem('educated_user', currentUsername);
    localStorage.setItem('educated_ap', userAudacity.toString());
    updateUserUI();
}

function awardPoints(points) {
    userAudacity += points;
    saveUser();
}

const animals = ['🦊', '🦝', '🐼', '🐨', '🐸', '🐵', '🐧', '🐢', '🐙', '🦖', '🦕', '🦉', '🦇', '🐺', '🐗', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐿️', '🦔', '🦦', '🦥', '🦡'];
function getAnimalForName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return animals[Math.abs(hash) % animals.length];
}

function getRankTitle(ap) {
    if (ap < 50) return { title: "Optimist", icon: "🌱" };
    if (ap < 150) return { title: "Smooth Talker", icon: "😎" };
    if (ap < 300) return { title: "Timeline Meddler", icon: "🕰️" };
    if (ap < 600) return { title: "Multiverse Master", icon: "🌌" };
    return { title: "Reality Weaver", icon: "🎭" };
}

function updateUserUI() {
    El.usernameDisplay.textContent = currentUsername;
    El.userAvatar.textContent = getAnimalForName(currentUsername);

    if (El.userRankDisplay) {
        const rank = getRankTitle(userAudacity);
        El.userRankDisplay.textContent = `${rank.icon} ${rank.title} (${userAudacity} AP)`;
    }
}

// Data Management
async function loadPosts() {
    try {
        const res = await fetch('/api/posts');
        posts = await res.json();
    } catch (e) {
        console.error('Failed to grab timeline anomalies:', e);
        posts = [];
    }
}

async function savePost(post) {
    try {
        await fetch('/api/posts/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
    } catch (e) {
        console.error('Timeline update failed:', e);
    }
}

// Posting
async function handlePostWish() {
    const title = El.wishTitle.value.trim();
    const content = El.wishContent.value.trim();
    const frequency = parseInt(El.timelineAlignment.value, 10);
    
    if (!title || !content) {
        alert("Please provide both a title and describe your wish.");
        return;
    }
    
    if (frequency !== 42) {
        alert("Biological verify failed: Your cosmic frequency must be aligned exactly to 42Hz to pin a wish.");
        return;
    }

    El.postWishBtn.disabled = true;
    let imageUrl = null;

    if (El.wishFile.files.length > 0) {
        const formData = new FormData();
        formData.append('image', El.wishFile.files[0]);

        try {
            const res = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.imageUrl) {
                imageUrl = data.imageUrl;
            }
        } catch (e) {
            console.error("Image upload failed", e);
            alert("Image upload failed, posting without image.");
        }
    }

    const newPost = {
        id: Date.now().toString(),
        title,
        content,
        color: currentUserColor,
        author: currentUsername,
        isAgent: false,
        timelineAlignment: frequency,
        date: new Date().toISOString(),
        imageUrl,
        likes: 0,
        comments: []
    };

    posts.unshift(newPost);

    // Create post on server
    try {
        await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });
    } catch (e) {
        console.error("Could not upload to server", e);
    }

    awardPoints(50); // Massive Audacity Points for pinning a wish!

    // Clear Form
    El.wishTitle.value = '';
    El.wishContent.value = '';
    El.wishFile.value = '';
    El.fileNameDisplay.textContent = '';
    El.timelineAlignment.value = 0;
    El.tunerDisplay.textContent = '0Hz';
    El.tunerDisplay.style.color = "";
    El.tunerDisplay.style.fontWeight = "";

    El.postWishBtn.disabled = false;
    renderPosts();
    renderTopPosts();
}

// Rendering
function renderPosts() {
    let filtered = [...posts];

    // Filter by Toggle Status
    const includeAgents = El.multiverseToggle ? El.multiverseToggle.checked : true;
    
    if (!includeAgents) {
        filtered = filtered.filter(p => !p.isAgent);
    }

    // Search
    const term = El.searchInput.value.toLowerCase().trim();
    if (term) {
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term) ||
            p.author.toLowerCase().includes(term)
        );
    }

    // Sort
    if (currentSort === 'newest') {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (currentSort === 'oldest') {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (currentSort === 'mostLiked') {
        filtered.sort((a, b) => b.likes - a.likes);
    } else if (currentSort === 'mostCommented') {
        filtered.sort((a, b) => b.comments.length - a.comments.length);
    }

    El.postsContainer.innerHTML = '';

    if (filtered.length === 0) {
        El.postsContainer.innerHTML = `<div style="text-align:center; grid-column: 1 / -1; color: var(--text-secondary); padding: 3rem;">No wishes found. Be the first to add one!</div>`;
        return;
    }

    // Enforce 1:3 visual ratio (max 1 agent per 3 humans)
    let humanCountThisGroup = 0;
    
    filtered.forEach((post, index) => {
        // If agent posts are "on", we still limit their dominance
        if (includeAgents && post.isAgent) {
            if (humanCountThisGroup < 3) {
                // Not enough humans have been shown yet to allow another agent
                return; // Skip this agent post for now
            } else {
                // Allowed to show an agent, reset the human counter
                humanCountThisGroup = 0;
            }
        } else if (!post.isAgent) {
            humanCountThisGroup++;
        }

        const rotation = (index % 5) - 2; // -2 to 2 degrees
        const card = createPostCard(post, rotation);
        El.postsContainer.appendChild(card);
    });
}

function renderTopPosts() {
    let top = [...posts].sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length));
    top = top.slice(0, 6); // Top 6

    El.topPostsContainer.innerHTML = '';
    if (top.length === 0) {
        El.topPostsContainer.innerHTML = `<div style="text-align:center; grid-column: 1 / -1; color: var(--text-secondary); padding: 3rem;">No top wishes yet. Engage with some wishes!</div>`;
        return;
    }

    top.forEach((post, index) => {
        const rotation = (index % 5) - 2;
        const card = createPostCard(post, rotation);
        El.topPostsContainer.appendChild(card);
    });
}

function createPostCard(post, rotation) {
    const el = document.createElement('div');
    el.className = post.isAgent ? 'wish-note agent-note' : 'wish-note';
    el.style.background = post.color;

    // Slight random rotation for natural feel
    el.style.transform = `rotate(${rotation}deg)`;

    // Formatted Date
    const d = new Date(post.date);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Inner HTML
    let imgHtml = '';
    if (post.imageUrl) {
        imgHtml = `<div class="note-img-container"><img src="${post.imageUrl}" alt="Wish Image"></div>`;
    }

    let fulfillmentHtml = '';
    if (post.fulfillment) {
        fulfillmentHtml = `
            <button class="fulfillment-badge" onclick="openFulfillment('${post.id}')">
                <i class="fa-solid fa-wand-magic-sparkles"></i> The Universe Responded
            </button>
        `;
    } else {
        fulfillmentHtml = `
            <button class="fulfillment-badge" style="background: rgba(255,255,255,0.2); border: 1px dashed rgba(0,0,0,0.3);" onclick="requestUniverse(event, '${post.id}')">
                <i class="fa-solid fa-meteor"></i> Ask the Universe
            </button>
        `;
    }

    // Calculate Author Rank dynamically
    const authorAp = (post.likes * 5) + (post.comments.length * 10);
    const rank = getRankTitle(authorAp);

    el.innerHTML = `
        <div class="pin"></div>
        <div class="note-header">
            <div class="note-title">${escapeHTML(post.title)}</div>
        </div>
        <div class="note-author">
            <div class="avatar-animal" title="${escapeHTML(post.author)}">${getAnimalForName(post.author)}</div>
            <div style="display: flex; flex-direction: column;">
                <span>${escapeHTML(post.author)}</span>
                <span style="font-size: 0.8rem; opacity: 0.7; font-family: var(--primary-font);">${rank.icon} ${rank.title}</span>
            </div>
        </div>
        <div class="note-body">${escapeHTML(post.content)}</div>
        ${imgHtml}
        ${fulfillmentHtml}
        <div class="note-footer">
            <div class="note-date">${dateStr}</div>
            <div class="note-actions">
                <button class="action-btn btn-comment" title="Discuss"><i class="fa-regular fa-comment"></i> ${post.comments.length}</button>
                <button class="action-btn btn-like" title="Plausible"><i class="fa-solid fa-check-double"></i> Plausible (${post.likes})</button>
            </div>
        </div>
    `;

    // Events
    const likeBtn = el.querySelector('.btn-like');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        post.likes++;
        savePost(post);
        awardPoints(5); // You get points for verifying timelines
        renderPosts();
        renderTopPosts();
    });

    const commentBtn = el.querySelector('.btn-comment');
    commentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCommentModal(post.id);
    });

    // Also open modal on card click
    el.addEventListener('click', () => {
        openCommentModal(post.id);
    });

    return el;
}

// Modal Logic
function openModal(modalEl) {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(m => m.classList.remove('active'));
    modalEl.classList.add('active');
}

function closeModal(modalEl) {
    if (modalEl) modalEl.classList.remove('active');
}

function openCommentModal(postId) {
    activeModalWishId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Render left side
    El.modalWishContext.innerHTML = '';

    // Create a clone but hide the fulfillment badge since we're in the comment view
    const clonePost = { ...post, fulfillment: null };
    const clone = createPostCard(clonePost, 0);
    // Remove pointer events for the clone in modal
    clone.style.pointerEvents = 'none';
    El.modalWishContext.appendChild(clone);

    renderComments(post);
    El.newCommentInput.value = '';
    openModal(El.commentModal);
}

window.requestUniverse = async function (e, postId) {
    e.stopPropagation(); // prevent modal opening
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!confirm("Are you sure you want to invoke the universe for this timeline anomaly? It cannot be undone.")) {
        return;
    }

    try {
        const btn = e.target.closest('button');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aligning Cosmos...';
        btn.disabled = true;

        const response = await fetch('/api/wish/fulfill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wishDescription: post.content })
        });

        const data = await response.json();

        if (data.success) {
            post.fulfillment = {
                type: "agent_message",
                title: "Cosmic Intervention Complete",
                description: data.fulfillmentText,
            };
            savePost(post);
            renderPosts();
            openFulfillment(postId);
        } else {
            alert("The universe is busy protecting another timeline right now.");
            btn.innerHTML = '<i class="fa-solid fa-meteor"></i> Ask the Universe';
            btn.disabled = false;
        }

    } catch (err) {
        alert("The universe is currently unreachable.");
        const btn = e.target.closest('button');
        btn.innerHTML = '<i class="fa-solid fa-meteor"></i> Ask the Universe';
        btn.disabled = false;
    }
};

// Ensure openFulfillment works globally for the inline onclick handler
window.openFulfillment = function (postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.fulfillment) return;

    const f = post.fulfillment;

    El.fulfillmentTitle.textContent = f.title || 'The Universe Provides';
    El.fulfillmentDesc.textContent = f.description || '';

    El.fulfillmentContent.innerHTML = '';

    if (f.type === 'image' || f.type === 'product_mockup') {
        const img = document.createElement('img');
        img.src = f.url;
        El.fulfillmentContent.appendChild(img);
    } else if (f.type === 'mini_app' || f.type === 'article_link') {
        const frame = document.createElement('iframe');
        frame.src = f.url;
        El.fulfillmentContent.appendChild(frame);
    } else if (f.type === 'animation') {
        const img = document.createElement('img');
        img.src = f.url; // Use an animated gif/webp for placeholder
        El.fulfillmentContent.appendChild(img);
    }

    if (f.actionText) {
        El.fulfillmentActionBtn.textContent = f.actionText;
        El.fulfillmentActionBtn.style.display = 'block';
    } else {
        El.fulfillmentActionBtn.style.display = 'none';
    }

    // Close other modals and open this one
    openModal(El.fulfillmentModal);
};

function renderComments(post) {
    El.commentsList.innerHTML = '';
    if (post.comments.length === 0) {
        El.commentsList.innerHTML = `<div style="text-align:center; color: var(--text-secondary); padding: 1rem;">No responses yet. Be the first!</div>`;
        return;
    }

    post.comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        const d = new Date(c.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `
            <div class="comment-author"><div class="avatar-animal" title="${escapeHTML(c.author)}">${getAnimalForName(c.author)}</div> ${escapeHTML(c.author)} <span style="font-weight:normal; font-size:0.8rem; color: #888;">• ${d}</span></div>
            <div class="comment-text">${escapeHTML(c.text)}</div>
        `;
        El.commentsList.appendChild(div);
    });
}

function handleAddComment() {
    if (!activeModalWishId) return;
    const text = El.newCommentInput.value.trim();
    if (!text) return;

    const post = posts.find(p => p.id === activeModalWishId);
    if (!post) return;

    post.comments.push({
        author: currentUsername,
        text: text,
        date: new Date().toISOString()
    });

    savePost(post);
    awardPoints(10); // Reward for contributing to the timeline discussion
    renderComments(post);
    El.newCommentInput.value = '';
    renderPosts();
    renderTopPosts();
}

// Utility
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Start
document.addEventListener('DOMContentLoaded', init);
