const http = require('http');

const payload = JSON.stringify({
    client_id: "qa_tester",
    task_type: "article",
    prompt_parameters: {
        topic: "The future of API integrations",
        tone: "professional"
    },
    sync: true
});

const options = {
    hostname: 'localhost',
    port: 3009,
    path: '/api/v1/generate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev_shared_secret',
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
