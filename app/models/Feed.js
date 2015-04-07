"use strict";

// External dependencies.
var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");
var async = require("async");
var Twister = require("../Twister");
var PostsCollection = require("../collections/posts");
var UserCollection = require("../collections/users");
var PostModel = require("../models/Post");
var UserModel = require("../models/User");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({
    defaults: {
        users: null,
        posts: null 
    },

    initialize: function () {
        this.set('users', new UserCollection());
        this.set('posts', new PostsCollection());
    },

    fetchPosts: function (amount, callback) {
        this.get('users').fetchPosts(amount, function (err, data) {
            if (err) return callback(err);
            _.each(data, function (posts, username) {
                var user = this.get('users').findWhere({username: username});
                if (!user) {
                    user = new UserModel({username: username});
                    this.get('users').add(user);
                }
                _.each(posts, function (post) {
                    post.set('user', user);
                }, this);
                this.get('posts').add(posts);
            }, this);
            callback();
        }.bind(this));
    },

    fetchAvatars: function (avatarLoadForUserCallback) {
        async.eachSeries(this.get('users').models, function (user, callback) {
            user.fetchAvatar(function (err) {
                if (err) return callback(err);
                avatarLoadForUserCallback(null, user, this.get('posts').filter(function (post) { return post.get('user').cid == user.cid }));
                callback();
            }.bind(this));
        }.bind(this),
        function () {
            console.log('All avatars fetched for feed model');
        });
    }
});
