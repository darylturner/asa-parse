module.exports = function(name) {
    var match = name.match(/name (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) ([\w-]*)/);
    if (!match) {
        throw new Error('name parsing error: ' + name);
    }
    return {
        value: match[1],
        name: match[2]
    }
}
