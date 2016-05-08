var requireAll = require('require-all')

module.exports = {
    Logger: require('./lib/Logger'),
    handlers: requireAll(__dirname + '/lib/handlers')
}