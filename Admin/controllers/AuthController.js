var express = require('express');
var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
const APIUser=require('../models/user')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const authenticateUser=require('./middleware/auth')

var validator = require('express-validator');

var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");

// This sets the mock adapter on the default instance
var mock = new MockAdapter(axios);

let users = [
	{ id: 1, username: 'admin', password: '123456', email: 'admin@themesbrand.com' }
];

// Mock GET request to /users when param `searchText` is 'John'
mock.onGet("/users", { params: { searchText: "John" } }).reply(200, {
	users: users,
});

module.exports = function (app) {

	// Inner Auth
	app.get('/pages-login', function (req, res) {
		res.locals = { title: 'Login' };
		res.render('AuthInner/pages-login');
	});
	app.get('/pages-register', function (req, res) {
		res.locals = { title: 'Register' };
		res.render('AuthInner/pages-register');
	});
	app.get('/pages-recoverpw', function (req, res) {
		res.locals = { title: 'Recover Password' };
		res.render('AuthInner/pages-recoverpw');
	});
	app.get('/pages-lock-screen', function (req, res) {
		res.locals = { title: 'Lock Screen' };
		res.render('AuthInner/pages-lock-screen');
	});


	// Auth Pages

	app.get('/pages-maintenance', function (req, res) {
		res.locals = { title: 'Maintenance' };
		res.render('Pages/pages-maintenance');
	});
	app.get('/pages-comingsoon', function (req, res) {
		res.locals = { title: 'Coming Soon' };
		res.render('Pages/pages-comingsoon');
	});
	app.get('/pages-404', function (req, res) {
		res.locals = { title: 'Error 404' };
		res.render('Pages/pages-404');
	});
	app.get('/pages-500', function (req, res) {
		res.locals = { title: 'Error 500' };
		res.render('Pages/pages-500');
	});


	app.get('/register', function (req, res) {
		if (req.user) { res.redirect('Dashboard/index'); }
		else {
			res.render('Auth/auth-register', { 'message': req.flash('message'), 'error': req.flash('error') });
		}
	});

	app.post('/post-register', urlencodeParser, function (req, res) {
		let tempUser = { username: req.body.name, password: req.body.password };
		users.push(tempUser);

		// Assign value in session
		sess = req.session;
		sess.user = tempUser;

		res.redirect('/');
	});
	app.post('/post-login', urlencodeParser,checkSuperadminRole,async function (req, res) {
		const ne5_member_id=req.body.ne5_member_id
		const password=req.body.password
		const sqlQuery = `
		SELECT * 
		FROM api_users
		WHERE ne5_member_id = :ne5_member_id
		LIMIT 1;
	  `;

		 const [validUser, _] = await sequelize.query(sqlQuery, {
      replacements: { ne5_member_id: ne5_member_id },
      type: Sequelize.QueryTypes.SELECT,
    });
		if (validUser.password===password) {

			// Assign value in session
			req.session.validUser=validUser
			res.redirect('/')
		} else {
			req.flash('error', 'Incorrect email or password!');
			res.redirect('/login',{'login':validUser,
		'message':'Could not authenticate with given details','active':validUser});
		}
	});



	app.get('/login', function (req, res) {
		res.render('Auth/auth-login', { 'message': req.flash('message'), 'error': req.flash('error') });
	});
	async function checkSuperadminRole(req, res, next) {
		const ne5_member_id = req.body.ne5_member_id;
		console.log(ne5_member_id)
	  
		try {
		  // Fetch the user's role from the database
		  const sqlQuery = `
			SELECT role,id
			FROM api_users
			WHERE ne5_member_id = :ne5_member_id
			LIMIT 1;
		  `;
			
		  const [user, _] = await sequelize.query(sqlQuery, {
			replacements: { ne5_member_id: ne5_member_id },
			type: Sequelize.QueryTypes.SELECT,
		  });
		  console.log(user)
	  
		  // If the user exists in the database and has a role property
		  console.log("Usern: ",  user.role);
		  if ( user) {
			// Get the user's role
			console.log("Inside if")
			const role = user.role;
			const userId = user.user_id;
			
	  
			// Check if the role is "admin"
			if (role === "Admin") {
				// Role is superadmin, allow access to all routes
				req.isAdmin = true; // Set a flag to indicate the user is an admin
				req.isSuperAdmin = true;
				 // Set a flag to indicate the user is a superadmin
				next();
			  } else  {
				// Role is neither admin nor superadmin, return error as Forbidden
				res.status(403).json({ error: "Forbidden - Superadmin role required" });
			  }
			} else {
			  // User not found in the database or doesn't have a role, return error as Forbidden
			  res.status(403).json({ error: "Forbidden - Superadmin role required" });
			}
		  } catch (err) {
			// Handle any errors that may occur during the database query
			console.error("Error checking user role:", err);
			// You can choose to respond with an error or redirect the user to an error page
			res.status(500).json({ error: "Internal Server Error" });
		  }
		}
		function isAdmin(req, res, next) {
			if (req.userRole === 'Admin') {
			  next();
			} else {
			  res.status(403).json({ error: 'Forbidden - Admin role required' });
			}
		  }
	 

	
		
	
	  

	app.get('/forgot-password', function (req, res) {
		res.render('Auth/auth-forgot-password', { 'message': req.flash('message'), 'error': req.flash('error') });
	});

	app.post('/post-forgot-password', urlencodeParser, function (req, res) {
		const validUser = users.filter(usr => usr.email === req.body.email);
		if (validUser['length'] === 1) {
			req.flash('message', 'We have e-mailed your password reset link!');
			res.redirect('/forgot-password');
		} else {
			req.flash('error', 'Email Not Found !!');
			res.redirect('/forgot-password');
		}
	});

	app.get('/logout', function (req, res) {

		// Assign  null value in session
		sess = req.session;
		sess.user = null;

		res.redirect('/login');
	});


};