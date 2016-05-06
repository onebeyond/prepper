var R = require('ramda')

module.exports = function() {

    var events = []

    this.onMessage = function(event) {
        events.push(event)
    }

    this.list = function() {
        return events
    }

    this.find = function(fn) {
        return R.reduce(function(results, event) {
            return fn(event) ? results.concat(event) : results
        }, [], events)
    }

    this.findBy = function(key, pattern) {
        return this.find(function(event) {
            return new RegExp(pattern).test(event[key])
        })
    }

    this.clear = function() {
        events = []
    }
}