const express = require('express');
const router = express.Router();
const { Note } = require('../models');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/journals:
 *   get:
 *     summary: Get all journal entries for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of journal entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireAuth, async (req, res) => {
  const journals = await Note.find({ isJournal: true, userId: req.userId });
  res.json(journals);
});

/**
 * @swagger
 * /api/journals:
 *   post:
 *     summary: Create a new journal entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Journal entry created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuth, async (req, res) => {
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

/**
 * @swagger
 * /api/journals/{id}:
 *   get:
 *     summary: Get a single journal entry by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Journal entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Journal entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', requireAuth, async (req, res) => {
  const journal = await Note.findOne({ _id: req.params.id, isJournal: true, userId: req.userId });
  if (!journal) return res.status(404).json({ error: 'Journal entry not found' });
  res.json(journal);
});

/**
 * @swagger
 * /api/journals/{id}:
 *   put:
 *     summary: Update a journal entry by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Journal entry updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Journal entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { title, content, tagIds, date, isPinned } = req.body;
  const updated = await Note.findOneAndUpdate(
    { _id: req.params.id, isJournal: true, userId: req.userId },
    { title, content, tagIds, date, isPinned },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Journal entry not found' });
  res.json(updated);
});

/**
 * @swagger
 * /api/journals/{id}:
 *   delete:
 *     summary: Delete a journal entry by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Journal entry deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Journal entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await Note.findOneAndDelete({ _id: req.params.id, isJournal: true, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Journal entry not found' });
  res.json({ success: true });
});

module.exports = router; 