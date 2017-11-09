'use strict';

var path = require('path'),
    caller = require('caller'),
    debug = require('debuglog')('freshy'),
    isAbsolute = require('path-is-absolute'),
    resolve = require('resolve');

/**
 * Array.includes polyfill
 * @param {string[]} array
 * @param {string} searchElement
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes#Polyfill
 */
function includes(array, searchElement, fromIndex) {
    var len = array.length >>> 0;

    if (len === 0) {
        return false;
    }

    var n = fromIndex | 0;
    var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }

    while (k < len) {
        if (sameValueZero(array[k], searchElement)) {
            return true;
        }
        k++;
    }

    return false;
}

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
function unload(module, stack) {
    var path = require.resolve(module);
    stack = stack || [];

    if (require.cache[path] && require.cache[path].children) {
        require.cache[path].children.forEach(function (child) {
            if (!includes(stack, child.id)) {
                stack.push(path);
                unload(child.id, stack);
            }
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
function restore(module, stack) {
    stack = stack || [];
    require.cache[module.id] = module;
    module.children.forEach(function (child) {
        if (!includes(stack, child.id)) {
            stack.push(child.id);
            restore(child, stack);
        }
    });
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
