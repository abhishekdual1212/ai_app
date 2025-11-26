const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('UserSession', UserSessionSchema);
