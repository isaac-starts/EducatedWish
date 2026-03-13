import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Save } from 'lucide-react';
import { DndContext, closestCorners } from '@dnd-kit/core';

import PostCard from './components/PostCard';
import KanbanColumn from './components/KanbanColumn';

const API_BASE = 'http://localhost:3009/api/manage';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState(null);
  
  // Workflow States
  const [workflows, setWorkflows] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [isPrompting, setIsPrompting] = useState(false);
  
  // Idea Generator States
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState("");
  const [ideaCount, setIdeaCount] = useState(3);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);
  const [isFetchingIdeas, setIsFetchingIdeas] = useState(false);

  // Multi-Project States
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchWorkflows();
    
    // Polling setup for Pending Workflows
    const interval = setInterval(() => {
        fetchWorkflows();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // When the project changes, reload posts
  useEffect(() => {
    if (currentProject) {
      fetchPosts();
    }
  }, [currentProject]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`);
      if (res.data.status === 'success') {
        setProjects(res.data.data);
        if (res.data.data.length > 0 && !currentProject) {
          setCurrentProject(res.data.data[0]); // Default to first project
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchPosts = async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/content?projectId=${currentProject.id}`);
      if (res.data.status === 'success') {
        const sorted = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        const mapped = sorted.map(p => ({ ...p, status: p.status || 'draft' }));
        setPosts(mapped);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const updatePostStatus = async (id, status) => {
    // Optimistic UI Update
    setPosts(posts.map(p => p.id === id ? { ...p, status } : p));
    try {
      await axios.put(`${API_BASE}/content/${id}`, { status });
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on fail
      fetchPosts(); 
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/projects`, { name: newProjectName });
      if (res.data.status === 'success') {
        const newProj = res.data.data;
        setProjects([...projects, newProj]);
        setCurrentProject(newProj);
        setNewProjectName('');
        setIsAddingProject(false);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const postId = active.id;
    const dropZoneId = over.id;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    let newStatus = null;
    if (dropZoneId === 'col-drafts') newStatus = 'draft';
    if (dropZoneId === 'col-scheduled') newStatus = 'scheduled';
    if (dropZoneId === 'col-published') newStatus = 'published';

    if (newStatus && post.status !== newStatus) {
      updatePostStatus(postId, newStatus);
    }
  };

  const deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      const res = await axios.delete(`${API_BASE}/content/${id}`);
      if (res.data.status === 'success') {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const saveEdit = async () => {
    if (!editingPost) return;
    try {
      const res = await axios.put(`${API_BASE}/content/${editingPost.id}`, editingPost);
      if (res.data.status === 'success') {
        setPosts(posts.map(p => p.id === editingPost.id ? editingPost : p));
        setEditingPost(null);
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  // --- WORKFLOW API CALLS ---
  const WORKFLOW_API = 'http://localhost:3009/api/workflow';

  const fetchWorkflows = async () => {
    try {
      const res = await axios.get(`${WORKFLOW_API}/pending`);
      setWorkflows(res.data);
    } catch (err) {
      console.error("Error fetching workflows:", err);
    }
  };

  const startWorkflow = async () => {
    if (!newPrompt) return;
    try {
      await axios.post(`${WORKFLOW_API}/start`, { 
        prompt: newPrompt, 
        author: 'HumanDirector',
        projectId: currentProject?.id || 'proj_default'
      });
      setNewPrompt('');
      setIsPrompting(false);
      setGeneratedIdeas([]);
      setIsGeneratingIdeas(false);
      setTimeout(fetchWorkflows, 1000);
      alert("Workflow started! It will appear in the queue when ready for approval.");
    } catch (err) {
      console.error(err);
    }
  };
  
  const generateIdeas = async () => {
    if (!ideaTopic) return;
    setIsFetchingIdeas(true);
    setGeneratedIdeas([]);
    try {
      const res = await axios.post(`${WORKFLOW_API}/generate-ideas`, { topic: ideaTopic, count: ideaCount });
      setGeneratedIdeas(res.data.ideas || []);
    } catch (err) {
      console.error("Error generating ideas:", err);
      alert("Failed to generate ideas. Ensure the backend is running and OpenAI key is valid.");
    } finally {
      setIsFetchingIdeas(false);
    }
  };

  const approveWorkflow = async (id) => {
    try {
      await axios.post(`${WORKFLOW_API}/${id}/approve`);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectWorkflow = async (id) => {
    try {
      await axios.post(`${WORKFLOW_API}/${id}/reject`, { feedback: "Admin rejected" });
      fetchWorkflows();
    } catch (err) {
      console.error(err);
    }
  };

  const drafts = posts.filter(p => p.status === 'draft');
  const scheduled = posts.filter(p => p.status === 'scheduled');
  const published = posts.filter(p => p.status === 'published');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Play size={18} className="text-white ml-0.5" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Educated Wish</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Content Generation Dashboard</p>
          </div>
          
          <div className="h-8 w-px bg-slate-800 mx-4"></div>
          
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <select 
              value={currentProject?.id || ''} 
              onChange={(e) => {
                const proj = projects.find(p => p.id === e.target.value);
                setCurrentProject(proj);
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 focus:outline-none shadow-sm"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-2 transition shadow-sm border border-slate-700"
              title="Add New Project"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGeneratingIdeas(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/20">
            ✨ Auto-Generate Ideas
          </button>
          <button 
            onClick={() => setIsPrompting(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            + New Video Workflow
          </button>
          <div className="h-6 w-px bg-slate-800 mx-2"></div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <Play size={16} /> Force Engine Run
          </button>
        </div>
      </header>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <main className="flex-1 p-8 overflow-x-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            </div>
          ) : (
            <div className="flex gap-6 h-full min-w-max pb-10">
              {/* Pending Approvals (Workflow) Column */}
              <KanbanColumn 
                id="col-pending"
                title={<><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div><h3 className="font-semibold text-amber-400">Pending Approval</h3></>}
                count={workflows.length}
                borderColorClass="border-amber-900/40"
                headerBgClass="bg-amber-900/50 text-amber-300"
                emptyMessage="Queue empty"
              >
                {workflows.map(wf => (
                    <div key={wf.id} className="bg-slate-800/80 backdrop-blur pb-4 pt-4 px-4 rounded-xl border border-amber-500/30 shadow-lg shadow-amber-900/10 group">
                      <h4 className="font-semibold text-white mb-2">Workflow: {wf.id.split('_')[1]}</h4>
                      <p className="text-sm text-slate-300 mb-2">Prompt: {wf.prompt}</p>
                      {wf.videoUrl && (
                        <a href={wf.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline block mb-4">View Generated Video</a>
                      )}
                      <div className="flex gap-2 justify-between mt-4">
                        <button onClick={() => approveWorkflow(wf.id)} className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 transition py-1.5 rounded-lg text-sm font-semibold">Approve</button>
                        <button onClick={() => rejectWorkflow(wf.id)} className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition py-1.5 rounded-lg text-sm font-semibold">Reject</button>
                      </div>
                    </div>
                ))}
              </KanbanColumn>

              {/* Drafts Column */}
              <KanbanColumn 
                id="col-drafts"
                title={<><div className="w-2 h-2 rounded-full bg-slate-400"></div><h3 className="font-semibold text-slate-200">Drafts</h3></>}
                count={drafts.length}
                borderColorClass="border-slate-700/50"
                headerBgClass="bg-slate-800 text-slate-300"
                emptyMessage="No drafts"
              >
                {drafts.map(post => <PostCard key={post.id} post={post} onEdit={setEditingPost} onDelete={deletePost} onUpdateStatus={updatePostStatus} />)}
              </KanbanColumn>

              {/* Scheduled Column */}
              <KanbanColumn 
                id="col-scheduled"
                title={<><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div><h3 className="font-semibold text-blue-400">Scheduled</h3></>}
                count={scheduled.length}
                borderColorClass="border-blue-900/40"
                headerBgClass="bg-blue-900/50 text-blue-300"
                emptyMessage="No scheduled posts"
              >
                {scheduled.map(post => <PostCard key={post.id} post={post} onEdit={setEditingPost} onDelete={deletePost} onUpdateStatus={updatePostStatus} />)}
              </KanbanColumn>

              {/* Published Column */}
              <KanbanColumn 
                id="col-published"
                title={<><div className="w-2 h-2 rounded-full bg-emerald-500"></div><h3 className="font-semibold text-emerald-400">Published</h3></>}
                count={published.length}
                borderColorClass="border-emerald-900/40"
                headerBgClass="bg-emerald-900/50 text-emerald-300"
                emptyMessage="No published posts"
              >
                {published.map(post => <PostCard key={post.id} post={post} onEdit={setEditingPost} onDelete={deletePost} onUpdateStatus={updatePostStatus} />)}
              </KanbanColumn>

            </div>
          )}
        </main>
      </DndContext>

      {/* Edit Modal Base */}
      {editingPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h2 className="text-xl font-bold mb-4">Edit Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input 
                  type="text"
                  value={editingPost.title}
                  onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
                <textarea 
                  rows={6}
                  value={editingPost.content}
                  onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setEditingPost(null)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20">
                <Save size={16}/> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Prompt Modal */}
      {isPrompting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <h2 className="text-xl font-bold mb-4 text-white">Start Content Creation Workflow</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Detailed Video Prompt</label>
                <textarea 
                  rows={6}
                  value={newPrompt}
                  onChange={e => setNewPrompt(e.target.value)}
                  placeholder="Describe the video in detail..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsPrompting(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={startWorkflow}
                disabled={!newPrompt}
                className="px-6 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-500 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                <Play size={16}/> Launch Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idea Generator Modal */}
      {isGeneratingIdeas && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex justify-between items-center mb-6 mt-2">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">✨ AI Content Generator</h2>
                <button onClick={() => setIsGeneratingIdeas(false)} className="text-slate-500 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex gap-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-2">Topic / Parameter</label>
                <input 
                  type="text"
                  value={ideaTopic}
                  onChange={e => setIdeaTopic(e.target.value)}
                  placeholder="e.g. Edmonton Health Practitioners..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-slate-400 mb-2">Count</label>
                <input 
                  type="number"
                  min="1"
                  max="10"
                  value={ideaCount}
                  onChange={e => setIdeaCount(Number(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition text-center"
                />
              </div>
              <div className="flex items-end">
                  <button 
                    onClick={generateIdeas}
                    disabled={isFetchingIdeas || !ideaTopic}
                    className="px-6 py-2 h-10 bg-purple-600 disabled:opacity-50 hover:bg-purple-500 text-white rounded-lg transition-all font-semibold shadow-lg shadow-purple-500/20 active:scale-95">
                    {isFetchingIdeas ? 'Thinking...' : 'Generate'}
                  </button>
              </div>
            </div>

            {/* Generated Results Grid */}
            {generatedIdeas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {generatedIdeas.map((idea, idx) => (
                        <div key={idx} className="bg-slate-800/80 p-5 rounded-xl border border-purple-500/30 shadow-lg shadow-purple-900/10 hover:border-purple-500/60 transition-colors group flex flex-col">
                            <h4 className="font-bold text-white mb-3 text-lg">{idea.title}</h4>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4 flex-1">
                              <p className="text-sm text-slate-300 italic line-clamp-4">"{idea.prompt}"</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setNewPrompt(idea.prompt);
                                    setIsGeneratingIdeas(false);
                                    setIsPrompting(true);
                                }}
                                className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2">
                                <Play size={14} fill="currentColor"/> Send to Video Workflow
                            </button>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddingProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <h2 className="text-xl font-bold mb-4 text-white">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                <input 
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="e.g. Directory Project"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  onKeyDown={(e) => { if (e.key === 'Enter') createProject(); }}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => { setIsAddingProject(false); setNewProjectName(''); }}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                Cancel
              </button>
              <button 
                onClick={createProject}
                disabled={!newProjectName.trim()}
                className="px-6 py-2 bg-blue-600 disabled:opacity-50 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
