import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const { user, workspaceRole, activeWorkspace } = useContext(AuthContext);

  useEffect(() => {
    const fetchStatsAndSummary = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/dashboard/stats', config);
        setStats(data);
        
        // Fetch AI Summary after getting stats
        setAiLoading(true);
        try {
           const aiRes = await axios.post('/api/ai/summary', { stats: data }, config);
           setAiSummary(aiRes.data.summary);
        } catch (aiErr) {
           console.error("AI Summary Error", aiErr);
           setAiSummary("AI Summary currently unavailable.");
        }
        setAiLoading(false);

      } catch (error) {
        console.error("Error fetching stats", error);
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data: acts } = await axios.get('/api/activities', config);
        setActivities(acts);
      } catch (err) {
        console.error("Error fetching activities", err);
      }
    };
    if (user && activeWorkspace) fetchStatsAndSummary();
  }, [user, activeWorkspace]);

  if (!stats) return <Layout><div style={{ padding: '2rem' }}>Loading dashboard stats...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.name}</p>
      </div>

      <motion.div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent-purple)', background: 'linear-gradient(to right, rgba(108, 92, 231, 0.1), transparent)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <h3 style={{ fontSize: '1rem', color: 'var(--accent-purple)' }}>AI Workspace Summary</h3>
        </div>
        {aiLoading ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Gemini is analyzing your workspace data...</p>
        ) : (
            <p style={{ color: '#eee', lineHeight: '1.5', fontSize: '0.95rem' }}>{aiSummary}</p>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {workspaceRole === 'Admin' && (
          <motion.div className="glass-panel" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Projects</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '600' }}>{stats.projectsCount}</div>
          </motion.div>
        )}
        <motion.div className="glass-panel" style={{ padding: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Tasks</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '600' }}>{stats.totalTasks}</div>
        </motion.div>
        <motion.div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3498db' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>In Progress</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '600' }}>{stats.inProgressTasks}</div>
        </motion.div>
        <motion.div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #2ecc71' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Done</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '600' }}>{stats.doneTasks}</div>
        </motion.div>
        <motion.div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #e74c3c' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overdue</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: '600' }}>{stats.overdueTasks}</div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Project Progress Section */}
        <motion.div className="glass-panel" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Project Progress</h2>
          {stats.projectsProgress && stats.projectsProgress.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {stats.projectsProgress.map(proj => (
                <div key={proj._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>{proj.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{proj.progressPercentage}% ({proj.completedTasks}/{proj.totalTasks})</span>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${proj.progressPercentage}%`, background: 'var(--accent-purple)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-out' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No projects found in this workspace.</p>
          )}
        </motion.div>

        {/* Recent Tasks Section */}
        <motion.div className="glass-panel" style={{ padding: '2rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Recent Tasks</h2>
          {stats.recentTasks && stats.recentTasks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.recentTasks.map(task => (
                <div key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{task.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      in {task.project?.title || 'Unknown Project'} • Assigned to {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.3rem 0.6rem', 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '20px',
                    color: task.status === 'Done' ? '#2ecc71' : task.status === 'In Progress' ? '#3498db' : task.status === 'Overdue' ? '#e74c3c' : '#f39c12'
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No recent tasks found.</p>
          )}
        </motion.div>

        {/* Activity Log Section */}
        <motion.div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Workspace Activity Log</h2>
          {activities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.map(activity => (
                <div key={activity._id} className="timeline-item">
                  <div style={{ marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{activity.performedBy?.name || 'Unknown'}</span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>{activity.action}</span>{' '}
                    <span style={{ fontWeight: '500', color: 'var(--accent-purple)' }}>{activity.target}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No recent activity in this workspace.</p>
          )}
        </motion.div>

      </div>
    </Layout>
  );
};

export default Dashboard;
