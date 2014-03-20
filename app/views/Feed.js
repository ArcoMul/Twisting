define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var $ = require("jquery.jsonrpcclient");
    var Backbone = require("backbone");
    var app = require("app");
    var feedTemplate = _.template(require("text!templates/feed.html"));
    var PostsCollection = require("collections/posts");
    var PostModel = require("models/Post");
    var Twister = require("Twister");
    var async = require("async");

    module.exports = Backbone.View.extend({

        posts: null,

        events: {
            "click a": "navigate",
        },

        initialize: function() {
            console.log("Initialize user profile");
            
            var self = this;

            this.posts = new PostsCollection();

            Twister.getFollowing(function (err, users) {
                async.each(users, function (user, callback) {
                    Twister.getPosts(user, 10, function (err, data) {
                        if (err) {
                            console.log('Error getting user posts for user:', user, err);
                            return;
                        }
                        _.each(data, function (item) {
                            self.posts.add([new PostModel({message: item.msg, username: item.n})]);
                        });
                        callback();
                    });
                }, function () {
                    console.log ('async done', self.posts);
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

