var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var SystemDecorator = lib.handlers.SystemDecorator

describe('System Decorator', function() {

    var repo = new Repo()
    var system = new SystemDecorator()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', system.handle)
        system.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        system.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with details from the os', function() {
        logger.debug('meh')

        var event = repo.first()
        assert.ok(event.os.hostname)
        assert.ok(event.os.type)
        assert.ok(event.os.platform)
        assert.ok(event.os.release)
        assert.ok(event.os.mem.total)
        assert.ok(event.os.mem.free)
        assert.ok(event.os.loadavg)
    })
})