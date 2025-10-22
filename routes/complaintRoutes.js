const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

/**
 * @route   POST /api/complaints
 * @desc    Create a new anonymous complaint
 * @access  Public
 */
router.post('/', complaintController.createComplaint);

/**
 * @route   POST /api/complaints/verify
 * @desc    Verify complaint by anonymous ID
 * @access  Public
 */
router.post('/verify', complaintController.verifyComplaintCode);

/**
 * @route   GET /api/complaints/statistics
 * @desc    Get complaint statistics (Admin only)
 * @access  Private/Admin
 */
router.get('/statistics', complaintController.getStatistics);

/**
 * @route   GET /api/complaints/forum/posts
 * @desc    Get public forum posts
 * @access  Public
 */
router.get('/forum/posts', complaintController.getForumPosts);

/**
 * @route   GET /api/complaints/:anonymousId
 * @desc    Get complaint by anonymous ID
 * @access  Public (with anonymous ID)
 */
router.get('/:anonymousId', complaintController.getComplaintByAnonymousId);

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints (Admin only)
 * @access  Private/Admin
 */
router.get('/', complaintController.getAllComplaints);

/**
 * @route   PATCH /api/complaints/:anonymousId/status
 * @desc    Update complaint status (Admin only)
 * @access  Private/Admin
 */
router.patch('/:anonymousId/status', complaintController.updateComplaintStatus);

/**
 * @route   POST /api/complaints/:anonymousId/evidence
 * @desc    Add evidence to complaint
 * @access  Public (with anonymous ID)
 */
router.post('/:anonymousId/evidence', complaintController.addEvidence);

/**
 * @route   POST /api/complaints/:anonymousId/witnesses
 * @desc    Update witness information
 * @access  Public (with anonymous ID)
 */
router.post('/:anonymousId/witnesses', complaintController.updateWitnessInfo);

/**
 * @route   PATCH /api/complaints/:anonymousId/approve-forum
 * @desc    Approve complaint for public forum (Admin only)
 * @access  Private/Admin
 */
router.patch('/:anonymousId/approve-forum', complaintController.approveForForum);

/**
 * @route   POST /api/complaints/:anonymousId/react
 * @desc    Add reaction to forum post
 * @access  Public
 */
router.post('/:anonymousId/react', complaintController.addReaction);

/**
 * @route   POST /api/complaints/:anonymousId/comments
 * @desc    Add comment to forum post
 * @access  Public
 */
router.post('/:anonymousId/comments', complaintController.addComment);

module.exports = router;
