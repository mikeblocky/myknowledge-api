const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const UserService = require('../services/userService');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.userId);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       404:
 *         description: User not found
 */
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    // For now, only allow users to fetch their own profile
    // You can add admin checks here later
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await UserService.getUserById(req.params.userId);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @swagger
 * /api/users/me/metadata:
 *   put:
 *     summary: Update current user metadata
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 description: Metadata to update
 *     responses:
 *       200:
 *         description: User metadata updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/me/metadata', requireAuth, async (req, res) => {
  try {
    const { metadata } = req.body;
    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({ error: 'Metadata object is required' });
    }

    const updatedUser = await UserService.updateUserMetadata(req.userId, metadata);
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    res.status(500).json({ error: 'Failed to update user metadata' });
  }
});

/**
 * @swagger
 * /api/users/me/organizations:
 *   get:
 *     summary: Get current user's organizations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's organization memberships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me/organizations', requireAuth, async (req, res) => {
  try {
    const organizations = await UserService.getUserOrganizations(req.userId);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    res.status(500).json({ error: 'Failed to fetch user organizations' });
  }
});

module.exports = router; 