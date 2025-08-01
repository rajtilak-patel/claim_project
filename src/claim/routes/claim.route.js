const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../auth/middleware/auth.middleware');
const {
  submitClaim,
  getClaimsForReview,
  updateClaimStatus
} = require('../controller/claim.controller');
const upload = require('../../middleware/multer.middleware');
router.post('/', verifyToken, upload.single('mediaProof'), submitClaim);

// Reviewer: Account or Admin
router.get('/review', verifyToken, authorizeRoles('Account', 'Admin'), getClaimsForReview);

// Update claim status (deduction or approval)
router.patch('/:id', verifyToken, authorizeRoles('Account', 'Admin'), updateClaimStatus);

module.exports = router;
