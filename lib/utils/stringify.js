// safe-json-stringify doesnt provide feedback on circular references
// json-stringify-safe breaks when a property getting throws an error

var hasProp = Object.prototype.hasOwnProperty

function safeGetValueFromPropertyOnObject(obj, property) {
    if (hasProp.call(obj, property)) {
        try { return obj[property] }
        catch (err) { return }
    }
    return obj[property]
}

function stringify(obj, wtf) {

    function visit(obj) {
        if (obj === null || typeof obj !== 'object') return obj

        if (seen.indexOf(obj) !== -1) {
            circular = true
            return
        }
        seen.push(obj)

        if (typeof obj.toJSON === 'function') {
            try { return visit(obj.toJSON()) } catch(err) {}
        }

        if (Array.isArray(obj)) return obj.map(visit)

        return Object.keys(obj).reduce(function(result, prop) {
            // prevent faulty defined getter properties
            result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop))
            return result
        }, {})
    }

    var seen = [ ] // store references to objects we have seen before
    var circular = false
    var text = JSON.stringify(visit(obj))

    return { circular: circular, text: text}
}

module.exports = function(data) {
    return stringify(data, {})
}
