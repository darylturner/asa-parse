function parseServiceObject(object) {
    var m1 = object.match(/object-group service ([\w-\.]+) ?(?:(tcp-udp|tcp|udp)|\n)/);
    var pObj = {
        name: m1[1],
        type: 'service',
        objects: []
    };

    var objectElements = object.match(/^ .*/gm);
    objectElements.forEach((element, pos, arr) => {
        var match;
        if (element.match(/port-object/)) {
            match = element.match(/port-object (range|eq) (.*)/);
            if (match[1] === 'range') {
                pObj.objects.push({
                    type: 'range',
                    protocol: m1[2],
                    value: match[2].trim()
                });
            } else if (match[1] === 'eq') {
                pObj.objects.push({
                    type: 'single',
                    protocol: m1[2],
                    value: match[2].trim()
                });
            } else {
                throw new Error('port-object parse error: ' + element);
            }
        } else if (element.match(/group-object/)) {
            pObj.objects.push({
                type: 'group',
                protocol: null,
                value: element.split(' ')[2]
            });
        } else if (element.match(/service-object/)) {
            match = element.match(/service-object ([\w-]+) ?(eq|range|.*)? ?(.*)/);
            if (match[1] === 'icmp') {
                pObj.objects.push({
                    protocol: 'icmp',
                    type: 'single',
                    value: match[2].trim() || null
                });
            } else {
                if (match[2] === 'range') {
                    pObj.objects.push({
                        protocol: match[1],
                        type: 'range',
                        value: match[3].trim()
                    });
                } else if (match[2] === 'eq') {
                    pObj.objects.push({
                        protocol: match[1],
                        type: 'single',
                        value: match[3].trim()
                    });
                } else {
                    pObj.objects.push({
                        protocol: match[1],
                        type: 'single',
                        value: match[3].trim() || null
                    });
                }
            }
        } else if (element.match(/description/)) {
            // skip descriptions
        } else {
            throw new Error('service-object element parse error: ' + element);
        }
    });
    return pObj;
}

function parseNetworkObject(object) {
    var pObj = {
        name: object.split(' ')[2].trim(),
        type: 'network',
        objects: []
    };
    var objectElements = object.match(/^ .*/gm);
    objectElements.forEach((element, pos, arr) => {
        var match = element.match(/(network|group)-object (host|[\d\.]+|[\w-]+) ?([\d\.]+|[\w-]+)?/);
        if (match) {
            if (match[1] === 'group') {
                pObj.objects.push({
                    type: 'group',
                    value: match[2]
                });
            } else if (match[1] === 'network') {
                if (match[2] === 'host') {
                    if (match[3].match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
                        pObj.objects.push({
                            type: 'network',
                            value: match[3] + '/255.255.255.255'
                        });
                    } else if (match[3].match(/[\w-]+/)) {
                        pObj.objects.push({
                            type: 'alias',
                            value: match[3] + '/255.255.255.255'
                        });
                    } else {
                        throw new Error('network-object element parse error: ' + element);
                    }
                } else if (match[2].match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
                    pObj.objects.push({
                        type: 'network',
                        value: match[2] + '/' + match[3]
                    });
                } else if (match[2].match(/[\w-]+/)) {
                     pObj.objects.push({
                         type: 'alias',
                         value: match[2] + '/' + match[3]
                     });
                } else {
                    throw new Error('network-object element parse error: ' + element);
                }
            } else if (element.match(/description/)) {
                //skip
            } else {    
                throw new Error('network-object element parse error: ' + element);
            }
        } else if (element.includes('description')) {
            //do nowt
        } else {
            throw new Error('network-object element parse error: ' + element);
        }
    });
    return pObj;
}

function parseProtocolObject(object) {
    var pObj = {                           
	name: object.split(' ')[2].trim(), 
	type: 'protocol',                   
	objects: []                        
    };
    var objectElements = object.match(/^ .*/gm);
    objectElements.forEach((element, pos, arr) => {
        if (element.match(/description/)) {
            // do nothing
        } else if (element.match(/protocol-object/)) {
            pObj.objects.push({
                type: 'single',
                value: element.split(' ')[2].trim()
            });
        } else {
            throw new Error('protocol-object parse error: ' + element);
        }
    });
    return pObj;
}

function parseICMPObject(object) {
    var pObj = {                           
	name: object.split(' ')[2].trim(), 
	type: 'icmp',                   
	objects: []                        
    };
    var objectElements = object.match(/^ .*/gm);
    objectElements.forEach((element, pos, arr) => {
        if (element.match(/description/)) {
            // do nothing
        } else if (element.match(/icmp-object/)) {
            pObj.objects.push({
                type: 'single',
                value: element.split(' ')[2].trim()
            });
        } else {
            throw new Error('icmp-object parse error: ' + element);
        }
    });
    return pObj;
}

module.exports = function(object) {
    var parsedObj;
    if (object.match(/^object-group service/)) {
        return parsedObj = parseServiceObject(object);
    } else if (object.match(/^object-group network/)) {
        return parsedObj = parseNetworkObject(object);
    } else if (object.match(/^object-group protocol/)) {
        return parsedObj = parseProtocolObject(object);
    } else if (object.match(/^object-group icmp-type/)) {
        return parsedObj = parseICMPObject(object);
    } else {
        throw new Error('object parse error: ' + object);
    }
}
