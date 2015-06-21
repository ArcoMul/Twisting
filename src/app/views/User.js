"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    PostModel = require("../models/Post"),
    userDetailTemplate = _.template(require("../templates/user-detail.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    initialize: function(options) {
        var self = this;
        
        this.options = options;
        this.user = options.user;

        this.user.fetchProfile(function (err) {
            if (err) return console.error('Error fetching profile', err);
            self.render();
        });

        app.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
        });

        this.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
        });

        this.user.fetchAvatar(function (err) {
            if (err) return console.error('Error fetch avatar', err);
            self.render();
        });

        self.render();
    },

    toggleFollow: function () {
        var self = this;
        if (app.user.isFollowing(this.model.get('username'))) {
            app.user.unfollow(this.model.get('username'), function (err) {
                if(err) return console.error('Error unfollowing user', err); 
                self.render();    
            });
        } else {
            app.user.follow(this.model.get('username'), function (err) {
                if(err) return console.error('Error following user', err); 
                self.render();    
            });
        }
    },

    render: function() {
        this.$el.html(userDetailTemplate({
            user: this.user
        }));
        return this;
    }
});

