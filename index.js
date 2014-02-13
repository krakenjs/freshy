'use strict';

var path = require('path'),
    caller = require('caller');



function getFresh(name) {
    var orig, fresh;

    orig = snapshot(name);
    unload(name);

    fresh = require(name);
    unload(name);

    restore(orig);
    return fresh;
}


function reload(name) {
    unload(name);
    return require(name);
}


function unload(module) {
    var path = require.resolve(module);

    require.cache[path].children.forEach(function (child) {
        unload(child.id);
    });

    return delete require.cache[path];
}


function snapshot(module) {
    return require.cache[require.resolve(module)];
}


function restore(module) {
    require.cache[module.id] = module;
    module.children.forEach(restore);
}


function startsWith(haystack, needle) {
    return haystack.indexOf(needle) === 0;
}


function normalize(fn) {
    return function resolve(module) {
        var basedir;
        if (startsWith(module, './') || startsWith(module, '../')) {
            basedir = path.dirname(caller());
            module = path.resolve(basedir, module);
        }
        return fn(module);
    };
}


exports.freshy = normalize(getFresh);

exports.unload = normalize(unload);

exports.reload = normalize(reload);
