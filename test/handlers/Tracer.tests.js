var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Tracer = lib.handlers.Tracer

describe('Tracer', function() {

    var repo = new Repo()
    var tracer = new Tracer()
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', tracer.handle)
        tracer.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        tracer.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with a tracer', function() {
        logger.debug('meh')
        assert.ok(repo.first()['tracer'])
    })

    it('should reuse the tracer', function() {
        logger.debug('meh')
        logger.debug('blah')
        assert.equal(repo.first()['tracer'], repo.second()['tracer'])
    })
})