var EventEmitter = require('events').EventEmitter
var util = require('util')
var merge = require('lodash.merge')

function Timestamp() {

    var self = this

    this.handle = function(event) {
        self.emit('message', merge({}, { timestamp: new Date() }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Timestamp, EventEmitter)

module.exports = Timestamp