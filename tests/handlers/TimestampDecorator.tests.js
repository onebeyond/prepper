var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Timestamp = lib.handlers.TimestampDecorator

describe('Timestamp Decorator', function() {

    var repo = new Repo()
    var timestamp = new Timestamp()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', timestamp.handle)
        timestamp.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        timestamp.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with a timestamp', function() {
        logger.debug('meh')
        assert.ok(Date.now() - repo.first().timestamp.getTime() < 1000)
    })
})