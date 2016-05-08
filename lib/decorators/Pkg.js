var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')

function Pkg(json) {

    var self = this

    this.decorate = function(event) {
        self.emit('message', R.merge({ package: { name: json.name, version: json.version } }, event))
    }

    EventEmitter.call(this);
}

util.inherits(Pkg, EventEmitter)

module.exports = Pkg