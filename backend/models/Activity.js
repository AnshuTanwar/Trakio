const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['Project', 'Task'],
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  }
}, {
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
