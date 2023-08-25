var app = require('express')();

var express = require('express');
var path = require('path');
var http = require('http').Server(app);
var validator = require('express-validator');
var cors=require('cors')
const axios = require("axios")


// import controller
var AuthController = require('./AuthController');
var Transaction=require('../models/transactions')
var Api=require('../models/api')


// import Router file
var pageRouter = require('./routers/route');

var session = require('express-session');
var bodyParser = require('body-parser');
const passport = require('passport')
const passportlocal=require('passport-local')
let localStrategy=passportlocal.Strategy
var flash = require('connect-flash');
var i18n = require("i18n-express");
var corsOptions={
  origin:"http://localhost:8000"
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions))




app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1200000
  }
}));

app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(flash());
app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
  siteLangs: ["es", "en", "de", "ru", "it", "fr"],
  textsVarName: 'translation'
}));

app.use('/public', express.static('public'));

app.get('/layouts/', function (req, res) {
  res.render('view');
});

// apply controller
AuthController(app);

//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname,'views')))
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Define All Route 
pageRouter(app);

app.get('/', function (req, res) {
  res.redirect('/');
});

http.listen(8000, function () {
  console.log('listening on *:8000');
});
