'use strict';

var hg = require('mercury')
var h = hg.h
var AutoCompleteInput = require('./autocomplete.js')
var Product = require('./product.js')

var api = require('../api.js')


function doSearch(state) {
    state.searching.set(true)
    api.search(state.keywords.text(),
               state.page(),
               function (status, products, totalPages) {
        if (status.success) {
            state.products.set(products)
            state.totalPages.set(totalPages)
        }
        state.searching.set(false)
    })
}


function Search(opts, selectProductCallback) {
    opts = opts || {}

    function submit(keywords) {
        doSearch(state)
    }

    var state = hg.state({
        products: hg.array([]),
        keywords: AutoCompleteInput(opts.keywords, api.autocomplete, submit),
        page: hg.value(opts.page || 1),
        totalPages: hg.value(0),
        condition: hg.value(opts.condition || 'New'),
        searching: hg.value(false),
        handles: {
            doSearch: doSearch,
            page: function (state, page) {
                state.page.set(page)
                doSearch(state)
            },
            selectProduct: function (state, product) {
                selectProductCallback(product)
            }
        }
    })

    state.searching(function (searching) {
        AutoCompleteInput.setEnabled(state.keywords, !searching)
    })

    return state
}


function renderPagination(state) {
    return h('ul.pagination', [
        state.page > 1 ? h('li',
            h('a', {
                'ev-click': hg.clickEvent(state.handles.page, state.page - 1)
            }, '<')) : null,
        Array.apply(null, Array(state.totalPages)).map(function (_, page) {
            page = page + 1
            return h(page !== state.page ? 'li' : 'li.selected',
                h(state.page === page ? 'span' : 'a', {
                    'ev-click': hg.clickEvent(state.handles.page, page)
                }, String(page))
            )
        }),
        state.totalPages > state.page ? h('li',
            h('a', {
                'ev-click': hg.clickEvent(state.handles.page, state.page + 1)
            }, '>')) : null,
    ])
}


Search.render = function (state) {
    var pagination = renderPagination(state)
    return h('#search' + (state.searching ? '.disabled' : ''), {
        'ev-event': hg.submitEvent(state.handles.doSearch)
    }, [
        AutoCompleteInput.render(state.keywords, !state.searching),
        pagination,
        h('ul.products', state.products.map(function (product) {
            return h('li', [
                Product.render(product),
                h('a.add', {
                    'ev-click': hg.clickEvent(state.handles.selectProduct, product)
                }, 'Add to my club')
            ])
        })),
        pagination
    ])
}


module.exports = Search
