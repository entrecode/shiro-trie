# shiro-trie benchmarks

Side-by-side benchmark of the optimized `index.js` against a snapshot of the
pre-optimization `develop` branch.

```
node bench/bench.js                   # speed table
node --expose-gc bench/bench.js       # adds the heap-delta line
```

## Files

| File          | Purpose                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `baseline.js` | Frozen copy of pre-optimization `index.js`. Required by `bench.js`; do not edit.                       |
| `bench.js`    | Loads `baseline.js` and `../index.js`, runs the same workload against both, prints a comparison table. |

## Final results

Workload: 1000 `user:N:read,write,delete` permissions plus a handful of
wildcards (`admin:*`, `m:n:*:p:q`, `a:b,c,d:e,f,g`, `product:1,2,3,4,5:view,edit`).

| Benchmark                     | Baseline   | Optimized | Δ          |
| ----------------------------- | ---------- | --------- | ---------- |
| `check` hit                   | 105 ns/op  | 63 ns/op  | **+62%**   |
| `check` miss                  | 86 ns/op   | 60 ns/op  | **+44%**   |
| `check` wildcard hit          | 71 ns/op   | 50 ns/op  | **+45%**   |
| `check` comma                 | 1064 ns/op | 149 ns/op | **+614%**  |
| `check` deep wildcard         | 350 ns/op  | 115 ns/op | **+204%**  |
| `permissions('user:?')`       | 14.5 µs    | 6.6 µs    | **+120%**  |
| `permissions('user:?:write')` | 144 µs     | 13 µs     | **+1025%** |
| `permissions('$:$:?')`        | 124 µs     | 47 µs     | **+165%**  |
| Build 1000 perms              | 0.85 ms    | 0.51 ms   | **+68%**   |
| **Heap per trie**             | **396 KB** | **66 KB** | **−83%**   |

Public API is unchanged. All 90 tests pass.

## Optimizations applied to `index.js`

### Memory

1. **Shared `LEAF` sentinel.** Every wildcard marker (`node[STAR] = {}`) is now
   the single shared frozen `LEAF`. Saves ~3000 empty-object allocations per
   1000-permission trie.
2. **Shared `TERMINATOR` sentinel.** Most leaves are structurally `{*: LEAF}`.
   `parent[token] = TERMINATOR` replaces the per-leaf wrapper. Saves another
   ~3000 wrapper allocations.
3. **Frozen sentinels.** Both are `Object.freeze`d so any accidental write
   throws loudly instead of silently corrupting every trie that shares the
   leaf. `_add` checks `existing === LEAF || hasWildcardAccess(existing)`
   before any in-place wildcard mutation.

Net memory: 396 KB → 66 KB per trie (−83%).

### `check` hot path

4. **Reference-compare empty checks.** With internal writes guaranteed to use
   `LEAF`, `isEmpty` and `hasWildcardAccess` collapse from `for-in` loops to a
   single `===` cmp.
5. **Index walk in `_check`.** Replaced `array.push(STAR) + array.slice(i+1)`
   recursion with `(node, parts, idx, len)` index walk. Zero per-step
   allocation; recursion only on the rare divergent (`*` and literal both
   present) case.
6. **`literal === TERMINATOR` short-circuit.** Landing on a leaf wrapper means
   the rest of the query is covered — skip the trailing terminal-step lookup.
7. **Branch order.** Most-common `literal && !star` branch is first.

### `check` with commas

8. **Lazy expansion (`_checkExpanded`).** The original built the full
   cartesian product of comma alternatives via `_expand`. Now we walk the
   product as an odometer and bail on first failed `_check` — no full array
   ever materialized.
9. **Single-multi-segment fast path.** When only one segment has alternatives
   (e.g. `user:500:read,write` — by far the common case), reuse `segments` as
   the parts array and overwrite only that one slot per iteration. Skips the
   odometer machinery entirely.

### `permissions(...)`

10. **Index walk.** Replaced `array.shift()` and `[].concat(array)` per
    recursion with a single `idx` parameter.
11. **`Object.keys` instead of `for-in`** for the `?` and `$` enumerations.
    Native intrinsic beats interpreter for many-key nodes (1000 children).
12. **Zero-copy bubble-up.** When only `literal` _or_ only `*` contributes,
    return the recursive result directly instead of allocating a new merged
    array.
13. **Linear-scan dedup in the `$` branch.** The unique result list is
    typically <10 strings; `Array#indexOf` beats `Set` hashing at that size.
14. **`_matches` predicate replaces `_expandTrie` for the `?` branch.** The
    QUESTION enumeration only needed a "does this subtree match?" boolean,
    not the full match list. New predicate allocates nothing and bails on
    first hit. Single biggest `permissions(...)` win — `user:?:write` from
    149 µs → 13 µs.
15. **Inlined fast path for `?:tail`.** When exactly one token follows the
    `?`, skip the `_matches` call entirely and check `sub[STAR] !== undefined
|| sub[tail] !== undefined` directly. Cuts function-call overhead on each
    of potentially thousands of children.

### `add(...)`

16. **No-copy normalization.** Trim trailing `*` via index instead of
    `[...array]` copy.
17. **TERMINATOR at leaf positions.** Brand-new leaves assign the shared
    sentinel directly instead of `newNode(); node[STAR] = LEAF`.
18. **Single-arg fast path** for the common `trie.add('a:b:c')` case avoids
    the `[].concat(...args)` temp array.

## Things tried and rejected

| Change                                                                 | Why                                                                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Object.create(null)` for trie nodes                                   | V8 dictionary-mode penalty regresses `check` 10-20%. Plain `{}` keeps fast hidden classes.                            |
| `for-in + push` instead of `Object.keys` for `?` enumeration           | 40% slower on 1000-key nodes. `Object.keys` is a JIT intrinsic.                                                       |
| `node === TERMINATOR` shortcut at top of `_check` loop                 | Adds one cmp per iteration. Net neutral; the `node[STAR] === LEAF` check at the next iteration catches the same case. |
| Subtree-collapse on wildcard add (`add('a:b:c').add('a:b')` drops `c`) | Changes observable `permissions('a:b:c')` from `['*']` to `[]`.                                                       |
| Manual char-by-char split                                              | V8's `String#split` is faster.                                                                                        |
| `Map` for wide nodes                                                   | More memory and slower lookup than plain-object hidden-class chain.                                                   |
| Bloom filter for misses                                                | Miss case is already 60 ns; a Bloom check is ~20-30 ns alone. No margin.                                              |

## What still costs perf — and would need API changes

- **`string.split(':')` is ~26 ns of every 63 ns `check` hit.** Eliminating
  it would need a `checkParts(arr)` / `compile(string)` API addition.
- **`Object.keys` on a 1000-key node is the floor for `permissions('user:?')`.**
  Caching results requires invalidation tracking, i.e. forbidding direct
  `get()` mutation.
