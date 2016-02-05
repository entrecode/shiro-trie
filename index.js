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
  if (array.length < 1 || array[array.length - 1] !== '*') { // add implicit star at the end
    array.push('*');
  }
  for (i = 0; i < array.length; i++) {
    if (node.hasOwnProperty('*')) {
      if (Object.keys(node['*']).length === 0) { // if we find a star leaf in the trie, we are done (everything below is allowed)
        return true;
      }
      node = node['*']; // otherwise we have to go deeper
    } else {
      if (!node.hasOwnProperty(array[i])) { // if the wanted permission is not found, we return false
        return false;
      }
      node = node[array[i]]; // otherwise we go deeper
    }
  }
  return true; // word (array) was found in the trie. all good!
}

function _permissions(trie, array) {
  var current, results;
  if (!trie || !array || !_.isObject(trie) || !_.isArray(array) || Object.keys(trie).length < 1 || array.length < 1) {
    return []; // for recursion safety, we make sure we have really valid values
  }
  if (trie.hasOwnProperty('*')) { // if we have a star permission, we can just return that
    return ['*'];
  }
  current = array.shift(); // take first element from array
  if (current === '?') { // the requested part
    results = Object.keys(trie);
    if (array.length > 0 && array[0] !== '$') { // if something is coming after the ?, we have to check permission and remove those that are not allowed
      results = results.filter(function(node) {
        return _check(trie[node], array);
      });
    }
    return results;
  }
  if (current === '$') { // if we have an 'any' flag, we have to go recursive for all alternatives
    results = [];
    Object.keys(trie).forEach(function(node) {
      results = results.concat(_permissions(trie[node], [].concat(array)));
    });
    return _.pull(_.uniq(results), '*'); // remove duplicates and * from results
  }
  if (trie.hasOwnProperty(current)) {
    return _permissions(trie[current], array); // we have to go deeper!
  }
  return [];
}

function _expand(permission) {
  var results = [];
  var parts = permission.split(':');
  var i, alternatives;
  for (i = 0; i < parts.length; i++) {
    alternatives = parts[i].split(',');
    if (results.length === 0) {
      results = alternatives;
    } else {
      alternatives = _.map(alternatives, function(alternative) {
        return _.map(results, function(perm) {
          return perm + ':' + alternative;
        }, this);
      }, this);
      results = _.flatten(_.union(alternatives));
    }
  }
  return results;
}

/**
 * Retuns a new ShiroTrie instance
 * @returns {ShiroTrie}
 * @constructor
 */
var ShiroTrie = function() {
  this.data = {};
  return this;
};

/**
 * removes all data from the Trie (clean startup)
 * @returns {ShiroTrie}
 */
ShiroTrie.prototype.reset = function() {
  this.data = {};
  return this;
};

/**
 * Add one or more permissions to the Trie
 * @param {...string|...Array} strings - Any number of permission string(s) or String Array(s)
 * @returns {ShiroTrie}
 */
ShiroTrie.prototype.add = function() {
  var args = _.flatten(arguments);
  var arg;
  for (arg in args) {
    if (args.hasOwnProperty(arg) && _.isString(args[arg])) {
      this.data = _add(this.data, args[arg].split(':'));
    }
  }
  return this;
};

/**
 * check if a specific permission is allowed in the current Trie.
 * @param string The string to check. Should not contain * – always check for the most explicit permission
 * @returns {*}
 */
ShiroTrie.prototype.check = function(string) {
  if (!_.isString(string)) {
    return false;
  }
  if (string.indexOf(',') !== -1) { // expand string to single comma-less permissions...
    return _.every(_.map(_expand(string), _.bind(function(permission) {
      return _check(this.data, permission.split(':'));
    }, this)), Boolean); // ... and make sure they are all allowed
  }
  return _check(this.data, string.split(':'));
};

/**
 * return the Trie data
 * @returns {{}|*}
 */
ShiroTrie.prototype.get = function() {
  return this.data;
};

/**
 * check what permissions a certain Trie part contains
 * @param string String to check – should contain exactly one ?. Also possible is usage of the any ($) parameter. See
 *   docs for details.
 * @returns {*}
 */
ShiroTrie.prototype.permissions = function(string) {
  if (!_.isString(string)) {
    return [];
  }
  return _permissions(this.data, string.split(':'));
};

module.exports = {
  new: function() {
    return new ShiroTrie();
  },
  _expand: _expand
};
