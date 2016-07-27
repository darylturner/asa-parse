#!/usr/local/bin/node
const fs = require('fs');

// parsers
const acl_parse = require('./parsers/acl-parse');
const name_parse = require('./parsers/name-parse');
const access_group_parse = require('./parsers/access-group-parse');
const object_group_parse = require('./parsers/object-group-parse');
const static_nat_parse = require('./parsers/static-nat-parse');
const dynamic_nat_parse = require('./parsers/dynamic-nat-parse');

// sectioning regex
const acl = /^access-list [\w-\.]+ extended.*/mg;
const name = /^name .*/mg
const acl_group = /^access-group .*/mg;
const object_groups = /^object-group.*\n(?: .*\n)+/mg
const static_nat = /^static .*/mg;
const dynamic_nat = /^nat .*/mg;
const dynamic_global = /^global .*/mg;

function parse(err, config) {
    if (err) { throw err; }

    // roughly sort config into sections
    var sections = {
        firewall: {
            acl: config.match(acl),
            apply: config.match(acl_group)
        },
        alias: config.match(name),
        groups: config.match(object_groups),
        nat: {
            static: config.match(static_nat),
            dynamic: {
                nat: config.match(dynamic_nat),
                global: config.match(dynamic_global)
            }
        }
    };

    // initialise objects to push parsed config
    var parsed = {
        firewall: { acl: [], apply: [] },
        alias: [],
        groups: [],
        nat: {
            static: [],
            dynamic: { nat: [], global: [] }
        }
    };

    if (sections.firewall.acl) {
        sections.firewall.acl.forEach((acl, pos, arr) => parsed.firewall.acl.push(acl_parse(acl)));
    }
    if (sections.alias) {
        sections.alias.forEach((alias, pos, arr) => parsed.alias.push(name_parse(alias)));
    }
    if (sections.firewall.apply) {
        sections.firewall.apply.forEach((access_group, pos, arr) => parsed.firewall.apply.push(access_group_parse(access_group)));
    }
    if (sections.groups) {
        sections.groups.forEach((group, pos, arr) => parsed.groups.push(object_group_parse(group)));
    }
    if (sections.nat.static) {
        sections.nat.static.forEach((nat, pos, arr) => parsed.nat.static.push(static_nat_parse(nat)));
    }
    if (sections.nat.dynamic.nat) {
        sections.nat.dynamic.nat.forEach((nat, pos, arr) => parsed.nat.dynamic.nat.push(dynamic_nat_parse(nat)));
    }
    if (sections.nat.dynamic.global) {
        sections.nat.dynamic.global.forEach((global, pos, arr) => parsed.nat.dynamic.global.push(dynamic_nat_parse(global)));
    }
    console.log(JSON.stringify(parsed));
}

var file = process.argv[2];
if (!file) {
    process.stderr.write('No file argument, reading from stdin\n');
    file = '/dev/stdin';
} 
fs.readFile(file, 'utf8', parse);
