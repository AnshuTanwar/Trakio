const Project = require('../models/Project');
const Activity = require('../models/Activity');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ workspace: req.workspaceId }).populate('createdBy', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, workspace: req.workspaceId }).populate('createdBy', 'name email');
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = new Project({
      title,
      description,
      createdBy: req.user._id,
      workspace: req.workspaceId
    });
    const createdProject = await project.save();

    await Activity.create({
      action: 'created project',
      performedBy: req.user._id,
      target: title,
      targetType: 'Project',
      workspace: req.workspaceId
    });

    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  const { title, description } = req.body;
  try {
    const project = await Project.findOne({ _id: req.params.id, workspace: req.workspaceId });
    if (project) {
      project.title = title || project.title;
      project.description = description || project.description;
      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Task = require('../models/Task');

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, workspace: req.workspaceId });
    if (project) {
      await Project.deleteOne({ _id: project._id });
      await Task.deleteMany({ project: project._id });

      await Activity.create({
          action: 'deleted project',
          performedBy: req.user._id,
          target: project.title,
          targetType: 'Project',
          workspace: req.workspaceId
      });

      res.json({ message: 'Project removed cleanly with all its tasks' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };
