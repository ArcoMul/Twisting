define(function(require, exports, module) {
    "use strict";

    // External dependencies.
    var Backbone = require("backbone");
    var notYetImplementedTemplate = _.template(require("text!templates/not-yet-implemented.html"));

    module.exports = Backbone.View.extend({

        events: {
            "click a": "navigate",
        },

        initialize: function() {
            this.setElement($("#main-page"));
        },

        navigate: function (e) {
            app.router.navigate(e.target.pathname, {trigger: true});
            e.preventDefault();
        },

        render: function() {
            this.$el.html(notYetImplementedTemplate());
            return this;
        }
    });
});

