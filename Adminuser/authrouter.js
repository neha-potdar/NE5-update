var express = require('express');
var authrouter = express.Router();


authrouter.get('/login', function (req, res) {
      res.render('Auth/auth_login');
});
authrouter.get('/register', function (req, res) {
      res.render('Auth/auth_register');
});
module.exports = authrouter;