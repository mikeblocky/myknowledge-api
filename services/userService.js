const { clerkClient } = require('@clerk/backend');

class UserService {
  /**
   * Get user details from Clerk
   * @param {string} userId - Clerk user ID
   * @returns {Promise<Object>} User object from Clerk
   */
  static async getUserById(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata
      };
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  /**
   * Get multiple users by their IDs
   * @param {string[]} userIds - Array of Clerk user IDs
   * @returns {Promise<Object[]>} Array of user objects
   */
  static async getUsersByIds(userIds) {
    try {
      const users = await clerkClient.users.getUserList({
        userId: userIds
      });
      
      return users.map(user => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt
      }));
    } catch (error) {
      console.error('Error fetching users from Clerk:', error);
      throw new Error('Failed to fetch users data');
    }
  }

  /**
   * Update user metadata
   * @param {string} userId - Clerk user ID
   * @param {Object} metadata - Metadata to update
   * @returns {Promise<Object>} Updated user object
   */
  static async updateUserMetadata(userId, metadata) {
    try {
      const user = await clerkClient.users.updateUser(userId, {
        publicMetadata: metadata
      });
      return user;
    } catch (error) {
      console.error('Error updating user metadata:', error);
      throw new Error('Failed to update user metadata');
    }
  }

  /**
   * Get user's organization memberships
   * @param {string} userId - Clerk user ID
   * @returns {Promise<Object[]>} Array of organization memberships
   */
  static async getUserOrganizations(userId) {
    try {
      const memberships = await clerkClient.users.getOrganizationMembershipList({
        userId: userId
      });
      return memberships;
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw new Error('Failed to fetch user organizations');
    }
  }
}

module.exports = UserService; 