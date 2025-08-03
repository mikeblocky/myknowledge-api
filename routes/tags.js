const express = require('express');
const router = express.Router();
const { Note, Tag } = require('../models');
const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', requireAuth, async (req, res) => {
  const tags = await Tag.find({ userId: req.userId });
  res.json(tags);
});

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       200:
 *         description: Tag created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', requireAuth, async (req, res) => {
  const { name, color } = req.body;
  const tag = new Tag({ name, color, userId: req.userId });
  await tag.save();
  res.json(tag);
});

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag by ID
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
 *             $ref: '#/components/schemas/Tag'
 *     responses:
 *       200:
 *         description: Tag updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag not found
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
  const { name, color } = req.body;
  const updated = await Tag.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { ...(name !== undefined && { name }), ...(color !== undefined && { color }) },
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: 'Tag not found' });
  res.json(updated);
});

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag by ID
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
 *         description: Tag deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Tag not found
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
  const deleted = await Tag.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Tag not found' });
  // Remove tag ID from all related notes for this user
  await Note.updateMany(
    { tagIds: req.params.id, userId: req.userId },
    { $pull: { tagIds: req.params.id } }
  );
  res.json({ success: true });
});

module.exports = router; 