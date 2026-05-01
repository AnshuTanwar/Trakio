const Activity = require('../models/Activity');

const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ workspace: req.workspaceId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActivities };
