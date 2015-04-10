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

    // Get posts
    fetchPosts: function (amount, callback) {

        // Get all the posts of the users in this feed
        this.get('users').fetchPosts(amount, function (err, posts) {
            if (err) return callback(err);

            // Sort before adding so that the 'add' events are called
            // in the right order
            posts = _.sortBy(posts, function (post) {
                return post.get('time') * -1;
            });
            this.get('posts').add(posts);

            callback();
        }.bind(this));
    },

    // Get all users which don't have an avatar yet in memory. The others
    // will already be rendered on the page so don't need fetching
    fetchAvatars: function (avatarLoadForUserCallback) {
        var usersWithoutAvatar = this.get('users').filter(function (user) { return user.get('avatar') == null});
        async.eachSeries(usersWithoutAvatar, function (user, callback) {
            user.fetchAvatar(function (err) {
                if (err) return callback(err);

                // Avatar should be set to all posts of user which are NOT a retwist
                var postsToSetAvatar = user.get('posts').filter(function (post) { return !post.get('retwist') });

                // AND all retwists of posts of this user
                postsToSetAvatar = postsToSetAvatar.concat(this.get('posts').filter(function (post) { return post.get('retwist') && post.get('retwist').get('user').cid == user.cid }));

                avatarLoadForUserCallback(null, user, postsToSetAvatar);
                callback();
            }.bind(this));
        }.bind(this),
        function () {
            console.log('All avatars fetched for feed model');
        });
    }
});
