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
        avatar: null,
        lowest_id: null,
        following: true,
    },

    initialize: function () {
        this.set('posts', new PostsCollection());
        this.get('posts').on('add', this.onAddPost.bind(this));
    },

    addPost: function (post) {
        // Add posts to user
        this.get('posts').add(post);
    },

    addPosts: function (posts) {
        // Add posts to user
        this.get('posts').add(posts);

        // Add user to posts
        _.each(posts, function (post) {
            post.set('user', this);
        }, this);
    },

    hasPost: function () {
        return this.get('posts').length > 0;
    },

    onAddPost: function (post) {
        var lowest_id = this.get('lowest_id');
        if (!lowest_id || post.get('twister_id') < lowest_id) {
            this.set('lowest_id', post.get('twister_id'));
        }

        // TODO: dont assume twister_ids are in the right order
        if (!this.get('last_twister_id') || post.get('last_twister_id') < this.get('last_twister_id')) {
            this.set('last_twister_id', post.get('last_twister_id'));
        }
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

    fetchAvatarFromDisk: function (callback) {
        var self = this;
        Twister.getAvatarFromDisk(this.get('username'), function (err, avatar) {
            if (err) {
                console.log('Error getting avatar for user:', self.get('username'), err);
                return callback(err);
            }
            self.set('avatar', avatar);
            callback();
        });
    },

    fetchAvatar: function (callback) {
        var self = this;
        Twister.getAvatarFromDHT(this.get('username'), function (err, avatar) {
            if (err) {
                console.log('Error getting avatar for user:', self.get('username'), err);
                return callback(err);
            }
            self.set('avatar', avatar);
            callback();
        });
    },

    getStatus: function (callback) {
        Twister.getUserStatus(this.get('username'), function (err, post) {
            // Just return the post, it has to be added to the user from the user collection
            callback(err, post);
        });
    }
});
