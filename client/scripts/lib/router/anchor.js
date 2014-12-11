'use strict';

var h = require('mercury').h
var clickEvent = require('value-event/click.js')
var getRouter = require('./getRouter.js')


module.exports = function (props, text) {
    var href = props.href
    var router = getRouter()

    // Rewrite URLs if this is a client-side render.
    if (router.initialRoute === undefined) {
        props.href = '#'
    }

    function pushState() {
        router.set(href)
    }

    props['ev-click'] = clickEvent(pushState, null, {
        ctrl: false,
        meta: false,
        rightClick: false,
        preventDefault: true
    })

    return h('a', props, text)
}
