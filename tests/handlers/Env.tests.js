var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Env = lib.handlers.Env

describe('Process Decorator', function() {

    var repo = new Repo()
    var env = new Env()
    var logger = new Logger()

    beforeEach(function() {
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