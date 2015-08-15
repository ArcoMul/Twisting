"use strict";

// External dependencies.
var $ = require("jquery"),
    moment = require("moment"),
    Backbone = require("backbone");

Backbone.$ = $;

// Defining the application router.
module.exports = Backbone.Model.extend({

    initialize: function () {

    },

    parse: function (data) {
        this.set(data);
    },

    getVersion: function () {
        var v = ("0000000" + this.get('version')).slice(-8);
        if (!v) return -1;
        return v.slice(0,2) + '.'
        + v.slice(2,4) + '.'
        + v.slice(4,6); // + '.'
        // + v.slice(6,8);
    },

    getConnectionLevel: function () {
        var level = this.get('connections');;
        if (level < 2) return 'bad';
        if (level < 5) return 'neutral';
        if (level >= 5) return 'good';
    },

    getDhtConnectionLevel: function () {
        var level = this.get('dht_nodes');;
        if (level < 5) return 'bad';
        if (level < 10) return 'neutral';
        if (level >= 10) return 'good';
    },

    getLastBlockFromNow: function () {
        if(!this.get('time')) return 'unkown';
        return moment(this.get('time') * 1000).fromNow();
    },

    getTotalDownload: function () {
        var bytes = this.get('total_download')
            + this.get('total_dht_download')
            + this.get('total_ip_overhead_download')
            + this.get('total_payload_download');
        return parseInt(bytes / 1024 / 1024);
    },

    getDownloadSpeed: function () {
        var bytes = this.get('download_rate')
            + this.get('dht_download_rate')
            + this.get('ip_overhead_download_rate')
            + this.get('payload_download_rate');
        return parseInt(bytes / 1024);
    },

    getTotalUpload: function () {
        var bytes = this.get('total_upload')
            + this.get('total_dht_upload')
            + this.get('total_ip_overhead_upload')
            + this.get('total_payload_upload');
        return parseInt(bytes / 1024 / 1024);
    },

    getUploadSpeed: function () {
        var bytes = this.get('upload_rate')
            + this.get('dht_upload_rate')
            + this.get('ip_overhead_upload_rate')
            + this.get('payload_upload_rate');
        return parseInt(bytes / 1024);
    }
});
