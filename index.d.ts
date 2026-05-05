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

declare const _default: {
  newTrie: typeof newTrie;
};
export default _default;
