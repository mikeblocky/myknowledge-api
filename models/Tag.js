const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#999' },
  userId: { type: String, required: true }, // Clerk user ID
});

module.exports = mongoose.model('Tag', tagSchema); 