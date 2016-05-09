var EventEmitter = require('events').EventEmitter
var util = require('util')
var isString = util.isString
var isFunction = util.isFunction
var merge = require('merge')
var R = require('ramda')

function EnvDecorator(_options) {

    var options = merge.recursive(true, { exclude: [], include: [] }, _options)
    var self = this

    this.handle = function(event) {
        var env = R.pipe(R.pickBy(notExcluded), R.pickBy(included))(process.env)
        self.emit('message', merge.recursive(true, { env: env }, event))
    }

    function notExcluded(value, key) {
        if (options.exclude.length === 0) return true
        return R.none(function(testable) {
            return testable.test(key)
        }, options.exclude)
    }

    function included(value, key) {
        if (options.include.length === 0) return true
        return R.any(function(testable) {
            return testable.test(key)
        }, options.include)
    }

    function ensureRegExp(testable) {
        if (isString(testable)) return new RegExp('\\b' + testable + '\\b')
        if (isFunction(testable.test)) return testable
        if (isFunction(testable)) return { test: testable }
        throw new Error('Predicates must be a string, regular expression or function')
    }

    options.exclude = R.map(ensureRegExp, options.exclude)
    options.include = R.map(ensureRegExp, options.include)

    EventEmitter.call(this);
}

util.inherits(EnvDecorator, EventEmitter)

module.exports = EnvDecorator