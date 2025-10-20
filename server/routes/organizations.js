/**
 * Organization API Routes
 * 
 * Provides endpoints for organization management and team collaboration
 * Phase 4: Organization Dashboards
 */

const express = require('express');
const router = express.Router();
const organizationService = require('../services/organization');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/organizations
 * Create a new organization
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Organization name is required'
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Organization name must be less than 255 characters'
      });
    }

    const organization = await organizationService.createOrganization(
      name.trim(),
      req.user.id,
      description?.trim() || null,
      settings || {}
    );
    
    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create organization'
    });
  }
});

/**
 * GET /api/organizations/health
 * Health check for organization service
 */
router.get('/health', verifyToken, async (req, res) => {
  try {
    // Test organization service with a simple query
    const organizations = await organizationService.getUserOrganizations(req.user.id);
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'organizations',
        version: '4.0.0',
        features: {
          createOrganization: true,
          inviteMembers: true,
          roleManagement: true,
          statistics: true,
          settingsManagement: true
        },
        testResult: {
          userOrganizations: organizations.length
        }
      }
    });
  } catch (error) {
    console.error('Organization health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Organization service health check failed',
      details: error.message
    });
  }
});

/**
 * GET /api/organizations
 * Get user's organizations
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const organizations = await organizationService.getUserOrganizations(req.user.id);
    
    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Error getting user organizations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve organizations'
    });
  }
});

/**
 * GET /api/organizations/:id
 * Get organization details
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }

    const organization = await organizationService.getOrganization(orgId, req.user.id);
    
    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error getting organization:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve organization'
    });
  }
});

/**
 * GET /api/organizations/:id/stats
 * Get organization statistics
 */
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }

    const stats = await organizationService.getOrganizationStats(orgId, req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting organization stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve organization statistics'
    });
  }
});

/**
 * POST /api/organizations/:id/invite
 * Invite a user to organization
 */
router.post('/:id/invite', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const { email, role = 'member' } = req.body;
    
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: owner, admin, member'
      });
    }

    const result = await organizationService.inviteMember(
      orgId,
      email.trim().toLowerCase(),
      role,
      req.user.id
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to invite member'
    });
  }
});

/**
 * GET /api/organizations/:id/members
 * Get organization members
 */
router.get('/:id/members', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }

    const organization = await organizationService.getOrganization(orgId, req.user.id);
    
    // Format members data
    const members = organization.memberships.map(membership => ({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      avatar_url: membership.user.avatar_url,
      role: membership.role,
      joined_at: membership.joined_at,
      invited_by: membership.inviter ? {
        id: membership.inviter.id,
        name: membership.inviter.name,
        email: membership.inviter.email
      } : null
    }));
    
    res.json({
      success: true,
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          description: organization.description
        },
        members
      }
    });
  } catch (error) {
    console.error('Error getting organization members:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve organization members'
    });
  }
});

/**
 * PUT /api/organizations/:id/members/:userId
 * Update member role
 */
router.put('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const { role } = req.body;
    
    if (isNaN(orgId) || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID or user ID'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: owner, admin, member'
      });
    }

    const result = await organizationService.updateMemberRole(
      orgId,
      userId,
      role,
      req.user.id
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update member role'
    });
  }
});

/**
 * DELETE /api/organizations/:id/members/:userId
 * Remove member from organization
 */
router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(orgId) || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID or user ID'
      });
    }

    const result = await organizationService.removeMember(
      orgId,
      userId,
      req.user.id
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove member'
    });
  }
});

/**
 * PUT /api/organizations/:id/settings
 * Update organization settings
 */
router.put('/:id/settings', verifyToken, async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const { settings } = req.body;
    
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID'
      });
    }

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required'
      });
    }

    const result = await organizationService.updateOrganizationSettings(
      orgId,
      settings,
      req.user.id
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update organization settings'
    });
  }
});

module.exports = router;
