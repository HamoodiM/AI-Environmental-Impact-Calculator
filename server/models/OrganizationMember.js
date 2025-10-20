/**
 * Organization Member Model
 * 
 * Represents membership in an organization with roles and permissions
 * Phase 4: Organization Dashboards
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OrganizationMember = sequelize.define('OrganizationMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  org_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    allowNull: false,
    defaultValue: 'member',
    validate: {
      isIn: [['owner', 'admin', 'member']]
    }
  },
  invited_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'organization_members',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['org_id', 'user_id']
    },
    {
      fields: ['org_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = OrganizationMember;
