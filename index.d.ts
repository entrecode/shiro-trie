export interface ShiroTrie {
  reset(): ShiroTrie;
  add(...permissions: Array<string | string[]>): ShiroTrie;
  check(permission: string): boolean;
  get(): any;
  permissions(search: string): Array<string>;
}

export function newTrie(): ShiroTrie;

declare const _default: {
  newTrie: typeof newTrie;
};
export default _default;
