var app = require('express')();

var express = require('express');
var path = require('path');
var http = require('http').Server(app);
var validator = require('express-validator');
var cors=require('cors')
const flash=require('connect-flash')
const axios = require("axios")
require('dotenv').config()
const Sequelize = require('sequelize')
const qrcode=require('qrcode')
const cookieParser=require('cookie-parser')
const helmet=require('helmet')





// import controller
var AuthController = require('./controllers/AuthController');
var Transaction=require('../models/transactions')
var Api=require('../models/api')
const { createCanvas, registerFont } = require('canvas');

// import Router file
var pageRouter = require('./routes/route');

var session = require('express-session');
var bodyParser = require('body-parser');

var i18n = require("i18n-express");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));

app.use(cookieParser())
app.use(session({
  name:'daffyduck',
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure:false,
    expires: 1200000
  }
}));
app.set('trust proxy',1)


app.use(session({ resave: false, saveUninitialized: true, secret: 'nodedemo' }));
app.use(
  session({
    secret: 'dwhjbewhfewiufhncdsjkncrjejei',
    resave: false,
    saveUninitialized: true
  })
);
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
  res.redirect('/register');
});


http.listen(8000, function () {
  console.log('listening on *:8000');
});
