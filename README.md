#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Check permissions using Shiro-like strings, put in a trie.

Module for handling permissions in an [Apache Shiro](http://shiro.apache.org/permissions.html)-like style.
Permissions are stored in a [Trie](https://en.wikipedia.org/wiki/Trie) which makes it super performant and able to make additional queries apart from a simple permission check: it is also possible to return a list of sub-rights.
For example, if you have permissions to access resources with id 1 and 2, you can simply ask which ids are accessable using a customized Shiro syntax.

## Install

```sh
$ npm install --save shiro-trie
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

```


## License

MIT © [Ruben Deyhle](https://entrecode.de)


[npm-image]: https://badge.fury.io/js/shiro-trie.svg
[npm-url]: https://npmjs.org/package/shiro-trie
[travis-image]: https://travis-ci.org/entrecode/shiro-trie.svg?branch=master
[travis-url]: https://travis-ci.org/entrecode/shiro-trie
[daviddm-image]: https://david-dm.org/entrecode/shiro-trie.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/entrecode/shiro-trie
