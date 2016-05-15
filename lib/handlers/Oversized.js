var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')
var stringify = require('../utils/stringify');

function Oversized(options) {

    if (!options.size) throw new Error('size is required')
    var self = this

    self.handle = function(event) {
        var result = stringify(event)
        var violations = {}
        if (result.text.length > options.size) violations.oversized = result.text.length
        if (result.circular) violations.circular = true
        self.emit('message', merge({}, { prepper: { violations: violations } }, event))
    }

    EventEmitter.call(self);
}

util.inherits(Oversized, EventEmitter)

module.exports = Oversized