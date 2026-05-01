const express = require('express');
const { registerUser, authUser, getUsers, getUserWorkspaces, inviteUserToWorkspace } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/users', protect, getUsers);
router.get('/workspaces', protect, getUserWorkspaces);
router.post('/workspaces/invite', protect, inviteUserToWorkspace);

module.exports = router;
