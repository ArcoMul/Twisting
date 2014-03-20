define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var Twister = require("Twister");
    var app = require("app");
    var PostsCollection = require("collections/posts");
    var PostModel = require("models/Post");

    // Defining the application router.
    module.exports = Backbone.Model.extend({
        defaults: {
            username: null,
            posts: new PostsCollection()
        },

        fetchPosts: function (amount, callback) {
            var self = this;
            Twister.getPosts(this.get('username'), amount, function (err, data) {
                if (err) {
                    console.log('Error getting user posts for user:', self.get('username'), err);
                    callback(err);
                    return;
                }
                var posts = self.get('posts');
                _.each(data, function (item) {
                    posts.add([new PostModel({message: item.msg, username: item.n, time: item.time})]);
                });
                self.set('posts', posts);
                callback(null, posts.models);
            });
        }
    });
});
