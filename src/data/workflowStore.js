const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'workflowDb.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

function getWorkflows() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveWorkflows(workflows) {
    fs.writeFileSync(DB_PATH, JSON.stringify(workflows, null, 2));
}

function getWorkflow(id) {
    const workflows = getWorkflows();
    return workflows.find(w => w.id === id);
}

function updateWorkflow(updatedWorkflow) {
    const workflows = getWorkflows();
    const index = workflows.findIndex(w => w.id === updatedWorkflow.id);
    if (index !== -1) {
        workflows[index] = { ...workflows[index], ...updatedWorkflow, updatedAt: new Date().toISOString() };
        saveWorkflows(workflows);
        return workflows[index];
    }
    return null;
}

function addWorkflow(workflow) {
    const workflows = getWorkflows();
    const newWorkflow = {
        ...workflow,
        id: 'wf_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        status: workflow.status || 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    workflows.unshift(newWorkflow);
    saveWorkflows(workflows);
    return newWorkflow;
}

function getPendingApprovals() {
    const workflows = getWorkflows();
    return workflows.filter(w => w.status === 'PENDING_APPROVAL');
}

module.exports = {
    getWorkflows,
    saveWorkflows,
    getWorkflow,
    updateWorkflow,
    addWorkflow,
    getPendingApprovals
};
