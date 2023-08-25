const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./user');
const Account = require('./account')


const balance = sequelize.define('balance', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
 balance:{
    type:DataTypes.DECIMAL,
    allowNull:false
 },
 staging_balance:{
    type:DataTypes.DECIMAL,
    allowNull:false
 },
 min_balance:{
    type:DataTypes.DECIMAL,
    allowNull:false
 }
}, {
  timestamps: false // Disable automatic timestamps
});

balance.hasOne(User, {
  foreignKey: 'api_user_id',
  onDelete: 'CASCADE'
});
balance.hasOne(Account, {
  foreignKey: 'api_user_id',
  onDelete: 'CASCADE'
});

balance.sync()
  .then(() => {
    console.log('Balance model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Balance model:', error);
  });

module.exports = balance;
