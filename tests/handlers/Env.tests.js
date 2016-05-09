var assert = require('chai').assert
var get = require('lodash.get')
var has = require('lodash.has')
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Sequence = lib.handlers.Sequence
var Env = lib.handlers.Env
var Flatten = lib.handlers.Flatten
var Unflatten = lib.handlers.Unflatten

describe('Env Decorator', function() {

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

    it('should exclude keys matching specified regular expressions', function() {
        logger.on('message', new Sequence([flatten, new Env({ exclude: [/path/i, /user/i] }), unflatten, repo]).handle)
        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should exclude keys matching specified strings', function() {
        logger.on('message', new Sequence([flatten, new Env({ exclude: ['PATH', 'USER'] }), unflatten, repo]).handle)
        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should exclude keys matching function', function() {
        logger.on('message', new Sequence([flatten, new Env({ exclude: [function(key) {
            return (key === 'PATH' || key === 'USER')
        }]}), unflatten, repo]).handle)

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
        logger.on('message', new Sequence([flatten, new Env({ include: [/NODE_ENV/] }), unflatten, repo]).handle)
        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should include keys matching specified strings', function() {
        logger.on('message', new Sequence([flatten, new Env({ include: ['NODE_ENV'] }), unflatten, repo]).handle)
        logger.debug({})

        var event = repo.first()
        assert.equal(get(event, 'env.NODE_ENV'), 'test')
        assert.isFalse(has(event, 'env.PATH'))
        assert.isFalse(has(event, 'env.USER'))
    })

    it('should include keys matching function', function() {
        logger.on('message', new Sequence([flatten, new Env({ include: [function(key) {
            return (key === 'NODE_ENV')
        }]}), unflatten, repo]).handle)

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