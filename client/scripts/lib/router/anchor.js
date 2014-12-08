'use strict';

var h = require('mercury').h
var clickEvent = require('value-event/click.js')
var routeAtom = require('./index.js').atom


module.exports = function (props, text) {
    var href = props.href
    props.href = '#'

    function pushState() {
        routeAtom.set(href)
    }

    props['ev-click'] = clickEvent(pushState, null, {
        ctrl: false,
        meta: false,
        rightClick: false,
        preventDefault: true
    })

    return h('a', props, text)
}
