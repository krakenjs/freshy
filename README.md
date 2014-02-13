# freshy

An (admittedly naïve) node module (un|re)loader/refreshener.

[![Build Status](https://travis-ci.org/totherik/freshy.png)](https://travis-ci.org/totherik/freshy)


## API
### unload(module)

* `module` (*String*) - the module to unload

(Attempt to) completely unload a node module from memory. Returns `true` if successful, `false` if not.

```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

freshy.unload('minimist'); // true
```


### reload(module)

* `module` (*String*) - the module to reload

(Attempt to) completely unload and reload a given module in place. Returns reloaded module.

```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

var fresh = freshy.reload('minimist');
console.log(minimist === fresh); // false
```


### freshy(module)

* `module` (*String*) - the module for which to fetch a fresh instance

Get a fresh instance of a module with out disturbing the current one in place. Returns fresh module instance.
```javascript
var minimist = require('minimist'),
    freshy = require('freshy');

var fresh = freshy.freshy('minimist');
console.log(minimist === fresh); // false

var mini = require('minimist');
console.log(minimist === mini); // true
```