"use strict";

// External dependencies.
var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");
var Twister = require("../Twister");
var PostsCollection = require("../collections/posts");
var UserModel = require("../models/User");
var PostModel = require("../models/Post");

Backbone.$ = $;

module.exports = Backbone.Collection.extend({
    model: UserModel,

    fetchPosts: function (amount, includeMaxId, callback) {

        // Build request object array
        var users = [];
        var following = this.filter(function (user) { return user.get('following') });
        _.each(following, function (user) {
            var data = {};
            data.username = user.get('username');
            if (includeMaxId && user.get('lowest_id')) {
                data.max_id = user.get('lowest_id') - 1;
            }
            users.push(data);
        });

        // Request!
        Twister.getPosts(users, amount, function (err, posts_data) {
            if (err) {
                console.log('Error getting user posts for user collection', err);
                callback(err);
                return;
            }
            var posts = [];
            _.each(posts_data, function (item) {
                var post = new PostModel().parse(item, this);
                posts.push(post);
            }, this);
            callback(null, posts);
        }.bind(this));
    },

    newUser: function (data) {
        var user = new UserModel(data);
        this.add(user);
        return user;
    }

});
