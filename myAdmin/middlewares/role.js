const passport = require('passport');
const sequelize = require('../../database/connection');
const { User } = require('../../models/user')
const {Sequelize,DataTypes}=require('sequelize')

async function checkRole(req, res, next) {
    const ne5_member_id = req.body.ne5_member_id;
  
    try {
      // Fetch the user's role from the database
      const sqlQuery = `
        SELECT role
        FROM api_users
        WHERE ne5_member_id = :ne5_member_id
        LIMIT 1;
      `;
  
      const [user, _] = await sequelize.query(sqlQuery, {
        replacements: { ne5_member_id: ne5_member_id },
        type: Sequelize.QueryTypes.SELECT,
      });
  
      // If the user exists in the database
      if (user && user.length > 0) {
        // Get the user's role
        const role = user.role;
        console.log(role)
        // Check if the role is "admin"
        if (role == "Admin") {
          // Role is admin, call the next middleware or route handler
          console.log(role)
          next();
        } else {
          // Role is not admin, return error as Forbidden
          res.status(403).json({ error: "Forbidden" });
        }
      } else {
        // User not found in the database, return error as Forbidden
        res.status(404).json({ error: "Not Found" });
      }
    } catch (err) {
      // Handle any errors that may occur during the database query
      console.error("Error checking user role:", err);
      // You can choose to respond with an error or redirect the user to an error page
      res.status(500).json({ error: "Internal Server Error" });
    }
  }



module.exports = checkRole;
