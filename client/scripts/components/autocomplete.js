'use strict';

var hg = require('mercury')
var h = hg.h

/*var ESCAPE = 27
var UP = 39
var DOWN = 40*/


function AutoCompleteInput(initial, getChoices, submitCallback) {
    initial = initial || {}
    return hg.state({
        text: hg.value(initial.text || ''),
        choices: hg.array([]),
        editing: hg.value(false),
        enabled: hg.value(true),
        handles: {
            change: function (state, text) {
                state.text.set(text.value)
                getChoices(text.value, function (choices) {
                    state.choices.set(choices)
                })
            },
            select: function (state, choice) {
                state.text.set(choice)
                getChoices(choice, function (choices) {
                    state.choices.set(choices)
                })
                state.editing.set(false)
                submitCallback(choice)
            },
            startEditing: function (state) {
                state.editing.set(true)
            },
            stopEditing: function (state) {
                state.editing.set(false)
            },
            keyDown: function (state) {
                console.log('keyDown')
            }
        }
    })
}

AutoCompleteInput.setEnabled = function (state, enabled) {
    state.enabled.set(enabled)
}


AutoCompleteInput.render = function (state) {
    return h('div.autocomplete', {
        //'ev-event': hg.keyEvent(state.handles.keyDown, ESCAPE),
    }, [
        h('input', {
            type: 'search',
            name: 'value',
            value: String(state.text),
            disabled: !state.enabled,
            'ev-event': hg.changeEvent(state.handles.change),
            'ev-focus': hg.valueEvent(state.handles.startEditing),
            'ev-blur': hg.valueEvent(state.handles.stopEditing)
        }),
        state.editing && state.choices.length > 0 ? h('ul', state.choices.map(function (choice) {
            return h(state.text === choice ? 'li.selected' : 'li', {
                'ev-event': hg.clickEvent(state.handles.select, choice)
            }, choice)
        })) : []
    ])
}

module.exports = AutoCompleteInput
