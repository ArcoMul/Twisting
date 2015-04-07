"use strict";

// External dependencies.
var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");
var Twister = require("../Twister");
var PostsCollection = require("../collections/posts");
var PostModel = require("../models/Post");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({
    defaults: {
        username: null,
        posts: null,
        avatar: null
    },

    initialize: function () {
        this.set('posts', new PostsCollection());
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
            callback(null, self);
        });
    },

    fetchAvatar: function (callback) {
        Twister.getAvatar(this.get('username'), function (err, avatar) {
            if (err) {
                console.log('Error getting avatar for user:', self.get('username'), err);
                callback(err);
                return;
            }
            this.set('avatar', avatar);
            callback();
        }.bind(this));
    }
});
