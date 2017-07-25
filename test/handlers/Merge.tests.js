var assert = require('chai').assert
var lib = require('../..')
var Logger = lib.Logger
var Repo = lib.handlers.Repo
var Merge = lib.handlers.Merge

describe('Merge', function() {

    it('should merge object into the root of the event', function() {
        var logger = new Logger()
        var merge = new Merge({ name: 'ernie', version: '1.2.3' })
        var repo = new Repo()

        logger.on('message', merge.handle)
        merge.on('message', repo.handle)

        logger.debug('meh')

        var event = repo.first()
        assert.equal(event.name, 'ernie')
        assert.equal(event.version, '1.2.3')
    })

    it('should merge object into the event at the specified key', function() {
        var logger = new Logger()
        var merge = new Merge({ name: 'ernie', version: '1.2.3' }, { key: 'package' })
        var repo = new Repo()

        logger.on('message', merge.handle)
        merge.on('message', repo.handle)

        logger.debug('meh')

        var event = repo.first()
        assert.equal(event.package.name, 'ernie')
        assert.equal(event.package.version, '1.2.3')
    })

    it('should not overwrite values in the original event normally', function() {
        var logger = new Logger()
        var merge = new Merge({ name: 'ernie', version: '1.2.3' }, { key: 'package' })
        var repo = new Repo()

        logger.on('message', merge.handle)
        merge.on('message', repo.handle)

        logger.debug('meh', { package: { name: 'bert' }})

        var event = repo.first()
        assert.equal(event.package.name, 'bert')
        assert.equal(event.package.version, '1.2.3')
    })

    it('should not overwrite values in the original event when inverted', function() {
        var logger = new Logger()
        var merge = new Merge({ name: 'ernie', version: '1.2.3' }, { key: 'package', invert: true })
        var repo = new Repo()

        logger.on('message', merge.handle)
        merge.on('message', repo.handle)

        logger.debug('meh', { package: { version: '1.0.0' }} )

        var event = repo.first()
        assert.equal(event.package.name, 'ernie')
        assert.equal(event.package.version, '1.2.3')
    })
})