const Complaint = require('../models/Complaint');

/**
 * Create a new anonymous complaint
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  try {
    const complaintData = req.body;

    // Validate required fields
    if (!complaintData.title || !complaintData.description || !complaintData.incidentType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and incident type are required'
      });
    }

    // Validate incident date
    if (!complaintData.incidentDate) {
      return res.status(400).json({
        success: false,
        message: 'Incident date is required'
      });
    }

    // Create complaint
    const result = await Complaint.create(complaintData);

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        anonymousId: result.anonymousId,
        complaintId: result.complaintId
      },
      instructions: 'Save your Anonymous ID to track your complaint status'
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: error.message
    });
  }
};

/**
 * Get complaint by anonymous ID
 * GET /api/complaints/:anonymousId
 */
exports.getComplaintByAnonymousId = async (req, res) => {
  try {
    const { anonymousId } = req.params;

    const complaint = await Complaint.findByAnonymousId(anonymousId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Increment view count
    await Complaint.incrementViewCount(anonymousId);

    // Remove sensitive admin information
    delete complaint.adminNotes;
    delete complaint.assignedTo;
    
    // If anonymous, remove user identification
    if (complaint.isAnonymous) {
      delete complaint.userId;
      delete complaint.contactMethod;
      delete complaint.encryptedContact;
    }

    return res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint',
      error: error.message
    });
  }
};

/**
 * Get all complaints (Admin only)
 * GET /api/complaints
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      incidentType,
      priority,
      isPublic,
      approvedForForum,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const filters = {
      status,
      incidentType,
      priority,
      isPublic: isPublic ? isPublic === 'true' : undefined,
      approvedForForum: approvedForForum ? approvedForForum === 'true' : undefined,
      startDate,
      endDate
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    };

    const result = await Complaint.findAll(filters, options);

    return res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints',
      error: error.message
    });
  }
};

/**
 * Update complaint status (Admin only)
 * PATCH /api/complaints/:anonymousId/status
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'under_review', 'verified', 'rejected', 'resolved'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const result = await Complaint.updateStatus(anonymousId, status, adminNotes);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully'
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};

/**
 * Add evidence to complaint
 * POST /api/complaints/:anonymousId/evidence
 */
exports.addEvidence = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { files, urls } = req.body;

    if ((!files || files.length === 0) && (!urls || urls.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one evidence file or URL is required'
      });
    }

    const evidenceData = { files, urls };
    const result = await Complaint.addEvidence(anonymousId, evidenceData);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Evidence added successfully'
    });
  } catch (error) {
    console.error('Add evidence error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add evidence',
      error: error.message
    });
  }
};

/**
 * Update witness information
 * POST /api/complaints/:anonymousId/witnesses
 */
exports.updateWitnessInfo = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { witnessFormUrl, witnessCount } = req.body;

    if (!witnessFormUrl || witnessCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Witness form URL and count are required'
      });
    }

    const result = await Complaint.updateWitnessInfo(
      anonymousId,
      witnessFormUrl,
      parseInt(witnessCount)
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const verificationMessage = witnessCount >= 5
      ? 'Complaint verified with sufficient witnesses'
      : 'Witness information updated. Need at least 5 witnesses for verification';

    return res.status(200).json({
      success: true,
      message: verificationMessage,
      verified: witnessCount >= 5
    });
  } catch (error) {
    console.error('Update witness info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update witness information',
      error: error.message
    });
  }
};

/**
 * Approve complaint for public forum (Admin only)
 * PATCH /api/complaints/:anonymousId/approve-forum
 */
exports.approveForForum = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { approved = true } = req.body;

    const result = await Complaint.approveForForum(anonymousId, approved);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: approved 
        ? 'Complaint approved for public forum' 
        : 'Complaint removed from public forum'
    });
  } catch (error) {
    console.error('Approve for forum error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update forum approval',
      error: error.message
    });
  }
};

/**
 * Get public forum posts
 * GET /api/complaints/forum/posts
 */
exports.getForumPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = -1
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: parseInt(sortOrder)
    };

    const result = await Complaint.getForumPosts(options);

    return res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve forum posts',
      error: error.message
    });
  }
};

/**
 * Add reaction to forum post
 * POST /api/complaints/:anonymousId/react
 */
exports.addReaction = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { reactionType } = req.body;

    const validReactions = ['support', 'concern', 'similar'];
    
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type. Must be: support, concern, or similar'
      });
    }

    const result = await Complaint.addReaction(anonymousId, reactionType);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found or not approved for public viewing'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reaction added successfully'
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

/**
 * Add comment to forum post
 * POST /api/complaints/:anonymousId/comments
 */
exports.addComment = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const { comment, commentorId = null } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const result = await Complaint.addForumComment(anonymousId, comment, commentorId);

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found or not approved for public viewing'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

/**
 * Get complaint statistics (Admin only)
 * GET /api/complaints/statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Complaint.getStatistics();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
};

/**
 * Verify complaint authenticity code
 * POST /api/complaints/verify
 */
exports.verifyComplaintCode = async (req, res) => {
  try {
    const { anonymousId } = req.body;

    if (!anonymousId) {
      return res.status(400).json({
        success: false,
        message: 'Anonymous ID is required'
      });
    }

    const complaint = await Complaint.findByAnonymousId(anonymousId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Anonymous ID',
        valid: false
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      data: {
        anonymousId: complaint.anonymousId,
        status: complaint.status,
        createdAt: complaint.createdAt,
        incidentType: complaint.incidentType
      }
    });
  } catch (error) {
    console.error('Verify complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify complaint',
      error: error.message
    });
  }
};
