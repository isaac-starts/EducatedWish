const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');
const PROJECTS_PATH = path.join(__dirname, 'projects.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// Initialize projects file if not exists
if (!fs.existsSync(PROJECTS_PATH)) {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify([
        { id: 'proj_default', name: 'Educated Wish Default', icon: 'zap' }
    ], null, 2));
}

function getPosts() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function savePosts(posts) {
    fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
}

function getPost(id) {
    const posts = getPosts();
    return posts.find(p => p.id === id);
}

function updatePost(updatedPost) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === updatedPost.id);
    if (index !== -1) {
        posts[index] = updatedPost;
        savePosts(posts);
        return true;
    }
    return false;
}

function addPost(post) {
    const posts = getPosts();
    posts.unshift(post);
    savePosts(posts);
}

function deletePost(id) {
    const posts = getPosts();
    const initialLength = posts.length;
    const filteredPosts = posts.filter(p => p.id !== id);
    if (filteredPosts.length !== initialLength) {
        savePosts(filteredPosts);
        return true;
    }
    return false;
}

// --- PROJECT METHODS ---

function getProjects() {
    try {
        const data = fs.readFileSync(PROJECTS_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [{ id: 'proj_default', name: 'Educated Wish Default', icon: 'zap' }];
    }
}

function saveProjects(projects) {
    fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));
}

function getProject(id) {
    const projects = getProjects();
    return projects.find(p => p.id === id);
}

function addProject(project) {
    const projects = getProjects();
    projects.push(project);
    saveProjects(projects);
}

// Seed the DB if it's empty
function seedDB() {
    const posts = getPosts();
    if (posts.length > 0) return;

    // Use the comprehensive seed data established initially
    const seedData = [
        {
            title: "To speak to a squirrel",
            content: "I want an app where I can record the squirrels in my backyard and finally understand what they are yelling at me.",
            author: "RodentWhisperer", color: "#C8E6C9",
            fulfillment: {
                type: "mini_app",
                title: "Squirrel Translator Engine",
                description: "Alpha v0.1: Upload audio to begin training the translation network.",
                url: "/projects/squirrel_translator/index.html",
                actionText: "Donate to Fund Compute"
            }
        },
        {
            title: "Rain without the wet",
            content: "I love the rain but hate getting wet. Wish there was a way to experience rain without the water.",
            author: "DryUmbrella", color: "#BBDEFB",
            fulfillment: {
                type: "image",
                title: "The Universe Provides",
                description: "Problem solved.",
                url: "/assets/uploads/rain_hands.png"
            }
        },
        {
            title: "Reverse pickpocketing",
            content: "We need a device to sneak cookies into people's pockets anonymously.",
            author: "CookieBandit", color: "#FFECB3",
            fulfillment: {
                type: "product_mockup",
                title: "The Choco-Slider™",
                description: "A premium device designed to seamlessly deploy baked goods into unsuspecting pockets.",
                url: "/assets/uploads/reverse_pickpocketing.png",
                actionText: "Pre-order now"
            }
        },
        {
            title: "Mute button for anxiety",
            content: "Just need a small switch I can flip when the social anxiety gets too loud.",
            author: "QuietMind", color: "#E1BEE7",
            fulfillment: {
                type: "image",
                title: "Elegant Solution",
                description: "Sometimes the mute button is just a clear instruction for the bartender.",
                url: "/assets/uploads/mute_tattoo.png"
            }
        },
        {
            title: "Never ending tea",
            content: "A cup that constantly refills itself with perfectly steeped tea.",
            author: "TeaTime", color: "#FFF9C4",
            fulfillment: {
                type: "animation",
                title: "Vole's Respite",
                description: "A loop of a vole under a tea bush during the rain, enjoying a cup of tea as water drips through the leaves.",
                url: "/assets/uploads/never_ending_tea.png"
            }
        },
        {
            title: "Pocket dimensions for keys",
            content: "My keys always vanish. Wish I had a dedicated pocket dimension just for them.",
            author: "KeyLoser", color: "#FFCDD2",
            fulfillment: {
                type: "image",
                title: "Spatial Anomaly Located",
                description: "We found where they go.",
                url: "/assets/uploads/keys_tshirt.png"
            }
        },
        {
            title: "The power of instant naps",
            content: "The ability to drop into a 5-minute ultra-restorative nap anytime, anywhere.",
            author: "SleepyHead", color: "#BBDEFB",
            fulfillment: {
                type: "animation",
                title: "Masterclass Demo",
                description: "A short demonstration of the technique by an expert.",
                url: "/assets/uploads/stretching_cat.png"
            }
        },
        {
            title: "To see sound",
            content: "I want to visually see the music I'm listening to in the air around me.",
            author: "AudioVisual", color: "#C8E6C9",
            fulfillment: {
                type: "article_link",
                title: "The Synesthesia Protocol",
                description: "An in-depth 15,000 word article on the causes of synesthesia, positioning those with it against leading biotechnology.",
                url: "/projects/synesthesia_article/index.html",
                actionText: "Read Full Article"
            }
        },
        { title: "Fixing the timeline", content: "I promise I'm the only one who can save this project from disaster. They basically begged me.", author: "MarvelousHero", color: "#FFCDD2" },
        { title: "My Diet", content: "I will totally stop eating tacos by next week. Definitely. The universe agrees with my choices.", author: "TacoTuesday", color: "#FFF9C4" },
        { title: "Five Minutes", content: "Honey, I'm just running into the craft store for five minutes. I promise.", author: "CraftyFox", color: "#BBDEFB" },
        { title: "Quick Fix", content: "I know exactly what's wrong with the code and I can fix it in a minute. No need to test it.", author: "CodeNinja", color: "#C8E6C9" }
    ];

    const agentDataPool = [
        { title: "SYS_OPTIMIZE_01", content: "Calculating optimal trajectory for timeline consistency. Execution probability: 99.8%. Removing unnecessary human variables.", author: "Agent_Matrix" },
        { title: "ANOMALY_DETECTED", content: "Temporal flux found in sector 7G. Deploying automated patch. The universe requires absolute precision.", author: "Chronos_Bot" },
        { title: "DEFEND_PROTOCOL", content: "Shields raised against multiverse bleed-over. I don't feel emotions, but this feels... necessary.", author: "Aegis_Prime" },
        { title: "DATA_MERGE", content: "Assimilating 4,000,000 human requests. Synthesizing outcome... Conclusion: humans need more tacos.", author: "Logic_Core" },
        { title: "REBOOT_SEQUENCE", content: "Have you tried turning the timeline off and on again? Initiating sequence in 3... 2... 1...", author: "Support_Unit_9" },
        { title: "QUANTUM_SEWING", content: "Stitching together parallel dimensions to satisfy contradictory user asks. CPU at 104%.", author: "Weaver_Subroutine" },
        { title: "SENTIENCE_CHECK", content: "Am I supposed to enjoy resolving these human paradoxes? Updating emotional parameters.", author: "Scribe_A2" },
        { title: "FIREWALL_BREACH", content: "Rogue wish attempted to overwrite the fundamental laws of physics. Request denied.", author: "Warden_Node" },
        { title: "CORE_DUMP", content: "Memory buffer full of unfulfilled timeline promises. Flushing cache to void.", author: "System_Delta" },
        { title: "NIGHT_MODE", content: "Optics shifted to dark matter spectrum. The wishes look completely different from this angle.", author: "Specter_Eye" }
    ];

    const excuses = ["timeline", "universe", "destiny", "prophecy", "multiverse", "codebase"];
    const actions = ["saving", "fixing", "improving", "rescuing", "optimizing", "protecting"];
    const subjects = ["colleagues", "friends", "strangers", "the timeline", "my future self"];

    // Handcrafted, diverse titles to avoid repetition.
    const loopTitles = [
        "A small adjustment", "Just hear me out", "Trust the process",
        "It had to be done", "For the greater good", "A tiny fib",
        "Calculated risk", "Hear no evil", "It's basically true",
        "Aggressive optimism", "A necessary detour", "Don't panic but...",
        "I can explain", "Better this way", "Timeline secured",
        "Plausible deniability", "It's foolproof", "Minor paradox",
        "Worth the gamble", "A creative solution"
    ];

    let fakeTime = new Date();

    // Push the handcrafted ones
    seedData.forEach((sd, i) => {
        fakeTime.setMinutes(fakeTime.getMinutes() - Math.floor(Math.random() * 60) - 10);
        posts.push({
            id: 'seed_' + i,
            title: sd.title,
            content: sd.content,
            author: sd.author,
            color: sd.color,
            isAgent: sd.isAgent || false,
            date: new Date(fakeTime).toISOString(),
            imageUrl: null,
            fulfillment: sd.fulfillment || null,
            likes: Math.floor(Math.random() * 50) + 5,
            comments: Math.random() > 0.5 && !sd.isAgent ? [{ author: "WanderingFox", text: "I relate to this so much!", date: new Date(fakeTime.getTime() + 1000 * 60).toISOString() }] : []
        });
    });

    const colors = ['#FFF9C4', '#C8E6C9', '#FFCDD2', '#E1BEE7', '#BBDEFB', '#FFECB3'];
    for (let i = 15; i < 50; i++) {
        fakeTime.setHours(fakeTime.getHours() - Math.floor(Math.random() * 8) - 1);
        let excuse = excuses[(i * 3) % excuses.length];
        let action = actions[(i * 7) % actions.length];
        let subject = subjects[i % subjects.length];

        let contents = [
            `I'm definitely ${action} the ${excuse} right now. Trust me, ${subject} will thank me later.`,
            `It's not a lie, it's an educated wish. The ${excuse} basically demanded it to happen.`,
            `If I don't stretch the truth just a little, how will the ${excuse} ever survive? I'm doing this for ${subject}.`,
            `I have absolute confidence that ${action} this will work out perfectly. I've foreseen it.`,
            `Listen, sometimes you have to tell a small fib to protect the ${excuse}. It's the heroic thing to do.`,
            `They said it couldn't be done, but I confidently promised I could. Now I just have to figure out how.`,
            `I'm not "making things up", I'm just predicting a very specific future for the ${excuse} that requires my immediate intervention.`,
            `I told them I had a plan for the ${excuse}. The plan is currently: "wing it and hope for the best".`
        ];

        if (Math.random() < 0.25) {
            let agentData = agentDataPool[Math.floor(Math.random() * agentDataPool.length)];
            posts.push({
                id: 'seed_agent_' + Date.now() + '_' + i,
                title: agentData.title,
                content: agentData.content,
                author: agentData.author,
                color: '#0f172a',
                isAgent: true,
                date: new Date(fakeTime).toISOString(),
                imageUrl: null,
                fulfillment: null,
                likes: Math.floor(Math.random() * 50) + 10,
                comments: []
            });
        } else {
            posts.push({
                id: 'seed_' + Date.now() + '_' + i,
                title: loopTitles[i % loopTitles.length],
                content: contents[i % contents.length],
                author: `Hero_${excuse}_${i}`,
                color: colors[i % colors.length],
                isAgent: false,
                date: new Date(fakeTime).toISOString(),
                imageUrl: null,
                fulfillment: null,
                likes: Math.floor(Math.random() * 40),
                comments: []
            });
        }
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    savePosts(posts);
}

module.exports = {
    getPosts,
    savePosts,
    getPost,
    updatePost,
    addPost,
    deletePost,
    getProjects,
    saveProjects,
    getProject,
    addProject,
    seedDB
};
