// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { verifyToken } = require('@clerk/backend');


console.log('Is CLERK_JWT_KEY set in this environment?', !!process.env.CLERK_JWT_KEY); 

const app = express();
app.use(cors({
  origin: [
    'https://myknowledge-phi.vercel.app', // your Vercel frontend URL
    'http://localhost:3000' // for local development
  ],
  credentials: true,
}));
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
  userId: { type: String, required: true }, // Clerk user ID
});

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#999' },
  userId: { type: String, required: true }, // Clerk user ID
});

const Note = mongoose.model('Note', noteSchema);
const Tag = mongoose.model('Tag', tagSchema);

// Clerk JWT verification middleware
// The final, correct requireAuth function
async function requireAuth(req, res, next) {
  console.log('Authorization header:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    // This is the correct way to call the function.
    // We pass an options object that explicitly uses the environment variable.
    const payload = await verifyToken(token, { 
      jwtKey: process.env.CLERK_JWT_KEY 
    });

    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    // Add more detail to your error logging for future debugging
    return res.status(401).json({ error: 'Invalid token', details: err.message, reason: err.reason });
  }
}

// --- Notes Endpoints ---
app.get('/api/notes', requireAuth, async (req, res) => {
  const notes = await Note.find({ userId: req.userId });
  res.json(notes);
});

app.post('/api/notes', requireAuth, async (req, res) => {
  const { title, content, tagIds, date, isPinned, isJournal } = req.body;
  const note = new Note({
    title,
    content,
    tagIds,
    date: date ? new Date(date).toISOString() : undefined,
    isPinned,
    isJournal,
    userId: req.userId,
  });
  await note.save();
  res.json(note);
});

app.get('/api/notes/:id', requireAuth, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.put('/api/notes/:id', requireAuth, async (req, res) => {
  const { title, content, tagIds, date, isPinned, isJournal } = req.body;
  const updated = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { title, content, tagIds, date, isPinned, isJournal },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json(updated);
});

app.delete('/api/notes/:id', requireAuth, async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

// --- Journals Endpoints ---
app.get('/api/journals', requireAuth, async (req, res) => {
  const journals = await Note.find({ isJournal: true, userId: req.userId });
  res.json(journals);
});

app.post('/api/journals', requireAuth, async (req, res) => {
  const { title, content, tagIds, date, isPinned } = req.body;
  const journal = new Note({
    title,
    content,
    tagIds,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    isPinned: typeof isPinned === 'boolean' ? isPinned : false,
    isJournal: true,
    userId: req.userId,
  });
  await journal.save();
  res.json(journal);
});

app.get('/api/journals/:id', requireAuth, async (req, res) => {
  const journal = await Note.findOne({ _id: req.params.id, isJournal: true, userId: req.userId });
  if (!journal) return res.status(404).json({ error: 'Journal entry not found' });
  res.json(journal);
});

app.put('/api/journals/:id', requireAuth, async (req, res) => {
  const { title, content, tagIds, date, isPinned } = req.body;
  const updated = await Note.findOneAndUpdate(
    { _id: req.params.id, isJournal: true, userId: req.userId },
    { title, content, tagIds, date, isPinned },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Journal entry not found' });
  res.json(updated);
});

app.delete('/api/journals/:id', requireAuth, async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, isJournal: true, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Journal entry not found' });
  res.json({ success: true });
});

// --- Tags Endpoints ---
app.get('/api/tags', requireAuth, async (req, res) => {
  const tags = await Tag.find({ userId: req.userId });
  res.json(tags);
});

app.post('/api/tags', requireAuth, async (req, res) => {
  const { name, color } = req.body;
  const tag = new Tag({ name, color, userId: req.userId });
  await tag.save();
  res.json(tag);
});

app.put('/api/tags/:id', requireAuth, async (req, res) => {
  const { name, color } = req.body;
  const updated = await Tag.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...(name !== undefined && { name }), ...(color !== undefined && { color }) },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: 'Tag not found' });
  res.json(updated);
});

app.delete('/api/tags/:id', requireAuth, async (req, res) => {
  const deleted = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Tag not found' });
  // Remove tag ID from all related notes for this user
  await Note.updateMany(
    { tagIds: req.params.id, userId: req.userId },
    { $pull: { tagIds: req.params.id } }
  );
  res.json({ success: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
