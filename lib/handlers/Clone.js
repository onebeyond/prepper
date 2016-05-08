var EventEmitter = require('events').EventEmitter
var util = require('util')
var clone = require('lodash.cloneDeep')

function Clone() {

    var self = this

    this.handle = function(event) {
        self.emit('message', clone(event))
    }

    EventEmitter.call(this);
}

util.inherits(Clone, EventEmitter)

module.exports = Clone