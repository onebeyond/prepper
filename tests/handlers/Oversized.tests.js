var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Oversized = lib.handlers.Oversized

describe('Oversized Decorator', function() {

    var repo = new Repo()
    var logger = new Logger()

    afterEach(function() {
        repo.clear()
        logger.removeAllListeners()
    })

    it('should decorate large events with oversized violation', function() {

        var oversized = new Oversized({ size: 1000 })
        logger.on('message', oversized.handle)
        oversized.on('message', repo.handle)

        logger.debug('meh', { process: process })
        var event = repo.first()
        assert.ok(event.process.title)
        assert.ok(event.prepper.violations.oversized)
    })

    it('should not decorate small events with oversized violation', function() {
        var oversized = new Oversized({size: 400000})
        logger.on('message', oversized.handle)
        oversized.on('message', repo.handle)

        logger.debug('meh', { process: process })
        var event = repo.first()
        assert.ok(event.process.title)
        assert.ok(event.prepper.violations.oversized)
    })

    it('should decorate circular events with circular violation', function() {

        var oversized = new Oversized({ size: 1000 })
        logger.on('message', oversized.handle)
        oversized.on('message', repo.handle)

        logger.debug('meh', { process: process })
        var event = repo.first()
        assert.ok(event.process.title)
        assert.ok(event.prepper.violations.circular)
    })
})