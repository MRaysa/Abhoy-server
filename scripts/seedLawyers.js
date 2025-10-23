require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safe_desk';

const sampleLawyers = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@legalaid.com',
    phone: '+1 (555) 123-4567',
    specializations: ['workplace-harassment', 'sexual-harassment', 'discrimination'],
    experience: 15,
    rating: 4.9,
    casesHandled: 250,
    successRate: 92,
    availability: 'available',
    bio: 'Dedicated employment law attorney with over 15 years of experience advocating for victims of workplace harassment. Passionate about creating safer work environments.',
    education: [
      { degree: 'JD', institution: 'Harvard Law School', year: 2008 },
      { degree: 'BA in Political Science', institution: 'Yale University', year: 2005 }
    ],
    languages: ['English', 'Spanish'],
    consultationFee: 0,
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    profileImage: ''
  },
  {
    name: 'James Chen',
    email: 'james.chen@employmentlaw.com',
    phone: '+1 (555) 234-5678',
    specializations: ['employment-law', 'discrimination', 'wrongful-termination'],
    experience: 12,
    rating: 4.8,
    casesHandled: 180,
    successRate: 89,
    availability: 'available',
    bio: 'Experienced employment attorney specializing in discrimination and wrongful termination cases. Committed to fighting for workers\' rights.',
    education: [
      { degree: 'JD', institution: 'Stanford Law School', year: 2011 },
      { degree: 'BS in Business', institution: 'UC Berkeley', year: 2008 }
    ],
    languages: ['English', 'Mandarin'],
    consultationFee: 0,
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    },
    profileImage: ''
  },
  {
    name: 'Maria Rodriguez',
    email: 'maria.rodriguez@civilrights.org',
    phone: '+1 (555) 345-6789',
    specializations: ['sexual-harassment', 'civil-rights', 'discrimination'],
    experience: 18,
    rating: 4.9,
    casesHandled: 320,
    successRate: 94,
    availability: 'available',
    bio: 'Award-winning civil rights attorney with a proven track record in sexual harassment cases. Advocate for justice and equality in the workplace.',
    education: [
      { degree: 'JD', institution: 'Columbia Law School', year: 2005 },
      { degree: 'MA in Social Justice', institution: 'Georgetown University', year: 2002 }
    ],
    languages: ['English', 'Spanish', 'Portuguese'],
    consultationFee: 0,
    location: {
      city: 'Miami',
      state: 'FL',
      country: 'USA'
    },
    profileImage: ''
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@laborlaw.com',
    phone: '+1 (555) 456-7890',
    specializations: ['labor-law', 'employment-law', 'wage-disputes'],
    experience: 10,
    rating: 4.7,
    casesHandled: 150,
    successRate: 87,
    availability: 'available',
    bio: 'Labor law specialist focusing on wage disputes and workers\' compensation. Dedicated to ensuring fair treatment for all employees.',
    education: [
      { degree: 'JD', institution: 'Northwestern Law', year: 2013 },
      { degree: 'BA in Economics', institution: 'University of Chicago', year: 2010 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA'
    },
    profileImage: ''
  },
  {
    name: 'Emily Patel',
    email: 'emily.patel@workplacelaw.com',
    phone: '+1 (555) 567-8901',
    specializations: ['workplace-harassment', 'employment-law', 'retaliation'],
    experience: 14,
    rating: 4.8,
    casesHandled: 200,
    successRate: 90,
    availability: 'available',
    bio: 'Compassionate attorney specializing in workplace harassment and retaliation cases. Focused on protecting employees who speak up.',
    education: [
      { degree: 'JD', institution: 'UCLA Law', year: 2009 },
      { degree: 'BA in Psychology', institution: 'Stanford University', year: 2006 }
    ],
    languages: ['English', 'Hindi', 'Gujarati'],
    consultationFee: 0,
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA'
    },
    profileImage: ''
  },
  {
    name: 'Michael O\'Brien',
    email: 'michael.obrien@employmentrights.com',
    phone: '+1 (555) 678-9012',
    specializations: ['discrimination', 'civil-rights', 'employment-law'],
    experience: 20,
    rating: 4.9,
    casesHandled: 400,
    successRate: 93,
    availability: 'available',
    bio: 'Senior partner with two decades of experience in employment discrimination cases. Known for aggressive representation and compassionate client care.',
    education: [
      { degree: 'JD', institution: 'University of Michigan Law', year: 2003 },
      { degree: 'BA in History', institution: 'Notre Dame', year: 2000 }
    ],
    languages: ['English', 'French'],
    consultationFee: 0,
    location: {
      city: 'Boston',
      state: 'MA',
      country: 'USA'
    },
    profileImage: ''
  }
];

async function seedLawyers() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      tls: false // Local development
    });
    console.log('✅ Connected to MongoDB!');

    console.log('🗑️  Clearing existing lawyers...');
    await Lawyer.deleteMany({});

    console.log('🌱 Seeding lawyers...');
    const lawyers = await Lawyer.insertMany(sampleLawyers);

    console.log(`✅ Successfully seeded ${lawyers.length} lawyers:`);
    lawyers.forEach((lawyer, index) => {
      console.log(`${index + 1}. ${lawyer.name} - ${lawyer.specializations.join(', ')}`);
    });

    console.log('\n✅ Seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding lawyers:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedLawyers();
