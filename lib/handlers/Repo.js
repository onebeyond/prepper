var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')

function Repo() {

    var events = []

    this.handle = function(event) {
        events.push(event)
    }

    this.first = function(fn) {
        return this.find(fn)[0]
    }

    this.second = function(fn) {
        return this.find(fn)[1]
    }

    this.list = function(fn) {
        return this.find()
    }

    this.count = function(fn) {
        return this.find(fn).length
    }

    this.find = function(fn) {
        fn = fn || function() { return true }
        return R.reduce(function(results, event) {
            return fn(event) ? results.concat(event) : results
        }, [], events)
    }

    this.findBy = function(key, pattern) {
        return this.find(function(event) {
            return new RegExp(pattern).test(event[key])
        })
    }

    this.isEmpty = function() {
        return events.length === 0
    }

    this.clear = function() {
        events = []
    }
    EventEmitter.call(this);
}

util.inherits(Repo, EventEmitter)

module.exports = Repo