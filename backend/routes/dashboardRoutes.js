const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, workspaceAccess } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, workspaceAccess, getDashboardStats);

module.exports = router;
