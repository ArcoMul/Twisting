"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    statusOverlayTemplate = _.template(require("../templates/overlay-status.html")),
    UserModel = require("../models/User"),
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
                app.changeUser(new UserModel({username: accounts[0]}));
                self.gatherInfo();
            }
        });
    },

    gatherInfo: function () {
        var self = this;

        self.setText("Fetching network information");

        // Twister is started, let's gather info on its status
        this.infoTimer = setInterval(function () {

            // Retrieve latest info
            Twister.getInfo(function (err, info) {
                self.latestInfo = info;
                self.renderInfo();
            });

            // Retrieve latest blockchain info
            Twister.getBestBlock(function (err, block) {
                self.latestBlock = block;
                self.renderInfo();
            });

            self.checkStatus();
        }, 1000);
    },

    checkStatus: function () {
        var time = new Date().getTime() / 1000;
        if (!this.latestInfo) {
            this.setText("Fetching network information");
        } else if (this.latestInfo.connections == 0) {
            this.setText("Waiting for a connection");
        } else if (!this.latestBlock) {
            this.setText("Fetching blockchain information");
        } else if (this.latestBlock.time < time - (2 * 3600)) {
            this.setText("Downloading latest blocks");
        } else {
            // Ready to go!
            clearInterval(this.infoTimer); 
            app.router.navigate('feed', {trigger: true});
            this.remove();
        }
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
