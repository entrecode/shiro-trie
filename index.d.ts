// Type definitions for shiro-trie
// Project: ec.shiro-trie
// Definitions by: Simon Scherzinger <scherzinger@entrecode.de>

export interface ShiroTrie {
  reset(): ShiroTrie;
  add(...permissions: Array<string | string[]>): ShiroTrie;
  check(permission: string): boolean;
  get(): any;
  permissions(search: string): Array<string>;
}

export function newTrie(): ShiroTrie;
export function _expand(permissions: string): Array<string>;

declare const _default: {
  newTrie: typeof newTrie;
  _expand: typeof _expand;
};
export default _default;
