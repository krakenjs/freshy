# freshy

An (admittedly naïve) node module (un|re)loader/refreshener.

[![Build Status](https://travis-ci.org/totherik/freshy.png)](https://travis-ci.org/totherik/freshy)


## API
### unload(module)

* `module` (*String*) - the module to unload

Completely unload a node module from the cache. Returns `true` if the module was present in the cache, `false` if not.

```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

freshy.unload('minimist'); // true
```


### reload(module)

* `module` (*String*) - the module to reload

Completely unload and reload a given module in place, leaving the new copy in the cache. Returns reloaded module.

```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

var fresh = freshy.reload('minimist');
console.log(minimist === fresh); // false
```


### freshy(module)

* `module` (*String*) - the module for which to fetch a fresh instance

Get a fresh instance of a module without disturbing the cached copy. Returns the fresh module instance.

```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

var fresh = freshy.freshy('minimist');
console.log(minimist === fresh); // false

var mini = require('minimist');
console.log(minimist === mini); // true
```
