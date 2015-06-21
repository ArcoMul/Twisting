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
    fetchPosts: function (amount, options, callback) {

        options.sortDirection = options.sortDirection ? options.sortDirection : -1;

        // Get all the posts of the users in this feed
        this.get('users').fetchPosts(amount, options, function (err, posts) {
            if (err) return callback(err);

            // Sort before adding so that the 'add' events are called
            // in the right order
            posts = _.sortBy(posts, function (post) {
                return post.get('last_time') * options.sortDirection;
            });
            this.get('posts').add(posts);

            callback();
        }.bind(this));
    },

    fetchMentions: function (amount, options, callback) {
        var self = this;
        this.get('users').fetchMentions(amount, options, function (err, mentions) {
            if (err) return callback(err);

            // Sort before adding so that the 'add' events are called
            // in the right order
            mentions = _.sortBy(mentions, function (post) {
                return post.get('time') * -1;
            });
            self.get('posts').add(mentions);

            callback();
        });
    },

    getOrignalPostsOfUser: function (user) {
        return user.get('posts').filter(function (post) { return !post.get('retwist') });
    },

    getRetwistsOfPostOfUser: function (user) {
        return this.get('posts').filter(function (post) { return post.get('retwist') && post.get('retwist').get('user').cid == user.cid });
    },

    // Get all users which don't have an avatar yet in memory. The others
    // will already be rendered on the page so don't need fetching
    fetchAvatars: function (avatarLoadedForUserCallback) {
        var self = this;

        // First get avatar from disk for every user
        //  then check for users which didn't have an avatar on disk
        //  for an avatar in DHT
        async.waterfall([
            function (callback) {
                // Try to get avatars from disk
                var usersWithoutAvatar = self.get('users').filter(function (user) { return user.get('avatar') == null && user.hasPost() });
                async.each(usersWithoutAvatar, function (user, callback) {
                    user.fetchAvatarFromDisk(function (err) {
                        if (err) return callback(err);
                        var posts = self.getOrignalPostsOfUser(user);
                        posts = posts.concat(self.getRetwistsOfPostOfUser(user));
                        avatarLoadedForUserCallback(null, user, posts);
                        callback();
                    });
                }, function (err) {
                    // Next waterfall item
                    callback();
                });
            },
            function (callback) {
                // If not fetched from disk, fetch from DHT and save to disk
                var usersWithoutAvatar = self.get('users').filter(function (user) { return user.get('avatar') == null  && user.hasPost() });
                async.eachSeries(usersWithoutAvatar, function (user, callback) {
                    user.fetchAvatar(function (err) {
                        if (err) return callback(err);
                        var posts = self.getOrignalPostsOfUser(user);
                        posts = posts.concat(self.getRetwistsOfPostOfUser(user));
                        avatarLoadedForUserCallback(null, user, posts);
                        callback();
                    });
                },
                function () {
                    console.log('All avatars fetched for feed model');
                });
            }
        ]);
    }
});
