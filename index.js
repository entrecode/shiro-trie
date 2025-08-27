'use strict';

const uniq = (arr) => Array.from(new Set(arr));

const _add = (trie, array) => {
  let node = trie;
  let goRecursive = false;
  
  // go through permission string array
  for (let i = 0; i < array.length; i++) {
    // split by comma
    const values = array[i].split(',');
    
    // default: only once (no comma separation)
    for (let j = 0; j < values.length; j++) {
      const value = values[j];
      
      // permission is new -> create
      if (!node.hasOwnProperty(value)) {
        node[value] = {};
      } else if (node.hasOwnProperty('*') && Object.keys(node['*']).length === 0) { 
        return trie;
      }
      
      if (values.length > 1) {
        // if we have a comma separated permission list, we have to go recursive
        // save the remaining permission array (subTrie has to be appended to each one)
        goRecursive = goRecursive || array.slice(i + 1);
        // call recursion for this subTrie
        node[value] = _add(node[value], goRecursive);
        // break outer loop
        i = array.length;
      } else {
        // if we don't need recursion, we just go deeper
        node = node[value];
      }
    }
  }
  
  // if we did not went recursive, we close the Trie with a * leaf
  if (!goRecursive) {
    node['*'] = {};
  }
  
  return trie;
};

const _check = (trie, array) => {
  let node = trie;
  
  // add implicit star at the end
  if (array.length < 1 || array[array.length - 1] !== '*') {
    array.push('*');
  }
  
  for (let i = 0; i < array.length; i++) {
    const current = array[i];
    
    if (node.hasOwnProperty('*') && Object.keys(node['*']).length === 0) {
      // if we find a star leaf in the trie, we are done (everything below is allowed)
      return true;
    } else if (node.hasOwnProperty('*') && current !== '*' && node.hasOwnProperty(current)) {
      // if there are multiple paths, we have to go recursive
      return _check(node['*'], array.slice(i + 1)) || _check(node[current], array.slice(i + 1));
    } else if (node.hasOwnProperty('*')) {
      // otherwise we have to go deeper
      node = node['*'];
    } else if (node.hasOwnProperty(current)) {
      // otherwise we go deeper
      node = node[current];
    } else {
      // if the wanted permission is not found, we return false
      return false;
    }
  }
  
  // word (array) was found in the trie. all good!
  return true;
};

const _permissions = (trie, array) => {
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
  const current = array.shift();
  
  // the requested part
  if (current === '?') {
    const results = Object.keys(trie);
    // if something is coming after the ?,
    if (array.length > 0) {
      const anyObj = {};
      results.forEach((node) => {
        anyObj[node] = _expandTrie(trie[node], array);
      });

      return results.filter((node) => anyObj[node].length > 0);
    }
    return results;
  }
  
  // if we have an 'any' flag, we have to go recursive for all alternatives
  if (current === '$') { // $ before ?
    const results = [];
    Object.keys(trie).forEach((node) => {
      results.push(..._permissions(trie[node], [].concat(array)));
    });
    // remove duplicates
    const u = uniq(results);
    // … and * from results
    for (let i = u.length - 1; i >= 0; i--) {
      if (u[i] === '*') {
        u.splice(i, 1);
      }
    }
    return u;
  }
  
  const results = [];
  if (trie.hasOwnProperty(current)) {
    // we have to go deeper!
    results.push(..._permissions(trie[current], array));
  }
  if (trie.hasOwnProperty('*')) {
    // if we have a star permission we need to go deeper
    results.push(..._permissions(trie['*'], array));
  }
  return results;
};

const _expand = (permission) => {
  const results = [];
  const parts = permission.split(':');
  
  for (let i = 0; i < parts.length; i++) {
    const alternatives = parts[i].split(',');
    if (results.length === 0) {
      results.push(...alternatives);
    } else {
      const newAlternatives = alternatives.map((alternative) => 
        results.map((perm) => `${perm}:${alternative}`)
      );
      results.length = 0;
      results.push(...[].concat(...uniq(newAlternatives)));
    }
  }
  return results;
};

const _expandTrie = (trie, array) => {
  const a = [...array];

  return Object.keys(trie).map((node) => {
    let recurse = false;
    if (node === '*') {
      if (array.length <= 1 || Object.keys(trie[node]).length === 0) {
        return [node];
      }
      recurse = true;
    }
    if (node === '*' || array[0] === node || array[0] === '$') {
      if (array.length <= 1) {
        return [node];
      }
      recurse = true;
    }

    if (!recurse) {
      return [];
    }
    const child = _expandTrie(trie[node], array.slice(1));
    return child.map((inner) => `${node}:${inner}`);
  }).reduce((a, b) => a.concat(b), []);
};

/**
 * Returns a new ShiroTrie instance
 * @returns {ShiroTrie}
 * @constructor
 */
class ShiroTrie {
  constructor() {
    this.data = {};
  }

  /**
   * removes all data from the Trie (clean startup)
   * @returns {ShiroTrie}
   */
  reset() {
    this.data = {};
    return this;
  }

  /**
   * Add one or more permissions to the Trie
   * @param {...string|...Array} args - Any number of permission string(s) or String Array(s)
   * @returns {ShiroTrie}
   */
  add(...args) {
    const flatArgs = [].concat(...args);
    
    for (const arg of flatArgs) {
      if (typeof arg === 'string') {
        const array = arg.split(':');
        // remove star leaf, because it is added in _add with empty subtree
        if (array[array.length - 1] === '*') { 
          array.splice(array.length - 1, 1);
        }
        this.data = _add(this.data, array);
      }
    }
    return this;
  }

  /**
   * check if a specific permission is allowed in the current Trie.
   * @param string The string to check. Should not contain * – always check for the most explicit
   *   permission
   * @returns {*}
   */
  check(string) {
    if (typeof string !== 'string') {
      return false;
    }
    
    if (string.indexOf(',') !== -1) { // expand string to single comma-less permissions...
      return _expand(string).map((permission) => 
        _check(this.data, permission.split(':'))
      ).every(Boolean); // ... and make sure they are all allowed
    }
    
    return _check(this.data, string.split(':'));
  }

  /**
   * return the Trie data
   * @returns {{}|*}
   */
  get() {
    return this.data;
  }

  /**
   * check what permissions a certain Trie part contains
   * @param string String to check – should contain exactly one ?. Also possible is usage of the any
   *   ($) parameter. See docs for details.
   * @returns {*}
   */
  permissions(string) {
    if (typeof string !== 'string') {
      return [];
    }
    return _permissions(this.data, string.split(':'));
  }
}

module.exports = {
  newTrie: () => new ShiroTrie(),
  _expand,
};
