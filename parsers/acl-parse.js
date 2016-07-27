const parse_acl = /access-list ([\w-\.]*) extended (permit|deny) (tcp|udp|icmp|gre|ip|object-group [\w-]+) (any|interface|host [\w-\d\.]*|object-group [\w-]*|[\d\.]* [\d\.]*|[\w-]+ [\d\.]+) (any|interface|host [\w-\d\.]*|object-group [\w-]*|[\d\.]* [\d\.]*|[\w-]+ [\d\.]+) ?(eq \w*|object-group [\w-]*|\n?)/

function convertWildcard(wildcard) {
    var netmask = '';
    wildcard.split('.').forEach((nibble, pos, arr) => {
        netmask = netmask + (255 - parseInt(nibble)) + '.';
    });
    return netmask.replace(/.$/, '');
}

function resolveAddress(address) {
    var a = {};
    if (address === 'any') {
        a.type = 'network';
        a.value = '0.0.0.0/0.0.0.0';
        return a;
    } else if (address.startsWith('object-group')) {
        a.type = 'group';
        a.value = address.split(' ')[1];
        return a;
    } else if (address.match(/host \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        a.type = 'network';
        a.value = address.split(' ')[1] + '/255.255.255.255'
        return a;
    } else if (address.match(/host [\w-]*/)) {
        a.type = 'alias';
        a.value = address.split(' ')[1];
        return a;
    } else if (address.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3} \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        a.type = 'network';
        a.value = address.split(' ')[0] + '/' + convertWildcard(address.split(' ')[1]);
        return a;
    } else if (address.match(/[\w-]+ \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
        a.type = 'alias';
        a.value = address.split(' ')[0] + '/' + address.split(' ')[1];
        return a;
    } else if (address === 'interface') {
        a.type = 'alias';
        a.value = address;
        return a;
    } else {
        throw new Error('address parse error: ' + address);
    }
}

function resolveApplication(application) {
    var a = {};
    if (!application) {
        return null;
    } else if (application.match(/eq/)) {
        a.type = 'port';
        a.value = application.split(' ')[1];
    } else if (application.match(/object-group/)) {
        a.type = 'group';
        a.value = application.split(' ')[1];
    } else if (application.match(/range/)) {
        a.type = 'range';
        a.value = application.split(' ')[1];
    }
    return a;
}

function resolveProtocol(protocol) {
    if (protocol.match(/object-group/)) {
        return {
            type: 'group',
            value: protocol.split(' ')[1]
        };
    } else {
        return {
            type: 'single',
            value: protocol
        };
    }
}

module.exports = function(acl) {
    var match = acl.match(parse_acl);
    if (!match) {
        throw new Error('acl parse error: ' + acl);
    }
    return rule = {
	name: match[1],
	action: match[2],
	protocol: resolveProtocol(match[3]),
        source: resolveAddress(match[4]),
        destination: resolveAddress(match[5]),
        application: resolveApplication(match[6])
    };
}
