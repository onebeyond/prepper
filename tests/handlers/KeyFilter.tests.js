var assert = require('chai').assert
var get = require('lodash.get')
var has = require('lodash.has')
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var KeyFilter = lib.handlers.KeyFilter
var Flatten = lib.handlers.Flatten
var Unflatten = lib.handlers.Unflatten

describe('Key Filter', function() {

    var repo = new Repo()
    var logger = new Logger()
    var flatten = new Flatten()
    var unflatten = new Unflatten()

    afterEach(function() {
        repo.removeAllListeners().clear()
        logger.removeAllListeners()
        flatten.removeAllListeners()
        unflatten.removeAllListeners()
    })

    function wireUp(keyFilter) {
        logger.on('message', flatten.handle)
        flatten.on('message', keyFilter.handle)
        keyFilter.on('message', unflatten.handle)
        unflatten.on('message', repo.handle)
    }

    it('should exclude keys matching specified regular expressions', function() {
        var keyFilter = new KeyFilter({ exclude: [/password/i, /secret/i] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should exclude keys matching specified strings', function() {
        var keyFilter = new KeyFilter({ exclude: ['password', 'secret'] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should exclude keys matching function', function() {
        var keyFilter = new KeyFilter({ exclude: [function(key) {
            return (key === 'password' || key === 'secret')
        }] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should report excludes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          new KeyFilter({ exclude: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })

    it('should include keys matching specified regular expressions', function() {
        var keyFilter = new KeyFilter({ include: [/username/, /aws\.key/] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should include keys matching specified strings', function() {
        var keyFilter = new KeyFilter({ include: ['username', 'aws.key'] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should include keys matching function', function() {
        var keyFilter = new KeyFilter({ include: [function(key) {
            return (key === 'username' || key === 'aws.key')
        }] })

        wireUp(keyFilter)

        logger.debug({ username: 'cressie176', password: 'bar', aws: { key: 123, secret: 'baz' } })

        var event = repo.first()
        assert.equal(get(event, 'username'), 'cressie176')
        assert.equal(get(event, 'aws.key'), 123)
        assert.isFalse(has(event, 'password'))
        assert.isFalse(has(event, 'secret'))
    })

    it('should report includes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          new KeyFilter({ include: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })
})