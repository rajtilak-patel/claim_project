const Claim = require("../models/claim.model");
const Post = require("../../post/models/post.model");
const mongoose = require("mongoose");
// const redisClient = require('../../utils/redisClient');
// Assume a fixed rate (you can later store this in DB)
const RATE_PER_LIKE = 0.5;
const RATE_PER_VIEW = 0.1;

exports.submitClaim = async (req, res) => {
  try {
    const { postId, views, likes } = req.body;
    const mediaProof = req.file?.filename;

    const expectedEarnings = likes * 0.5 + views * 0.1;

    const claim = await Claim.create({
      postId,
      userId: req.user.id,
      views,
      likes,
      mediaProof,
      expectedEarnings,
      logs: [`Submitted by user at ${new Date().toISOString()}`],
    });

    res.status(201).json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClaimsForReview = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const status = req.query.status;

    const query = {};
    if (status) query.status = status;

    const total = await Claim.countDocuments(query);

    const claims = await Claim.find(query)
      .populate("userId postId")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // Optional: newest first

    res.json({
      success: true,
      claims,
      total,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, deduction } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (deduction) {
      claim.deductions.push(deduction);
      claim.status = "deducted";
      claim.logs.push(
        `Deducted by ${req.user.role} at ${new Date().toISOString()}`
      );
    } else {
      claim.status = status;
      claim.logs.push(
        `${status} by ${req.user.role} at ${new Date().toISOString()}`
      );
    }

    await claim.save();
    res.json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClaimsForReviewUser = async (req, res) => {
  try {
    const id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // const cacheKey = `claims:${page}:${limit}:${status || 'all'}`;

    // // Try Redis cache first
    // const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   return res.json({ success: true, source: 'cache', claims: JSON.parse(cached) });
    // }

    // DB filter
    const filter = {};
    if (status) filter.status = status;

    const claims = await Claim.find({ userId: id, ...filter })
      .populate("userId postId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Cache result
    // await redisClient.setEx(cacheKey, 60, JSON.stringify(claims)); // Cache for 60 seconds7

    res.json({ success: true, source: "db", claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 💰 Apply Deduction (Account role)
exports.applyDeduction = async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body; // accountId is who applied
  const accountId = req.user.id;
  try {
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    claim.deductions.push({
      amount,
      reason,
      status: 'pending',
      appliedBy: new mongoose.Types.ObjectId(accountId)
    });

    claim.status = 'deducted';

    claim.logs.push({
      role: 'Account',
      action: 'Deduction applied',
      comment: reason
    });

    await claim.save();
    res.status(200).json({ message: 'Deduction added. Awaiting user response.', claim });
  } catch (err) {
    res.status(500).json({ message: 'Error applying deduction', error: err.message });
  }
};

// ✅ Accept Deduction (User)
exports.acceptDeduction = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const pendingDeduction = claim.deductions.find(d => d.status === 'pending');
    if (!pendingDeduction) return res.status(400).json({ message: 'No pending deduction found' });

    pendingDeduction.status = 'accepted';
    pendingDeduction.respondedAt = new Date();

    const totalDeduction = claim.deductions
      .filter(d => d.status === 'accepted')
      .reduce((sum, d) => sum + d.amount, 0);

    claim.approvedEarnings = claim.expectedEarnings - totalDeduction;
    claim.status = 'confirmed';

    claim.logs.push({
      role: 'User',
      action: 'Accepted deduction',
      comment: `Accepted ₹${pendingDeduction.amount} deduction`
    });

    await claim.save();
    res.status(200).json({ message: 'Deduction accepted. Sent to Admin.', claim });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting deduction', error: err.message });
  }
};

// ❌ Reject Deduction (User)
exports.rejectDeduction = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const pendingDeduction = claim.deductions.find(d => d.status === 'pending');
    if (!pendingDeduction) return res.status(400).json({ message: 'No pending deduction found' });

    pendingDeduction.status = 'rejected';
    pendingDeduction.respondedAt = new Date();

    claim.status = 'pending'; // goes back to Account

    claim.logs.push({
      role: 'User',
      action: 'Rejected deduction',
      comment: `Rejected deduction of ₹${pendingDeduction.amount}`
    });

    await claim.save();
    res.status(200).json({ message: 'Deduction rejected. Sent back to Account.', claim });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting deduction', error: err.message });
  }
};

// ✅ Admin Final Approval
exports.adminApproveClaim = async (req, res) => {
  const { id } = req.params;

  try {
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (claim.status !== 'confirmed') {
      return res.status(400).json({ message: 'Claim not ready for admin approval' });
    }

    claim.status = 'approved';

    claim.logs.push({
      role: 'Admin',
      action: 'Approved claim',
      comment: `Approved final amount ₹${claim.approvedEarnings || claim.expectedEarnings}`
    });

    await claim.save();
    res.status(200).json({ message: 'Claim approved by Admin', claim });
  } catch (err) {
    res.status(500).json({ message: 'Error approving claim', error: err.message });
  }
};