const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  caseAnalysis: {
    caseType: {
      type: String,
      enum: [
        'workplace-harassment',
        'sexual-harassment',
        'discrimination',
        'retaliation',
        'wrongful-termination',
        'wage-dispute',
        'other'
      ]
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    description: String,
    keywords: [String],
    recommendedAction: String
  },
  recommendedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'lawyer-assigned', 'closed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSessionSchema.index({ userId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
