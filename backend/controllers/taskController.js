const Task = require('../models/Task');
const Activity = require('../models/Activity');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ workspace: req.workspaceId })
        .populate('project', 'title')
        .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId, workspace: req.workspaceId })
            .populate('project', 'title')
            .populate('assignedTo', 'name email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, workspace: req.workspaceId })
        .populate('project', 'title')
        .populate('assignedTo', 'name email');
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, project, assignedTo, dueDate } = req.body;
  try {
    const task = new Task({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      workspace: req.workspaceId
    });
    const createdTask = await task.save();

    await Activity.create({
      action: 'created task',
      performedBy: req.user._id,
      target: title,
      targetType: 'Task',
      workspace: req.workspaceId
    });

    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate } = req.body;
  try {
    const task = await Task.findOne({ _id: req.params.id, workspace: req.workspaceId });
    if (task) {
      if (req.workspaceRole === 'Member') {
          if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
              return res.status(403).json({ message: 'Not authorized to update this task' });
          }
          task.status = status || task.status;
      } else {
          task.title = title || task.title;
          task.description = description || task.description;
          task.status = status || task.status;
          task.assignedTo = assignedTo || task.assignedTo;
          task.dueDate = dueDate || task.dueDate;
      }

      const updatedTask = await task.save();

      if (status && status !== task.status) {
          await Activity.create({
              action: `updated task status to ${status}`,
              performedBy: req.user._id,
              target: task.title,
              targetType: 'Task',
              workspace: req.workspaceId
          });
      }

      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, workspace: req.workspaceId });
    if (task) {
      await Task.deleteOne({ _id: task._id });
      
      await Activity.create({
          action: 'deleted task',
          performedBy: req.user._id,
          target: task.title,
          targetType: 'Task',
          workspace: req.workspaceId
      });

      res.json({ message: 'Task removed' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, getTasksByProject, getTaskById, createTask, updateTask, deleteTask };
