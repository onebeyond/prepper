var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Env = lib.handlers.Env

describe('Env Decorator', function() {

    var repo
    var env
    var logger

    beforeEach(function() {
        repo = new Repo()
        env = new Env()
        logger = new Logger()

        logger.on('message', env.handle)
        env.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        env.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with environment variables', function() {
        logger.debug('meh')
        assert.ok(repo.first().env.NODE_ENV, 'test')
    })
})
