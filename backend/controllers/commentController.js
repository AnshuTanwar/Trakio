const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
        task: req.params.taskId, 
        workspace: req.workspaceId 
    })
    .populate('author', 'name')
    .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { text, taskId } = req.body;
    
    if (!text || !taskId) {
        return res.status(400).json({ message: 'Text and taskId are required' });
    }

    const comment = new Comment({
        text,
        author: req.user._id,
        task: taskId,
        workspace: req.workspaceId
    });

    await comment.save();

    await comment.populate('author', 'name');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, addComment };
