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
            broadcast(String(document.location.pathname))
        })
    })
}


function Router(initialRoute) {
    var inPopState = false
    var atom = hg.value(initialRoute || String(document.location.pathname))

    if (initialRoute === undefined) {
        var popStates = popState()
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
    }

    return atom
}


var _cachedRouter = null
function getRouter(initialRoute, useCache) {
    useCache = useCache === undefined ? true : useCache
    if (!useCache || !_cachedRouter) {
        _cachedRouter = Router(initialRoute)
        _cachedRouter.initialRoute = initialRoute
    }
    return _cachedRouter
}


module.exports = getRouter
