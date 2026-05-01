const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Auto-create a personal workspace for the new user
      const workspace = await Workspace.create({
        name: `${name}'s Workspace`,
        owner: user._id,
        members: [{ user: user._id, role: 'Admin' }]
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
    try {
        // Fetch only users who are members of the current workspace
        const workspaceId = req.headers['x-workspace-id'];
        if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

        const workspace = await Workspace.findById(workspaceId).populate('members.user', '-password');
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const users = workspace.members.map(m => m.user).filter(u => u != null);
        
        // Also include owner if not in members list (though they should be)
        if (workspace.owner && !users.find(u => u._id.toString() === workspace.owner.toString())) {
            const owner = await User.findById(workspace.owner).select('-password');
            if (owner) users.push(owner);
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Additional endpoint to get user's workspaces
const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteUserToWorkspace = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspaceId = req.headers['x-workspace-id'];

    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only workspace owner can invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found with this email. They must sign up first.' });
    }

    const isAlreadyMember = workspace.members.some(m => m.user.toString() === userToInvite._id.toString());
    if (isAlreadyMember || workspace.owner.toString() === userToInvite._id.toString()) {
      return res.status(400).json({ message: 'User is already in this workspace' });
    }

    workspace.members.push({ user: userToInvite._id, role: role || 'Member' });
    await workspace.save();

    res.json({ message: 'User successfully added to workspace', workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getUsers, getUserWorkspaces, inviteUserToWorkspace };
