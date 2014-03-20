define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var $ = require("jquery.jsonrpcclient");
    var Backbone = require("backbone");
    var app = require("app");
    var userProfileTemplate = _.template(require("text!templates/user-profile.html"));
    var PostsCollection = require("collections/posts");
    var PostModel = require("models/Post");
    var Twister = require("Twister");

    module.exports = Backbone.View.extend({

        posts: null,

        events: {
            "click a": "navigate",
        },

        initialize: function() {
            console.log("Initialize user profile");
            
            var self = this;

            this.posts = new PostsCollection();

            Twister.getPosts(this.model.get('username'), 10, function (err, data) {
                if (err) {
                    console.log('Error getting user posts:', err);
                    return;
                }
                _.each(data, function (item) {
                    self.posts.add([new PostModel({message: item.msg, username: item.n, time: item.time})]);
                });
                self.render();
            });

            Twister.getFollowing(function (err, users) {
                console.log('users', users);
            });

            this.setElement($("#main-page"));
        },

        navigate: function (e) {
            console.log (arguments);
            app.router.navigate(e.target.pathname, {trigger: true});
            e.preventDefault();
        },

        render: function() {
            console.log("Render user profile");
            this.$el.html(userProfileTemplate({user: this.model, posts: this.posts}));
            return this;
        }
    });
});

