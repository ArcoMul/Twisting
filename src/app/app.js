"use strict";

// External dependencies.
var _ = require("underscore"),
    gui = window.require('nw.gui'),
    $ = require("jquery"),
    UserModel = require("./models/User"),
    Backbone = require("backbone"),
    MainMenuView = require("./views/MainMenu"),
    MainPageView = require("./views/MainPage");

// Alias the module for easier identification.
var app = module.exports;

app.user = undefined;
app.changeUser = function (user) {
    console.log('Change user to:', user);
    app.user = user;
    app.menuView.trigger('userChange', user);
    app.mainView.trigger('userChange', user);
}

app.menuView = new MainMenuView({model: app.user});
app.mainView = new MainPageView();

app.dispatcher = _.clone(Backbone.Events);
app.dispatcher.on('open-post-detail', function (options) {
    app.mainView.openPostDetail(options);
});
app.dispatcher.on('open-user-profile', function (options) {
    app.mainView.openUserProfile(options);
});
app.dispatcher.on('open-mentions', function (options) {
    app.mainView.openMentions(options);
});

// The root path to run the application through.
app.root = '/';
