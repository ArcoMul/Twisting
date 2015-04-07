// Break out the application running from the configuration definition to
// assist with testing.

var fs = require('fs');
require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var app = require('./app');
var Router = require('./router');
var $ = require('jquery');
var Backbone = require('backbone');

Backbone.$ = $;

// Define your master router on the application namespace and trigger all
// navigation from this instance.
app.router = new Router();

// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default.  Change in app.js.
Backbone.history.start({ root: app.root });
app.router.navigate('/index.html', {trigger: true});
