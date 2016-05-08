var EventEmitter = require('events').EventEmitter
var util = require('util')
var flatten = require('flat').flatten

function Flatten() {

    var self = this

    this.handle = function(event) {
        self.emit('message', flatten(event))
    }

    EventEmitter.call(this);
}

util.inherits(Flatten, EventEmitter)

module.exports = Flatten