const express = require('express');
const { getComments, addComment } = require('../controllers/commentController');
const { protect, workspaceAccess } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, workspaceAccess, addComment);

router.route('/task/:taskId')
  .get(protect, workspaceAccess, getComments);

module.exports = router;
