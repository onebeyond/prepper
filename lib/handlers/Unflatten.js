var EventEmitter = require('events').EventEmitter
var util = require('util')
var unflatten = require('flat').unflatten

function Unflatten() {

    var self = this

    this.handle = function(event) {
        self.emit('message', unflatten(event))
    }

    EventEmitter.call(this);
}

util.inherits(Unflatten, EventEmitter)

module.exports = Unflatten