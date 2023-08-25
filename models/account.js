const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const api=require('./api')


const virtual_account_details = sequelize.define('virtual_account_details', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
 bank:{
    type:DataTypes.STRING,
    allowNull:false
 },
 accountNumber:{
    type:DataTypes.STRING,
    allowNull:false
 },
 ifscCode:{
    type:DataTypes.STRING,
    allowNull:false
 },
 allowedMethods:{
    type:DataTypes.STRING,
    enum:["IMPS","NEFT","RTGS","UPI"]
 },
 transactionLimit:{
    type:DataTypes.DECIMAL,
    allowNull:false
 },
 account_type:{
    type:DataTypes.STRING,
    allowNull:false
 },
 customer_id:{
    type:DataTypes.STRING,
    allowNull:false
 }


}, {
  timestamps: false // Disable automatic timestamps
});



virtual_account_details.sync()
  .then(() => {
    console.log('Account model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Account model:', error);
  });

module.exports = virtual_account_details;
