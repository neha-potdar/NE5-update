const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');


const users_api_plans = sequelize.define('users_api_plans', {
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true
  
  }
  ,api_user_id:{
    type:DataTypes.STRING,
    allowNull:false
  },
  api_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  api_alias_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price:{
    type:DataTypes.INTEGER,
    allowNull:false

  },
  price2:{
    type:DataTypes.INTEGER,
    allowNull:false

  },
  price3:{
    type:DataTypes.INTEGER,
    allowNull:false

  },
  price4:{
    type:DataTypes.INTEGER,
    allowNull:false

  },
  type:{
    type:DataTypes.INTEGER,
    allowNull:false
  },
  comments:{
    type:DataTypes.STRING,
    allowNull:false
  },
  enable:{
    type:DataTypes.INTEGER,
    allowNull:false
  }
},{timestamps:false});
users_api_plans.sync()
  .then(() => {
    console.log('Api model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Api model:', error);
  });

module.exports=users_api_plans;
