import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout, workspaces, activeWorkspace, changeWorkspace } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Trakio</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FolderKanban size={20} /> Projects
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          {activeWorkspace && workspaces.length > 0 && (
            <div className="workspace-selector" style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Workspace</label>
              <select 
                value={activeWorkspace._id} 
                onChange={(e) => changeWorkspace(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-light)', outline: 'none', cursor: 'pointer' }}
              >
                {workspaces.map(w => (
                  <option key={w._id} value={w._id} style={{ color: '#000' }}>{w.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="user-info">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h4>{user.name}</h4>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> 
            Log Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
