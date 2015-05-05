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
                self.gatherInfo();
            }
        });
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
                    self.gatherInfo();
                }
            });
        }, 1000);
    },

    gatherInfo: function () {
        // Prevent starting the timer twice by accident
        if(this.infoTimer) return;

        var self = this;

        self.setText("Fetching network information");

        var count = 0;

        // Twister is started, let's gather info on its status
        this.infoTimer = setInterval(function () {

            // Retrieve latest info
            Twister.getInfo(function (err, info) {
                if(!self) return;
                self.latestInfo = info;
                self.renderInfo();
            });

            // Retrieve latest blockchain info
            Twister.getBestBlock(function (err, block) {
                if(!self) return;
                self.latestBlock = block;
                self.renderInfo();

                // Increase the counter only when we actually get a response
                // otherwise it might not be the connection, but the deamon
                // unresponsive
                count++;
            });

            // After 10, 30, and 60 seconds force a connection to the offical Twister seeders
            // in case this client can't find a connection
            if (count == 10) {
                Twister.addNode('seed.twister.net.co', 'onetry');
            } else if (count == 30) {
                Twister.addNode('seed2.twister.net.co', 'onetry');
            } else if (count == 60) {
                Twister.addNode('seed3.twister.net.co', 'onetry');
            }

            self.checkStatus();
        }, 1000);
    },

    checkStatus: function () {
        var self = this;
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
            // Everything is fine, stop checking for new info
            clearInterval(this.infoTimer); 

            // See if there is already an account
            this.checkAccounts(function () {
                // Seems like we are good to go    
                app.router.navigate('feed', {trigger: true});
                self.remove();
            });
        }
    },

    /**
     * Checks if there are known users
     * If there are multiple a dialog will be shown to choose one
     * If there is one user that one is used immideately
     * 
     * callback: will be executed if there is only one user so that 
     * t         the next step can be executed immideately
     */
    checkAccounts: function (callback) {
        var self = this;

        // If there is already an user choosen, nothing to do here
        if (app.user) return callback();

        self.setText("Looking for accounts");

        // Get the users from the Twister wallet
        Twister.getUsers(function (err, accounts) {
            // No accounts? Login so that we get one
            if (accounts.length == 0) {
                app.router.navigate('login', {trigger: true});
                self.remove();
            // More than one account? Make the user choose one
            } else if (accounts.length > 1) {
                app.router.navigate('choose-account', {trigger: true});
                self.remove();

            // Only one account? Choose that one directly
            } else {
                app.changeUser(new UserModel({username: accounts[0]}));
                callback();
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
        this.$el.html(statusOverlayTemplate());
        this.$status = this.$el.find('span.status');
        this.$info = this.$el.find('span.info');
        return this;
    }
});
