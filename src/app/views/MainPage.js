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

    /*
    $context: null,
    $content: null,
    currentContextView: null,
    currentContentView: null,
    */

    events: {
        "click a": "navigate",
    },

    initialize: function() {
        var self = this;
        this.render();
        // this.$context = this.$el.children('#context-section');
        // this.$content = this.$el.children('#content-section');
        // this.$preview = this.$el.children('#preview-section').children('.content');
        // this.$preview.css({left: this.$preview.width()});

        // $("#main-scrollable").scroll(function () {
        //     self.scroll();
        // });
        // $(window).resize(function () {
        //     self.$preview.css({left: self.$preview.width()});
        // });
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

    /*
    openPreview: function (view) {
        var self = this;
        if (this.currentPreviewView) {
            this.togglePreview(false, function () {
                self.currentPreviewView.remove();

                self.$preview.html('<div />');
                self.currentPreviewView = view;
                self.currentPreviewView.setElement(self.$preview.children().first());
                self.currentPreviewView.render();
                self.$preview.css({paddingTop: $("#main-scrollable").scrollTop()});    
                self.togglePreview(true);
            });
            return;
        }
        this.$preview.html('<div />');
        this.currentPreviewView = view;
        this.currentPreviewView.setElement(this.$preview.children().first());
        this.currentPreviewView.render();
        this.$preview.css({paddingTop: $("#main-scrollable").scrollTop()});    
        this.togglePreview(true);
    },

    togglePreview: function (visible, callback) {
        this.$preview.animate({
            left: visible ? 0 : this.$preview.width()
        }, {
            duration: 200,
            complete: callback
        });
    },
    */

    render: function() {
        this.$el.html(mainPageTemplate());
        this.$overlay = $("#overlay-holder");
        return this;
    }
});
