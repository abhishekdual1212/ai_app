const mongoose = require('mongoose');
const {LegalCatalog} = require('../models/LegalCatalog');
const dotenv = require('dotenv');
dotenv.config();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const assignPricesToIntents = async () => {
  const samplePrices = [400, 500, 600];

  try {
    const catalogs = await LegalCatalog.find();

    for (const catalog of catalogs) {
      for (const service of catalog.services) {
        for (const intent of service.intents) {
          const professional_fees = randomFrom(samplePrices);
          const government_fees = randomFrom(samplePrices);
          const total_amount = professional_fees + government_fees;

          // Assign price object
          intent.price = {
            professional_fees,
            government_fees,
            total_amount
          };
        }
      }

      // Save updated catalog
      await catalog.save();
    }

    console.log('✅ All intents updated with random prices.');
  } catch (err) {
    console.error('❌ Error updating intents:', err);
  } finally {
    mongoose.connection.close();
  }
};

assignPricesToIntents();
