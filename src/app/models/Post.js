"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    twemoji = require('twemoji'),
    moment = require("moment");

Backbone.$ = $;

var TYPES = {
    RETWIST: 'retwist',
    REPLY: 'reply',
    POST: 'post',
    COMPOSE: 'compose',
};

// Defining the application router.
var PostModel = module.exports = Backbone.Model.extend({
    defaults: {
        twister_id: null,
        message: null,
        time: null,
        last_time: null,
        user: null,
        retwist: null,
        retwisters: []
    },

    /**
     * data = Twister post data
     * users = user collection to retrieve users from
     */
    parse: function (data, users) {
        var retwist;
        var item = data.userpost;

        var user = users.findWhere({username: item.n});

        // Maybe the user doens't excist yet when we are parsing a 
        // parent post of a reply for example
        if (!user) {
            user = users.newUser({username: item.n, isFollowing: false});
        }
        
        if(item.rt) {
            var retwistUser = users.findWhere({username: item.rt.n});

            // If this is a retwist we might not know the user
            // in that case add it to the list of users
            if (!retwistUser) {
                retwistUser = users.newUser({username: item.rt.n, isFollowing: false});
            } else {
                // Check if post is already known
                var post = retwistUser.get('posts').findWhere({id: retwistUser.get('username') + '_' + item.rt.k});
                if (post) {
                    post.setLastTime(item.time);
                    post.addRetwister(user);
                    return post;
                }
            }

            // Build the retwist post model
            retwist = new PostModel({
                id: retwistUser.get('username') + '_' + item.rt.k,
                signature: item.sig_rt,
                height: item.rt.height,
                user: retwistUser,
                message: item.rt.msg,
                time: item.rt.time,
                last_time: item.time,
                last_rt_time: item.time,
                twister_id: item.rt.k,
                last_twister_id: item.rt.lastk,
                retwisters: [user]
            });

            retwistUser.addPost(retwist);

            // Return the retwist as if it is an original twist
            return retwist;
        }

        this.set({
            id: user.get('username') + '_' + item.k,
            signature: data.sig_userpost,
            height: item.height,
            user: user,
            message: item.msg,
            time: item.time,
            last_time: item.time,
            retwist: retwist,
            reply: item.reply ? {username: item.reply.n, twister_id: item.reply.k} : undefined,
            twister_id: item.k,
            last_twister_id: item.lastk
        });

        user.addPost(this);

        return this;
    },

    addRetwister: function (user) {
        var retwisters = this.get('retwisters');
        retwisters.push(user);
        this.set('retwisters', retwisters);
    },

    setLastTime: function (time) {
        if (time > this.get('last_time')) {
            this.set('last_time', time);
        }
    },

    getMessageRegexed: function () {
        if (!this.get('message')) return "";
        // Urls
        var msg = this.get('message').replace( /(https?:\/\/[^\s]+)/g, function(url) { return '<a href="'+url+'">'+url+'</a>' });
        // Hashtags
        msg = msg.replace( /(^|[^#\w])#(\w{1,30})\b/g, '$1<a href="hashtag/$2">#$2</a>' );
        // Mentions
        msg = msg.replace( /(^|[^@\w])@(\w{1,30})\b/g, '$1<a class="username" href="user/$2">$2</a>' );
        // Emojis
        msg = twemoji.parse(msg, {
            base: '',
            folder: 'node_modules/twemoji/svg',
            ext: '.svg'
        });
        return msg;
    },

    getTimeAgo: function ()
    {
        return moment(this.get('time') * 1000).fromNow();
    },

    getDaysAgo: function ()
    {
        var now = moment(new Date());
        var date = moment(this.get('last_time') * 1000);
        console.log('days ago', now.diff(date, 'days'));
        return now.diff(date, 'days');
    },

    getAsUserpost: function ()
    {
        var data = {
            height: this.get('height'),
            k: this.get('twister_id'),
            lastk: this.get('last_twister_id'),
            msg: this.get('message'),
            n: this.get('user').get('username'),
            time: this.get('time')
        };
        if (this.get('reply')) {
            data.reply = {
                k: this.get('reply').twister_id,
                n: this.get('reply').username
            };
        }
        return data;
    },

    toRetwist: function ()
    {
        var sig_userpost = this.get('signature');
        var userpost = this.getAsUserpost();
        return {
            sig_userpost: sig_userpost,
            userpost: userpost
        }
    },

    getTopParent: function ()
    {
        var t = this;
        // This is the top parent
        if (!t.get('parent')) return t;
        // Treverse to top
        while(t.get('parent')) {
            t = t.get('parent');
        }
        return t;
    },

    getType: function ()
    {
        if (this.get('twister_id') == null) {
            return TYPES.COMPOSE;
        } else if (this.get('last_time') != this.get('time')) {
            return TYPES.RETWIST;
        } else if (this.get('reply')) {
            return TYPES.REPLY;
        }
        return TYPES.POST;
    }
});
