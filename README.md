#

## Why write another logger?
We didn't. Ernie plugs into your existing logger. Ernie is a set of event emitters behind an interface that makes it look like a logger.
```js
logger.on('message', function(event) {
    // Replace with your logger of choice
    console.log(event.level.toUpperCase(), event.message)
})
logger.debug('Server started')
```
Results in
```
DEBUG Server started
```
However the power comes when you chain event emitters together
var sequence = new Sequence([
    new System(),
    new Process(),
    new Env()
])
logger.on('message', sequence.handle)
sequence.on('message', function(event) {
    // Replace with your logger of choice
    console.log(event.level.toUpperCase(), event.os.hostname, event.process.pid, event.env.NODE_ENV, event.message)
})
Results in
```
DEBUG sophrosyne 8285 development Server started
```

## Why did you write an event emitter that looks like a logger, but doesn't log anything?
```
We built a microservice based architecture but ran into problems with our [ELK stack](https://www.elastic.co/webinars/introduction-elk-stack). With the default configuration ElasticSearch dynamically creates a schema the first time it encounters a property. This means the first service to execute
```js
log.debug('Bad request', { user: 'cressie176' })
```
Defines the schema and any subsequent log statments along the lines of
```js
log.debug('Bad request', { user: { id: 'cressie176' }})
```
will cause ElasticSearch to throw and error and the message to be dropped. When ElasticSearch throws an error it slows down. A noisy service, logging messages in high volumes can cause a delay in logs.

As second problem we encountered is that developers were careless with what they logged. We've had binary messages, web pages, emails and some very large json documents transmitted to our logging infrastructure, degrading performance, incurring cost and most significantly risking information leak (thankfully none of the content was or a financial or personal nature).

We felt it was infeasible for multiple development teams working on different sets of microservices to keep track of a common logging schema without tooling, and experience has taught us that education isn't sufficient to prevent these problems happening again, so we built a logger that supports a centrally managed, easy to update schema. We could have done this in logstash, but thought this would have been harder to maintain and update. It's also preferable to filter documents prior to transmission.
```

## What other features does Ernie have?

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
The log level is derived from the parameters, but can also be forced
```js
// Emits { message: 'On Noes', level: 'warn', error: { message: 'On Noes', stack: ... }}
logger.warn(new Error('On Noes'))
```
The default log level for messages is 'info', but can be overriden in the constructor options
```js
new Logger({ level: 'trace' }).log('will be logged at trace')
```

### Support for common log levels
The supported log levels are trace, debug, info, warn, error and fatal. You can add additional log levels by extending the Logger class, e.g.

```js
Logger.catastrophic = function catastrophic(arg1, arg2, arg3) {
    __logEvent.apply(self, toArray(arguments).concat('catastrophic'))
    return self
}
```

### Custom log levels
```

var Logger = require('events').Logger
var util = require('util')
var Logger = require('ernie').Logger

function MyLogger() {

    var self = this

    this.catastrophe = function(event) {
        self._logEvent(event)
    }

    Logger.call(this);
}

util.inherits(MyLogger, Logger)

module.exports = MyLogger

## Child Loggers



Clone

