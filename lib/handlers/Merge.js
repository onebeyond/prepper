var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')
var set = require('lodash.set')

function Merge(_other, _options) {

    var options = _options || {}
    var other = options.key ? set({}, options.key, _other) : _other
    var self = this

    this.handle = function(event) {
        self.emit('message', options.invert ? merge({}, event, other) : merge({}, other, event))
    }

    EventEmitter.call(this);
}

util.inherits(Merge, EventEmitter)

module.exports = Merge