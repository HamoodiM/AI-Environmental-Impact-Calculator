const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Calculation = sequelize.define('Calculation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  energy_kwh: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  co2_kg: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  equivalences: {
    type: DataTypes.JSON,
    allowNull: false
  },
  source: {
    type: DataTypes.ENUM('manual', 'openai_api', 'import'),
    defaultValue: 'manual'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'calculations',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['model']
    },
    {
      fields: ['region']
    }
  ]
});

module.exports = Calculation;
