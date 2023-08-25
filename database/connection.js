// database/connection.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  "ne5",
  "root",
  "",
  {
    host: "localhost",
    port:"3306",
    dialect: 'mysql',
  }
);
try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

module.exports = sequelize;
