const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const crypto = require('crypto');

const ApiKey = sequelize.define('ApiKey', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  provider: {
    type: DataTypes.ENUM('openai', 'anthropic', 'google'),
    allowNull: false
  },
  encrypted_key: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  key_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_used: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'api_keys',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['provider']
    },
    {
      fields: ['is_active']
    }
  ],
  hooks: {
    beforeCreate: (apiKey) => {
      // Hash the key for quick lookup
      apiKey.key_hash = crypto.createHash('sha256').update(apiKey.encrypted_key).digest('hex');
    }
  }
});

module.exports = ApiKey;
