var EventEmitter = require('events').EventEmitter
var util = require('util')
var _ = require('lodash')

function Timestamp() {

    var self = this

    this.handle = function(event) {
        self.emit('message', _.merge({}, { timestamp: new Date() }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Timestamp, EventEmitter)

module.exports = Timestamp