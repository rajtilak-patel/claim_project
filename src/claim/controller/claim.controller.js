const Claim = require('../models/claim.model');
const Post = require('../../post/models/post.model');
// const redisClient = require('../../utils/redisClient');
// Assume a fixed rate (you can later store this in DB)
const RATE_PER_LIKE = 0.5;
const RATE_PER_VIEW = 0.1;

exports.submitClaim = async (req, res) => {
  try {
    const { postId, views, likes } = req.body;
    const mediaProof = req.file?.filename;

    const expectedEarnings = (likes * 0.5) + (views * 0.1);

    const claim = await Claim.create({
      postId,
      userId: req.user.id,
      views,
      likes,
      mediaProof,
      expectedEarnings,
      logs: [`Submitted by user at ${new Date().toISOString()}`]
    });

    res.status(201).json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClaimsForReview = async (req, res) => {
  try {
    const claims = await Claim.find().populate('userId postId');
    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { status, deduction } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (deduction) {
      claim.deductions.push(deduction);
      claim.status = 'deducted';
      claim.logs.push(`Deducted by ${req.user.role} at ${new Date().toISOString()}`);
    } else {
      claim.status = status;
      claim.logs.push(`${status} by ${req.user.role} at ${new Date().toISOString()}`);
    }

    await claim.save();
    res.json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getClaimsForReview = async (req, res) => {
  try {
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

    const claims = await Claim.find(filter)
      .populate('userId postId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Cache result
    // await redisClient.setEx(cacheKey, 60, JSON.stringify(claims)); // Cache for 60 seconds7

    res.json({ success: true, source: 'db', claims });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};