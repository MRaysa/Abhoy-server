require('dotenv').config();
const { connectDB } = require('../config/database');

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
    profileImage: '',
    isActive: true
  },
  {
    name: 'James Chen',
    email: 'james.chen@employmentlaw.com',
    phone: '+1 (555) 234-5678',
    specializations: ['employment-law', 'discrimination', 'labor-law'],
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
    profileImage: '',
    isActive: true
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
    profileImage: '',
    isActive: true
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@laborlaw.com',
    phone: '+1 (555) 456-7890',
    specializations: ['labor-law', 'employment-law', 'workplace-harassment'],
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
    profileImage: '',
    isActive: true
  },
  {
    name: 'Emily Patel',
    email: 'emily.patel@workplacelaw.com',
    phone: '+1 (555) 567-8901',
    specializations: ['workplace-harassment', 'employment-law', 'discrimination'],
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
    profileImage: '',
    isActive: true
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
    profileImage: '',
    isActive: true
  },
  {
    name: 'Amanda Johnson',
    email: 'amanda.johnson@justicelaw.com',
    phone: '+1 (555) 789-0123',
    specializations: ['sexual-harassment', 'workplace-harassment', 'retaliation'],
    experience: 16,
    rating: 4.9,
    casesHandled: 280,
    successRate: 91,
    availability: 'available',
    bio: 'Fierce advocate for harassment victims with extensive trial experience. Known for her compassionate approach and strategic litigation skills.',
    education: [
      { degree: 'JD', institution: 'University of Pennsylvania Law', year: 2007 },
      { degree: 'BA in Women\'s Studies', institution: 'Smith College', year: 2004 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: { city: 'Philadelphia', state: 'PA', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Robert Kim',
    email: 'robert.kim@workersrights.org',
    phone: '+1 (555) 890-1234',
    specializations: ['wrongful-termination', 'discrimination', 'employment-law'],
    experience: 13,
    rating: 4.7,
    casesHandled: 190,
    successRate: 88,
    availability: 'available',
    bio: 'Skilled litigator specializing in wrongful termination and discrimination cases. Dedicated to securing justice for wronged employees.',
    education: [
      { degree: 'JD', institution: 'NYU School of Law', year: 2010 },
      { degree: 'BA in Sociology', institution: 'Cornell University', year: 2007 }
    ],
    languages: ['English', 'Korean'],
    consultationFee: 0,
    location: { city: 'Seattle', state: 'WA', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Jessica Martinez',
    email: 'jessica.martinez@civiladvocates.com',
    phone: '+1 (555) 901-2345',
    specializations: ['civil-rights', 'discrimination', 'workplace-harassment'],
    experience: 11,
    rating: 4.8,
    casesHandled: 165,
    successRate: 89,
    availability: 'available',
    bio: 'Passionate civil rights attorney committed to fighting workplace discrimination. Strong track record of successful settlements and verdicts.',
    education: [
      { degree: 'JD', institution: 'University of Texas Law', year: 2012 },
      { degree: 'BA in Criminal Justice', institution: 'UT Austin', year: 2009 }
    ],
    languages: ['English', 'Spanish'],
    consultationFee: 0,
    location: { city: 'Austin', state: 'TX', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Daniel Washington',
    email: 'daniel.washington@employmentdefense.com',
    phone: '+1 (555) 012-3456',
    specializations: ['retaliation', 'wrongful-termination', 'employment-law'],
    experience: 17,
    rating: 4.8,
    casesHandled: 310,
    successRate: 90,
    availability: 'available',
    bio: 'Veteran employment attorney with deep expertise in retaliation and whistleblower cases. Committed to protecting those who speak truth to power.',
    education: [
      { degree: 'JD', institution: 'Georgetown Law', year: 2006 },
      { degree: 'BA in Political Science', institution: 'Howard University', year: 2003 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: { city: 'Washington', state: 'DC', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Lisa Nguyen',
    email: 'lisa.nguyen@workplaceequity.com',
    phone: '+1 (555) 123-4568',
    specializations: ['wage-dispute', 'labor-law', 'employment-law'],
    experience: 9,
    rating: 4.6,
    casesHandled: 140,
    successRate: 85,
    availability: 'available',
    bio: 'Dedicated labor attorney focusing on wage theft and overtime violations. Fights tirelessly to ensure workers receive fair compensation.',
    education: [
      { degree: 'JD', institution: 'UC Irvine Law', year: 2014 },
      { degree: 'BS in Accounting', institution: 'USC', year: 2011 }
    ],
    languages: ['English', 'Vietnamese'],
    consultationFee: 0,
    location: { city: 'San Diego', state: 'CA', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Christopher Brown',
    email: 'chris.brown@equalrights.org',
    phone: '+1 (555) 234-5679',
    specializations: ['discrimination', 'sexual-harassment', 'civil-rights'],
    experience: 19,
    rating: 4.9,
    casesHandled: 360,
    successRate: 92,
    availability: 'available',
    bio: 'Highly experienced civil rights advocate with nearly two decades fighting discrimination. Multiple landmark case victories.',
    education: [
      { degree: 'JD', institution: 'Duke Law School', year: 2004 },
      { degree: 'BA in Philosophy', institution: 'Princeton University', year: 2001 }
    ],
    languages: ['English', 'German'],
    consultationFee: 0,
    location: { city: 'Atlanta', state: 'GA', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Rachel Cohen',
    email: 'rachel.cohen@laborjustice.com',
    phone: '+1 (555) 345-6780',
    specializations: ['workplace-harassment', 'retaliation', 'employment-law'],
    experience: 8,
    rating: 4.7,
    casesHandled: 125,
    successRate: 86,
    availability: 'available',
    bio: 'Rising star in employment law with a focus on creating safe workplaces. Known for thorough case preparation and client advocacy.',
    education: [
      { degree: 'JD', institution: 'University of Minnesota Law', year: 2015 },
      { degree: 'BA in English', institution: 'Carleton College', year: 2012 }
    ],
    languages: ['English', 'Hebrew'],
    consultationFee: 0,
    location: { city: 'Minneapolis', state: 'MN', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Anthony Garcia',
    email: 'anthony.garcia@workersadvocacy.com',
    phone: '+1 (555) 456-7891',
    specializations: ['wrongful-termination', 'wage-dispute', 'labor-law'],
    experience: 15,
    rating: 4.8,
    casesHandled: 240,
    successRate: 89,
    availability: 'available',
    bio: 'Passionate workers\' advocate specializing in wrongful termination and wage disputes. Fluent in both legal strategy and client communication.',
    education: [
      { degree: 'JD', institution: 'University of Arizona Law', year: 2008 },
      { degree: 'BA in Labor Studies', institution: 'Arizona State', year: 2005 }
    ],
    languages: ['English', 'Spanish'],
    consultationFee: 0,
    location: { city: 'Phoenix', state: 'AZ', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Sophia Anderson',
    email: 'sophia.anderson@equalitylaw.com',
    phone: '+1 (555) 567-8902',
    specializations: ['sexual-harassment', 'discrimination', 'civil-rights'],
    experience: 12,
    rating: 4.8,
    casesHandled: 195,
    successRate: 90,
    availability: 'available',
    bio: 'Determined advocate for victims of sexual harassment and discrimination. Combines legal expertise with genuine empathy for clients.',
    education: [
      { degree: 'JD', institution: 'Vanderbilt Law School', year: 2011 },
      { degree: 'BA in Gender Studies', institution: 'Emory University', year: 2008 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: { city: 'Nashville', state: 'TN', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Kevin Lewis',
    email: 'kevin.lewis@employmentjustice.org',
    phone: '+1 (555) 678-9013',
    specializations: ['retaliation', 'whistleblower', 'employment-law'],
    experience: 14,
    rating: 4.9,
    casesHandled: 220,
    successRate: 91,
    availability: 'available',
    bio: 'Expert in whistleblower and retaliation cases with numerous successful outcomes. Protects those who risk everything to do what\'s right.',
    education: [
      { degree: 'JD', institution: 'Boston College Law', year: 2009 },
      { degree: 'BA in Ethics', institution: 'Boston College', year: 2006 }
    ],
    languages: ['English', 'Italian'],
    consultationFee: 0,
    location: { city: 'Denver', state: 'CO', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Jennifer Taylor',
    email: 'jennifer.taylor@civilrightscenter.com',
    phone: '+1 (555) 789-0124',
    specializations: ['discrimination', 'workplace-harassment', 'employment-law'],
    experience: 11,
    rating: 4.7,
    casesHandled: 170,
    successRate: 87,
    availability: 'available',
    bio: 'Skilled mediator and litigator in employment discrimination cases. Believes in exhausting all options to achieve justice for clients.',
    education: [
      { degree: 'JD', institution: 'University of Washington Law', year: 2012 },
      { degree: 'BA in Communications', institution: 'University of Oregon', year: 2009 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: { city: 'Portland', state: 'OR', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'William Harris',
    email: 'william.harris@labordefense.com',
    phone: '+1 (555) 890-1235',
    specializations: ['wage-dispute', 'wrongful-termination', 'labor-law'],
    experience: 16,
    rating: 4.8,
    casesHandled: 275,
    successRate: 90,
    availability: 'available',
    bio: 'Veteran labor attorney with extensive class action experience. Successfully recovered millions in unpaid wages for workers.',
    education: [
      { degree: 'JD', institution: 'University of Illinois Law', year: 2007 },
      { degree: 'BA in Economics', institution: 'Northwestern University', year: 2004 }
    ],
    languages: ['English'],
    consultationFee: 0,
    location: { city: 'Detroit', state: 'MI', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Nicole Williams',
    email: 'nicole.williams@harassmentlaw.com',
    phone: '+1 (555) 901-2346',
    specializations: ['sexual-harassment', 'workplace-harassment', 'retaliation'],
    experience: 13,
    rating: 4.9,
    casesHandled: 210,
    successRate: 92,
    availability: 'available',
    bio: 'Compassionate yet aggressive representation for harassment victims. Creates safe spaces for clients to share their stories and seek justice.',
    education: [
      { degree: 'JD', institution: 'Fordham Law School', year: 2010 },
      { degree: 'BA in Psychology', institution: 'Barnard College', year: 2007 }
    ],
    languages: ['English', 'French'],
    consultationFee: 0,
    location: { city: 'New York', state: 'NY', country: 'USA' },
    profileImage: '',
    isActive: true
  },
  {
    name: 'Thomas Jackson',
    email: 'thomas.jackson@employeeadvocates.org',
    phone: '+1 (555) 012-3457',
    specializations: ['discrimination', 'civil-rights', 'wrongful-termination'],
    experience: 21,
    rating: 4.9,
    casesHandled: 450,
    successRate: 94,
    availability: 'available',
    bio: 'Distinguished employment attorney with over two decades of experience. Recognized nationally for excellence in civil rights litigation.',
    education: [
      { degree: 'JD', institution: 'University of Virginia Law', year: 2002 },
      { degree: 'BA in History', institution: 'University of Virginia', year: 1999 }
    ],
    languages: ['English', 'Spanish'],
    consultationFee: 0,
    location: { city: 'Charlotte', state: 'NC', country: 'USA' },
    profileImage: '',
    isActive: true
  }
];

async function seedLawyers() {
  try {
    console.log('🔄 Connecting to database...');
    const db = await connectDB();

    console.log('🗑️  Clearing existing lawyers...');
    await db.collection('lawyers').deleteMany({});

    console.log('🌱 Seeding lawyers...');
    const result = await db.collection('lawyers').insertMany(sampleLawyers);

    console.log(`✅ Successfully seeded ${result.insertedCount} lawyers:`);
    sampleLawyers.forEach((lawyer, index) => {
      console.log(`${index + 1}. ${lawyer.name} - ${lawyer.specializations.join(', ')}`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding lawyers:', error);
    if (error.cause) console.error('Cause:', error.cause);
    process.exit(1);
  }
}

seedLawyers();
