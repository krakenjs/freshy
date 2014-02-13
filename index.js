'use strict';

var path = require('path'),
    caller = require('caller');


function getFresh(name) {
    var orig, fresh;

    orig = snapshot(name);
    invalidate(name);

    fresh = require(name);
    invalidate(name);

    restore(orig);
    return fresh;
}


function invalidate(module) {
    var path, metadata;

    path = require.resolve(module);
    metadata = require.cache[path];
    if (Array.isArray(metadata.children)) {
        metadata.children.forEach(function (child) {
            invalidate(child.id);
        });
    }

    return delete require.cache[path];
}


function snapshot(module, dest) {
    var path, metadata;

    dest = dest || [];

    path = require.resolve(module);
    metadata = require.cache[path];
    if (Array.isArray(metadata.children)) {
        metadata.children.forEach(function (child) {
            snapshot(child.id, dest);
        });
    }

    dest.push(require.cache[path]);
    return dest;
}


function restore(module) {
    if (Array.isArray(module)) {
        module.forEach(restore);
        return;
    }

    require.cache[module.id] = module;
}


function startsWith(haystack, needle) {
    return haystack.indexOf(needle) === 0;
}


module.exports = function freshy(module, options) {
    var basedir;

    // @see http://nodejs.org/api/modules.html#modules_file_modules
    if (startsWith(module, './') || startsWith(module, '../')) {
        basedir = caller();
        module = path.resolve(basedir, module);
    }

    return freshy(module);
};