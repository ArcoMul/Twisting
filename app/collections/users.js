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

    fetchPosts: function (amount, callback) {
        var self = this;
        var users = [];
        this.each(function (user) {
            users.push(user.get('username'));
        });
        Twister.getPosts(users, amount, function (err, data) {
            if (err) {
                console.log('Error getting user posts for user collection', err);
                callback(err);
                return;
            }
            var posts = {};
            _.each(data, function (item) {
                // If retwist
                if(item.rt) {
                    console.log('retwist!', item);
                    if (!posts[item.rt.n]) {
                        posts[item.rt.n] = [];
                    }
                    posts[item.rt.n].push(new PostModel({message: item.rt.msg, time: item.time, retwist: true}));
                    return;
                }

                if (!posts[item.n]) {
                    posts[item.n] = [];
                }
                posts[item.n].push(new PostModel({message: item.msg, time: item.time}));
            });
            callback(null, posts);
        });
    }
});
