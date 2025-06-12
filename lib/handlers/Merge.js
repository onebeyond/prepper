var EventEmitter = require('events').EventEmitter
var util = require('util')
var _ = require('lodash')

function Merge(_other, _options) {

    var options = _options || {}
    var other = options.key ? _.set({}, options.key, _other) : _other
    var self = this

    this.handle = function(event) {
        self.emit('message', options.invert ? _.merge({}, event, other) : _.merge({}, other, event))
    }

    EventEmitter.call(this);
}

util.inherits(Merge, EventEmitter)

module.exports = Merge