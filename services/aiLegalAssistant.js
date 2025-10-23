const { getDB } = require('../config/database');

class AILegalAssistant {
  constructor() {
    // Keywords for case type identification
    this.caseTypeKeywords = {
      'workplace-harassment': [
        'harassment', 'harassed', 'harassing', 'bully', 'bullying', 'hostile', 'intimidation',
        'verbal abuse', 'workplace', 'colleague', 'boss', 'manager', 'supervisor'
      ],
      'sexual-harassment': [
        'sexual', 'unwanted advances', 'inappropriate touching', 'assault', 'molest',
        'groping', 'sexual comments', 'sexual jokes', 'quid pro quo', 'sexual favor'
      ],
      'discrimination': [
        'discrimination', 'discriminate', 'racist', 'racism', 'sexist', 'sexism',
        'age discrimination', 'gender discrimination', 'racial', 'bias', 'unfair treatment',
        'religion', 'disability', 'pregnant', 'pregnancy'
      ],
      'retaliation': [
        'retaliation', 'retaliate', 'fired after complaint', 'punished', 'demoted',
        'revenge', 'payback', 'whistleblower'
      ],
      'wrongful-termination': [
        'fired', 'terminated', 'dismissal', 'wrongful termination', 'unfair firing',
        'laid off', 'let go', 'termination without cause'
      ],
      'wage-dispute': [
        'unpaid', 'salary', 'wages', 'overtime', 'payment', 'compensation',
        'paycheck', 'minimum wage', 'wage theft', 'not paid'
      ]
    };

    // Severity indicators
    this.severityIndicators = {
      high: [
        'assault', 'physical', 'threatened', 'threat', 'violence', 'violent',
        'police', 'criminal', 'hospital', 'injury', 'hurt', 'weapon',
        'stalking', 'fear for safety', 'rape', 'sexual assault', 'suicide'
      ],
      medium: [
        'repeated', 'multiple times', 'ongoing', 'persistent', 'daily',
        'documented', 'evidence', 'witnesses', 'complaint filed', 'HR involved',
        'mental health', 'anxiety', 'depression', 'stress', 'unable to work'
      ],
      low: [
        'once', 'first time', 'minor', 'uncomfortable', 'awkward',
        'unsure', 'not sure', 'happened yesterday', 'recent', 'single incident'
      ]
    };
  }

  /**
   * Analyze user's problem description
   */
  analyzeProblem(description) {
    const lowerDesc = description.toLowerCase();
    
    // Identify case type
    let caseType = 'other';
    let maxMatches = 0;

    for (const [type, keywords] of Object.entries(this.caseTypeKeywords)) {
      const matches = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        caseType = type;
      }
    }

    // Determine severity
    let severity = 'low';
    const highMatches = this.severityIndicators.high.filter(keyword => 
      lowerDesc.includes(keyword)
    ).length;
    const mediumMatches = this.severityIndicators.medium.filter(keyword => 
      lowerDesc.includes(keyword)
    ).length;

    if (highMatches > 0) {
      severity = 'high';
    } else if (mediumMatches >= 2) {
      severity = 'medium';
    } else if (mediumMatches === 1 || lowerDesc.length > 200) {
      severity = 'medium';
    }

    // Extract keywords
    const allKeywords = Object.values(this.caseTypeKeywords).flat();
    const keywords = allKeywords.filter(keyword => lowerDesc.includes(keyword));

    return {
      caseType,
      severity,
      keywords: [...new Set(keywords)].slice(0, 10)
    };
  }

  /**
   * Generate AI response based on analysis
   */
  generateResponse(analysis, userName = 'there') {
    const { caseType, severity } = analysis;

    let greeting = `Thank you for sharing this with me, ${userName}. I understand this must be difficult for you.`;
    
    let caseExplanation = this.getCaseExplanation(caseType);
    let recommendation = this.getRecommendation(caseType, severity);
    
    return {
      greeting,
      caseExplanation,
      recommendation,
      severity
    };
  }

  /**
   * Get legal explanation for case type
   */
  getCaseExplanation(caseType) {
    const explanations = {
      'workplace-harassment': `Based on your description, this appears to be a **workplace harassment** case. Workplace harassment includes unwelcome conduct that creates an intimidating, hostile, or offensive work environment. Under employment law, employers have a legal duty to provide a safe workplace free from harassment.`,
      
      'sexual-harassment': `This situation involves **sexual harassment**, which is a serious violation of employment law. Sexual harassment includes unwelcome sexual advances, requests for sexual favors, or other verbal/physical conduct of a sexual nature. This is illegal under Title VII of the Civil Rights Act and similar state laws.`,
      
      'discrimination': `Your case involves **workplace discrimination**. Discrimination occurs when an employer treats you unfairly because of protected characteristics like race, gender, age, religion, or disability. This is prohibited by federal and state anti-discrimination laws.`,
      
      'retaliation': `This appears to be **workplace retaliation**, which occurs when an employer punishes an employee for engaging in legally protected activity, such as filing a complaint or reporting illegal conduct. Retaliation is illegal and you have strong legal protections.`,
      
      'wrongful-termination': `This may constitute **wrongful termination**. While most employment is "at-will," you cannot be fired for illegal reasons such as discrimination, retaliation, or breach of contract. You may have grounds for a legal claim.`,
      
      'wage-dispute': `This is a **wage and hour dispute**. Employers are legally required to pay minimum wage, overtime, and provide proper compensation. Wage theft is illegal, and you have the right to recover unpaid wages plus penalties.`,
      
      'other': `I understand you're facing a challenging workplace situation. While I need more specific details to categorize this precisely, workplace rights are protected by various employment laws, and you have options for addressing this issue.`
    };

    return explanations[caseType] || explanations['other'];
  }

  /**
   * Get recommendation based on severity
   */
  getRecommendation(caseType, severity) {
    if (severity === 'high') {
      return {
        message: `**⚠️ This is a serious matter that requires immediate legal attention.**\n\nGiven the severity of your situation, I strongly recommend you:\n\n1. **Document everything immediately** - Write down dates, times, what happened, and any witnesses\n2. **Preserve all evidence** - Save emails, text messages, photos, or recordings (where legal)\n3. **Report to authorities if applicable** - For threats, violence, or criminal conduct, contact police\n4. **Consult with a lawyer urgently** - A qualified employment attorney can protect your rights and guide you through the legal process\n\nYour safety and legal rights are paramount. I'm recommending an experienced lawyer from our panel who specializes in these cases.`,
        requiresLawyer: true,
        urgent: true
      };
    } else if (severity === 'medium') {
      return {
        message: `**This situation warrants professional legal guidance.**\n\nBased on the details you've shared, I recommend:\n\n1. **Document the incidents** - Keep a detailed record with dates, times, people involved, and witnesses\n2. **Follow internal procedures** - If you haven't already, report this to HR or your supervisor (in writing)\n3. **Preserve evidence** - Save all relevant communications and documentation\n4. **Consult with a lawyer** - An employment attorney can assess your case, explain your rights, and advise on the best course of action\n\nWhile you may be able to resolve this through internal channels, having legal counsel ensures your rights are protected. I'll connect you with a qualified lawyer who handles these cases.`,
        requiresLawyer: true,
        urgent: false
      };
    } else {
      return {
        message: `**Here are some initial steps you can take:**\n\n1. **Document what happened** - Write down the date, time, what occurred, and any witnesses\n2. **Review your employee handbook** - Check your company's policies on this issue\n3. **Consider reporting internally** - You may want to speak with HR or a supervisor (preferably in writing)\n4. **Know your rights** - Familiarize yourself with your company's complaint procedures\n\nMany workplace issues can be resolved through internal processes. However, if:\n- The situation continues or worsens\n- You face retaliation for speaking up\n- Your employer doesn't take appropriate action\n- You feel your rights have been violated\n\n**Then consulting with a lawyer would be advisable.**\n\nWould you like me to connect you with a qualified employment attorney who can provide a free initial consultation?`,
        requiresLawyer: false,
        urgent: false
      };
    }
  }

  /**
   * Find best matched lawyer
   */
  async findBestLawyer(caseType, severity) {
    try {
      const db = getDB();
      const lawyers = db.collection('lawyers');
      
      // Map case types to lawyer specializations
      const specializationMap = {
        'workplace-harassment': 'workplace-harassment',
        'sexual-harassment': 'sexual-harassment',
        'discrimination': 'discrimination',
        'retaliation': 'employment-law',
        'wrongful-termination': 'employment-law',
        'wage-dispute': 'labor-law',
        'other': 'employment-law'
      };

      const specialization = specializationMap[caseType] || 'employment-law';

      // Find lawyers with matching specialization
      const query = {
        specializations: specialization,
        isActive: true,
        availability: { $ne: 'unavailable' }
      };

      // For high severity, prioritize more experienced lawyers
      const sortCriteria = severity === 'high' 
        ? { experience: -1, successRate: -1, rating: -1 }
        : { rating: -1, successRate: -1, experience: -1 };

      const results = await lawyers.find(query)
        .sort(sortCriteria)
        .limit(3)
        .toArray();

      return results;
    } catch (error) {
      console.error('Error finding lawyer:', error);
      return [];
    }
  }

  /**
   * Format lawyer recommendation
   */
  formatLawyerRecommendation(lawyer, caseType) {
    if (!lawyer) {
      return `I apologize, but I couldn't find an available lawyer at this moment. Please try again later or contact our support team for direct assistance.`;
    }

    const specialization = lawyer.specializations.join(', ').replace(/-/g, ' ');
    
    return `\n\n**👨‍⚖️ Recommended Lawyer: ${lawyer.name}**\n\n` +
           `**Specialization:** ${specialization}\n` +
           `**Experience:** ${lawyer.experience} years\n` +
           `**Success Rate:** ${lawyer.successRate}%\n` +
           `**Rating:** ⭐ ${lawyer.rating}/5\n` +
           `**Cases Handled:** ${lawyer.casesHandled}+\n` +
           `**Consultation Fee:** ${lawyer.consultationFee === 0 ? 'Free initial consultation' : `$${lawyer.consultationFee}`}\n` +
           (lawyer.bio ? `\n**About:** ${lawyer.bio}\n` : '') +
           `\n**Contact:** ${lawyer.email} | ${lawyer.phone}\n\n` +
           `Would you like me to help you schedule a consultation with ${lawyer.name.split(' ')[0]}?`;
  }

  /**
   * Generate follow-up questions
   */
  getFollowUpQuestions(severity) {
    if (severity === 'low') {
      return [
        "Would you like to speak with a lawyer for a free consultation?",
        "Do you need help documenting this incident?",
        "Would you like information about filing a formal complaint?"
      ];
    } else {
      return [
        "Would you like me to connect you with this lawyer?",
        "Do you need help gathering evidence for your case?",
        "Would you like information about the legal process ahead?"
      ];
    }
  }
}

module.exports = new AILegalAssistant();
