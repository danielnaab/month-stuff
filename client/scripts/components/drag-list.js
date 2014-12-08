'use strict';

var hg = require('mercury')
var h = hg.h


function dragStart(state) {
    console.log('dragStart')
}


function dragEnd(state) {
    console.log('dragEnd')
}

function render(items, className, renderFunction) {
    return h('ul.' + className, items.map(function (item, index) {
        return h('li', {
            draggable: 'true',
            'ev-dragend': hg.event(dragEnd),
            'ev-dragstart': hg.event(dragStart)
        }, renderFunction(item, index))
    }))
}


module.exports = {
    render: render
}
