const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema({
  amount: Number,
  reason: String
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
  logs: [String]
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
