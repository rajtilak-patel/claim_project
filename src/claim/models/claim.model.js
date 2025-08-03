const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming finance user is also in the User model, else create separate 'Account' model
  },
  respondedAt: Date,
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const claimSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: Number,
  likes: Number,
  mediaProof: String,
  expectedEarnings: Number,
  deductions: [deductionSchema],
  status: {
    type: String,
    enum: ['pending', 'deducted', 'confirmed', 'approved', 'rejected'],
    default: 'pending'
  },
  logs: [
    {
      role: String,
      action: String,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
