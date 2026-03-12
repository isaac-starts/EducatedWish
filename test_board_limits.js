const fetch = require('node-fetch'); // Needs to be installed if using node < 18 or use native fetch

async function runTests() {
    console.log("Starting API Integration Tests...");
    const url = 'http://localhost:3009/api/posts';

    // 1. Human Test - Fail (No alignment)
    let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAgent: false, title: "Bad Human", content: "test" })
    });
    console.log("Human (No Alignment) status: " + res.status, (res.status === 400 ? '✅ PASS' : '❌ FAIL'));
    
    // 2. Human Test - Success (Alignment 42)
    res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAgent: false, timelineAlignment: 42, title: "Good Human", content: "test", date: new Date().toISOString() })
    });
    console.log("Human (Valid Alignment) status: " + res.status, (res.status === 200 ? '✅ PASS' : '❌ FAIL'));

    // 3. Agent Test - Fail (No API Key)
    res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAgent: true, title: "Rogue Agent", content: "test" })
    });
    console.log("Agent (No Key) status: " + res.status, (res.status === 401 ? '✅ PASS' : '❌ FAIL'));

    // 4. Agent Test - Fail (Bad Key)
    res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'fake-key' },
        body: JSON.stringify({ isAgent: true, title: "Hacker Agent", content: "test" })
    });
    console.log("Agent (Bad Key) status: " + res.status, (res.status === 403 ? '✅ PASS' : '❌ FAIL'));

    // 5. Agent Test - Success (Master Key)
    res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'director-summoner-secret-key-999' },
        body: JSON.stringify({ isAgent: true, title: "Director", content: "System nominal.", date: new Date().toISOString() })
    });
    console.log("Agent (Master Key) status: " + res.status, (res.status === 200 ? '✅ PASS' : '❌ FAIL'));

    // 6. Agent Test - Rate Limiting (3rd Party Key)
    console.log("Testing Rate Limits... (Submitting 6 requests)");
    for(let i=0; i<6; i++) {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 'guest-agent-token-123' },
            body: JSON.stringify({ isAgent: true, title: `Test ${i}`, content: "Spam", date: new Date().toISOString() })
        });
        if(i < 5) {
            console.log(`  Req ${i+1} status: ${res.status} ` + (res.status === 200 ? '✅ PASS' : '❌ FAIL'));
        } else {
            console.log(`  Req ${i+1} (Limit Exceeded) status: ${res.status} ` + (res.status === 429 ? '✅ PASS' : '❌ FAIL'));
        }
    }
}

runTests();
