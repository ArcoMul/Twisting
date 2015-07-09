"use strict";

// External dependencies.
var $ = require("jquery"),
    _ = require("underscore"),
    Backbone = require("backbone"),
    Twister = require("../Twister"),
    app = require("../app"),
    PostsCollection = require("../collections/posts"),
    config = require("../config"),
    PostModel = require("../models/Post");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({
    defaults: {
        username: null,
        posts: null,
        avatar: null,
        lowest_id: null,
        isFollowing: true,
    },

    initialize: function () {
        this.set('posts', new PostsCollection());
        this.set('retwists', new PostsCollection());
        this.get('posts').on('add', this.onAddPost.bind(this));
    },

    getUrl: function () {
        return '/users/' + this.get('username');
    },

    addPost: function (post) {
        this.get('posts').add(post);
    },

    addRetwist: function (post) {
        this.get('retwists').add(post);
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
        return this.get('posts').length > 0 || this.get('retwists').length > 0;
    },

    onAddPost: function (post) {
        this.processTwisterIdsOfPost(post.get('twister_id'), post.get('last_twister_id'));
    },

    processTwisterIdsOfPost: function (twister_id, last_twister_id) {
        var lowest_id = this.get('lowest_id');
        if (!lowest_id || twister_id < lowest_id) {
            this.set('lowest_id', twister_id);
        }

        // TODO: dont assume twister_ids are in the right order
        if (!this.get('last_twister_id') || last_twister_id < this.get('last_twister_id')) {
            this.set('last_twister_id', last_twister_id);
        }
    },

    getDefaultAvatar: function () {
        return config.DEFAULT_AVATAR;
    },

    isFollowing: function (username) {
        if (!this.get('following')) {
            return false;
        }
        return this.get('following').indexOf(username) != -1;
    },

    isFollowedByActiveUser: function () {
        return app.user.isFollowing(this.get('username'));
    },

    follow: function (username, callback) {
        var self = this;
        Twister.follow(this.get('username'), [username], true, function (err) {
            if (err) return callback(err);

            var following = self.get('following');
            following.push(username);
            self.set('following', following);
            callback();
        });
    },

    unfollow: function (username, callback) {
        var self = this;
        Twister.unfollow(this.get('username'), [username], true, function (err) {
            if (err) return callback(err);

            var following = self.get('following');
            var index = following.indexOf(username);
            if (index == -1) return callback();

            following.splice(index, 1);
            self.set('following', following);

            callback();
        });
    },

    fetchFollowing: function (callback) {
        if (this.get('following')) return callback();

        var self = this;
        Twister.getFollowing(this.get('username'), function (err, usernames) {
            if (err) return callback(err);

            if (usernames.length == 0) {
                Twister.getFollowingFromDht(self.get('username'), function (err, usernames) {
                    if (err) return callback(err);
                    self.set('following', usernames);
                    callback(null, self);
                });
                return;
            }

            self.set('following', usernames);
            callback(null, self);
        });
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
            if (callback) callback();
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

    fetchProfile: function (callback) {
        var self = this;
        Twister.getProfile(this.get('username'), function (err, data) {
            if (err) return callback(err);
            self.set(data[0].p.v);
            callback();
        });
    },

    getStatus: function (callback) {
        Twister.getUserStatus(this.get('username'), function (err, post) {
            // Just return the post, it has to be added to the user from the user collection
            callback(err, post);
        });
    },

    getAvatarImg: function (title) {
        if (this.get('avatar')) {
            return '<img data-username="'+this.get('username')+'" ' + (title ? 'title="'+this.get('username')+'"' : '') + ' src="' + this.get('avatar') + '" />';
        } else {
            return '<img data-username="'+this.get('username')+'" ' + (title ? 'title="'+this.get('username')+'"' : '') + ' src="app/img/profile.jpg" />';
        }
    }
});
