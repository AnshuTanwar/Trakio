import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const { user, workspaceRole, activeWorkspace } = useContext(AuthContext);

  useEffect(() => {
    if (user && activeWorkspace) fetchProjects();
  }, [user, activeWorkspace]);

  const fetchProjects = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/projects', config);
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/projects', { title, description }, config);
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? All associated tasks will be permanently deleted.")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/projects/${projectId}`, config);
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting project');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/auth/workspaces/invite', { email: inviteEmail, role: 'Member' }, config);
      setShowInviteModal(false);
      setInviteEmail('');
      alert('User successfully invited to workspace!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error inviting user');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your workspaces</p>
        </div>
        {workspaceRole === 'Admin' && (
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn-secondary" onClick={() => setShowInviteModal(true)}>Invite Member</button>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.map((project, i) => (
          <motion.div 
            key={project._id} 
            className="glass-panel" 
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
              {project.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#888' }}>Created by {project.createdBy?.name || 'Unknown'}</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {workspaceRole === 'Admin' && (
                  <button className="btn-danger" onClick={() => handleDelete(project._id)}>
                    🗑 Delete
                  </button>
                )}
                <Link to={`/projects/${project._id}`} style={{ color: 'var(--accent-purple)', fontSize: '0.9rem', fontWeight: '500' }}>
                  View Details &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: '#111' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Project Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', background: '#111' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Invite Member to Workspace</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>They must have already created an account to be invited.</p>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
