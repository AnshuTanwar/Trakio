import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        await fetchWorkspaces(parsedUser.token);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const fetchWorkspaces = async (token) => {
    try {
      const { data } = await axios.get('/api/auth/workspaces', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkspaces(data);
      if (data.length > 0) {
        const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
        const selected = data.find(w => w._id === savedWorkspaceId) || data[0];
        setActiveWorkspace(selected);
        axios.defaults.headers.common['x-workspace-id'] = selected._id;
      }
    } catch (error) {
      console.error('Failed to fetch workspaces', error);
    }
  };

  const changeWorkspace = (workspaceId) => {
    const selected = workspaces.find(w => w._id === workspaceId);
    if (selected) {
      setActiveWorkspace(selected);
      axios.defaults.headers.common['x-workspace-id'] = selected._id;
      localStorage.setItem('activeWorkspaceId', selected._id);
      window.location.reload(); // Refresh the app to load new workspace data
    }
  };

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      await fetchWorkspaces(data.token);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const register = async (name, email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/register', { name, email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      await fetchWorkspaces(data.token);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('activeWorkspaceId');
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-workspace-id'];
    setUser(null);
    setWorkspaces([]);
    setActiveWorkspace(null);
  };

  const getWorkspaceRole = () => {
    if (!activeWorkspace || !user) return 'Member';
    if (activeWorkspace.owner === user._id) return 'Admin';
    const member = activeWorkspace.members?.find(m => m.user === user._id || (m.user && m.user._id === user._id));
    return member ? member.role : 'Member';
  };

  const workspaceRole = getWorkspaceRole();

  return (
    <AuthContext.Provider value={{ user, workspaces, activeWorkspace, workspaceRole, changeWorkspace, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
