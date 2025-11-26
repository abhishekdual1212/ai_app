const Service = require('../models/Service');
const Intent = require('../models/Intent');

async function createServiceAndLinkIntents({ name, type, category, description, intentNames }) {
  const intentLabels = [];

  for (const label of intentNames) {
    let intent = await Intent.findOne({ label });

    if (!intent) {
      intent = await Intent.create({
        label,
        description: `${label} (auto-created)`,
        services: [type]
      });
    } else if (!intent.services.includes(type)) {
      intent.services.push(type);
      await intent.save();
    }

    intentLabels.push(intent.label);
  }

  const service = await Service.create({
    name,
    type,
    category,
    description,
    status: 'active',
    intents: intentLabels
  });

  return service;
}

module.exports = createServiceAndLinkIntents;
