const { Sequelize } = require('sequelize');
const config = require('./database');
require('dotenv').config();

// Get the appropriate config for the current environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create sequelize instance
const sequelize = new Sequelize(dbConfig);

module.exports = sequelize;
