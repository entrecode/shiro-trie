// Cache frequently used values
const STAR = '*';
const QUESTION = '?';
const DOLLAR = '$';
const COLON = ':';
const COMMA = ',';

// Optimized uniq function with Set
const uniq = (arr) => Array.from(new Set(arr));

// Cache Object.keys for better performance
const getKeys = (obj) => Object.keys(obj);
const isEmpty = (obj) => getKeys(obj).length === 0;

// Pre-allocate common arrays
const EMPTY_ARRAY = [];

// Optimized permission normalization - removes redundant wildcards
const normalizePermission = (array) => {
  // Remove trailing wildcards since they're implicit
  let normalized = [...array];
  while (normalized.length > 0 && normalized[normalized.length - 1] === STAR) {
    normalized.pop();
  }
  return normalized;
};

// Check if a node has a wildcard that grants all permissions at this level
const hasWildcardAccess = (node) => {
  return STAR in node && isEmpty(node[STAR]);
};

const _add = (trie, array) => {
  // Normalize the permission array to remove redundant wildcards
  const normalizedArray = normalizePermission(array);

  // If the normalized array is empty, we have a root wildcard
  if (normalizedArray.length === 0) {
    trie[STAR] = {};
    return trie;
  }

  let node = trie;
  let goRecursive = false;

  // go through permission string array
  for (let i = 0; i < normalizedArray.length; i++) {
    // split by comma - cache the split result
    const values = normalizedArray[i].includes(COMMA) ? normalizedArray[i].split(COMMA) : [normalizedArray[i]];
    const valuesLength = values.length;

    // default: only once (no comma separation)
    for (let j = 0; j < valuesLength; j++) {
      const value = values[j];

      // permission is new -> create
      if (!(value in node)) {
        node[value] = {};
      } else if (hasWildcardAccess(node[value])) {
        // If this node already has wildcard access, no need to add more
        return trie;
      }

      if (valuesLength > 1) {
        // if we have a comma separated permission list, we have to go recursive
        // save the remaining permission array (subTrie has to be appended to each one)
        goRecursive = goRecursive || normalizedArray.slice(i + 1);
        // call recursion for this subTrie
        node[value] = _add(node[value], goRecursive);
        // break outer loop
        i = normalizedArray.length;
      } else {
        // if we don't need recursion, we just go deeper
        node = node[value];
      }
    }
  }

  // if we did not went recursive, we close the Trie with a * leaf
  if (!goRecursive) {
    node[STAR] = {};
  }

  return trie;
};

const _check = (trie, array) => {
  let node = trie;

  // add implicit star at the end
  if (array.length < 1 || array[array.length - 1] !== STAR) {
    array.push(STAR);
  }

  // we iterate one step beyond the length of the array to check for wildcard access at the end
  for (let i = 0; i <= array.length; i++) {
    const current = array[i];

    // If we find a wildcard with empty subtree at this level, we're done
    // This means we have permission for everything at this level and below
    if (hasWildcardAccess(node)) {
      return true;
    } else if (STAR in node && current !== STAR && current in node) {
      // if there are multiple paths, we have to go recursive
      return _check(node[STAR], array.slice(i + 1)) || _check(node[current], array.slice(i + 1));
    } else if (STAR in node) {
      // otherwise we have to go deeper
      node = node[STAR];
    } else if (current in node) {
      // otherwise we go deeper
      node = node[current];
    } else {
      // if the wanted permission is not found, we return false
      return false;
    }
  }
};

const _permissions = (trie, array) => {
  if (!trie || !array || typeof trie !== 'object' || !Array.isArray(array) || isEmpty(trie) || array.length < 1) {
    // for recursion safety, we make sure we have really valid values
    return EMPTY_ARRAY;
  }

  // if we have a star permission with nothing further down the trie we can just return that
  if (hasWildcardAccess(trie)) {
    return [STAR];
  }

  array = [].concat(array);
  // take first element from array
  const current = array.shift();

  // the requested part
  if (current === QUESTION) {
    const results = getKeys(trie);
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
  if (current === DOLLAR) {
    // $ before ?
    const results = [];
    getKeys(trie).forEach((node) => {
      results.push(..._permissions(trie[node], [].concat(array)));
    });
    // remove duplicates
    const u = uniq(results);
    // … and * from results
    for (let i = u.length - 1; i >= 0; i--) {
      if (u[i] === STAR) {
        u.splice(i, 1);
      }
    }
    return u;
  }

  const results = [];
  if (current in trie) {
    // we have to go deeper!
    results.push(..._permissions(trie[current], array));
  }
  if (STAR in trie) {
    // if we have a star permission we need to go deeper
    results.push(..._permissions(trie[STAR], array));
  }
  return results;
};

const _expand = (permission) => {
  const results = [];
  const parts = permission.split(COLON);

  for (let i = 0; i < parts.length; i++) {
    const alternatives = parts[i].includes(COMMA) ? parts[i].split(COMMA) : [parts[i]];
    if (results.length === 0) {
      results.push(...alternatives);
    } else {
      // More efficient array handling
      const newResults = [];
      for (const alternative of alternatives) {
        for (const perm of results) {
          newResults.push(perm + COLON + alternative);
        }
      }
      results.length = 0;
      results.push(...uniq(newResults));
    }
  }
  return results;
};

const _expandTrie = (trie, array) => {
  const a = [...array];

  return getKeys(trie)
    .map((node) => {
      let recurse = false;
      if (node === STAR) {
        if (array.length <= 1 || isEmpty(trie[node])) {
          return [node];
        }
        recurse = true;
      }
      if (node === STAR || array[0] === node || array[0] === DOLLAR) {
        if (array.length <= 1) {
          return [node];
        }
        recurse = true;
      }

      if (!recurse) {
        return EMPTY_ARRAY;
      }
      const child = _expandTrie(trie[node], array.slice(1));
      return child.map((inner) => node + COLON + inner);
    })
    .reduce((a, b) => a.concat(b), EMPTY_ARRAY);
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
        const array = arg.split(COLON);
        // The normalization is now handled in _add function
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

    // Early check: if the trie has a root wildcard, everything is allowed
    if (hasWildcardAccess(this.data)) {
      return true;
    }

    if (string.includes(COMMA)) {
      // expand string to single comma-less permissions...
      return _expand(string)
        .map((permission) => _check(this.data, permission.split(COLON)))
        .every(Boolean); // ... and make sure they are all allowed
    }

    return _check(this.data, string.split(COLON));
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
      return EMPTY_ARRAY;
    }
    return _permissions(this.data, string.split(COLON));
  }
}

module.exports = {
  newTrie: () => new ShiroTrie(),
  _expand,
};
