"use strict";

// External dependencies.
var _ = require("underscore");
var UserModel = require("./models/User");
var MainMenuView = require("./views/MainMenu");

// Alias the module for easier identification.
var app = module.exports;

app.user = new UserModel({username: 'arco'});

var menu = new MainMenuView({model: app.user});
menu.render();

// The root path to run the application through.
app.root = '/';
