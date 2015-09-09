// Break out the application running from the configuration definition to
// assist with testing.

var fs = require('fs'),
    gui = window.require('nw.gui');

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

global.document = window.document;
global.navigator = window.navigator;

var $ = require('jquery'),
    Backbone = require('backbone'),
    Twister = require('./Twister'),
    app = require('./app'),
    Router = require('./router');

Backbone.$ = $;

// Define your master router on the application namespace and trigger all
// navigation from this instance.
app.router = new Router();

// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default.  Change in app.js.
Backbone.history.start({ root: app.root });
app.router.navigate('/index.html', {trigger: true});

// Press <d> to open dev tools
$(window.document).on('keyup', function (e) {
    if (e.keyCode == 123) {
        gui.Window.get().showDevTools();
    }
});

var win = gui.Window.get();
win.on('close', function() {
    this.hide(); // Pretend to be closed already
    /*
    Twister.stopDeamon(function (err, data) {
        // TODO: application should always quit, no matter what
        //      this is just for debugging
        if (err) return console.log('Error stopping deamon, inspect!', err);
    });
    */

    // Quit the application
    gui.App.quit();
});

// Enable shadow
// var win = gui.Window.get();
// win.minimize();
// win.restore();
