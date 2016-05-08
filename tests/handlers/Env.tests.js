var assert = require('chai').assert
var get = require('lodash.get')
var has = require('lodash.has')
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Env = lib.handlers.Env
var Flatten = lib.handlers.Flatten
var Unflatten = lib.handlers.Unflatten

describe('Env', function() {

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

    function wireUp(env) {
        logger.on('message', flatten.handle)
        flatten.on('message', env.handle)
        env.on('message', unflatten.handle)
        unflatten.on('message', repo.handle)
    }

    it('should exclude keys matching specified regular expressions', function() {
        wireUp(new Env({ exclude: [/path/i, /user/i] }))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should exclude keys matching specified strings', function() {
        wireUp(new Env({ exclude: ['PATH', 'USER'] }))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should exclude keys matching function', function() {
        wireUp(new Env({ exclude: [function(key) {
            return (key === 'PATH' || key === 'USER')
        }]}))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should report excludes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          new Env({ exclude: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })

    it('should include keys matching specified regular expressions', function() {
        wireUp(new Env({ include: [/NODE_ENV/] }))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should include keys matching specified strings', function() {
        wireUp(new Env({ include: ['NODE_ENV'] }))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should include keys matching function', function() {
        wireUp(new Env({ include: [function(key) {
            return (key === 'NODE_ENV')
        }]}))

        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should report includes that are not Strings, Regular Expressions or Functions', function() {
        assert.throws(function() {
          new Env({ include: [1] })
        }, /Predicates must be a string, regular expression or function/)
    })
})