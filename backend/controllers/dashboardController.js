const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    let tasks;
    let projectsCount = 0;

    if (req.workspaceRole === 'Admin') {
      tasks = await Task.find({ workspace: req.workspaceId });
      projectsCount = await Project.countDocuments({ workspace: req.workspaceId });
    } else {
      tasks = await Task.find({ workspace: req.workspaceId, assignedTo: req.user._id });
    }

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(task => task.status === 'To Do').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const doneTasks = tasks.filter(task => task.status === 'Done').length;
    
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
        if (task.status === 'Overdue') return true;
        if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') return true;
        return false;
    }).length;

    // Fetch recent tasks (limit 5)
    let recentTasksQuery = Task.find({ workspace: req.workspaceId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('project', 'title')
        .populate('assignedTo', 'name');
    
    if (req.workspaceRole !== 'Admin') {
        recentTasksQuery = recentTasksQuery.where({ assignedTo: req.user._id });
    }
    const recentTasks = await recentTasksQuery;

    // Fetch project progress (Admin only or all members? Let's show all members their projects)
    // Actually, members can see all projects in the workspace.
    const projects = await Project.find({ workspace: req.workspaceId });
    const projectsProgress = projects.map(proj => {
        const projTasks = tasks.filter(t => t.project && t.project.toString() === proj._id.toString());
        const total = projTasks.length;
        const completed = projTasks.filter(t => t.status === 'Done').length;
        return {
            _id: proj._id,
            title: proj.title,
            totalTasks: total,
            completedTasks: completed,
            progressPercentage: total === 0 ? 0 : Math.round((completed / total) * 100)
        };
    });

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      projectsCount: req.workspaceRole === 'Admin' ? projectsCount : undefined,
      recentTasks,
      projectsProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
