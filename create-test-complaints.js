/**
 * Script to create test complaints in the database
 * Run with: node create-test-complaints.js
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Use environment variable or default to local
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://abhoy-server.vercel.app/api'  // Production backend
  : 'http://localhost:3000/api';            // Local backend

const testComplaints = [
  {
    incidentType: 'bullying',
    severity: 'high',
    title: 'test',
    description: 'this is for test parpas',
    incidentDate: new Date('2025-10-20'),
    location: 'test',
    isAnonymous: true,
    department: 'HR'
  },
  {
    incidentType: 'discrimination',
    severity: 'critical',
    title: 'Workplace Discrimination',
    description: 'I have been experiencing discrimination based on my background',
    incidentDate: new Date('2025-10-18'),
    location: 'Main Office',
    isAnonymous: true,
    department: 'Engineering'
  },
  {
    incidentType: 'harassment',
    severity: 'medium',
    title: 'Verbal Harassment',
    description: 'Repeated verbal harassment from a colleague',
    incidentDate: new Date('2025-10-21'),
    location: 'Floor 3',
    isAnonymous: false,
    reporterName: 'John Doe',
    reporterEmail: 'john@example.com',
    department: 'Sales'
  }
];

async function createComplaints() {
  console.log('🚀 Creating test complaints...\n');
  
  for (let i = 0; i < testComplaints.length; i++) {
    const complaint = testComplaints[i];
    
    try {
      console.log(`📝 Creating complaint ${i + 1}/${testComplaints.length}: "${complaint.title}"`);
      
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaint),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Created successfully! ID: ${data.data.anonymousId}\n`);
      } else {
        console.log(`❌ Failed: ${data.message}\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('✨ Done! Check your All Reports page.');
}

createComplaints();
