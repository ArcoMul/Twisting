"use strict";

// External dependencies.
var gui = window.require('nw.gui'),
    $ = require("jquery"),
    Backbone = require("backbone"),
    app = require("../app"),
    _ = require("underscore"),
    OverlayView = require("../views/Overlay"),
    SlideOverlayView = require("../views/SlideOverlay"),
    PostView = require("../views/Post"),
    UserView = require("../views/User"),
    MentionsView = require("../views/Mentions"),
    mainPageTemplate = _.template(require("../templates/main-page.html"));

Backbone.$ = $;

module.exports = Backbone.View.extend({

    el: '#main-scrollable',

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        var self = this;
        this.render();
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
