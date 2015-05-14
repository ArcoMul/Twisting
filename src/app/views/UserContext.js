"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    _ = require("underscore"),
    app = require("../app"),
    userContextTemplate = _.template(require("../templates/context-user.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    events: {
        // 'click button': 'toggleFollow'
    },

    initialize: function() {
        var self = this;    

        this.model.fetchProfile(function (err) {
            if (err) return console.error('Error fetching profile', err);
            self.render();
        });

        app.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
        });

        this.model.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.render();
        });

        this.model.fetchAvatar(function (err) {
            if (err) return console.error('Error fetch avatar', err);
            self.render();
        });
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
        this.$el.html(userContextTemplate({app: app, user: this.model}));
        return this;
    }
});
