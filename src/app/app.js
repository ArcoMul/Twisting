"use strict";

// External dependencies.
var _ = require("underscore"),
    gui = window.require('nw.gui'),
    $ = require("jquery"),
    UserModel = require("./models/User"),
    Backbone = require("backbone"),
    MainMenuView = require("./views/MainMenu"),
    PopupView = require("./views/Popup"),
    ConfirmPopupView = require("./views/ConfirmPopup"),
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

app.dispatcher = _.clone(Backbone.Events);
app.menuView = new MainMenuView({model: app.user});
app.mainView = new MainPageView();

app.dispatcher.on('open-post-detail', function (options) {
    app.mainView.openPostDetail(options);
});
app.dispatcher.on('open-user-profile', function (options) {
    app.mainView.openUserProfile(options);
});
app.dispatcher.on('open-following', function (options) {
    app.mainView.openFollowing(options);
});
app.dispatcher.on('open-mentions', function (options) {
    app.mainView.openMentions(options);
});
app.dispatcher.on('open-popup', function (options) {
    app.mainView.showPopup(PopupView, options);
});
app.dispatcher.on('open-confirm-popup', function (options) {
    app.mainView.showPopup(ConfirmPopupView, options);
});

// The root path to run the application through.
app.root = '/';
