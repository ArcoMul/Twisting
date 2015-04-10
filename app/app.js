"use strict";

// External dependencies.
var _ = require("underscore"),
    UserModel = require("./models/User"),
    MainMenuView = require("./views/MainMenu"),
    MainPageView = require("./views/MainPage");

// Alias the module for easier identification.
var app = module.exports;

app.user = new UserModel({username: 'arco'});

app.menuView = new MainMenuView({model: app.user});

app.mainView = new MainPageView();

// The root path to run the application through.
app.root = '/';
