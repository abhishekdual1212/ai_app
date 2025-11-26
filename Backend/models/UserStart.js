const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema(
  {
    providerId: { type: String },
    uid: { type: String },
    email: { type: String },
    displayName: { type: String },
    photoURL: { type: String },
    phoneNumber: { type: String },
  },
  { _id: false }
);

const UserStartSchema = new mongoose.Schema(
  {
    userid: { type: String, required: true, unique: true, index: true },

    email: { type: String, index: true },
    emailVerified: { type: Boolean, default: false },

    displayName: { type: String },
    photoURL: { type: String },

    providerData: { type: [ProviderSchema], default: [] },

    creationTime: { type: Date },
    lastSignInTime: { type: Date },

    brandname: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  {
    collection: 'userstart',
    timestamps: true,
  }
);

module.exports = mongoose.model('UserStart', UserStartSchema);
