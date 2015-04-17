"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    statusOverlayTemplate = _.template(require("../templates/overlay-status.html")),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    posts: null,

    events: {
        "click a": "navigate",
    },

    initialize: function(options) {
        var self = this;
        console.log("Initialize status overlay");

        this.options = options;

        this.render();

        this.setText("Requesting status");

        Twister.getStatus(function (status) {
            if (status == Twister.status.NOCONNECTION) {
                self.startDeamon();
            } else {
                self.checkAccounts();
            }
        });
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    startDeamon: function () {
        var self = this;

        // Tell the user we are starting Twister
        self.setText("Starting");

        // Start the deamon
        Twister.startDeamon();

        // Keep checking if it is started
        var check = setInterval (function () {
            Twister.getStatus(function (status) {
                if (status != Twister.status.NOCONNECTION) {
                    clearInterval(check);
                    self.checkAccounts();
                }
            });
        }, 1000);
    },

    checkAccounts: function () {
        var self = this;
        if (app.user) return this.gatherInfo();
        self.setText("Looking for accounts");
        Twister.getUsers(function (err, accounts) {
            console.log('status users', accounts);
            if (accounts.length == 0) {
                app.router.navigate('login', {trigger: true});
                self.remove();
            } else if (accounts.length > 1) {
                app.router.navigate('choose-account', {trigger: true});
                self.remove();
            } else {
                self.gatherInfo();
            }
        });
    },

    gatherInfo: function () {
        var self = this;

        self.setText("Waiting for a connection");

        var infoInterval, blockInterval;
        // Twister is started, let's gather info on its status
        infoInterval = setInterval(function () {
            Twister.getInfo(function (err, info) {
                self.latestInfo = info;
                self.renderInfo();
                if (info.connections > 0) {
                    clearInterval(infoInterval); 
                    clearInterval(blockInterval); 
                    self.remove();
                    app.router.navigate('feed', {trigger: true});
                }
            });
        }, 1000);

        blockInterval = setInterval(function () {
            Twister.getBestBlock(function (err, block) {
                self.latestBlock = block;
                self.renderInfo();
            });
        }, 1000);
    },

    renderInfo: function () {
        if (!this.latestInfo || !this.latestBlock) return;
        this.$info.html([
            'DHT nodes: ' + this.latestInfo.dhtNodes,
            'Connections: ' + this.latestInfo.connections,
            'Peers: ' + this.latestInfo.peers,
            'Blocks: ' + this.latestInfo.blocks,
            '',
            'Latest block: ' + moment(this.latestBlock.time * 1000).fromNow(),
        ].join('<br />'));
    },

    setText: function (text) {
        this.$status.html(text);
    },

    render: function() {
        this.$el.html(statusOverlayTemplate());
        this.$status = this.$el.find('span.status');
        this.$info = this.$el.find('span.info');
        return this;
    }
});
