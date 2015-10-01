"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    Twister = require("../Twister"),
    PostModel = require("../models/Post"),
    FeedModel = require("../models/Feed"),
    UserModel = require("../models/User"),
    postTemplate = _.template(require("../templates/post.html")),
    followingTemplate = _.template(require("../templates/following.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    firstFollowingLoop: true,

    events: {
        "scroll": "scroll",
    },

    initialize: function(options) {
        var self = this;

        this.options = options;
        this.user = options.user;
        this.following = {};

        this.user.fetchFollowing(function (err) {
            if (err) return console.error('Error fetching following', err);
            self.user.get('following').forEach(function (u) {
                self.following[u] = {
                    user: new UserModel({username: u})
                };
            });
            self.loopOverFollowing(0);
            self.render();
        });

        self.render();

        this.$scrollable = this.$el.parents('.content-holder');
        this.$scrollable.scroll(function () {
            self.scroll();
        });
    },

    loopOverFollowing: function (index) {
        var self = this;
        var username = this.user.get('following')[index];
        if (index === this.user.get('following').length) {
            this.firstFollowingLoop = false;
            return;
        }
        Twister.getTorrentStatus(username, function (err, torrentstatus) {
            self.following[username].torrentstatus = torrentstatus;
            var yes = 0, no = 0, firstZeros = true;
            for (var i = torrentstatus.bitfield.length - 1; i >= 0; i--) {
                if(torrentstatus.bitfield[i] === '1') {
                    firstZeros = false;
                    yes++;
                    continue;
                }
                if (!firstZeros) {
                    no++;
                }
            }
            self.following[username].yes = yes;
            self.following[username].no = no;
            self.following[username].percentage = (yes === 0 && no === 0 ? 0 : Math.round(100 - (no / (yes + no) * 100)));
            self.render();
            self.loopOverFollowing(index+1);

            self.following[username].user.fetchAvatarFromDisk(function (err) {
                if (!self.following[username].user.get('avatar')) return;
                console.log('set avatar', username, self.following[username].user.get('avatar'));
                self.$el.find('img[data-username=' + username + ']').attr('src', self.following[username].user.get('avatar'));
            });
        });
    },

    toggleFollow: function () {
        var self = this;
        this.$followButton.addClass('loading');
        if (app.user.isFollowing(this.user.get('username'))) {
            app.user.unfollow(this.user.get('username'), function (err) {
                if(err) return console.error('Error unfollowing user', err);
                self.render();
            });
        } else {
            app.user.follow(this.user.get('username'), function (err) {
                if(err) return console.error('Error following user', err);
                self.render();
            });
        }
    },

    render: function() {
        console.log('render', this.following);
        this.$el.html(followingTemplate({
            _: _,
            user: this.user,
            following: this.following
        }));
        return this;
    }
});
