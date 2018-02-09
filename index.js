'use strict';

function uniq(arr) {
  var u = {}, a = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(u, arr[i])) {
      continue;
    }
    a.push(arr[i]);
    u[arr[i]] = 1;
  }
  return a;
}

function _add(trie, array) {
  var i, j, node, prevNode, values, goRecursive;
  node = trie;
  goRecursive = false;
  // go through permission string array
  for (i = 0; i < array.length; i++) {
    // split by comma
    values = array[i].split(',');
    // default: only once (no comma separation)
    for (j = 0; j < values.length; j++) {
      // permission is new -> create
      if (!node.hasOwnProperty(values[j])) {
        node[values[j]] = {};
      }
      if (values.length > 1) {
        // if we have a comma separated permission list, we have to go recursive
        // save the remaining permission array (subTrie has to be appended to each one)
        goRecursive = goRecursive || array.slice(i + 1);
        // call recursion for this subTrie
        node[values[j]] = _add(node[values[j]], goRecursive);
        // break outer loop
        i = array.length;
      } else {
        // if we don't need recursion, we just go deeper
        prevNode = node;
        node = node[values[j]];
      }
    }
  }
  // if we did not went recursive, we close the Trie with a * leaf
  if (!goRecursive && (!prevNode || !prevNode.hasOwnProperty('*'))) {
    node['*'] = {};
  }
  return trie;
}

function _check(trie, array) {
  var i, node;
  node = trie;
  // add implicit star at the end
  if (array.length < 1 || array[array.length - 1] !== '*') {
    array.push('*');
  }
  for (i = 0; i < array.length; i++) {
    if (node.hasOwnProperty('*') && Object.keys(node['*']).length === 0) {
      // if we find a star leaf in the trie, we are done (everything below is allowed)
      return true;
    } else if (node.hasOwnProperty('*') && (array[i] !== '*' && node.hasOwnProperty(array[i]))) {
      // if there are multiple paths, we have to go recursive
      return _check(node['*'], array.slice(i+1)) || _check(node[array[i]], array.slice(i+1));
    } else if (node.hasOwnProperty('*')) {
      // otherwise we have to go deeper
      node = node['*'];
    } else if (node.hasOwnProperty(array[i])) {
      // otherwise we go deeper
      node = node[array[i]];
    } else {
      // if the wanted permission is not found, we return false
      if (!node.hasOwnProperty(array[i])) {
        return false;
      }
    }
  }
  // word (array) was found in the trie. all good!
  return true;
}

function _permissions(trie, array) {
  var current, results;
  if (!trie || !array ||
    typeof trie !== 'object' || !Array.isArray(array) ||
    Object.keys(trie).length < 1 || array.length < 1) {
    // for recursion safety, we make sure we have really valid values
    return [];
  }
  // if we have a star permission with nothing further down the trie we can just return that
  if (trie.hasOwnProperty('*') && Object.keys(trie['*']).length === 0) {
    return ['*'];
  }
  array = [].concat(array);
  // take first element from array
  current = array.shift();
  // the requested part
  if (current === '?') {
    results = Object.keys(trie);
    // if something is coming after the ?,
    if (array.length > 0) {
      var anyObj = {};
      results.forEach(function (node) {
        anyObj[node] = _expandTrie(trie[node], array);
      });

      return results.filter(function (node) {
        return anyObj[node].length > 0;
      });
    }
    return results;
  }
  // if we have an 'any' flag, we have to go recursive for all alternatives
  if (current === '$') { // $ before ?
    results = [];
    Object.keys(trie).forEach(function concatPermissions(node) {
      results = results.concat(_permissions(trie[node], [].concat(array)));
    });
    // remove duplicates
    var u = uniq(results);
    // … and * from results
    for (var i = u.length - 1; i >= 0; i--) {
      if (u[i] === '*') {
        u.splice(i, 1);
      }
    }
    return u;
  }
  results = [];
  if (trie.hasOwnProperty(current)) {
    // we have to go deeper!
    results = results.concat(_permissions(trie[current], array));
  }
  if (trie.hasOwnProperty('*')) {
    // if we have a star permission we need to go deeper
    results = results.concat(_permissions(trie['*'], array));
  }
  return results;
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
      alternatives = alternatives.map(function (alternative) {
        return results.map(function (perm) {
          return perm + ':' + alternative;
        }, this);
      }, this);
      results = [].concat.apply([], uniq(alternatives));
    }
  }
  return results;
}

function _expandTrie(trie, array) {
  var a = [].concat(array);

  return Object.keys(trie).map(function (node) {
    if (node === '*') {
      return [node];
    }
    if (array[0] === node || array[0] === '$') {
      if (array.length <= 1) {
        return [node];
      }
      var child = _expandTrie(trie[node], array.slice(1));
      return child.map(function (inner) {
        return node + ':' + inner;
      });
    }
    return [];
  }).reduce(function (a, b) {
    return a.concat(b);
  }, []);
}

/**
 * Retuns a new ShiroTrie instance
 * @returns {ShiroTrie}
 * @constructor
 */
var ShiroTrie = function () {
  this.data = {};
  return this;
};

/**
 * removes all data from the Trie (clean startup)
 * @returns {ShiroTrie}
 */
ShiroTrie.prototype.reset = function () {
  this.data = {};
  return this;
};

/**
 * Add one or more permissions to the Trie
 * @param {...string|...Array} args - Any number of permission string(s) or String Array(s)
 * @returns {ShiroTrie}
 */
ShiroTrie.prototype.add = function () {
  var args = [].concat.apply([], arguments);
  var arg;
  for (arg in args) {
    if (args.hasOwnProperty(arg) && typeof(args[arg]) === 'string') {
      var array = args[arg].split(':');
      // remove star leaf, because it is added in _add with empty subtree
      if (array[array.length - 1] === '*') { 
        array.splice(array.length-1, 1);
      }
      this.data = _add(this.data, array);
    }
  }
  return this;
};

/**
 * check if a specific permission is allowed in the current Trie.
 * @param string The string to check. Should not contain * – always check for the most explicit
 *   permission
 * @returns {*}
 */
ShiroTrie.prototype.check = function (string) {
  if (typeof string !== 'string') {
    return false;
  }
  if (string.indexOf(',') !== -1) { // expand string to single comma-less permissions...
    return _expand(string).map(function (permission) {
      return _check(this.data, permission.split(':'));
    }, this).every(Boolean); // ... and make sure they are all allowed
  }
  return _check(this.data, string.split(':'));
};

/**
 * return the Trie data
 * @returns {{}|*}
 */
ShiroTrie.prototype.get = function () {
  return this.data;
};

/**
 * check what permissions a certain Trie part contains
 * @param string String to check – should contain exactly one ?. Also possible is usage of the any
 *   ($) parameter. See docs for details.
 * @returns {*}
 */
ShiroTrie.prototype.permissions = function (string) {
  if (typeof string !== 'string') {
    return [];
  }
  return _permissions(this.data, string.split(':'));
};

module.exports = {
  /**
   * @deprecated since 0.4.0. Use newTrie() instead.
   * @returns {ShiroTrie}
   */
  new: function () {
    return new ShiroTrie();
  },
  newTrie: function () {
    return new ShiroTrie();
  },
  _expand: _expand,
};
