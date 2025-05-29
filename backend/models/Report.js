const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    default: 'Manual Form'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  screenshotUrl: {
    type: String // URL to stored image (Cloudinary URL or direct URL)
  },
  screenshotPublicId: {
    type: String // Cloudinary public ID for deletion
  },
  imageType: {
    type: String,
    default: 'base64'
  },
  reporterName: {
    type: String,
    trim: true
  },
  contactInfo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  reportedBy: {
    type: String,
    default: 'Anonymous User'
  },
  similarity: {
    type: Number,
    default: 0
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
reportSchema.index({ dateReported: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });

module.exports = mongoose.model('Report', reportSchema);