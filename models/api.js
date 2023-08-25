const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Transaction=require('../models/transactions')

const api_names = sequelize.define('api_names', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  api_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

api_names.sync()
  .then(() => {
    console.log('Api model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Api model:', error);
  });

module.exports=api_names;
