const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { protect, workspaceAccess } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, workspaceAccess, getActivities);

module.exports = router;
