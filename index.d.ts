// Type definitions for shiro-trie
// Project: ec.shiro-trie
// Definitions by: Simon Scherzinger <scherzinger@entrecode.de>

declare module 'shiro-trie' {
  export function newTrie(): ShiroTrie;

  interface IShiroTrie {
    newTrie: () => ShiroTrie,
    _expand: (permissions: string) => Array<string>,
  }

  export interface ShiroTrie {
    constructor(): ShiroTrie;

    reset: () => ShiroTrie;

    add: (...permissions: Array<string>) => ShiroTrie;

    check: (permission: string) => boolean;

    get: () => any;

    permissions: (search: string) => Array<string>;
  }

}
