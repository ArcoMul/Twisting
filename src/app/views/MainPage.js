"use strict";

// External dependencies.
var gui = window.require('nw.gui'),
    $ = require("jquery"),
    Backbone = require("backbone"),
    Twister = require("../Twister"),
    app = require("../app"),
    _ = require("underscore"),
    OverlayView = require("../views/Overlay"),
    SlideOverlayView = require("../views/SlideOverlay"),
    PostView = require("../views/Post"),
    UserView = require("../views/User"),
    FollowingView = require("../views/Following"),
    MentionsView = require("../views/Mentions"),
    mainPageTemplate = _.template(require("../templates/main-page.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el: '#main-scrollable',

    fetchUserMentionsInterval: undefined,

    events: {
        "click a": "navigate",
        "scroll": "scroll",
    },

    initialize: function() {
        var self = this;
        this.render();
        this.on('userChange', this.userChange.bind(this));
    },

    userChange: function (e) {
        if (this.fetchUserMentionsInterval) clearInterval(this.fetchUserMentionsInterval);
        this.fetchUserMentionsInterval = setInterval(function () {
            Twister.getMentionsCombined(app.user.get('username'), 10, function (err, posts) {
                if (err) return console.error('Error fetching mentions:', err);
                posts = _.sortBy(posts, function (post) {
                    if (post.userpost) {
                        return post.userpost.time * -1;
                    } else if (post.p) {
                        return post.p.time * -1;
                    }
                });
                var lastMention = posts[0].userpost? posts[0].userpost.time : posts[0].p.time;
                if (lastMention > (window.localStorage[app.user.get('username') + '_lastMention'] || 0)) {
                    app.dispatcher.trigger('new-mentions');
                }
            });
        }, 5000);
    },

    navigate: function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var url = $(e.currentTarget).attr('href');
        if (this.isExternal(url)) {
            gui.Shell.openExternal(url);
        } else {
            app.router.load(url);
        }
    },

    isExternal: function (url) {
        var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
        if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== window.location.protocol) return true;
        if (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[window.location.protocol]+")?$"), "") !== window.location.host) return true;
        return false;
    },

    scroll: function () {
        this.trigger('scroll');
    },

    /**
     * If the user can actually scroll the window
     * without a scrollable window the scroll event
     * can never be called
     */
    isScrollable: function () {
        if (this.$el[0].scrollHeight > this.$el.height()) {
            return true;
        }
        return false;
    },

    openPostDetail: function (options) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: PostView,
            options: {
                post: options.post,
                feed: options.feed
            }
        });
    },

    openUserProfile: function (options) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: UserView,
            options: {
                user: options.user
            }
        });
    },

    openFollowing: function (options) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: FollowingView,
            options: {
                user: options.user
            }
        });
    },

    openMentions: function (options) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: MentionsView,
        });
    },

    showPopup: function (View, options) {
        this.$popup.append('<div />');
        options.el = this.$popup.children().last();
        new View(options);
    },

    showOverlay: function (View, options) {
        console.log('main page ', View, options);
        this.$overlay.append('<div />');
        new OverlayView({
            el: this.$overlay.children().last(),
            childView: View,
            options: options
        });
    },

    showSlideOverlay: function (View, options) {
        this.$el.append('<div class="slide-overlay"></div>');
        new SlideOverlayView({
            el: this.$el.children().last(),
            childView: View,
            options: options
        });
    },

    render: function() {
        this.$el.html(mainPageTemplate());
        this.$overlay = $("#overlay-holder");
        this.$popup = $("#popup-holder");
        return this;
    }
});
