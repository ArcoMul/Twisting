define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var $ = require("jquery.jsonrpcclient");
    var Backbone = require("backbone");
    var app = require("app");
    var feedTemplate = _.template(require("text!templates/feed.html"));
    var PostsCollection = require("collections/posts");
    var PostModel = require("models/Post");
    var UserModel = require("models/User");
    var Twister = require("Twister");
    var async = require("async");

    module.exports = Backbone.View.extend({

        posts: null,

        events: {
            "click a": "navigate",
        },

        initialize: function() {
            console.log("Initialize feed");
            
            var self = this;
            var users = [];

            this.posts = new PostsCollection();

            Twister.getFollowing(function (err, usernames) {
                async.each(usernames, function (username, callback) {
                    var user = new UserModel({username: username});
                    user.fetchPosts(10, function (err, posts) {
                        if (err) {
                            console.log('Error getting user posts for user:', user, err);
                            return;
                        }
                        self.posts.add(posts);
                        callback();
                    });
                }, function () {
                    console.log ('Got all initial feed posts:', self.posts);
                    self.render();
                });
            });

            this.setElement($("#main-page"));
        },

        navigate: function (e) {
            app.router.navigate(e.target.pathname, {trigger: true});
            e.preventDefault();
        },

        render: function() {
            console.log("Render user profile");
            this.$el.html(feedTemplate({user: this.model, posts: this.posts}));
            return this;
        }
    });
});

