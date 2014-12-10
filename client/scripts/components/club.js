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

    if (initial.ASINs && !initial.products) {

    }

    return hg.state({
        description: hg.value(initial.description || 'My Month Club'),
        ASINs: hg.array(initial.ASINs || []),
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
            },
            clearProducts: function (state) {
                state.ASINs.set([])
                state.products.set([])
            },
            clearProduct: function (state, product) {
                var index = state.products.indexOf(product)
                if (index > -1) {
                    state.products.splice(index, 1)
                }
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
    return ('/club/' + encodeURIComponent(state.description) + '/' +
            state.startDate.toISOString().substr(0, 10) +
            '/' + state.products.map(function (product) {
                return product.ASIN
            }).join(','))
}


Club.render = function render(state, editable) {
    return h('#club', [
        h('input', {
            id: 'club-title',
            type: 'text',
            name: 'title',
            value: String(state.description),
            'ev-event': [hg.changeEvent(state.handles.changeDescription),
                         hg.submitEvent(state.handles.blurDescription)]
        }),
        h('.details', [
            h('.date', [
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
            ]),
            h('.actions', [
                state.products.length > 0 ? h('a.permalink', {
                    href: Club.getPermalink(state)
                }, 'Subscribe to stuff club / Get permalink') : null,
                editable ? h('a.clear', {
                    'ev-click': hg.clickEvent(state.handles.clearProducts)
                }, 'Clear All') : null
            ]),
        ]),
        DragList.render(state.products, 'products', function (product, index) {
            return Product.render(product,
                                  Club.getDateOffset(state.startDate, index),
                                  state.handles.clearProduct)
        })
    ])
}

module.exports = Club
