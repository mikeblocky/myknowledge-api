const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: String, default: () => new Date().toISOString() },
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  isPinned: Boolean,
  isJournal: Boolean,
  userId: { type: String, required: true }, // Clerk user ID
});

module.exports = mongoose.model('Note', noteSchema); 