const mongoose = require('mongoose');
const OutcomeKnowledge = require('../models/OutcomeKnowledge'); // adjust path if needed
const dotenv = require('dotenv');
dotenv.config();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
async function updatePrices() {
  const priceOptions = [400, 500, 600, 700, 800, 900, 1000];
  const outcomes = await OutcomeKnowledge.find();

  for (let outcome of outcomes) {
    const professional_fees = priceOptions[Math.floor(Math.random() * priceOptions.length)];
    const government_fees = priceOptions[Math.floor(Math.random() * priceOptions.length)];
    const total_amount = professional_fees + government_fees;

    outcome.price = {
      professional_fees,
      government_fees,
      total_amount
    };

    await outcome.save();
    console.log(`✅ Updated outcome ${outcome._id}`);
  }

  console.log('🎉 All outcomes updated successfully');
  mongoose.disconnect();
}

updatePrices().catch(console.error);
