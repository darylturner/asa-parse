// static nat patterns
const portForward = /^static \((\w+),(\w+)\) (tcp|udp) (interface|[\w-\.]+) (\w+) ([\w-\.]+) ([\w]+) ?(netmask [\d.]+)?/;
const one2one = /^static \((\w+),(\w+)\) (interface|[\w-\.]+) (access-list [\w-]+|[\w-\.]+) ?(netmask [\d.]+)?/;

const ipAddress = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;

function parsePortForward(nat) {
    var match = nat.match(portForward);
    var externalIP = match[4];
    var internalIP = match[6];

    if (match[8]) {
        mask = match[8].split(' ')[1].trim();
    } else {
        mask = '255.255.255.255'
    }

    if (externalIP.match(ipAddress)) {
        externalIP = { type: 'network', value: externalIP + '/' + mask };
    } else {
        externalIP = { type: 'alias', value: externalIP + '/' + mask };
    }

    if (internalIP === 'access-list') {
        var nObj = {
            type: 'policy-nat',
            internal_int: match[1],
            external_int: match[2],
            protocol: match[3],
            external_ip: externalIP,
            external_port: match[5],
            internal_ip: {
                type: 'access-list',
                value: match[7]
            },
            internal_port: null
        }
        return nObj;
    } else {
        if (internalIP.match(ipAddress)) {
            internalIP = { type: 'network', value: internalIP + '/' + mask };
        } else {
            internalIP = { type: 'alias', value: internalIP + '/' + mask };
        }

        var nObj = {
            type: 'static-nat',
            internal_int: match[1],
            external_int: match[2],
            protocol: match[3],
            external_ip: externalIP,
            external_port: match[5],
            internal_ip: internalIP,
            internal_port: match[7]
        }
        return nObj;
    }
}

function parseOne2One(nat) {
    var match = nat.match(one2one);
    var externalIP = match[3];
    var internalIP = match[4];

    if (match[5]) {
        mask = match[5].split(' ')[1].trim();
    } else {
        mask = '255.255.255.255'
    }

    if (externalIP.match(ipAddress)) {
        externalIP = { type: 'network', value: externalIP + '/' + mask };
    } else {
        externalIP = { type: 'alias', value: externalIP + '/' + mask };
    }


    if (internalIP === 'access-list') {
        var nObj = {
            type: 'policy-nat',
            internal_int: match[1],
            external_int: match[2],
            protocol: null,
            external_ip: externalIP,
            external_port: null,
            internal_ip: {
                type: 'access-list',
                value: match[4].split(' ')[1].trim()
            },
            internal_port: null
        }
        return nObj;
    } else {
        if (internalIP.match(ipAddress)) {
            internalIP = { type: 'network', value: internalIP + '/' + mask };
        } else {
            internalIP = { type: 'alias', value: internalIP + '/' + mask };
        }

        var nObj = {
            type: 'static-nat',
            internal_int: match[1],
            external_int: match[2],
            protocol: null,
            external_ip: externalIP,
            external_port: null,
            internal_ip: internalIP,
            internal_port: null
        }
        return nObj;
    }
}

module.exports = function(nat) {
    if (nat.match(portForward)) {
        return parsePortForward(nat);
    } else if (nat.match(one2one)) {
        return parseOne2One(nat);
    } else {
        //throw new Error('static nat parse error: ' + nat);
        debugger;
    }
}
