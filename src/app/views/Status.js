"use strict";

// External dependencies.
var $ = require("jquery"),
    Backbone = require("backbone"),
    async = require("async"),
    moment = require("moment"),
    app = require("../app"),
    _ = require("underscore"),
    statusTemplate = _.template(require("../templates/status.html")),
    InfoModel = require("../models/Info"),
    Twister = require("../Twister");

Backbone.$ = $;

module.exports = Backbone.View.extend({

    infoTimer: null,

    events: {

    },

    initialize: function (options) {
        var self = this;

        this.options = options;

        this.render();

        this.gatherInfo();
    },

    gatherInfo: function () {
        // Prevent starting the timer twice by accident
        if (this.infoTimer) return;

        var self = this;

        this.infoTimer = setInterval(this.getInfo.bind(this), 1000);
        this.getInfo();
    },
        
    getInfo: function () {
        var self = this;

        // Retrieve latest info
        Twister.getInfo(function (err, data) {
            if (!self.latestInfo) self.latestInfo = new InfoModel();
            self.latestInfo.parse(data);
            self.render();
        });

        // Retrieve latest blockchain info
        Twister.getBestBlock(function (err, data) {
            if (!self.latestInfo) self.latestInfo = new InfoModel();
            // Remove version from block data because of conflict
            // with general info 
            data.version = undefined;
            self.latestInfo.parse(data);
        });
    },

    /**
     * BE AWARE: Function called by the overlay type using this view
     */
    onClose: function () {
        clearInterval(this.infoTimer); 
    },

    render: function() {
        this.$el.html(statusTemplate({info: this.latestInfo}));
        return this;
    }
});
