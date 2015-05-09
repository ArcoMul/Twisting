"use strict";

// External dependencies.
var _ = require("underscore"),
    gui = window.require('nw.gui'),
    $ = require("jquery"),
    UserModel = require("./models/User"),
    MainMenuView = require("./views/MainMenu"),
    MainPageView = require("./views/MainPage");

// Alias the module for easier identification.
var app = module.exports;
var win = gui.Window.get();
var maximized = false;

app.user = undefined;
app.changeUser = function (user) {
    console.log('Change user to:', user);
    app.user = user;
    app.menuView.trigger('userChange', user);
    app.mainView.trigger('userChange', user);
}

app.menuView = new MainMenuView({model: app.user});
app.mainView = new MainPageView();

// The root path to run the application through.
app.root = '/';

$("#window-controls .close").on('click', function () {
    win.close();    
});
$("#window-controls .minimize").on('click', function () {
    win.minimize();    
});
$("#window-controls .scale").on('click', function () {
    if (maximized) {
        win.unmaximize();
        maximized = false;
    } else {
        win.maximize();
        maximized = true;
    }
});
