'use strict';

var hg = require('mercury')
var source = require('geval/source')
var window = require('global/window')
var document = require('global/document')


function pushHistoryState(uri) {
    window.history.pushState(undefined, document.title, uri)
}


function popState() {
    return source(function broadcaster(broadcast) {
        window.addEventListener('popstate', function () {
            //broadcast(String(document.location.pathname))
            broadcast(String(document.location.hash))
        })
    })
}


function Router() {
    var inPopState = false
    var popStates = popState()
    //var atom = hg.value(String(document.location.pathname))
    var atom = hg.value(String(document.location.hash))

    popStates(function (uri) {
        inPopState = true
        atom.set(uri)
    })
    atom(function (uri) {
        if (inPopState) {
            inPopState = false
            return
        }

        pushHistoryState(uri)
    })

    return atom
}


var cachedRouter = null

function getRouter() {
    if (!cachedRouter) {
        cachedRouter = Router()
    }
    return cachedRouter
}

getRouter.atom = cachedRouter
getRouter.anchor = require('./anchor.js')
getRouter.render = require('./view.js')


module.exports = getRouter
