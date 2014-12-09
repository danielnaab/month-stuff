'use strict';

var document = require('global/document')
var hg = require('mercury')
var h = hg.h

var DragList = require('./drag-list.js')
var Product = require('./product.js')


function Club(initial) {
    initial = initial || {}

    if (typeof initial.startDate === 'string') {
        initial.startDate = new Date(initial.startDate)
    }

    return hg.state({
        description: hg.value(initial.description || 'My Month Club'),
        products: hg.array(initial.products || []),
        startDate: hg.value(initial.startDate || new Date()),
        handles: {
            changeDescription: function (state, value) {
                state.description.set(value.title)
            },
            blurDate: function (state) {
                document.getElementById('startDate').blur()
            },
            blurDescription: function (state) {
                document.getElementById('club-title').blur()
            },
            changeStartDate: function (state, value) {
                var date = new Date(value.startDate)
                state.startDate.set(date)
            }
        }
    })
}


Club.getDateOffset = function (date, monthOffset) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
    newDate.setMonth(newDate.getMonth() + monthOffset)
    return newDate
}


Club.getPermalink = function (state) {
    return ('#club/' + state.description +
            '/' + state.products.map(function (product) {
                return product.asin
            }).join(',') +
            state.startDate)
}


Club.render = function render(state, showPermalink) {
    return h('#club', [
        h('a.permalink', {
            href: Club.getPermalink(state)
        }, 'Permalink'),
        h('input', {
            id: 'club-title',
            type: 'text',
            name: 'title',
            value: String(state.description),
            'ev-event': [hg.changeEvent(state.handles.changeDescription),
                         hg.submitEvent(state.handles.blurDescription)]
        }),
        h('label', {
            'for': 'startDate'
        }, 'Starts on '),
        h('input', {
            id: 'startDate',
            type: 'date',
            name: 'startDate',
            value: state.startDate.toISOString().slice(0, 10),
            'ev-event': [hg.changeEvent(state.handles.changeStartDate),
                         hg.submitEvent(state.handles.blurDate)]
        }),
        DragList.render(state.products, 'products', function (product, index) {
            return Product.render(product,
                                  Club.getDateOffset(state.startDate, index))
        })
    ])
}

module.exports = Club
