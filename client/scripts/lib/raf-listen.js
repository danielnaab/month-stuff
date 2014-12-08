'use strict';

var raf = require('raf')


module.exports = function (observ, fn) {
    var sending = false
    var currValue

    function onvalue(value) {
        currValue = value
        if (sending) {
            return
        }

        sending = true
        raf(send)
    }

    function send() {
        var oldValue = currValue
        fn(currValue)
        sending = false

        if (oldValue !== currValue) {
            sending = true
            raf(send)
        }
    }

    return observ(onvalue)
}
