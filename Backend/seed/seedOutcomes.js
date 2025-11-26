const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Outcome = require('../models/Outcome');

dotenv.config();

const seedData = [
  // Questions 1 to 3 already filled (unchanged)...
    { questionNumber: 1, optionId: 1, outcomes: ['Employment Contracts', 'NDA', 'Offer Letters'] },
  { questionNumber: 1, optionId: 2, outcomes: ['Employment Contracts', 'NDA', 'Offer Letters'] },
  { questionNumber: 1, optionId: 3, outcomes: ['Employment Contracts', 'NDA', 'Offer Letters'] },
  { questionNumber: 1, optionId: 6, outcomes: ['Employment Contracts', 'NDA', 'Offer Letters'] },
  { questionNumber: 1, optionId: 5, outcomes: ['Internship Agreement'] },
  { questionNumber: 1, optionId: 4, outcomes: ['Freelancer Agreement'] },
  { questionNumber: 1, optionId: 7, outcomes: ['Independent Contractor Agreements'] },

  // Question 2
  { questionNumber: 2, optionId: 1, outcomes: ['Vendor Agreement'] },
  { questionNumber: 2, optionId: 2, outcomes: ['Service Provider Agreement'] },
  { questionNumber: 2, optionId: 3, outcomes: ['Master Service Agreement (MSA)'] },
  { questionNumber: 2, optionId: 4, outcomes: ['Purchase Agreement & Supply Agreement'] },
  { questionNumber: 2, optionId: 5, outcomes: ['Distribution Agreement'] },
  { questionNumber: 2, optionId: 6, outcomes: ['Franchise Agreement'] },
  { questionNumber: 2, optionId: 7, outcomes: ['Outsourcing Agreement'] },
  { questionNumber: 2, optionId: 8, outcomes: ['Logistics Agreement'] },
  { questionNumber: 2, optionId: 9, outcomes: ['Annual Maintenance Contract (AMC)'] },
  { questionNumber: 2, optionId: 10, outcomes: ['Service Level Agreement (SLA)'] },
  { questionNumber: 2, optionId: 11, outcomes: ['Consultancy Agreement'] },
  { questionNumber: 2, optionId: 12, outcomes: ['Marketing & Advertising Agreement'] },
  { questionNumber: 2, optionId: 13, outcomes: ['Channel Partner Agreement'] },
  { questionNumber: 2, optionId: 14, outcomes: ['Sales Commission Agreement'] },
  { questionNumber: 2, optionId: 15, outcomes: ['Sponsorship Agreement'] },
  { questionNumber: 2, optionId: 16, outcomes: ['Tri-Party Agreement'] },
  { questionNumber: 2, optionId: 17, outcomes: ['Terms of Service'] },
  { questionNumber: 2, optionId: 18, outcomes: ['Joint Venture Agreement'] },

  // Question 3
  { questionNumber: 3, optionId: 1, outcomes: ['Shareholders Agreement', 'Investors Agreement'] },
  { questionNumber: 3, optionId: 2, outcomes: ['Founders Agreement'] },
  { questionNumber: 3, optionId: 3, outcomes: ['Partnership Agreement'] },
  { questionNumber: 3, optionId: 4, outcomes: ['Share Purchase Agreement'] },
  { questionNumber: 3, optionId: 5, outcomes: ['Investment Agreement'] },
  { questionNumber: 3, optionId: 6, outcomes: ['Equity Financing Agreement'] },
  { questionNumber: 3, optionId: 7, outcomes: ['Memorandum of Understanding (MoU)'] },
  { questionNumber: 3, optionId: 8, outcomes: ['Articles of Association (AoA)'] },
  { questionNumber: 3, optionId: 9, outcomes: ['Non-Disclosure Agreement (NDA)', 'Confidentiality & Non-Compete Agreement'] },
  { questionNumber: 3, optionId: 10, outcomes: ['Business Transfer Agreement'] },


  // Question 4 (Data governance)
  { questionNumber: 4, optionId: 1, outcomes: ['Data Processing Agreement'] },
  { questionNumber: 4, optionId: 2, outcomes: ['Data Sharing Agreement'] },
  { questionNumber: 4, optionId: 3, outcomes: ['Data Transfer Agreement'] },
  { questionNumber: 4, optionId: 4, outcomes: ['Employee Data Protection Agreement'] },
  { questionNumber: 4, optionId: 5, outcomes: ['Privacy Policy'] },
  { questionNumber: 4, optionId: 6, outcomes: ['Vendor Data Protection Agreement'] },
  { questionNumber: 4, optionId: 7, outcomes: ['Data Retention Policy Agreement'] },
  { questionNumber: 4, optionId: 8, outcomes: ['Information Security Policy'] },
  { questionNumber: 4, optionId: 9, outcomes: ['IT Security & Access Control Agreement'] },
  { questionNumber: 4, optionId: 10, outcomes: ['Consent Form for Data Collection'] },
  { questionNumber: 4, optionId: 11, outcomes: ['Cloud Service Agreement'] },
  { questionNumber: 4, optionId: 12, outcomes: ['Non-Disclosure Agreement (NDA)'] },
  { questionNumber: 4, optionId: 13, outcomes: ['Third-Party Risk Management'] },
  { questionNumber: 4, optionId: 14, outcomes: ['Third-Party Risk Management'] },

  // Question 5 (Regulatory jurisdictions)
  { questionNumber: 5, optionId: 1, outcomes: ['DPDP Compliance Checklist', 'Privacy Impact Assessment'] },
  { questionNumber: 5, optionId: 2, outcomes: ['GDPR Readiness Report', 'Privacy Impact Assessment'] },
  { questionNumber: 5, optionId: 3, outcomes: ['CCPA Compliance Report', 'Privacy Impact Assessment'] },
  { questionNumber: 5, optionId: 4, outcomes: ['Privacy Impact Assessment', 'Data Protection Gap Analysis'] },
  { questionNumber: 5, optionId: 5, outcomes: ['Children’s Data Compliance Report'] },
  { questionNumber: 5, optionId: 6, outcomes: ['Data Protection Gap Analysis'] },
  { questionNumber: 5, optionId: 7, outcomes: ['HIPAA Compliance Report'] },
  { questionNumber: 5, optionId: 8, outcomes: ['High-Risk Data Processing Assessments'] },
  { questionNumber: 5, optionId: 9, outcomes: ['AI Decision-Making Compliance Report'] },
  { questionNumber: 5, optionId: 10, outcomes: ['High-Risk Data Processing Assessments'] },

  // Question 6 (Data sharing/security)
  { questionNumber: 6, optionId: 1, outcomes: ['Cross-Border Data Transfer Assessment', 'Data Localization Compliance Assessment', 'Data Breach Notification Mechanism', 'Breach Incident Response Plan'] },
  { questionNumber: 6, optionId: 2, outcomes: ['Third-Party Risk Assessment Report', 'Vendor Due Diligence'] },
  { questionNumber: 6, optionId: 3, outcomes: ['Third-Party Risk Assessment Report', 'Vendor Due Diligence', 'Supply Chain Risk Report'] },
  { questionNumber: 6, optionId: 4, outcomes: ['Third-Party Risk Assessment Report', 'Vendor Due Diligence'] },
  { questionNumber: 6, optionId: 5, outcomes: ['Data Breach Notification Mechanism', 'Breach Incident Response Plan'] },

  // Question 7 (Employee data policies)
  { questionNumber: 7, optionId: 1, outcomes: ['Employee Data Compliance Report'] },
  { questionNumber: 7, optionId: 2, outcomes: ['Workplace Monitoring Assessment'] },
  { questionNumber: 7, optionId: 3, outcomes: ['Biometric Risk Report'] },
  { questionNumber: 7, optionId: 4, outcomes: ['AI Hiring Compliance Report'] },
  { questionNumber: 7, optionId: 5, outcomes: ['Employee Data Compliance Report'] },
  { questionNumber: 7, optionId: 6, outcomes: ['Workplace Monitoring Assessment'] },
  { questionNumber: 7, optionId: 7, outcomes: ['Remote Work Privacy Guide'] },

  // Question 8 (Marketing compliance)
  { questionNumber: 8, optionId: 1, outcomes: ['Marketing & Advertising Privacy Report'] },
  { questionNumber: 8, optionId: 2, outcomes: ['Marketing & Advertising Privacy Report', 'Targeted Advertising Compliance Checklist'] },
  { questionNumber: 8, optionId: 3, outcomes: ['Marketing & Advertising Privacy Report'] },
  { questionNumber: 8, optionId: 4, outcomes: ['Consumer Opt-Out Compliance Report'] },
  { questionNumber: 8, optionId: 5, outcomes: ['AI Marketing Risk Assessment'] },

  // Question 9 (AI systems)
  { questionNumber: 9, optionId: 1, outcomes: ['AI Privacy Assessment', 'AI Transparency Report', 'Ethical AI Compliance Guide'] },
  { questionNumber: 9, optionId: 2, outcomes: ['AI Privacy Assessment', 'AI Transparency Report', 'Ethical AI Compliance Guide'] },
  { questionNumber: 9, optionId: 3, outcomes: ['AI Privacy Assessment', 'AI Transparency Report', 'Ethical AI Compliance Guide'] },
  { questionNumber: 9, optionId: 4, outcomes: ['AI Privacy Assessment', 'AI Transparency Report', 'Generative AI Compliance Checklist', 'Ethical AI Compliance Guide'] },

  // Question 10 (Workplace/HR)
  { questionNumber: 10, optionId: 1, outcomes: ['Formation of POSH Policy', 'Formation of Internal Complaints Committee (ICC)', 'Anti-Sexual Harassment Training', 'EPF Registration', 'ESI Registration', 'Gratuity Compliance', 'Minimum Wages Act Compliance Report', 'Fire Safety & Emergency Preparedness', 'Health Insurance', 'Mental Health & Employee Well-being Programs'] },
  { questionNumber: 10, optionId: 2, outcomes: ['Formation of Internal Complaints Committee (ICC)', 'Labour Welfare Fund Contribution', 'Maternity Benefits Act Compliance Report', 'Work Hours & Leave Compliance Report', 'Gratuity Compliance', 'Safety Audit Report'] },
  { questionNumber: 10, optionId: 3, outcomes: ['Employee Awareness Programs', 'Anti-Sexual Harassment Training', 'Minimum Wages Act Compliance Report', 'Third-Party Worker Benefits Compliance Report'] },
  { questionNumber: 10, optionId: 4, outcomes: ['Annual POSH Report Submission to District Officer', 'Employee Exit Compliance Report', 'Contract Labour Compliance Report'] },
  { questionNumber: 10, optionId: 5, outcomes: ['Anti-Sexual Harassment Training', 'Contract Labour Compliance Report'] },
  { questionNumber: 10, optionId: 6, outcomes: ['Work Hours & Leave Compliance Report'] },
  { questionNumber: 10, optionId: 7, outcomes: ['Work Hours & Leave Compliance Report'] },
  { questionNumber: 10, optionId: 8, outcomes: ['Notice Period & Termination Rules Compliance'] },
  { questionNumber: 10, optionId: 9, outcomes: ['Employee Exit Compliance Report'] },
  { questionNumber: 10, optionId: 10, outcomes: ['Mental Health & Employee Well-being Programs'] },
  { questionNumber: 10, optionId: 11, outcomes: ['Fire Safety & Emergency Preparedness', 'Safety Audit Report'] },
  { questionNumber: 10, optionId: 12, outcomes: ['Contract Labour Compliance Report'] },
  { questionNumber: 10, optionId: 13, outcomes: ['Contract Labour Compliance Report'] },
  { questionNumber: 10, optionId: 14, outcomes: ['Contract Labour Compliance Report'] },
  { questionNumber: 10, optionId: 15, outcomes: ['Freelancer Compliance'] },
  { questionNumber: 10, optionId: 16, outcomes: ['Freelancer Compliance'] }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Outcome.deleteMany({});
  await Outcome.insertMany(seedData);
  console.log('✅ Outcomes seeded');
  process.exit();
}

seed();
