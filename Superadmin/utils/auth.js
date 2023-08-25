const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

const registerUser = async (userdets, roles, res) => {
  try {
    let idNotTaken = await validateId(userdets.ne5_member_id);

    if (!idNotTaken) {
      return res.status(400).json({
        message: "Id is taken",
        success: false
      });
    }

    let nameNotRegistered = await validateName(userdets.name);
    if (!nameNotRegistered) {
      return res.status(400).json({
        message: "Name is taken",
        success: false
      });
    }

    const hashedPassword = await bcrypt.hash(userdets.password, 12);

    const newUser = await User.create({
      ...userdets,
      password:hashedPassword,
      role: roles
    });

    return res.status(201).json({
      message: "User registered successfully",
      success: true
      
    });
  } catch (e) {
    return res.status(500).json({
      message: "Unable to create account",
      success: false
    });
  }
};
const userLogin=async(userCreds, role,res)=>{
  let {ne5_member_id,password}=userCreds
  const user = await User.findOne({
    where:{
      ne5_member_id:userCreds.ne5_member_id
    }
  })
  
  if(!user){
    res.status(404).json({
      message:"Username is not found. Invalid credentials",
      success:false
    })
  }
  if(!user.role===role){
    res.status(403).json({
      message:"Unauthorized",
      success:false
    })
  }
  let isMatch=bcrypt.compare(password,user.password)
  if(isMatch){
    let token = jwt.sign({role:user.role, ne5_member_id:user.ne5_member_id, password:user.password},secret, {expiresIn:"2h"})
 let result={
  ne5_member_id:user.ne5_member_id,
  role:user.role,
  token:`Bearer ${token}`,
  expiresIn:168
 }

 return res.status(200).json({
  message:"Login successful",
  success:true,
  token
 })
  }else{
    return res.status(403).json({
      message:"Incorrect Password",
      success:false
    })
  }
}

const validateId = async (ne5_member_id) => {
  let user = await User.findOne({ where: { ne5_member_id } });
  return user ? false : true;
};

const validateName = async (name) => {
  let user = await User.findOne({ where: { name } });
  return user ? false : true;
};

module.exports = {
  registerUser,
  userLogin
};
