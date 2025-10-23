// Test script for Anonymous Complaint System
// Run with: node test-complaint-api.js

const testComplaintAPI = async () => {
  // Use environment variable or default to local
  const baseURL = process.env.NODE_ENV === 'production'
    ? 'https://abhoy-server.vercel.app/api'  // Production backend
    : 'http://localhost:3000/api';            // Local backend
  
  console.log('🧪 Testing Anonymous Complaint System API...\n');
  
  // Test 1: Create a complaint
  console.log('Test 1: Creating a new complaint...');
  try {
    const complaintData = {
      title: "Test Harassment Complaint",
      incidentType: "sexual_harassment",
      category: "Workplace",
      description: "This is a test complaint to verify the system is working correctly. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      incidentDate: "2025-10-15",
      location: "Office Building A, Floor 3",
      priority: "high",
      isAnonymous: true,
      evidenceUrls: [
        { url: "https://example.com/evidence1.jpg", addedAt: new Date() }
      ],
      witnessFormUrl: "https://forms.google.com/test",
      witnessCount: 5
    };

    const response = await fetch(`${baseURL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Complaint created successfully!');
      console.log('   Anonymous ID:', result.data.anonymousId);
      console.log('   Complaint ID:', result.data.complaintId);
      
      const anonymousId = result.data.anonymousId;
      
      // Test 2: Retrieve the complaint
      console.log('\nTest 2: Retrieving complaint by Anonymous ID...');
      const getResponse = await fetch(`${baseURL}/complaints/${anonymousId}`);
      const getResult = await getResponse.json();
      
      if (getResult.success) {
        console.log('✅ Complaint retrieved successfully!');
        console.log('   Title:', getResult.data.title);
        console.log('   Status:', getResult.data.status);
        console.log('   Priority:', getResult.data.priority);
      } else {
        console.log('❌ Failed to retrieve complaint');
      }
      
      // Test 3: Verify complaint
      console.log('\nTest 3: Verifying Anonymous ID...');
      const verifyResponse = await fetch(`${baseURL}/complaints/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anonymousId })
      });
      
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success && verifyResult.valid) {
        console.log('✅ Anonymous ID verified successfully!');
      } else {
        console.log('❌ Failed to verify Anonymous ID');
      }
      
      // Test 4: Update status (Admin action)
      console.log('\nTest 4: Updating complaint status...');
      const updateResponse = await fetch(`${baseURL}/complaints/${anonymousId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'under_review',
          adminNotes: 'Test review note'
        })
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log('✅ Status updated successfully!');
      } else {
        console.log('❌ Failed to update status');
      }
      
      // Test 5: Add reaction
      console.log('\nTest 5: Adding reaction to complaint...');
      
      // First approve for forum
      await fetch(`${baseURL}/complaints/${anonymousId}/approve-forum`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true })
      });
      
      const reactionResponse = await fetch(`${baseURL}/complaints/${anonymousId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType: 'support' })
      });
      
      const reactionResult = await reactionResponse.json();
      
      if (reactionResult.success) {
        console.log('✅ Reaction added successfully!');
      } else {
        console.log('❌ Failed to add reaction');
      }
      
      // Test 6: Add comment
      console.log('\nTest 6: Adding comment to complaint...');
      const commentResponse = await fetch(`${baseURL}/complaints/${anonymousId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          comment: 'This is a test comment to show support.',
          commentorId: null // Anonymous
        })
      });
      
      const commentResult = await commentResponse.json();
      
      if (commentResult.success) {
        console.log('✅ Comment added successfully!');
      } else {
        console.log('❌ Failed to add comment');
      }
      
      // Test 7: Get forum posts
      console.log('\nTest 7: Fetching forum posts...');
      const forumResponse = await fetch(`${baseURL}/complaints/forum/posts?page=1&limit=5`);
      const forumResult = await forumResponse.json();
      
      if (forumResult.success) {
        console.log('✅ Forum posts retrieved successfully!');
        console.log('   Total posts:', forumResult.data.length);
      } else {
        console.log('❌ Failed to retrieve forum posts');
      }
      
      // Test 8: Get statistics
      console.log('\nTest 8: Fetching statistics...');
      const statsResponse = await fetch(`${baseURL}/complaints/statistics`);
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        console.log('✅ Statistics retrieved successfully!');
        console.log('   Total complaints:', statsResult.data.totalComplaints);
      } else {
        console.log('❌ Failed to retrieve statistics');
      }
      
      console.log('\n✨ All tests completed!');
      console.log('\n📝 Test Summary:');
      console.log('   Anonymous ID for testing:', anonymousId);
      console.log('   You can use this ID to test the frontend tracking page.');
      
    } else {
      console.log('❌ Failed to create complaint:', result.message);
    }
  } catch (error) {
    console.log('❌ Error during testing:', error.message);
    console.log('\n⚠️  Make sure the server is running on http://localhost:3000');
  }
};

// Run tests
testComplaintAPI();
