/**
 * Organization Model
 * 
 * Represents an organization/team for collaborative environmental impact tracking
 * Phase 4: Organization Dashboards
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      default_region: 'global-average',
      default_model: 'default',
      notifications_enabled: true,
      weekly_reports: false,
      public_stats: false
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'organizations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['owner_id']
    },
    {
      fields: ['name']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Organization;
