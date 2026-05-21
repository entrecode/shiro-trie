const STAR = '*';
const QUESTION = '?';
const DOLLAR = '$';
const COLON = ':';
const COMMA = ',';

const EMPTY_ARRAY = [];

const newNode = () => ({});

const LEAF = Object.freeze({});
const TERMINATOR = Object.freeze({ [STAR]: LEAF });

const isEmpty = (obj) => obj === LEAF;
const hasWildcardAccess = (node) => node[STAR] === LEAF;

const _add = (trie, array, from) => {
  let end = array.length;
  while (end > from && array[end - 1] === STAR) end--;

  if (end === from) {
    trie[STAR] = LEAF;
    return trie;
  }

  let node = trie;
  const lastIdx = end - 1;

  for (let i = from; i < end; i++) {
    const token = array[i];
    const isLast = i === lastIdx;
    const commaIdx = token.indexOf(COMMA);

    if (commaIdx === -1) {
      const existing = node[token];
      if (existing === undefined) {
        if (isLast) {
          node[token] = TERMINATOR;
          return trie;
        }
        const child = newNode();
        node[token] = child;
        node = child;
      } else if (existing === LEAF || hasWildcardAccess(existing)) {
        return trie;
      } else if (isLast) {
        existing[STAR] = LEAF;
        return trie;
      } else {
        node = existing;
      }
    } else {
      const values = token.split(COMMA);
      const tailFrom = i + 1;
      const tailEmpty = tailFrom >= end;
      for (let j = 0; j < values.length; j++) {
        const value = values[j];
        const existing = node[value];
        if (existing === undefined) {
          if (tailEmpty) {
            node[value] = TERMINATOR;
          } else {
            const child = newNode();
            node[value] = child;
            _add(child, array, tailFrom);
          }
          continue;
        }
        if (existing === LEAF || hasWildcardAccess(existing)) continue;
        if (tailEmpty) {
          existing[STAR] = LEAF;
        } else {
          _add(existing, array, tailFrom);
        }
      }
      return trie;
    }
  }
};

const _check = (node, parts, idx, len) => {
  while (idx < len) {
    const star = node[STAR];
    if (star === LEAF) return true;

    const current = parts[idx];
    const literal = current !== STAR ? node[current] : undefined;

    if (literal !== undefined && star === undefined) {
      if (literal === TERMINATOR) return true;
      node = literal;
    } else if (literal !== undefined) {
      return _check(star, parts, idx + 1, len) || _check(literal, parts, idx + 1, len);
    } else if (star !== undefined) {
      node = star;
    } else {
      return false;
    }
    idx++;
  }
  return node[STAR] === LEAF;
};

const _checkExpanded = (data, string) => {
  const segments = string.split(COLON);
  const len = segments.length;

  let firstMultiIdx = -1;
  let secondMultiIdx = -1;
  for (let i = 0; i < len; i++) {
    if (segments[i].indexOf(COMMA) !== -1) {
      if (firstMultiIdx === -1) firstMultiIdx = i;
      else {
        secondMultiIdx = i;
        break;
      }
    }
  }

  if (secondMultiIdx === -1) {
    const alts = segments[firstMultiIdx].split(COMMA);
    for (let i = 0; i < alts.length; i++) {
      segments[firstMultiIdx] = alts[i];
      if (!_check(data, segments, 0, len)) return false;
    }
    return true;
  }

  const alts = new Array(len);
  for (let i = 0; i < len; i++) {
    alts[i] = segments[i].indexOf(COMMA) === -1 ? null : segments[i].split(COMMA);
  }
  const idxs = new Array(len).fill(0);
  const parts = segments;
  for (let i = 0; i < len; i++) if (alts[i] !== null) parts[i] = alts[i][0];

  while (true) {
    if (!_check(data, parts, 0, len)) return false;
    let k = 0;
    while (k < len) {
      const a = alts[k];
      if (a !== null) {
        idxs[k]++;
        if (idxs[k] < a.length) {
          parts[k] = a[idxs[k]];
          break;
        }
        idxs[k] = 0;
        parts[k] = a[0];
      }
      k++;
    }
    if (k === len) return true;
  }
};

const _permissions = (trie, parts, idx) => {
  if (!trie || typeof trie !== 'object' || isEmpty(trie) || idx >= parts.length) {
    return EMPTY_ARRAY;
  }

  if (hasWildcardAccess(trie)) return [STAR];

  const current = parts[idx];

  if (current === QUESTION) {
    const keys = Object.keys(trie);
    if (idx + 1 >= parts.length) return keys;
    const out = [];
    if (idx + 2 >= parts.length) {
      const tail = parts[idx + 1];
      if (tail === DOLLAR) {
        for (let i = 0; i < keys.length; i++) {
          const sub = trie[keys[i]];
          if (sub[STAR] !== undefined) {
            out.push(keys[i]);
            continue;
          }
          for (const k in sub) {
            if (k !== STAR) {
              out.push(keys[i]);
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < keys.length; i++) {
          const sub = trie[keys[i]];
          if (sub[STAR] !== undefined || sub[tail] !== undefined) {
            out.push(keys[i]);
          }
        }
      }
      return out;
    }
    for (let i = 0; i < keys.length; i++) {
      if (_matches(trie[keys[i]], parts, idx + 1)) {
        out.push(keys[i]);
      }
    }
    return out;
  }

  if (current === DOLLAR) {
    const keys = Object.keys(trie);
    const out = [];
    for (let i = 0; i < keys.length; i++) {
      const sub = _permissions(trie[keys[i]], parts, idx + 1);
      for (let j = 0; j < sub.length; j++) {
        const v = sub[j];
        if (v !== STAR && out.indexOf(v) === -1) out.push(v);
      }
    }
    return out;
  }

  const literal = trie[current];
  const star = current !== STAR ? trie[STAR] : undefined;
  if (literal !== undefined && star === undefined) {
    return _permissions(literal, parts, idx + 1);
  }
  if (literal === undefined && star !== undefined) {
    return _permissions(star, parts, idx + 1);
  }
  if (literal === undefined) return EMPTY_ARRAY;
  const out = [];
  const subA = _permissions(literal, parts, idx + 1);
  for (let i = 0; i < subA.length; i++) out.push(subA[i]);
  const subB = _permissions(star, parts, idx + 1);
  for (let i = 0; i < subB.length; i++) out.push(subB[i]);
  return out;
};

const _matches = (trie, parts, idx) => {
  if (idx >= parts.length) return true;
  const head = parts[idx];
  const lastToken = idx + 1 >= parts.length;

  const star = trie[STAR];
  if (star !== undefined) {
    if (lastToken || star === LEAF) return true;
    if (_matches(star, parts, idx + 1)) return true;
  }

  if (head === DOLLAR) {
    for (const k in trie) {
      if (k === STAR) continue;
      if (lastToken || _matches(trie[k], parts, idx + 1)) return true;
    }
    return false;
  }

  const literal = trie[head];
  if (literal === undefined) return false;
  return lastToken || _matches(literal, parts, idx + 1);
};

/**
 * Returns a new ShiroTrie instance
 * @returns {ShiroTrie}
 * @constructor
 */
class ShiroTrie {
  constructor() {
    this.data = newNode();
  }

  /**
   * removes all data from the Trie (clean startup)
   * @returns {ShiroTrie}
   */
  reset() {
    this.data = newNode();
    return this;
  }

  /**
   * Add one or more permissions to the Trie
   * @param {...string|...Array} args - Any number of permission string(s) or String Array(s)
   * @returns {ShiroTrie}
   */
  add(...args) {
    if (args.length === 1) {
      const a = args[0];
      if (typeof a === 'string') {
        _add(this.data, a.split(COLON), 0);
        return this;
      }
      if (Array.isArray(a)) {
        for (let i = 0; i < a.length; i++) {
          const item = a[i];
          if (typeof item === 'string') _add(this.data, item.split(COLON), 0);
        }
        return this;
      }
      return this;
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'string') {
        _add(this.data, arg.split(COLON), 0);
      } else if (Array.isArray(arg)) {
        for (let j = 0; j < arg.length; j++) {
          const item = arg[j];
          if (typeof item === 'string') _add(this.data, item.split(COLON), 0);
        }
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
    if (typeof string !== 'string') return false;

    if (hasWildcardAccess(this.data)) return true;

    if (string.indexOf(COMMA) !== -1) {
      return _checkExpanded(this.data, string);
    }

    const parts = string.split(COLON);
    return _check(this.data, parts, 0, parts.length);
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
    if (typeof string !== 'string') return EMPTY_ARRAY;
    return _permissions(this.data, string.split(COLON), 0);
  }
}

const newTrie = () => new ShiroTrie();

module.exports = { newTrie, new: newTrie };
module.exports.default = { newTrie, new: newTrie };
