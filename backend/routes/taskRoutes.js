const express = require('express');
const { getTasks, getTasksByProject, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, workspaceAccess, workspaceAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, workspaceAccess, getTasks)
  .post(protect, workspaceAccess, workspaceAdmin, createTask);

router.route('/project/:projectId')
  .get(protect, workspaceAccess, getTasksByProject);

router.route('/:id')
  .get(protect, workspaceAccess, getTaskById)
  .put(protect, workspaceAccess, updateTask) // Members and Admins can update tasks
  .delete(protect, workspaceAccess, workspaceAdmin, deleteTask);

module.exports = router;
