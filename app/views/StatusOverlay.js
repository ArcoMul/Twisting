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

    initialize: function() {
        var self = this;
        console.log("Initialize status overlay");

        this.render();

        this.setText("Requesting status");

        Twister.getStatus(function (status) {
            console.log('received status', status);
            if (status == Twister.status.NOCONNECTION) {
                self.startDeamon();
            } else {
                self.gatherInfo();
            }
        });
    },

    navigate: function (e) {
        e.preventDefault();
        app.router.navigate($(e.target).attr('href'), {trigger: true});
    },

    startDeamon: function () {
        var self = this;

        // Start the deamon
        Twister.startDeamon();

        // Keep checking if it is started
        var check = setInterval (function () {
            Twister.getStatus(function (status) {
                console.log('Twister status', status);
                if (status != Twister.status.NOCONNECTION) {
                    clearInterval(check);
                    console.log('Twister started');
                    self.gatherInfo();
                }
            });
        }, 1000);

        // Tell the user we are starting Twister
        self.setText("Starting");
    },

    gatherInfo: function () {
        var self = this;

        self.setText("Looking for accounts");

        Twister.getUsers(function (err, accounts) {
            if (accounts.length == 0) {
                app.router.navigate('login', {trigger: true});
            } else {
                // Twister is started, let's gather info on its status
                setInterval(function () {
                    Twister.getInfo(function (err, info) {
                        console.log('Received info', info, self.$info);
                        self.latestInfo = info;
                        self.renderInfo();
                    });
                }, 1000);

                setInterval(function () {
                    Twister.getBestBlock(function (err, block) {
                        console.log('Received block', block);
                        self.latestBlock = block;
                        self.renderInfo();
                    });
                }, 1000);
            }
        });
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
        console.log("Render status overlay");
        this.$el.html(statusOverlayTemplate());
        this.$status = this.$el.find('span.status');
        this.$info = this.$el.find('span.info');
        return this;
    }
});
