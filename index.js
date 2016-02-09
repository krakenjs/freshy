'use strict';

var path = require('path'),
    caller = require('caller'),
    debug = require('debuglog')('freshy'),
    isAbsolute = require('path-is-absolute'),
    resolve = require('resolve');


/**
 * Gets a reference to a unique instance of a given module.
 * @param name module name or absolute path
 * @param cb function Optional: will be called while the module in cache is the fresh one, not the original.
 * @returns {*} the fresh instance of the module.
 */
function getFresh(name, cb) {
    var orig, fresh;

    orig = snapshot(name);
    unload(name);

    fresh = require(name);

    if (cb) {
        cb(fresh);
    }

    unload(name);

    orig && restore(orig);
    return fresh;
}


/**
 * Reload a given module.
 * @param name module name or absolute path
 * @returns {*} the reloaded module
 */
function reload(name) {
    unload(name);
    return require(name);
}


/**
 * Unload a given module.
 * @param module module name or absolute path
 * @returns {boolean} true if the module was removed or false if not
 */
function unload(module) {
    var path = require.resolve(module);

    if (require.cache.hasOwnProperty(path) && require.cache[path].children) {
        require.cache[path].children.forEach(function (child) {
            unload(child.id);
        });
    }

    return delete require.cache[path];
}


/**
 * Get a reference to the module's cache entry.
 * @param module module name or absolute path
 * @returns {*}
 */
function snapshot(module) {
    return require.cache[require.resolve(module)];
}


/**
 * Add a module entry back into the cache
 * @param module module cache object
 */
function restore(module) {
    require.cache[module.id] = module;
    module.children.forEach(restore);
}

function normalize(fn) {
    return function (module) {
        var basedir;
        if (!isAbsolute(module)) {
            basedir = path.dirname(caller());
            debug('resolving "%s" from directory "%s"', module, basedir);
            arguments[0] = module = resolve.sync(module, {
                basedir: basedir,
                extensions: Object.keys(require.extensions)
            });
        }
        return fn.apply(this, arguments);
    };
}


exports.freshy = normalize(getFresh);

exports.unload = normalize(unload);

exports.reload = normalize(reload);
