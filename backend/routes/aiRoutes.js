const express = require('express');
const { generateDashboardSummary, generateTasksFromProject, enhanceTaskDescription } = require('../controllers/aiController');
const { protect, workspaceAccess, workspaceAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/summary', protect, workspaceAccess, generateDashboardSummary);
router.post('/generate-tasks', protect, workspaceAccess, workspaceAdmin, generateTasksFromProject);
router.post('/enhance-description', protect, workspaceAccess, enhanceTaskDescription);

module.exports = router;
