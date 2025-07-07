// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: String, default: () => new Date().toISOString() },
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  isPinned: Boolean,
  isJournal: Boolean,
});

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#999' },
});

const Note = mongoose.model('Note', noteSchema);
const Tag = mongoose.model('Tag', tagSchema);

// Get all notes
app.get('/notes', async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// Add note
app.post('/notes', async (req, res) => {
  const { title, content, tagIds, date, isPinned, isJournal } = req.body;
  const note = new Note({
    title,
    content,
    tagIds,
    date: date ? new Date(date).toISOString() : undefined,
    isPinned,
    isJournal,
  });
  await note.save();
  res.json(note);
});

// Update note
app.put('/notes/:id', async (req, res) => {
  const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Delete note
app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get tags
app.get('/tags', async (req, res) => {
  const tags = await Tag.find();
  res.json(tags);
});

// Add tag
app.post('/tags', async (req, res) => {
  const tag = new Tag(req.body);
  await tag.save();
  res.json(tag);
});

// Delete tag
// Delete tag by ID
app.delete('/tags/:id', async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);

    // (Optional) Remove tag ID from all related notes
    await Note.updateMany(
      { tagIds: req.params.id },
      { $pull: { tagIds: req.params.id } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update tag by ID
app.put('/tags/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (name === undefined && color === undefined) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }
    const updated = await Tag.findByIdAndUpdate(
      req.params.id,
      { ...(name !== undefined && { name }), ...(color !== undefined && { color }) },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Journal Endpoints ---
// Get all journal entries
app.get('/journals', async (req, res) => {
  const journals = await Note.find({ isJournal: true });
  res.json(journals);
});

// Add journal entry
app.post('/journals', async (req, res) => {
  const { title, content, tagIds, date, isPinned } = req.body;
  const journal = new Note({
    title,
    content,
    tagIds,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    isPinned: typeof isPinned === 'boolean' ? isPinned : false,
    isJournal: true,
  });
  await journal.save();
  res.json(journal);
});

// Update journal entry
app.put('/journals/:id', async (req, res) => {
  const updated = await Note.findOneAndUpdate(
    { _id: req.params.id, isJournal: true },
    req.body,
    { new: true }
  );
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Journal entry not found' });
  }
  res.json(updated);
});

// Delete journal entry
app.delete('/journals/:id', async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, isJournal: true });
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Journal entry not found' });
  }
  res.json({ success: true });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
