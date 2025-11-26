const mongoose = require('mongoose');
const dotenv = require('dotenv');
const createServiceAndLinkIntents = require('../utils/createServiceAndLinkIntents');

dotenv.config(); // loads MONGODB_URI

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    await createServiceAndLinkIntents({
      name: "Design Protection",
      type: "design",
      category: "intellectual_property",
      description: "Protect your industrial designs and UI work",
      intentNames: ["File in India", "Design Registration", "Cease and Desist"]
    });

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error:", err);
    mongoose.disconnect();
  });
