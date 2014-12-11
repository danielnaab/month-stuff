'use strict';

var hg = require('mercury'),
    document = require('global/document'),
    window = require('global/window')

var App = require('./app.js'),
    config = require('./config.js'),
    rafListen = require('./lib/raf-listen.js')


var STATE_KEY = 'monthstuff@' + config.STATE_VERSION


/**
 * The initial state will be determined by:
 * - the presence of a global, `window.initialState`, set by the server-render
 * - additional state stored in localStorage
 */
function getInitialState() {
    var initialState = window.initialState || {}

    // Reuse a limited subset of the previous application state.
    if (window.localStorage !== undefined) {
        var localState = window.localStorage.getItem(STATE_KEY)
        if (localState) {
            localState = JSON.parse(localState)
            initialState.clubBuild = localState.clubBuild
        }
    }

    return initialState
}


function createApp(initialRoute) {
    var app = App(getInitialState(), initialRoute)

    rafListen(app, function onChange(value) {
        window.localStorage.setItem(STATE_KEY, JSON.stringify(value))
    })

    if (typeof app.route !== 'string') {
        rafListen(app.route, function onChange(value) {
            console.log('route changed')
        })
    }
    else {
        console.log(app.route)
    }

    return app
}


var elem = document.getElementById('app')
elem.innerHTML = ''
hg.app(elem, createApp(), App.render)
