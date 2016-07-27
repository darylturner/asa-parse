const nat_parse = /nat \((\w+)\) (\d) ([\w\.-]+) ?([\w\.-]+)?/;
const global_parse = /global \((\w+)\) (\d) ([\w\.-]+)/;

const ipAddress = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/

function parseNAT(nat) {
    var match = nat.match(nat_parse);

    var nObj = {
        internal_int: match[1],
        id: match[2]
    };

    var mask;
    if (match[4]) {
        mask = match[4];
    } else {
        mask = '255.255.255.255';
    }

    if (match[3] === 'access-list') {
        nObj.value = {
            type: 'access-list',
            value: match[4]
        };
    } else if (match[3].match(ipAddress)) {
        nObj.value = {
            type: 'network',
            value: match[3] + '/' + mask
        };
    } else {
        nObj.value = {                  
            type: 'alias',
            value: match[3] + '/' + mask
        };
    }
    return nObj;
}

function parseGlobal(global) {
    var match = global.match(global_parse);

    var gObj = {
        external_int: match[1],
        id: match[2]
    };

    if (match[3].match(/[\d\.]+-[\d\.]+/)) {
        gObj.value = {
            type: 'range',
            value: match[3].split('-').join(' ')
        };
    } else if (match[3].match(ipAddress)) {
        gObj.value = {
            type: 'single',
            value: match[3]
        };
    } else {
        gObj.value = {
            type: 'alias',
            value: match[3]
        };
    }
    return gObj;
}

module.exports = function(statement) {
    if (statement.match(nat_parse)) {
        return parseNAT(statement);
    } else if (statement.match(global_parse)) {
        return parseGlobal(statement);
    } else {
        throw new Error('dynamic nat parse error: ' + statement);
    }
}
