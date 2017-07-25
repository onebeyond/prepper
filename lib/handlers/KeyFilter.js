var EventEmitter = require('events').EventEmitter
var util = require('util')
var R = require('ramda')
var isString = R.compose(R.equals('String'), R.type)
var isFunction = R.compose(R.equals('Function'), R.type)
var merge = require('lodash.merge')

function KeyFilter(_options) {

    var options = merge({}, { exclude: [], include: [] }, _options)
    var self = this

    this.handle = function(event) {
        self.emit('message', R.pipe(R.pickBy(notExcluded), R.pickBy(included))(event))
    }

    function notExcluded(value, key) {
        return consider(value, key, R.none, options.exclude)
    }

    function included(value, key) {
        return consider(value, key, R.any, options.include)
    }

    function consider(value, key, includeOrExclude, items) {
        if (items.length === 0) return true
        return includeOrExclude(function(testable) {
            return testable.test(key)
        }, items)
    }

    function ensureRegExp(testable) {
        if (isString(testable)) return new RegExp('\\b' + testable + '\\b', 'i')
        if (isFunction(testable.test)) return testable
        if (isFunction(testable)) return { test: testable }
        throw new Error('Predicates must be a string, regular expression or function')
    }

    options.exclude = R.map(ensureRegExp, options.exclude)
    options.include = R.map(ensureRegExp, options.include)

    EventEmitter.call(this);
}

util.inherits(KeyFilter, EventEmitter)

module.exports = KeyFilter
