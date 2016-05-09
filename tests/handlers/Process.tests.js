var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Process = lib.handlers.Process

describe('Process Decorator', function() {

    var repo = new Repo()
    var proc = new Process()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', proc.handle)
        proc.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        proc.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with details from process', function() {
        logger.debug('meh')

        var event = repo.first()
        assert.ok(event.process.pid)
        assert.ok(event.process.title)
        assert.ok(event.process.version)
        assert.ok(event.process.memory)
    })
})