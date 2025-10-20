/**
 * Organization Service
 * 
 * Provides organization management and team collaboration features
 * Phase 4: Organization Dashboards
 * 
 * @author AI Environmental Impact Calculator Team
 * @version 4.0.0
 */

const { Organization, OrganizationMember, User, Calculation } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new organization
 * @param {string} name - Organization name
 * @param {number} ownerId - Owner user ID
 * @param {string} description - Organization description (optional)
 * @param {Object} settings - Organization settings (optional)
 * @returns {Promise<Object>} Created organization
 */
async function createOrganization(name, ownerId, description = null, settings = {}) {
  try {
    // Check if user exists
    const owner = await User.findByPk(ownerId);
    if (!owner) {
      throw new Error('Owner user not found');
    }

    // Create organization
    const organization = await Organization.create({
      name,
      description,
      owner_id: ownerId,
      settings: {
        default_region: 'global-average',
        default_model: 'default',
        notifications_enabled: true,
        weekly_reports: false,
        public_stats: false,
        ...settings
      }
    });

    // Add owner as organization member with owner role
    await OrganizationMember.create({
      org_id: organization.id,
      user_id: ownerId,
      role: 'owner',
      invited_by: null,
      joined_at: new Date()
    });

    // Return organization with owner info
    const orgWithOwner = await Organization.findByPk(organization.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log(`✅ Organization "${name}" created by user ${ownerId}`);
    return orgWithOwner;

  } catch (error) {
    console.error('Error creating organization:', error);
    throw new Error('Failed to create organization');
  }
}

/**
 * Get organization by ID with members
 * @param {number} orgId - Organization ID
 * @param {number} userId - User ID (for permission check)
 * @returns {Promise<Object>} Organization details
 */
async function getOrganization(orgId, userId) {
  try {
    // Check if user is member of organization
    const membership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
        is_active: true
      }
    });

    if (!membership) {
      throw new Error('Access denied: Not a member of this organization');
    }

    const organization = await Organization.findByPk(orgId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrganizationMember,
          as: 'memberships',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'avatar_url']
            },
            {
              model: User,
              as: 'inviter',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;

  } catch (error) {
    console.error('Error getting organization:', error);
    throw new Error('Failed to retrieve organization');
  }
}

/**
 * Get user's organizations
 * @param {number} userId - User ID
 * @returns {Promise<Array>} User's organizations
 */
async function getUserOrganizations(userId) {
  try {
    const memberships = await OrganizationMember.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      include: [
        {
          model: Organization,
          as: 'organization',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['joined_at', 'DESC']]
    });

    return memberships.map(membership => ({
      ...membership.organization.toJSON(),
      userRole: membership.role,
      joinedAt: membership.joined_at
    }));

  } catch (error) {
    console.error('Error getting user organizations:', error);
    throw new Error('Failed to retrieve user organizations');
  }
}

/**
 * Invite a user to organization (email-based)
 * @param {number} orgId - Organization ID
 * @param {string} email - User email
 * @param {string} role - Member role
 * @param {number} inviterId - User ID of inviter
 * @returns {Promise<Object>} Invitation result
 */
async function inviteMember(orgId, email, role = 'member', inviterId) {
  try {
    // Check if inviter has permission
    const inviterMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: inviterId,
        is_active: true,
        role: {
          [Op.in]: ['owner', 'admin']
        }
      }
    });

    if (!inviterMembership) {
      throw new Error('Access denied: Insufficient permissions');
    }

    // Find user by email
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found with this email address');
    }

    // Check if user is already a member
    const existingMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: user.id
      }
    });

    if (existingMembership) {
      if (existingMembership.is_active) {
        throw new Error('User is already a member of this organization');
      } else {
        // Reactivate membership
        await existingMembership.update({
          role,
          is_active: true,
          joined_at: new Date(),
          invited_by: inviterId
        });
        
        console.log(`✅ Reactivated membership for user ${user.id} in organization ${orgId}`);
        return {
          success: true,
          message: 'User membership reactivated',
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        };
      }
    }

    // Create new membership
    await OrganizationMember.create({
      org_id: orgId,
      user_id: user.id,
      role,
      invited_by: inviterId,
      joined_at: new Date()
    });

    console.log(`✅ User ${user.id} invited to organization ${orgId} with role ${role}`);
    return {
      success: true,
      message: 'User invited successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

  } catch (error) {
    console.error('Error inviting member:', error);
    throw new Error(error.message || 'Failed to invite member');
  }
}

/**
 * Update member role
 * @param {number} orgId - Organization ID
 * @param {number} userId - User ID to update
 * @param {string} newRole - New role
 * @param {number} updaterId - User ID of updater
 * @returns {Promise<Object>} Update result
 */
async function updateMemberRole(orgId, userId, newRole, updaterId) {
  try {
    // Check if updater has permission
    const updaterMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: updaterId,
        is_active: true,
        role: {
          [Op.in]: ['owner', 'admin']
        }
      }
    });

    if (!updaterMembership) {
      throw new Error('Access denied: Insufficient permissions');
    }

    // Prevent non-owners from promoting to owner
    if (newRole === 'owner' && updaterMembership.role !== 'owner') {
      throw new Error('Only owners can promote users to owner role');
    }

    // Find target membership
    const targetMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
        is_active: true
      }
    });

    if (!targetMembership) {
      throw new Error('User is not a member of this organization');
    }

    // Prevent demoting the last owner
    if (targetMembership.role === 'owner' && newRole !== 'owner') {
      const ownerCount = await OrganizationMember.count({
        where: {
          org_id: orgId,
          role: 'owner',
          is_active: true
        }
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot demote the last owner of the organization');
      }
    }

    // Update role
    await targetMembership.update({ role: newRole });

    console.log(`✅ User ${userId} role updated to ${newRole} in organization ${orgId}`);
    return {
      success: true,
      message: 'Member role updated successfully'
    };

  } catch (error) {
    console.error('Error updating member role:', error);
    throw new Error(error.message || 'Failed to update member role');
  }
}

/**
 * Remove member from organization
 * @param {number} orgId - Organization ID
 * @param {number} userId - User ID to remove
 * @param {number} removerId - User ID of remover
 * @returns {Promise<Object>} Removal result
 */
async function removeMember(orgId, userId, removerId) {
  try {
    // Check if remover has permission
    const removerMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: removerId,
        is_active: true,
        role: {
          [Op.in]: ['owner', 'admin']
        }
      }
    });

    if (!removerMembership) {
      throw new Error('Access denied: Insufficient permissions');
    }

    // Find target membership
    const targetMembership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
        is_active: true
      }
    });

    if (!targetMembership) {
      throw new Error('User is not a member of this organization');
    }

    // Prevent removing the last owner
    if (targetMembership.role === 'owner') {
      const ownerCount = await OrganizationMember.count({
        where: {
          org_id: orgId,
          role: 'owner',
          is_active: true
        }
      });

      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner of the organization');
      }
    }

    // Deactivate membership
    await targetMembership.update({ is_active: false });

    console.log(`✅ User ${userId} removed from organization ${orgId}`);
    return {
      success: true,
      message: 'Member removed successfully'
    };

  } catch (error) {
    console.error('Error removing member:', error);
    throw new Error(error.message || 'Failed to remove member');
  }
}

/**
 * Get organization statistics
 * @param {number} orgId - Organization ID
 * @param {number} userId - User ID (for permission check)
 * @returns {Promise<Object>} Organization statistics
 */
async function getOrganizationStats(orgId, userId) {
  try {
    // Check if user is member of organization
    const membership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
        is_active: true
      }
    });

    if (!membership) {
      throw new Error('Access denied: Not a member of this organization');
    }

    // Get organization member IDs
    const members = await OrganizationMember.findAll({
      where: {
        org_id: orgId,
        is_active: true
      },
      attributes: ['user_id']
    });

    const memberIds = members.map(m => m.user_id);

    // Get aggregated statistics for all members
    const stats = await Calculation.findAll({
      where: {
        user_id: {
          [Op.in]: memberIds
        }
      },
      attributes: [
        [Calculation.sequelize.fn('COUNT', Calculation.sequelize.col('id')), 'totalCalculations'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('tokens')), 'totalTokens'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'totalCo2'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('energy_kwh')), 'totalEnergy']
      ]
    });

    // Get model breakdown
    const modelStats = await Calculation.findAll({
      where: {
        user_id: {
          [Op.in]: memberIds
        }
      },
      attributes: [
        'model',
        [Calculation.sequelize.fn('COUNT', Calculation.sequelize.col('id')), 'count'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('tokens')), 'tokens'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'co2']
      ],
      group: ['model'],
      order: [[Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'DESC']]
    });

    // Get regional breakdown
    const regionalStats = await Calculation.findAll({
      where: {
        user_id: {
          [Op.in]: memberIds
        }
      },
      attributes: [
        'region',
        [Calculation.sequelize.fn('COUNT', Calculation.sequelize.col('id')), 'count'],
        [Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'co2']
      ],
      group: ['region'],
      order: [[Calculation.sequelize.fn('SUM', Calculation.sequelize.col('co2_kg')), 'DESC']]
    });

    const totalStats = stats[0]?.dataValues || {
      totalCalculations: 0,
      totalTokens: 0,
      totalCo2: 0,
      totalEnergy: 0
    };

    return {
      organization: {
        id: orgId,
        memberCount: memberIds.length
      },
      summary: {
        totalCalculations: parseInt(totalStats.totalCalculations) || 0,
        totalTokens: parseInt(totalStats.totalTokens) || 0,
        totalCo2: parseFloat(totalStats.totalCo2) || 0,
        totalEnergy: parseFloat(totalStats.totalEnergy) || 0,
        averageCo2PerCalculation: totalStats.totalCalculations > 0 ? 
          parseFloat(totalStats.totalCo2) / parseInt(totalStats.totalCalculations) : 0
      },
      breakdown: {
        models: modelStats.map(stat => ({
          model: stat.dataValues.model,
          count: parseInt(stat.dataValues.count),
          tokens: parseInt(stat.dataValues.tokens),
          co2: parseFloat(stat.dataValues.co2)
        })),
        regions: regionalStats.map(stat => ({
          region: stat.dataValues.region,
          count: parseInt(stat.dataValues.count),
          co2: parseFloat(stat.dataValues.co2)
        }))
      }
    };

  } catch (error) {
    console.error('Error getting organization stats:', error);
    throw new Error('Failed to retrieve organization statistics');
  }
}

/**
 * Update organization settings
 * @param {number} orgId - Organization ID
 * @param {Object} settings - New settings
 * @param {number} userId - User ID (for permission check)
 * @returns {Promise<Object>} Update result
 */
async function updateOrganizationSettings(orgId, settings, userId) {
  try {
    // Check if user has permission (owner or admin)
    const membership = await OrganizationMember.findOne({
      where: {
        org_id: orgId,
        user_id: userId,
        is_active: true,
        role: {
          [Op.in]: ['owner', 'admin']
        }
      }
    });

    if (!membership) {
      throw new Error('Access denied: Insufficient permissions');
    }

    const organization = await Organization.findByPk(orgId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Merge with existing settings
    const updatedSettings = {
      ...organization.settings,
      ...settings
    };

    await organization.update({ settings: updatedSettings });

    console.log(`✅ Organization ${orgId} settings updated by user ${userId}`);
    return {
      success: true,
      message: 'Organization settings updated successfully',
      settings: updatedSettings
    };

  } catch (error) {
    console.error('Error updating organization settings:', error);
    throw new Error(error.message || 'Failed to update organization settings');
  }
}

module.exports = {
  createOrganization,
  getOrganization,
  getUserOrganizations,
  inviteMember,
  updateMemberRole,
  removeMember,
  getOrganizationStats,
  updateOrganizationSettings
};
