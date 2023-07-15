# Prepper
Prepper is an event based api for filtering, decorating and validating log events before routing them to your logging framework of choice. It's especially useful in a micro-service environment where it is otherwise hard to ensure consistent and responsible logging practice.

[![NPM version](https://img.shields.io/npm/v/prepper.svg?style=flat-square)](https://www.npmjs.com/package/prepper)
[![NPM downloads](https://img.shields.io/npm/dm/prepper.svg?style=flat-square)](https://www.npmjs.com/package/prepper)
[![Build Status](https://img.shields.io/travis/guidesmiths/prepper/master.svg)](https://travis-ci.org/guidesmiths/prepper)
[![Code Climate](https://codeclimate.com/github/guidesmiths/prepper/badges/gpa.svg)](https://codeclimate.com/github/guidesmiths/prepper)
[![Test Coverage](https://codeclimate.com/github/guidesmiths/prepper/badges/coverage.svg)](https://codeclimate.com/github/guidesmiths/prepper/coverage)
[![Code Style](https://img.shields.io/badge/code%20style-imperative-brightgreen.svg)](https://github.com/guidesmiths/eslint-config-imperative)
[![Dependency Status](https://david-dm.org/guidesmiths/prepper.svg)](https://david-dm.org/guidesmiths/prepper)
[![devDependencies Status](https://david-dm.org/guidesmiths/prepper/dev-status.svg)](https://david-dm.org/guidesmiths/prepper?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/03d3439aa152219a9f36/maintainability)](https://codeclimate.com/github/onebeyond/prepper/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/03d3439aa152219a9f36/test_coverage)](https://codeclimate.com/github/onebeyond/prepper/test_coverage)

## tl;dr
```js
const prepper = require('prepper')
const pkg = require('./package.json')
const os = require('os')
const Sequence = prepper.handlers.Sequence
const Merge = prepper.handlers.Merge

const logger = new prepper.Logger([
    new Merge({ system: { hostname: os.hostname() } }),
    new Merge({ package: { name: pkg.name } }),
    new Merge({ process: { pid: process.pid } })
]).on('message', function(event) {
    // Replace with your logger of choice
    console.log(event.level.toUpperCase(), event.system.hostname, event.process.pid, event.package.name, event.message)
})

logger.debug('Server started')
```
Results in
```
DEBUG sophrosyne 8285 prepper Server started
```

## Why write another logger?
We didn't. Prepper is a sequence of event handlers/emitters hidden behind an api that makes it look like a logger. The emitters decorate or filter attributes of the log event as it bubbles to the finally handler, which should invoke the logging framework of your choice.

## Why write an event emitter that looks like a logger, but doesn't log anything?
We ran into problems with our [ELK stack](https://www.elastic.co/webinars/introduction-elk-stack). With the default configuration ElasticSearch dynamically creates a schema the first time it encounters a property. This means the first service to execute
```js
log.debug('Bad request', { user: 'cressie176' })
```
Defines the schema and any subsequent log statments along the lines of
```js
log.debug('Bad request', { user: { id: 'cressie176' }})
```
will cause ElasticSearch to throw an error and the message to be dropped. When ElasticSearch throws an error it slows down. A noisy service, logging messages in high volumes can cause a delay in logs.

As second problem we encountered is that developers were careless with what they logged. We've had binary messages, web pages, emails and some very large json documents transmitted to our logging infrastructure, degrading performance, incurring cost and most significantly risking information leak (thankfully none of the content was or a financial or personal nature).

We felt it infeasible for multiple development teams working on different sets of microservices to keep track of a common logging schema without tooling, and experience has taught us that education isn't sufficient to prevent these problems happening again, so we built a logger that supports a centrally managed, easy to update schema. We could have done this with a static ElasticSearch schema or with logstash groks, but thought this would have been harder to maintain and update. It's also preferable to filter documents prior to transmission.

## What other features does Prepper have?

### A helpful API
The api was designed to support common use cases for logging messages and errors with context
```js
logger.log([message], [error], [context])
```
For example:
```js
// Emits { message: 'some message', level: 'info' }
logger.log('some message')

// Emits { message: 'some message', level: 'info', user: { ... }}
logger.log('some message', { user: user })

// Emits { message: 'On Noes', level: 'error', error: { message: 'On Noes', stack: ... }}
logger.log(new Error('Oh Noes'))

// Emits { message: 'An error occurred', level: 'error', error: { message: 'On Noes', stack: ... }}
logger.log('An error occurred', new Error('Oh Noes'))
```

### Support for common log levels
The supported log levels are trace, debug, info, warn, error and fatal.
```js
// Emits { message: 'some message', level: 'trace' }
logger.trace('some message')

// Emits { message: 'On Noes', level: 'warn', error: { message: 'On Noes', stack: ... }}
logger.warn(new Error('Oh Noes'))
```

### Custom log levels
You can add additional log levels by extending the Logger class, e.g.
```
function MyLogger() {
    var self = this
    this.catastrophe = function(event) {
        var args = Array.prototype.slice.apply(arguments)
        self._logEvent.apply(self, args.concat('catastrophe'))
        return self
    }
    Logger.call(this);
}
util.inherits(MyLogger, Logger)

module.exports = MyLogger
```
### Request scoped loggers
Because loggers are event emitters too you can wire them together. By defining an application scoped logger, referenced by ```app.locals.logger``` and a request scoped logger referenced by ```response.locals.logger```, and connecting them together you can automatically decorate log events with request details. See the express tests for an example.

### Thoughtful error treatment
Sometimes you need to yield and error, but don't want it logged as one. If you decorate the error object with a ```level``` attribute set to the desired level and log the error with ```logger.log(err)``` instead of ```logger.error(err)```, prepper will use the specified level rather than the default of error. Any other attributes (e.g. ```code```) added to an error will be included in the event too.

### A few helpful handlers

#### Merge
Merges the given object into the event. You can optionally supply a key and whether to merge left or right.
```js
// Merges package json into the event under the package sub-document, overwriting existing properties
new prepper.handlers.Merge(packageJson, { key: 'package', invert: true })
```
#### Env
Decorates the event with all key value pairs from ```process.env``` under the ```env``` sub-document
```js
new prepper.handlers.Env()
```
#### Process
Decorates the event with various process properties (title, version, pid, memory usage, etc) under the ```process``` sub-document
```js
new prepper.handlers.Process()
```
#### System
Decorates the event with various os properties (hostname, load average, memory usage, platform, release, etc) under the ```system``` sub-document
```js
new prepper.handlers.System()
```
#### Timestamp
Decorates the event with a timestamp
```js
new prepper.handlers.Timestamp()
```
### Tracer
Decorates the event with a new uuid or existing tracer if specified. Especially useful for web applications when the logger is scoped to the request
```js
new prepper.handlers.Tracer({ tracer: req.headers.tracer })
```
### KeyFilter
Includes or excludes properties based on keyname. Useful for removing password fields and limiting output to a fixed schema
```js
// Restrict the log even to a reasonable set of values, explicitly excluding potentially sensitve fields
// and package dependencies that might creep in accidentally because of names like 'leveldb'
new prepper.handlers.KeyFilter({
    include: [
        'tracer',
        'timestamp',
        'level',
        'message',
        'error.message',
        'error.code',
        'error.stack',
        'request.url',
        'request.headers',
        'request.params',
        'request.method',
        'response.statusCode',
        'response.time',
        'env.NODE_ENV',
        'env.USER',
        'env.PWD',
        'process',
        'system',
        'package.name',
        'user.id',
        'user.username'
    ],
    exclude: [
        'password',
        'secret',
        'token',
        'request.headers.cookie',
        'dependencies',
        'devDependencies'
    ]
})
```
The KeyFilter assumes that you have flattened the event object previously in the sequence, and that you will unflatten it at some point prior to logging. The KeyFilter deliberately doesn't flatten the event object internally as it's likely you might want to filter based on keys or values in another handler. We do provide handlers for Flattening and Unflattening the event, so usage is likely to be:
```js
new prepper.handlers.Sequence([
    new prepper.handlers.Flatten(),
    new prepper.handlers.KeyFilter( includes: [...], excludes: [...] ),
    new prepper.handlers.ValueFilter( excludes: [creditCards, etc] ), // Not implemented yet
    new prepper.handlers.Unflatten()
])
```
#### Oversized
Decorates the event with an ```prepper.violation.oversized``` property if the stringified version of the event is larger than the given size. Circular references are ignored, as are toJSON functions and property getters which throw exceptions.
```js
new prepper.handlers.Oversized({ size: 20000 })
```



