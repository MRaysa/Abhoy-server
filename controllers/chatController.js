const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');
const aiAssistant = require('../services/aiLegalAssistant');

/**
 * Start a new chat session
 */
exports.startChatSession = async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('chat_sessions');
    const userId = req.user._id; // From auth middleware - using MongoDB _id

    // Check if user has an active session
    let session = await sessions.findOne({
      userId,
      isActive: true
    });

    if (!session) {
      // Create new session with greeting
      const greeting = {
        role: 'assistant',
        content: `Hello! I'm your AI Legal Assistant. I'm here to help you understand your legal situation and connect you with the right support.\n\n**How can I assist you today?**\n\nPlease describe your situation in as much detail as you're comfortable sharing. Include:\n- What happened and when\n- Who was involved\n- How it has affected you\n- Any steps you've already taken\n\nYour information is confidential and will help me provide the best guidance. 🔒`,
        timestamp: new Date()
      };

      const newSession = {
        userId,
        messages: [greeting],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await sessions.insertOne(newSession);
      session = { _id: result.insertedId, ...newSession };
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: error.message
    });
  }
};

/**
 * Send message and get AI response
 */
exports.sendMessage = async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('chat_sessions');
    const lawyers = db.collection('lawyers');
    
    const userId = req.user._id;
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Find active session
    let session = await sessions.findOne({
      _id: new ObjectId(sessionId),
      userId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Check if this is the first user message (problem description)
    const userMessages = session.messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 1) {
      // First message - analyze the problem
      const analysis = aiAssistant.analyzeProblem(message);
      
      // Save analysis
      session.caseAnalysis = {
        caseType: analysis.caseType,
        severity: analysis.severity,
        keywords: analysis.keywords,
        description: message
      };

      // Generate AI response
      const userName = req.user.displayName || req.user.email.split('@')[0];
      const aiResponse = aiAssistant.generateResponse(analysis, userName);
      
      // Find best lawyer
      const matchedLawyers = await aiAssistant.findBestLawyer(analysis.caseType, analysis.severity);
      const bestLawyer = matchedLawyers[0];

      if (bestLawyer) {
        session.recommendedLawyer = bestLawyer._id;
        session.recommendedLawyerData = bestLawyer; // Store for response
      }

      // Construct full response
      let fullResponse = `${aiResponse.greeting}\n\n${aiResponse.caseExplanation}\n\n${aiResponse.recommendation.message}`;
      
      if (aiResponse.recommendation.requiresLawyer && bestLawyer) {
        fullResponse += `\n\n${aiAssistant.formatLawyerRecommendation(bestLawyer, analysis.caseType)}`;
      }

      // Add AI response
      session.messages.push({
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      });

      // Save case analysis recommendation
      session.caseAnalysis.recommendedAction = aiResponse.recommendation.message;
      
    } else {
      // Follow-up message
      let aiResponseText = '';
      
      const lowerMessage = message.toLowerCase();
      
      // Get lawyer info if available
      let lawyerInfo = null;
      if (session.recommendedLawyer) {
        lawyerInfo = await lawyers.findOne({ _id: new ObjectId(session.recommendedLawyer) });
      }
      
      // Check if user wants lawyer consultation
      if (lowerMessage.includes('yes') || lowerMessage.includes('lawyer') || 
          lowerMessage.includes('consultation') || lowerMessage.includes('schedule')) {
        
        aiResponseText = `Great! I'm connecting you with ${lawyerInfo?.name || 'our legal team'}.\n\n` +
                        `**Next Steps:**\n\n` +
                        `1. You'll receive an email confirmation shortly\n` +
                        `2. The lawyer's office will contact you within 24 hours to schedule your consultation\n` +
                        `3. Prepare any documents or evidence you have\n` +
                        `4. Write down questions you want to ask\n\n` +
                        `**In the meantime:**\n` +
                        `- Document everything related to your case\n` +
                        `- Don't discuss this with colleagues or on social media\n` +
                        `- Save all relevant communications\n\n` +
                        `Is there anything else you'd like to know about the process?`;
        
        session.status = 'lawyer-assigned';
        
      } else if (lowerMessage.includes('no') || lowerMessage.includes('not now') || 
                 lowerMessage.includes('maybe later')) {
        
        aiResponseText = `I understand. You can reach out whenever you're ready.\n\n` +
                        `**Remember:**\n` +
                        `- Keep documenting incidents as they occur\n` +
                        `- Save this chat - you can return anytime\n` +
                        `- Your legal rights don't expire immediately, but acting sooner is often better\n` +
                        `- We're here 24/7 if you change your mind\n\n` +
                        `You can also:\n` +
                        `- File an anonymous complaint through our system\n` +
                        `- Access our resource library for more information\n` +
                        `- Join our support community (confidential)\n\n` +
                        `Would you like information about any of these options?`;
        
      } else if (lowerMessage.includes('evidence') || lowerMessage.includes('document') || 
                 lowerMessage.includes('proof')) {
        
        aiResponseText = `**📝 Evidence Collection Guide:**\n\n` +
                        `**What to Document:**\n` +
                        `1. **Written Records** - Emails, texts, notes, performance reviews\n` +
                        `2. **Timeline** - Dates, times, locations of each incident\n` +
                        `3. **Witnesses** - Names and contact info of anyone who saw/heard incidents\n` +
                        `4. **Impact** - Medical records, therapy notes, job performance changes\n` +
                        `5. **Company Policies** - Employee handbook, complaint procedures\n\n` +
                        `**How to Preserve Evidence:**\n` +
                        `- Forward work emails to personal email\n` +
                        `- Screenshot text messages\n` +
                        `- Keep a detailed journal (date each entry)\n` +
                        `- Store everything in a secure location\n\n` +
                        `**⚠️ Important:** Don't delete anything, even if it seems minor.\n\n` +
                        `Would you like help with anything else?`;
        
      } else if (lowerMessage.includes('cost') || lowerMessage.includes('fee') || 
                 lowerMessage.includes('afford') || lowerMessage.includes('money')) {
        
        aiResponseText = `**💰 Legal Costs & Options:**\n\n` +
                        `**Free Options:**\n` +
                        `- Most lawyers offer free initial consultations (30-60 min)\n` +
                        `- We can connect you with pro bono (free) legal aid if you qualify\n` +
                        `- Some cases are taken on contingency (lawyer only paid if you win)\n\n` +
                        `**Employment Law Cases:**\n` +
                        `Many employment lawyers work on contingency for strong cases, meaning:\n` +
                        `- No upfront costs\n` +
                        `- No payment unless you win\n` +
                        `- Lawyer takes a percentage of settlement/award (typically 30-40%)\n\n` +
                        `**Your Case:**\n` +
                        `${session.caseAnalysis?.severity === 'high' || session.caseAnalysis?.severity === 'medium' 
                          ? 'Your case may qualify for contingency representation.' 
                          : 'We can discuss cost options during your consultation.'}\n\n` +
                        `Would you like to proceed with the free consultation?`;
        
      } else {
        // General follow-up
        aiResponseText = `I'm here to help! Could you please clarify:\n\n` +
                        `1. Would you like to speak with the recommended lawyer?\n` +
                        `2. Do you need more information about your legal rights?\n` +
                        `3. Do you have questions about the process?\n` +
                        `4. Would you like guidance on documenting your case?\n\n` +
                        `Just let me know how I can assist you further.`;
      }
      
      session.messages.push({
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date()
      });
    }

    // Update session
    session.updatedAt = new Date();
    await sessions.updateOne(
      { _id: session._id },
      { $set: session }
    );

    // Get full lawyer data if available
    if (session.recommendedLawyer) {
      const lawyerData = await lawyers.findOne({ _id: new ObjectId(session.recommendedLawyer) });
      // Ensure consultationFee has a value
      if (lawyerData && (lawyerData.consultationFee === undefined || lawyerData.consultationFee === null)) {
        lawyerData.consultationFee = 0;
      }
      session.recommendedLawyer = lawyerData;
    }

    res.status(200).json({
      success: true,
      data: session
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
};

/**
 * Get chat history
 */
exports.getChatHistory = async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('chat_sessions');
    const lawyers = db.collection('lawyers');
    const userId = req.user._id;

    const sessionList = await sessions.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Populate lawyer data for each session
    for (let session of sessionList) {
      if (session.recommendedLawyer) {
        const lawyer = await lawyers.findOne({ _id: new ObjectId(session.recommendedLawyer) });
        // Ensure consultationFee has a value
        if (lawyer && (lawyer.consultationFee === undefined || lawyer.consultationFee === null)) {
          lawyer.consultationFee = 0;
        }
        session.recommendedLawyer = lawyer;
      }
    }

    res.status(200).json({
      success: true,
      data: sessionList
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
};

/**
 * Get active session
 */
exports.getActiveSession = async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('chat_sessions');
    const lawyers = db.collection('lawyers');
    const userId = req.user._id;

    const session = await sessions.findOne({
      userId,
      isActive: true
    });

    if (session && session.recommendedLawyer) {
      const lawyer = await lawyers.findOne({ _id: new ObjectId(session.recommendedLawyer) });
      // Ensure consultationFee has a value
      if (lawyer && (lawyer.consultationFee === undefined || lawyer.consultationFee === null)) {
        lawyer.consultationFee = 0;
      }
      session.recommendedLawyer = lawyer;
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active session',
      error: error.message
    });
  }
};

/**
 * End chat session
 */
exports.endChatSession = async (req, res) => {
  try {
    const db = getDB();
    const sessions = db.collection('chat_sessions');
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await sessions.findOne({
      _id: new ObjectId(sessionId),
      userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await sessions.updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: { 
          isActive: false,
          status: 'closed',
          updatedAt: new Date()
        } 
      }
    );

    session.isActive = false;
    session.status = 'closed';

    res.status(200).json({
      success: true,
      message: 'Chat session ended',
      data: session
    });
  } catch (error) {
    console.error('End chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session',
      error: error.message
    });
  }
};

/**
 * Get all lawyers
 */
exports.getLawyers = async (req, res) => {
  try {
    const db = getDB();
    const lawyers = db.collection('lawyers');
    const { specialization, availability } = req.query;

    const query = { isActive: true };
    
    if (specialization) {
      query.specializations = specialization;
    }
    
    if (availability) {
      query.availability = availability;
    }

    const lawyerList = await lawyers.find(query)
      .sort({ rating: -1, experience: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: lawyerList.length,
      data: lawyerList
    });
  } catch (error) {
    console.error('Get lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lawyers',
      error: error.message
    });
  }
};
