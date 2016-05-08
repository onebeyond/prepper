var assert = require('chai').assert
var lib = require('../..')
var semver = require('semver')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Pkg = lib.handlers.Pkg
var json = require('../../package.json')

describe('Package Decorator', function() {

    var repo = new Repo()
    var pkg = new Pkg(json)
    var logger = new Logger()

    beforeEach(function() {
        logger.on('message', pkg.handle)
        pkg.on('message', repo.handle)
    })

    afterEach(function() {
        repo.clear()
        pkg.removeAllListeners()
        logger.removeAllListeners()
    })

    it('should decorate events with details from package json', function() {
        logger.debug('meh')

        var events = repo.list()
        assert.equal(repo.count(), 1)
        assert.equal(events[0].level, 'debug')
        assert.equal(events[0].message, 'meh')
        assert.equal(events[0].package.name, 'ernie')
        assert.ok(semver.valid(events[0].package.version))
    })
})