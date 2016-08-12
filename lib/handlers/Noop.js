var EventEmitter = require('events').EventEmitter
var util = require('util')

function Noop() {

    var self = this

    this.handle = function(event) {
        self.emit('message', event)
    }

    EventEmitter.call(this);
}

util.inherits(Noop, EventEmitter)

module.exports = Noop