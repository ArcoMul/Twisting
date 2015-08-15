"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    createAccountTemplate = _.template(require("../templates/create-account.html")),
    UserModel = require("../models/User"),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,

    events: {
        "click button": "create",
        "click a.button-cancel": "destroy"
    },

    initialize: function() {
        var self = this;

        this.render();

        Twister.getUsers(function (users) {

        });
    },

    create: function (e) {
        e.preventDefault();
        var self = this;
        var username = this.$el.find("input[name=username]").val();

        // Insert the given details into the wallet
        Twister.createUser(username, function (err, key) {
            if (err) {
                return console.log('Error creating user:', err);
            }

            app.dispatcher.trigger('open-popup', {
                texts: {
                    main: 'Below is your private key displayed. This random sequence of letters and numbers is your password. Make sure to store this key somewhere safeley.<br />Select the text and use ctrl+c to copy.<br /><br />' + key,
                    button: 'Close'
                },
                onClose: function () {
                    app.changeUser(new UserModel({username: username}));
                    app.user.follow('twister', function (err) {
                        if (err) {
                            return console.log('Error creating following default user:', err);
                        }
                        app.router.navigate('feed', {trigger: true});
                        self.destroy();
                    });
                }
            });
        });
    },

    render: function() {
        this.$el.html(createAccountTemplate());
        return this;
    },

    destroy: function () {
        this.trigger('close');
    }
});
