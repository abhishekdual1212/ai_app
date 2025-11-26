const mongoose = require('mongoose');
const {LegalCatalog} = require('../models/LegalCatalog');

// Connect to your MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/abyd', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedData = [
  {
    sector: 'IPR',
    services: [
      {
        name: 'Trademark',
        intents: [
          { name: 'File in India (Trademark)' },
          { name: 'File international' },
          { name: 'Help with Objection' },
          { name: 'Help with cease and desist' },
          { name: 'Litigation/ opposition assistance' },
          { name: 'Want to file an infringement claim' },
          { name: 'Any other' }
        ]
      },
      {
        name: 'Copyright',
        intents: [
          { name: 'File in India (Copyright)' },
          { name: "Respond to Registrar's Objections" },
          { name: 'Respond to infringement claim' },
          { name: 'Want to file an infringement claim' },
          { name: 'Any other' }
        ]
      },
      {
        name: 'Patent',
        intents: [
          { name: 'Prior art search' },
          { name: 'Provisional patent filing' },
          { name: 'Complete patent filing' },
          { name: 'License or Assign your patent' },
          { name: 'Enforce your patent rights - file cease and desist' },
          { name: 'Received an infringement notice' },
          { name: 'Help with renewal' },
          { name: 'Want to file under the PCT' },
          { name: 'Respond to Examination Reports' },
          { name: 'Pre-grant opposition or post-grant opposition' },
          { name: 'Any other' }
        ]
      },
      {
        name: 'Design',
        intents: [
          { name: 'Registering your design' },
          { name: 'Need help with objections' },
          { name: 'Received an infringement claim' }
        ]
      }
    ]
  },
  {
    sector: '', // No sector
    services: [
      {
        name: 'Contract',
        intents: [
          { name: 'Notice & Demand Letters' },
          { name: 'Non-Disclosure Agreements (NDA)' },
          { name: 'Employment Agreements' },
          { name: 'Master Service Agreements (MSA)' },
          { name: 'End User License Agreements (EULA)' },
          { name: 'Tri-Party Agreements' },
          { name: 'Shareholder & Founder Agreements' },
          { name: 'Joint Venture Agreements' },
          { name: 'Lease & Rental Agreements' },
          { name: 'Franchise Agreements' },
          { name: 'Supply Chain & Vendor Contracts' },
          { name: 'Employment Contracts (Full-time, Part-time, Remote)' },
          { name: 'Any other' }
        ]
      },
     
    ]
  },
{
  sector: "",  // No sector
  services: [
    {
      name: "",  // No service
      intents: [
        { name: "Fractional Legal Counsel" }
      ]
    }
  ]
}
,

  {
    sector: 'Privacy',
    services: [
      {
        name: 'Agreements and Contracts',
        intents: [
          { name: 'Privacy policy' },
          { name: 'Terms of service' },
          { name: 'Data Processing Agreement (DPA)' },
          { name: 'Cross-Border Data Transfer Agreements' },
          { name: 'Third-Party Data Sharing Agreements' }
        ]
      },
      {
        name: 'Compliance',
        intents: [
          { name: 'Automated Decision-Making System (AI systems) Audit' },
          { name: 'DPIA' },
          { name: 'Privacy Compliance Report according to DPDPA' }
        ]
      }
    ]
  },
  {
    sector: 'Labour Law',
    services: [
      {
        name: 'Labour Law',
        intents: [
          { name: 'POSH Policy' },
          { name: 'HR Policy' },
          { name: 'POSH Training + Certificate' },
          { name: 'Annual POSH Return Filing' }
        ]
      }
    ]
  }
];

(async () => {
  try {
    await LegalCatalog.deleteMany({});
    await LegalCatalog.insertMany(seedData);
    console.log('✅ LegalCatalog Seed completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.disconnect();
  }
})();
