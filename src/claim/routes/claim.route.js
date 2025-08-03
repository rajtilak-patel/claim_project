const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../auth/middleware/auth.middleware');
const {
  submitClaim,
  getClaimsForReview,
  updateClaimStatus,
  getClaimsForReviewUser,
  applyDeduction,
  acceptDeduction,
  rejectDeduction,
  adminApproveClaim
} = require('../controller/claim.controller');
const upload = require('../../middleware/multer.middleware');
router.post('/', verifyToken, upload.single('mediaProof'), submitClaim);

router.get('/review/user', verifyToken, getClaimsForReviewUser); // User's own claims
// Reviewer: Account or Admin
router.get('/review', verifyToken, getClaimsForReview);

// Update claim status (deduction or approval)
router.patch('/:id', verifyToken, authorizeRoles('Account', 'Admin'), updateClaimStatus);



// Deduction-related routes
router.post('/:id/deduct', verifyToken, authorizeRoles('Account'), applyDeduction);           // Account applies deduction
router.post('/:id/deduction/accept', verifyToken, authorizeRoles('User'), acceptDeduction); // User accepts
router.post('/:id/deduction/reject', verifyToken, authorizeRoles('User'), rejectDeduction); // User rejects
router.post('/:id/admin-approve', verifyToken, authorizeRoles('Admin'), adminApproveClaim);  // Admin approves final

module.exports = router;
