const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Workspace = require('../models/Workspace');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const workspaceAccess = async (req, res, next) => {
  const workspaceId = req.headers['x-workspace-id'];
  
  if (!workspaceId) {
    return res.status(400).json({ message: 'Workspace ID missing in headers' });
  }

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    
    if (!member && workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    // Set workspace context
    req.workspaceId = workspaceId;
    req.workspaceRole = member ? member.role : 'Admin'; // Owner is Admin
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying workspace access' });
  }
};

const workspaceAdmin = (req, res, next) => {
  if (req.workspaceRole === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin in this workspace' });
  }
};

module.exports = { protect, workspaceAccess, workspaceAdmin };
