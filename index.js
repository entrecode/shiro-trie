'use strict';

var _ = require('lodash');

function _add(trie, array) {
  var i, j, node, prevNode, values, goRecursive;
  node = trie;
  goRecursive = false;
  for (i = 0; i < array.length; i++) { // go through permission string array
    values = array[i].split(','); // split by comma
    for (j = 0; j < values.length; j++) { // default: only once (no comma separation)
      if (!node.hasOwnProperty(values[j])) { // permission is new -> create
        node[values[j]] = {};
      }
      if (values.length > 1) { // if we have a comma separated permission list, we have to go recursive
        goRecursive = goRecursive || array.slice(i + 1); // save the remaining permission array (subTrie has to be
                                                         // appended to each one)
        node[values[j]] = _add(node[values[j]], goRecursive); // call recursion for this subTrie
        i = array.length; // break outer loop
      } else { // if we don't need recursion, we just go deeper
        prevNode = node;
        node = node[values[j]];
      }
    }
  }
  if (!goRecursive && (!prevNode || !prevNode.hasOwnProperty('*'))) { // if we did not went recursive, we close the Trie with a * leaf
    node['*'] = {};
  }
  return trie;
}

function _check(trie, array) {
  var i, node;
  node = trie;
  if (array.length < 1 || array[array.length - 1] !== '*') {
    array.push('*');
  }
  for (i = 0; i < array.length; i++) {
    if (node.hasOwnProperty('*')) {
      if (Object.keys(node['*']).length === 0) {
        return true;
      }
      node = node['*'];
    } else {
      if (!node.hasOwnProperty(array[i])) {
        return false;
      }
      node = node[array[i]];
    }
  }
  return true;
}

function _permissions(trie, array) {
  var current, results;
  if (!trie || !array || !_.isObject(trie) || !_.isArray(array) || Object.keys(trie).length < 1 || array.length < 1) {
    return [];
  }
  if (trie.hasOwnProperty('*')) {
    return ['*'];
  }
  current = array.shift();
  if (current === '?') {
    results = Object.keys(trie);
    if (array.length > 0 && array[0] !== '$') {
      results = results.filter(function(node) {
        return _check(trie[node], array);
      });
    }
    return results;
  }
  if (current === '$') {
    results = [];
    Object.keys(trie).forEach(function(node) {
      results = results.concat(_permissions(trie[node], [].concat(array)));
    });
    return _.pull(_.uniq(results), '*');
  }
  if (trie.hasOwnProperty(current)) {
    return _permissions(trie[current], array);
  }
  return [];
}

var ShiroTrie = function() {
  this.data = {};
  return this;
};
ShiroTrie.prototype.reset = function() {
  this.data = {};
  return this;
};

ShiroTrie.prototype.add = function() {
  var args = _.flatten(arguments);
  var arg;
  for (arg in args) {
    if (args.hasOwnProperty(arg) && typeof args[arg] === 'string') {
      this.data = _add(this.data, args[arg].split(':'));
    }
  }
  return this;
};

ShiroTrie.prototype.check = function(string) {
  return _check(this.data, string.split(':'));
};

ShiroTrie.prototype.get = function() {
  return this.data;
};

ShiroTrie.prototype.permissions = function(string) {
  if (!_.isString(string)) {
    return [];
  }
  return _permissions(this.data, string.split(':'));
};

module.exports = {
  new: function() {
    return new ShiroTrie();
  }
};
