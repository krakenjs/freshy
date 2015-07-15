'use strict';

var test = require('tape'),
    path = require('path'),
    freshy = require('../');


test('freshy', function (t) {

    t.test('reload', function (t) {
        var orig, minime;

        orig = require('./mymodule');
        minime = freshy.reload('./mymodule');

        t.notEqual(minime, orig);
        t.notEqual(minime.me, orig.me);
        t.notEqual(minime.myself, orig.myself);
        t.equal(minime.me.name, orig.me.name);
        t.equal(minime.myself.name, orig.myself.name);
        t.end();
    });


    t.test('freshy', function (t) {
        var orig, minime;

        orig = require('../package');
        minime = freshy.freshy('../package');
        t.notEqual(minime, orig);

        minime = require('../package');
        t.equal(minime, orig);
        t.end();
    });


    t.test('freshy with callback', function (t) {
        var orig, minime, betweener;

        orig = require('../package');
        minime = freshy.freshy('../package', function (minime) {
            console.log('loaded');
            betweener = require('../package');
            t.equal(minime, betweener);
        });
        t.notEqual(minime, orig);
        t.equal(betweener, minime);

        minime = require('../package');
        t.equal(minime, orig);
        t.end();
    });

    t.test('unload', function (t) {
        var orig, success, minime;

        orig = require('./mymodule');
        success = freshy.unload('./mymodule');
        t.ok(success);

        minime = require('./mymodule');
        t.notEqual(minime, orig);
        t.notEqual(minime.me, orig.me);
        t.notEqual(minime.myself, orig.myself);
        t.equal(minime.me.name, orig.me.name);
        t.equal(minime.myself.name, orig.myself.name);
        t.end();
    });


    t.test('npm module', function (t) {
        var orig, minime;

        orig = require('istanbul');
        minime = freshy.freshy('istanbul');
        t.notEqual(minime, orig);

        minime = require('istanbul');
        t.equal(minime, orig);
        t.end();
    });


    t.test('not yet loaded module', function (t) {
        // should not throw
        freshy.freshy('eslint');
        t.end();
    });


    t.test('abs path', function (t) {
        var file, orig, minime;

        file = path.resolve(__dirname, './mymodule');
        orig = require(file);
        minime = freshy.freshy(file);
        t.notEqual(minime, orig);

        minime = require(file);
        t.equal(minime, orig);
        t.end();
    });

    t.test('node_modules require from deeply nested module', function (t) {
        t.equal(require('./mymodule/nested-resolutions.js'), 'hello');
        t.end();
    });

});
