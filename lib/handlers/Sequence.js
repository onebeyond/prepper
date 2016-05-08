var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')

function Sequence(_handlers) {

    var handlers = [this].concat(_handlers)
    var self = this

    this.handle = function(event) {
        self.emit('message', event)
    }

    R.times(function(i) {
        handlers[i].on('message', function(event) {
            handlers[i+1].handle(event)
        })
    }, handlers.length - 1)

    EventEmitter.call(this);
}

util.inherits(Sequence, EventEmitter)

module.exports = Sequence