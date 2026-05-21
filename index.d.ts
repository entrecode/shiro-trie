export interface ShiroTrieNode {
  [segment: string]: ShiroTrieNode;
}

export interface ShiroTrie {
  reset(): ShiroTrie;
  add(...permissions: Array<string | string[]>): ShiroTrie;
  check(permission: string): boolean;
  get(): ShiroTrieNode;
  permissions(search: string): Array<string>;
}

export function newTrie(): ShiroTrie;

/** @deprecated since 0.4.0 — kept as an alias for {@link newTrie}. */
declare function _new(): ShiroTrie;
export { _new as new };

declare const _default: {
  newTrie: typeof newTrie;
  new: typeof newTrie;
};
export default _default;
