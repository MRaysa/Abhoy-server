const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Complaint {
  constructor() {
    this.collectionName = 'complaints';
  }

  /**
   * Get the complaints collection
   */
  getCollection() {
    const db = getDB();
    return db.collection(this.collectionName);
  }

  /**
   * Generate a unique anonymous ID for complaint
   * Format: ANON-YYYY-XXXX (where X is alphanumeric)
   */
  generateAnonymousId() {
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let randomPart = '';
    
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `ANON-${year}-${randomPart}`;
  }

  /**
   * Create a new anonymous complaint
   */
  async create(complaintData) {
    try {
      const collection = this.getCollection();
      
      // Generate unique anonymous ID
      let anonymousId;
      let isUnique = false;
      
      // Ensure uniqueness
      while (!isUnique) {
        anonymousId = this.generateAnonymousId();
        const existing = await collection.findOne({ anonymousId });
        if (!existing) {
          isUnique = true;
        }
      }

      const complaint = {
        anonymousId,
        userId: complaintData.userId ? new ObjectId(complaintData.userId) : null, // Optional for tracking
        isAnonymous: complaintData.isAnonymous || true,
        
        // Complaint Details
        title: complaintData.title,
        incidentType: complaintData.incidentType,
        category: complaintData.category,
        description: complaintData.description,
        incidentDate: new Date(complaintData.incidentDate),
        location: complaintData.location,
        
        // Evidence
        evidenceFiles: complaintData.evidenceFiles || [],
        evidenceUrls: complaintData.evidenceUrls || [],
        witnessFormUrl: complaintData.witnessFormUrl || null,
        witnessCount: complaintData.witnessCount || 0,
        
        // Status & Workflow
        status: 'pending', // pending, under_review, verified, rejected, resolved
        priority: complaintData.priority || 'medium', // low, medium, high, critical
        verificationStatus: 'pending', // pending, verified, insufficient_evidence
        
        // People Involved (optional, can be anonymous)
        accusedPerson: complaintData.accusedPerson || null,
        accusedDepartment: complaintData.accusedDepartment || null,
        witnessNames: complaintData.witnessNames || [],
        
        // Legal & Compliance
        relevantLaws: complaintData.relevantLaws || [],
        legalGuidance: complaintData.legalGuidance || null,
        
        // Forum/Public
        isPublic: complaintData.isPublic || false,
        approvedForForum: false,
        forumReactions: {
          support: 0,
          concern: 0,
          similar: 0
        },
        forumComments: [],
        
        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        lastReviewedAt: null,
        resolvedAt: null,
        
        // Admin Notes (internal use only)
        adminNotes: [],
        assignedTo: null, // Admin/Investigator ID
        
        // Analytics
        viewCount: 0,
        reportCount: 0,
        
        // Contact (encrypted/secured)
        contactMethod: complaintData.contactMethod || null, // email, phone, etc.
        encryptedContact: complaintData.encryptedContact || null
      };

      const result = await collection.insertOne(complaint);
      
      return {
        success: true,
        complaintId: result.insertedId,
        anonymousId: anonymousId,
        message: 'Complaint submitted successfully'
      };
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
  }

  /**
   * Find complaint by anonymous ID
   */
  async findByAnonymousId(anonymousId) {
    try {
      const collection = this.getCollection();
      const complaint = await collection.findOne({ anonymousId });
      return complaint;
    } catch (error) {
      console.error('Error finding complaint:', error);
      throw error;
    }
  }

  /**
   * Get all complaints (with filters)
   */
  async findAll(filters = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const {
        status,
        incidentType,
        priority,
        isPublic,
        approvedForForum,
        startDate,
        endDate
      } = filters;

      const query = {};

      if (status) query.status = status;
      if (incidentType) query.incidentType = incidentType;
      if (priority) query.priority = priority;
      if (typeof isPublic !== 'undefined') query.isPublic = isPublic;
      if (typeof approvedForForum !== 'undefined') query.approvedForForum = approvedForForum;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder };

      const complaints = await collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(query);

      return {
        complaints,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding complaints:', error);
      throw error;
    }
  }

  /**
   * Update complaint status
   */
  async updateStatus(anonymousId, status, adminNotes = null) {
    try {
      const collection = this.getCollection();
      
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      if (adminNotes) {
        updateData.$push = {
          adminNotes: {
            note: adminNotes,
            addedAt: new Date(),
            addedBy: 'admin' // TODO: Add actual admin ID
          }
        };
      }

      const result = await collection.updateOne(
        { anonymousId },
        { $set: updateData }
      );

      return result;
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  }

  /**
   * Add evidence to complaint
   */
  async addEvidence(anonymousId, evidenceData) {
    try {
      const collection = this.getCollection();
      
      const result = await collection.updateOne(
        { anonymousId },
        {
          $push: {
            evidenceFiles: {
              $each: evidenceData.files || []
            },
            evidenceUrls: {
              $each: evidenceData.urls || []
            }
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error adding evidence:', error);
      throw error;
    }
  }

  /**
   * Update witness information
   */
  async updateWitnessInfo(anonymousId, witnessFormUrl, witnessCount) {
    try {
      const collection = this.getCollection();
      
      const result = await collection.updateOne(
        { anonymousId },
        {
          $set: {
            witnessFormUrl,
            witnessCount,
            verificationStatus: witnessCount >= 5 ? 'verified' : 'pending',
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error updating witness info:', error);
      throw error;
    }
  }

  /**
   * Approve complaint for public forum
   */
  async approveForForum(anonymousId, approved = true) {
    try {
      const collection = this.getCollection();
      
      const result = await collection.updateOne(
        { anonymousId },
        {
          $set: {
            approvedForForum: approved,
            isPublic: approved,
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error approving for forum:', error);
      throw error;
    }
  }

  /**
   * Add reaction to forum post
   */
  async addReaction(anonymousId, reactionType) {
    try {
      const collection = this.getCollection();
      const validReactions = ['support', 'concern', 'similar'];
      
      if (!validReactions.includes(reactionType)) {
        throw new Error('Invalid reaction type');
      }

      const result = await collection.updateOne(
        { anonymousId, approvedForForum: true },
        {
          $inc: {
            [`forumReactions.${reactionType}`]: 1
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Add comment to forum post
   */
  async addForumComment(anonymousId, comment, commentorId = null) {
    try {
      const collection = this.getCollection();
      
      const result = await collection.updateOne(
        { anonymousId, approvedForForum: true },
        {
          $push: {
            forumComments: {
              commentId: new ObjectId(),
              comment,
              commentorId,
              isAnonymous: !commentorId,
              createdAt: new Date(),
              likes: 0
            }
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get public forum complaints
   */
  async getForumPosts(options = {}) {
    try {
      const collection = this.getCollection();
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder };

      // Only get approved public complaints
      const posts = await collection
        .find({ 
          approvedForForum: true,
          isPublic: true 
        })
        .project({
          // Exclude sensitive information
          userId: 0,
          contactMethod: 0,
          encryptedContact: 0,
          adminNotes: 0
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments({ 
        approvedForForum: true,
        isPublic: true 
      });

      return {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting forum posts:', error);
      throw error;
    }
  }

  /**
   * Track complaint view
   */
  async incrementViewCount(anonymousId) {
    try {
      const collection = this.getCollection();
      
      await collection.updateOne(
        { anonymousId },
        {
          $inc: { viewCount: 1 }
        }
      );
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get complaint statistics
   */
  async getStatistics() {
    try {
      const collection = this.getCollection();
      
      const stats = await collection.aggregate([
        {
          $facet: {
            statusCounts: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            typeCounts: [
              { $group: { _id: '$incidentType', count: { $sum: 1 } } }
            ],
            priorityCounts: [
              { $group: { _id: '$priority', count: { $sum: 1 } } }
            ],
            totalComplaints: [
              { $count: 'total' }
            ],
            pendingComplaints: [
              { $match: { status: 'pending' } },
              { $count: 'total' }
            ],
            resolvedComplaints: [
              { $match: { status: 'resolved' } },
              { $count: 'total' }
            ],
            forumPosts: [
              { $match: { approvedForForum: true } },
              { $count: 'total' }
            ]
          }
        }
      ]).toArray();

      return stats[0];
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }
}

module.exports = new Complaint();
