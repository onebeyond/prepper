var R = require('ramda')

module.exports = function() {

    var events = []
    var self

    this.store = function(event) {
        events.push(event)
    }

    this.list = function() {
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
}