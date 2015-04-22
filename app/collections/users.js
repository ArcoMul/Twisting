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

                var retwist;
                if(item.rt) {
                    // If this is a retwist we might not know the user
                    // in that case add it to the list of users
                    var retwistUser = this.findWhere({username: item.rt.n});
                    if (!retwistUser) {
                        retwistUser = new UserModel({username: item.rt.n, following: false});
                        this.add(retwistUser);
                    }

                    // Build the retwist post model
                    retwist = new PostModel({
                        user: retwistUser,
                        message: item.rt.msg,
                        time: item.rt.time,
                        twister_id: item.rt.k
                    });
                }

                var user = this.findWhere({username: item.n});
                var post = new PostModel({
                    id: user + '_' + item.k,
                    user: user,
                    message: item.msg,
                    time: item.time,
                    retwist: retwist,
                    twister_id: item.k
                });

                if (!user) {
                    console.log('username:',item.n);
                    console.log('post:', post);
                }

                user.addPost(post);
                posts.push(post);
            }, this);
            callback(null, posts);
        }.bind(this));
    }
});
