'use strict';

var _ = require('lodash');

var ShiroTree = function() {
  this.data = {};
  return this;
};
ShiroTree.prototype.new = function() {
  this.data = {};
};

ShiroTree.prototype.add = function() {
  var args = _.flatten(arguments);
  var arg;
  for (arg in args) {
    if (typeof args[arg] === 'string') {
      this.data = _add(this.data, args[arg].split(':'));
    }
  }
};

ShiroTree.prototype.check = function(string) {
  return _check(this.data, string.split(':'));
};

ShiroTree.prototype.get = function() {
  return this.data;
};

module.exports = {
  new: function() {
    return new ShiroTree();
  }
};

function _add(trie, array) {
  var i, j, node, values, goRecursive;
  node = trie;
  for (i = 0; i < array.length; i++) { // go through permission string array
    values = array[i].split(','); // split by comma
    for (j = 0; j<values.length; j++) { // default: only once (no comma separation)
      if (!node.hasOwnProperty(values[j])) { // permission is new -> create
        node[values[j]] = {};
      }
      if (values.length > 1) { // if we have a comma separated permission list, we have to go recursive
        goRecursive = goRecursive || array.slice(i+1); // save the remaining permission array (subtree has to be appended to each one)
        node[values[j]] = _add(node[values[j]], goRecursive); // call recursion for this subtree
        i = array.length; // break outer loop
      } else { // if we don't need recursion, we just go deeper
        node = node[values[j]];
      }
    }
  }
  if (!goRecursive) { // if we did not went recursive, we close the tree with a * leaf
    node['*'] = {};
  }
  return trie;
}

function _check(trie, array) {
  var i, node, key;
  key = null;
  node = trie;
  for (i = 0; i < array.length; i++) {
    if (node.hasOwnProperty('*')) {
      return true;
    }
    if (!node.hasOwnProperty(array[i])) {
      return false;
    }
    node = node[array[i]];
    key = array[i];
  }
  return true;
}
