module.exports = function(name) {
    var match = name.match(/access-group ([\w-]*) (in|out) interface ([\w-]*)/);
    if (!match) {
        throw new Error('access-group parsing error: ' + name);
    }
    return {
        name: match[1],
        direction: match[2],
        interface: match[3]
    }
}
