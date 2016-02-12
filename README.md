#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Check permissions using Shiro-like strings, put in a trie.

Module for handling permissions in an [Apache Shiro](http://shiro.apache.org/permissions.html)-like style.
Permissions are stored in a [Trie](https://en.wikipedia.org/wiki/Trie) which makes it super performant and able to make additional queries apart from a simple permission check: it is also possible to return a list of sub-rights.
For example, if you have permissions to access resources with id 1 and 2, you can simply ask which ids are accessable using a customized Shiro syntax.

## Install

### node.js

```sh
$ npm install --save shiro-trie
```

### web / frontend

```sh
$ bower install --save shiro-trie
```

## Getting Started

### node.js

```js
var shiroTrie = require('shiro-trie');
```

### web / frontend
Using the shiro-trie plugin in your web-app is pretty simple, too. First, you should include the script file to your HTML-file:

```html
<script type="text/javascript" src="bower_components/lodash/lodash.js" /> <!-- shiro-trie is dependant on lodash! -->
<script type="text/javascript" src="bower_components/shiro-trie/dist/shiro-trie.js" />
```

## Usage

```js
var shiroTrie = require('shiro-trie');

var account1 = shiroTrie.new();

account1.add([
  'printer:xpc5000:print',
  'printer:xpc4000:*',
  'nas:timeCapsule,fritzbox:read'
]);

account1.check('printer:xpc4000:configure'); // true
account1.check('nas:timeCapsule:write'); // false

account1.permissions('printer:?'); // ['xpc5000', 'xpc4000']
account1.permissions('nas:$:?'); // ['read']
```


## Defining permissions

See [Understanding Permissions in Apache Shiro](http://shiro.apache.org/permissions.html) for a short introduction to Shiro Syntax. Basically, you can describe a permission hierarchy using `:` as separator. 
Example:

`printer:xpc5000:print`


You may define multiple alternatives for a level using `,` as separator.
For example: 

`nas:timeCapsule,fritzbox:read` is the same as `nas:timeCapsule:read` plus `nas:fritzbox:read`.

You may also use the wildcard character `*` to grant *all* permissions:

`printer:*:print` grants printing on any printer.

At the end, a wildcard may be omitted.
Example:

`printer:xpc5000` is the same as `printer:xpc5000:*`.

The function for adding one or multiple permissions is `.add(…)`. You may set one string, a list of strings or array(s) of strings. It returns the same ShiroTrie instance for chainability.

*Note that `?` is* ***no*** *special character for single-character-wildcard, as opposed to some other Shiro libraries.*

## Checking permissions

You should always check for explicit permissions (no wildcard `*` or alternative `,` characters). For example:

`printer:xpc4000:print`

or

`nas:timeCapsule:write`

The function for checking a permission is `.check(string)`. It returns `true` or `false`.

## Getting available permissions

This is an extension to the original [Apache Shiro](http://shiro.apache.org/permissions.html) syntax and functionality that is enabled by using a [Trie](https://en.wikipedia.org/wiki/Trie) instead of regular expressions for permission checking.

Given the example above, you may want to show a list of printers the user has access to (=any sub-permission). In traditional Shiro, you will have to take the whole list and whitelist each single object using a separate permission-check call to find out if there are permissions or not.

This module has a special method with a slightly different syntax to achieve exactly that: getting objects an account has permissions to.

The syntax is basically the same as for checking permissions, but introduces two new special characters: `$` and `?`. You perform a normal check, but you can swap a single part of the query with `?`. This means “give me all that can stand there”.
For example:

The permission `nas:timeCapsule,fritzbox:read` can be queried with `nas:?` which will return `['timeCapsule', 'fritzbox']`. In the same manner, `nas:?:write` would return a list with all NAS devices where the `write` permission is available.

`$` is a special character for “any”. For example:

`nas:$:?` would return a list of rights the user has on any NAS device in the example above – where each is only included once. Example:

Available permissions: `nas:timeCapsule:read,write`, `nas:fritzbox:read,reboot`.
The query `nas:$:?` would return `['read', 'write', 'reboot']`.

The function for checking available permissions is `.permissions(string)`. It returns `true` or `false`.
The string to check may only contain one `?` character.

## API

### Initialization

```js
var shiroTrie = require('shiro-trie');
```

#### shiroTrie.new();

Returns a new ShiroTrie instance.

```js
var account1 = shiroTrie.new();
```

### Instance methods

#### add(string[, string])

Adds a new permission. Multiple permission strings can be added at once, either as argument list or as array. Even multiple array may be used as arguments. Returns the same instance for chaining.

Permission strings may contain special characters `:`, `*`, `,` but not `$` or `?`.

```js
account1.add([
  'printer:xpc5000:print',
  'printer:xpc4000:*',
  'nas:timeCapsule,fritzbox:read'
]);
```

#### check(string)

Checks if a single permission is allowed. No special characters apart from `:`, `,` and `*` are allowed.
If the permission string contains `,` characters, all variants are tested and the result is only true if all permissions are allowed.
Returns *Boolean.*

```js
account1.check('printer:xpc4000:configure'); // true
account1.check('nas:timeCapsule:write'); // false
```

#### permissions(string)

Retrieves a list of available permissions at a certain position in the permission Trie.
Expects a permission string containing `?`. Additionally, the *any* operator `$` can be used.
Returns *Array.*

```js
account1.permissions('printer:?'); // ['xpc5000', 'xpc4000']
account1.permissions('nas:$:?'); // ['read']
```

#### reset()

Empties the Trie and returns it. New permissions can be added using `add(…)` afterwards.

## Tests

Tests can be executed with [Mocha](http://mochajs.org/):

```sh
$ mocha -R spec
```

Current Test Coverage: 

[![Coverage][coveralls-image]][coveralls-url] 

It can be checked with [istanbul](http://gotwarlost.github.io/istanbul/):

```sh
$ istanbul cover _mocha -- -R spec
```

## Known issues

- `add(…)` and `permissions(…)` is implemented recursive which is probably not ideal

## Changelog

### 0.3.4
- dependency update

### 0.3.3
- dependency update

### 0.3.2
- dependency update

### 0.3.1
- dependency update

### 0.3.0
- support for `,` in `check(…)`

### 0.2.1
- bug fixes

### 0.2.0
- Renamed package to shiro-trie
- Added bower support

### 0.1.1
- Updated dependencies

### 0.1.0
- Initial Release

## License

MIT © [entrecode GmbH](https://entrecode.de)


[npm-image]: https://badge.fury.io/js/shiro-trie.svg
[npm-url]: https://npmjs.org/package/shiro-trie
[travis-image]: https://travis-ci.org/entrecode/shiro-trie.svg?branch=master
[travis-url]: https://travis-ci.org/entrecode/shiro-trie
[coveralls-image]: https://coveralls.io/repos/entrecode/shiro-trie/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/entrecode/shiro-trie?branch=master
[daviddm-image]: https://david-dm.org/entrecode/shiro-trie.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/entrecode/shiro-trie
