const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  specializations: [{
    type: String,
    enum: [
      'workplace-harassment',
      'sexual-harassment',
      'discrimination',
      'labor-law',
      'employment-law',
      'civil-rights',
      'corporate-law',
      'criminal-law'
    ]
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  casesHandled: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 85,
    min: 0,
    max: 100
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  languages: [{
    type: String
  }],
  consultationFee: {
    type: Number,
    default: 0
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  profileImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
lawyerSchema.index({ specializations: 1, availability: 1, rating: -1 });

module.exports = mongoose.model('Lawyer', lawyerSchema);
