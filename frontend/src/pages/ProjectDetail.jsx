import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { user, workspaceRole, activeWorkspace } = useContext(AuthContext);

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (user && activeWorkspace) {
      fetchProjectDetails();
      if (workspaceRole === 'Admin') fetchUsers();
    }
  }, [id, user, workspaceRole, activeWorkspace]);

  const fetchProjectDetails = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`, config),
        axios.get(`/api/tasks/project/${id}`, config)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/auth/users', config);
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const [editingTaskId, setEditingTaskId] = useState(null);

  const handleCreateOrUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingTaskId) {
        await axios.put(`/api/tasks/${editingTaskId}`, { title, description, assignedTo, dueDate }, config);
      } else {
        await axios.post('/api/tasks', { title, description, project: id, assignedTo, dueDate }, config);
      }
      setShowTaskModal(false);
      setTitle(''); setDescription(''); setAssignedTo(''); setDueDate(''); setEditingTaskId(null);
      fetchProjectDetails();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = async (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setAssignedTo(task.assignedTo?._id || '');
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEditingTaskId(task._id);
    setShowTaskModal(true);
    
    // Fetch comments
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/comments/task/${task._id}`, config);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/comments', { text: newComment, taskId: editingTaskId }, config);
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/tasks/${taskId}`, config);
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

  const [aiGeneratingTasks, setAiGeneratingTasks] = useState(false);
  const [aiEnhancingDescription, setAiEnhancingDescription] = useState(false);

  const handleGenerateTasks = async () => {
    setAiGeneratingTasks(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/ai/generate-tasks', { title: project.title, description: project.description, projectId: project._id }, config);
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating tasks');
    }
    setAiGeneratingTasks(false);
  };

  const handleEnhanceDescription = async () => {
    if (!description) return alert("Please write a short description first.");
    setAiEnhancingDescription(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/ai/enhance-description', { text: description }, config);
      setDescription(data.enhancedText);
    } catch (error) {
      alert(error.response?.data?.message || 'Error enhancing description');
    }
    setAiEnhancingDescription(false);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, config);
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating task');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'To Do': return '#f39c12';
      case 'In Progress': return '#3498db';
      case 'Done': return '#2ecc71';
      case 'Overdue': return '#e74c3c';
      default: return '#ccc';
    }
  };

  if (!project) return <Layout><div style={{ padding: '2rem' }}>Loading project...</div></Layout>;

  return (
    <Layout>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <Link to="/projects" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'inline-block' }}>&larr; Back to Projects</Link>
          <h1 style={{ marginTop: '0.5rem' }}>{project.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{project.description}</p>
        </div>
        {workspaceRole === 'Admin' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn-secondary" onClick={handleGenerateTasks} disabled={aiGeneratingTasks} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {aiGeneratingTasks ? 'Generating...' : '✨ Auto-Generate Tasks'}
            </button>
            <button className="btn-primary" onClick={() => {
              setTitle(''); setDescription(''); setAssignedTo(''); setDueDate(''); setEditingTaskId(null);
              setShowTaskModal(true);
            }}>+ Add Task</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {tasks.map((task, i) => (
          <motion.div 
            key={task._id} 
            className="glass-panel" 
            style={{ padding: '1.5rem', borderLeft: `4px solid ${getStatusColor(task.status)}` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', color: getStatusColor(task.status) }}>
                  {task.status}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditClick(task)} style={{ background: 'transparent', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '0.75rem' }}>Open</button>
                  {workspaceRole === 'Admin' && (
                    <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                  )}
                </div>
              </div>
              {task.dueDate && <span style={{ fontSize: '0.75rem', color: '#888' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>
              {task.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                  {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{task.assignedTo?.name || 'Unassigned'}</span>
              </div>
              
              {/* Status updater for assigned member or Admin */}
              {(workspaceRole === 'Admin' || (workspaceRole === 'Member' && task.assignedTo?._id === user._id)) && (
                 <select 
                   value={task.status} 
                   onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                   style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                 >
                   <option style={{color: 'black'}} value="To Do">To Do</option>
                   <option style={{color: 'black'}} value="In Progress">In Progress</option>
                   <option style={{color: 'black'}} value="Done">Done</option>
                 </select>
              )}
            </div>
          </motion.div>
        ))}
        {tasks.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>No tasks found for this project.</div>
        )}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>{editingTaskId ? 'Task Details' : 'Add New Task'}</h2>
              <button type="button" onClick={() => setShowTaskModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            </div>
            <form onSubmit={handleCreateOrUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={workspaceRole !== 'Admin'} />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Description</label>
                  <button type="button" onClick={handleEnhanceDescription} disabled={aiEnhancingDescription || !description} style={{ background: 'rgba(108, 92, 231, 0.2)', border: 'none', color: 'var(--accent-purple)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {aiEnhancingDescription ? 'Enhancing...' : '✨ Enhance with AI'}
                  </button>
                </div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', resize: 'vertical' }} disabled={workspaceRole !== 'Admin'} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} required disabled={workspaceRole !== 'Admin'}>
                  <option value="">Select a member...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id} style={{color:'black'}}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={workspaceRole !== 'Admin'} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowTaskModal(false)}>Close</button>
                {workspaceRole === 'Admin' && (
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingTaskId ? 'Update Task' : 'Add Task'}</button>
                )}
              </div>
            </form>

            {editingTaskId && (
              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Comments</h3>
                
                <div className="chat-box" style={{ marginBottom: '1rem' }}>
                  {comments.length > 0 ? comments.map(comment => (
                    <div key={comment._id} className="chat-message">
                      <div className="chat-avatar">{comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : '?'}</div>
                      <div>
                        <div className="chat-header">
                          <span className="chat-author">{comment.author?.name || 'Unknown'}</span>
                          <span className="chat-time">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="chat-content">{comment.text}</div>
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>No comments yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." style={{ flex: 1 }} required />
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Send</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProjectDetail;
