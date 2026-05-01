const express = require('express');
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, workspaceAccess, workspaceAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, workspaceAccess, getProjects)
  .post(protect, workspaceAccess, workspaceAdmin, createProject);

router.route('/:id')
  .get(protect, workspaceAccess, getProjectById)
  .put(protect, workspaceAccess, workspaceAdmin, updateProject)
  .delete(protect, workspaceAccess, workspaceAdmin, deleteProject);

module.exports = router;
