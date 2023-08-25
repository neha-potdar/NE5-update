const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');


const api_users = sequelize.define('api_users', {
  id:{
    type:DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  ne5_member_id:{
type:DataTypes.STRING,
allowNull:false
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
    
  },
  photo:{
    type:DataTypes.STRING,
    allowNull:true
  },
  ne5_member_id: DataTypes.STRING,
  production_client_id: DataTypes.STRING,
  production_client_secret: DataTypes.STRING,
  staging_client_id: DataTypes.STRING,
  staging_client_secret: DataTypes.STRING,
  
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role:{
    type: DataTypes.STRING,
    allowNull:false
  }
},{
    timestamps: false, // Add timestamps for createdAt and updatedAt
  });
api_users.sync()
  .then(() => {
    console.log('Api users model synchronized successfully');
  })
  .catch((error) => {
    console.error('Error synchronizing Api users model:', error);
  });

module.exports=api_users;
