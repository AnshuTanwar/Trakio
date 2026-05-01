const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member'
      }
    }
  ]
}, {
  timestamps: true
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;
