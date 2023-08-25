const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Api = require('./api');


const transaction = sequelize.define('transaction', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  credit_debit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  narration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transaction_time: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false // Disable automatic timestamps
});

transaction.hasMany(Api, {
  foreignKey: 'api_id',
  onDelete: 'CASCADE'
});

transaction.sync()
  .then(() => {
    console.log('Transaction model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Transaction model:', error);
  });

module.exports = transaction;
