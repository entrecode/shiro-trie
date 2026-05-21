## 0.5.0 (2026-05-21)

* feat: add legacy 'new' alias for newTrie function and update type definitions ([50c18d7](https://github.com/entrecode/shiro-trie/commit/50c18d7))
* feat: enhance permission handling in ShiroTrie by normalizing and compressing wildcard paths ([2b080ab](https://github.com/entrecode/shiro-trie/commit/2b080ab))
* feat: publish dual ESM/CJS package ([d5d60cc](https://github.com/entrecode/shiro-trie/commit/d5d60cc))
* docs: document the 0.5.0 performance rewrite in the README ([4f668c4](https://github.com/entrecode/shiro-trie/commit/4f668c4))
* docs: drop branch=master pin from coveralls badge ([7f0e149](https://github.com/entrecode/shiro-trie/commit/7f0e149))
* docs: refresh CHANGELOG with the latest 0.5.0 commits ([328dcdf](https://github.com/entrecode/shiro-trie/commit/328dcdf))
* docs: refresh README to match current toolchain ([1caaab7](https://github.com/entrecode/shiro-trie/commit/1caaab7))
* docs: regenerate CHANGELOG for 0.5.0 ([cf1d386](https://github.com/entrecode/shiro-trie/commit/cf1d386))
* types: replace get(): any with a recursive ShiroTrieNode ([8d9d3d1](https://github.com/entrecode/shiro-trie/commit/8d9d3d1))
* chore: add build step to GitHub Actions workflow ([b5ad085](https://github.com/entrecode/shiro-trie/commit/b5ad085))
* chore: add prettier and apply to repo ([c19b4b4](https://github.com/entrecode/shiro-trie/commit/c19b4b4))
* chore: adds gh action build ([8c8cb04](https://github.com/entrecode/shiro-trie/commit/8c8cb04))
* chore: bump dev dependencies to latest ([430cea1](https://github.com/entrecode/shiro-trie/commit/430cea1))
* chore: bump to 0.5.0 ([7953fd1](https://github.com/entrecode/shiro-trie/commit/7953fd1))
* chore: declare node >=18 engine ([cf6b3ed](https://github.com/entrecode/shiro-trie/commit/cf6b3ed))
* chore: drop Bower, Browserify, and Karma browser test pipeline ([38379d9](https://github.com/entrecode/shiro-trie/commit/38379d9))
* chore: drop legacy module field from package.json ([8e6d945](https://github.com/entrecode/shiro-trie/commit/8e6d945))
* chore: fix vscode launch config to call npm test ([7575876](https://github.com/entrecode/shiro-trie/commit/7575876))
* chore: gate npm publish on tests and prettier check ([15b91db](https://github.com/entrecode/shiro-trie/commit/15b91db))
* chore: refactor index.js to use modern JavaScript syntax ([ad9a994](https://github.com/entrecode/shiro-trie/commit/ad9a994))
* chore: remove bench/ snapshot harness ([524fa0b](https://github.com/entrecode/shiro-trie/commit/524fa0b))
* chore: rename workflow file ([f8e6348](https://github.com/entrecode/shiro-trie/commit/f8e6348))
* chore: switch jest progress to dot reporter ([bb1d93e](https://github.com/entrecode/shiro-trie/commit/bb1d93e))
* chore: switch to jest and coveralls-next ([c1bcfcb](https://github.com/entrecode/shiro-trie/commit/c1bcfcb))
* chore: trim .gitignore to what this repo actually produces ([af42e9d](https://github.com/entrecode/shiro-trie/commit/af42e9d))
* chore: update chai version with commonJS version ([0c83561](https://github.com/entrecode/shiro-trie/commit/0c83561))
* chore: update dependencies and remove Travis CI configuration ([19e6c27](https://github.com/entrecode/shiro-trie/commit/19e6c27))
* chore: update GitHub Actions badge to reflect new workflow name ([9aee943](https://github.com/entrecode/shiro-trie/commit/9aee943))
* chore: update GitHub Actions to include feature branch for testing ([9b89ba9](https://github.com/entrecode/shiro-trie/commit/9b89ba9))
* chore: update launch configuration to run backend tests ([a9118ea](https://github.com/entrecode/shiro-trie/commit/a9118ea))
* chore: update Node.js versions in GitHub Actions workflow ([d88dbd5](https://github.com/entrecode/shiro-trie/commit/d88dbd5))
* chore: update README and GitHub Actions workflow to reflect build status ([adc8217](https://github.com/entrecode/shiro-trie/commit/adc8217))
* test: add new test cases for wildcard matching in shiro-trie ([e5462e5](https://github.com/entrecode/shiro-trie/commit/e5462e5))
* test: add side-by-side benchmark harness for perf comparison ([e144d75](https://github.com/entrecode/shiro-trie/commit/e144d75))
* test: drop meta-tests that don't exercise the library ([edcdee4](https://github.com/entrecode/shiro-trie/commit/edcdee4))
* test: modernize var/function-expr to const-let/arrow ([ca628dc](https://github.com/entrecode/shiro-trie/commit/ca628dc))
* ci: drop node-version matrix ([c305366](https://github.com/entrecode/shiro-trie/commit/c305366))
* ci: drop stale feature/modernize branch trigger ([eb2222d](https://github.com/entrecode/shiro-trie/commit/eb2222d))
* ci: gate prettier formatting in build-and-test workflow ([0e45a2c](https://github.com/entrecode/shiro-trie/commit/0e45a2c))
* ci: replace coveralls-next + .coveralls.yml with official action ([e9e28d8](https://github.com/entrecode/shiro-trie/commit/e9e28d8))
* refactor: drop unused _expand export and tighten coverage ([9caf9f6](https://github.com/entrecode/shiro-trie/commit/9caf9f6))
* refactor: optimize performance in index.js by caching values and using modern syntax ([1edb53b](https://github.com/entrecode/shiro-trie/commit/1edb53b))
* refactor: remove compressTrie function ([a28735c](https://github.com/entrecode/shiro-trie/commit/a28735c))
* perf: optimize check, permissions, and trie memory via shared sentinels ([c6ff072](https://github.com/entrecode/shiro-trie/commit/c6ff072)), closes [Array#indexOf](https://github.com/Array/issues/indexOf)
* frontend build ([28d664d](https://github.com/entrecode/shiro-trie/commit/28d664d))
* frontend build ([435dc16](https://github.com/entrecode/shiro-trie/commit/435dc16))
* new frontend build ([3226652](https://github.com/entrecode/shiro-trie/commit/3226652))
* fix: correct loop condition in _check function to prevent out-of-bounds access ([c9151a7](https://github.com/entrecode/shiro-trie/commit/c9151a7))

## <small>0.4.10 (2021-01-13)</small>

* fix: order of permissions irrelevant ([1260fcd](https://github.com/entrecode/shiro-trie/commit/1260fcd)), closes [#147](https://github.com/entrecode/shiro-trie/issues/147)
* chore: new changelog ([48e9c65](https://github.com/entrecode/shiro-trie/commit/48e9c65))
* chore: updated travis.yml ([cd45e20](https://github.com/entrecode/shiro-trie/commit/cd45e20))
* chore(package): update coveralls to version 3.0.8 ([b27be6b](https://github.com/entrecode/shiro-trie/commit/b27be6b)), closes [#142](https://github.com/entrecode/shiro-trie/issues/142)
* chore(package): update coveralls to version 3.0.9 ([b71921d](https://github.com/entrecode/shiro-trie/commit/b71921d)), closes [#142](https://github.com/entrecode/shiro-trie/issues/142)
* chore(package): update karma to version 4.0.0 ([6d995b1](https://github.com/entrecode/shiro-trie/commit/6d995b1))
* chore(package): update lockfile package-lock.json ([c418016](https://github.com/entrecode/shiro-trie/commit/c418016))
* chore(package): update lockfile package-lock.json ([8a8d4c4](https://github.com/entrecode/shiro-trie/commit/8a8d4c4))
* chore(package): update lockfile package-lock.json ([f396e88](https://github.com/entrecode/shiro-trie/commit/f396e88))
* chore(package): update package-lock.json ([53f91bf](https://github.com/entrecode/shiro-trie/commit/53f91bf))
* chore(package): Bump http-proxy from 1.17.0 to 1.18.1 ([002effa](https://github.com/entrecode/shiro-trie/commit/002effa))
* test: restored node 8 support ([d71deb7](https://github.com/entrecode/shiro-trie/commit/d71deb7))



## <small>0.4.9 (2019-10-30)</small>

* fix: made sure that permissions like `a:*:c` don't overwrite `a:*` - star at end trumps all ([3dbf518](https://github.com/entrecode/shiro-trie/commit/3dbf518))



## <small>0.4.8 (2018-08-31)</small>

* chore(package): dependency update



## <small>0.4.7 (2018-05-22)</small>

* feat: #132 add return type to constructor definition ([3bf732f](https://github.com/entrecode/shiro-trie/commit/3bf732f)), closes [#132](https://github.com/entrecode/shiro-trie/issues/132)



## <small>0.4.6 (2018-05-05)</small>

* feat: Better support for querying permissions with wildcards, any, and sub-rights: querying for permissions `a:b:*:c` with query `a:?:$:d` resulting in `b` instead of `[]`. ([4778e8e](https://github.com/entrecode/shiro-trie/commit/4778e8e)), closes [#129](https://github.com/entrecode/shiro-trie/issues/129)



## <small>0.4.5 (2018-02-09)</small>

* fix: a permission where an explicit star at the end would not overpower previous more fine-granular ([4086906](https://github.com/entrecode/shiro-trie/commit/4086906))



## <small>0.4.4 (2018-01-30)</small>

* fix: optimized last fix for permission including * and current one ([6ead538](https://github.com/entrecode/shiro-trie/commit/6ead538))



## <small>0.4.3 (2018-01-30)</small>

- fix: querying for permissions `a:*:b` with query `a:c:?` not resulting in `b`, closes [#118](https://github.com/entrecode/shiro-trie/issues/118) [#119](https://github.com/entrecode/shiro-trie/issues/119)



## <small>0.4.2 (2017-12-05)</small>

* fix: a bug where a star permission would be overwritten ([19b47f4](https://github.com/entrecode/shiro-trie/commit/19b47f4))



## <small>0.4.1 (2017-11-29)</small>

* fix: a bug where a permission `a:*:c` would overwrite `a:b:c,d` so that `a:b:d` would return `false` ([bc6876c](https://github.com/entrecode/shiro-trie/commit/bc6876c))



## 0.4.0 (2017-08-31)

* feat: adds typescript typings ([5723b1c](https://github.com/entrecode/shiro-trie/commit/5723b1c))



## <small>0.3.13 (2017-04-11)</small>

* chore(package): dependency update



## <small>0.3.12 (2016-11-21)</small>

* feat: redefined query to include implicit ‘$’ at end ([0d927a0](https://github.com/entrecode/shiro-trie/commit/0d927a0))



## <small>0.3.11 (2016-11-18)</small>

* feat: permission query now supports multiple any ($bling$) ([3d294bd](https://github.com/entrecode/shiro-trie/commit/3d294bd))



## <small>0.3.10 (2016-11-17)</small>

* fix: proper handling of single $ after ? in permission query ([24a07a9](https://github.com/entrecode/shiro-trie/commit/24a07a9))



## <small>0.3.9 (2016-11-15)</small>

* chore(package): dependency update



## <small>0.3.8 (2016-08-23)</small>

* chore(package): dependency update ([c5e6ba6](https://github.com/entrecode/shiro-trie/commit/c5e6ba6))



## <small>0.3.7 (2016-04-25)</small>

* chore(package): dependency update ([b66710e](https://github.com/entrecode/shiro-trie/commit/b66710e))



## <small>0.3.6 (2016-02-17)</small>

* refactor: do not put uniq into Array.prototype, version 0.3.6 ([26e01c3](https://github.com/entrecode/shiro-trie/commit/26e01c3))



## <small>0.3.5 (2016-02-17)</small>

* refactor: removed lodash from module ([37dea69](https://github.com/entrecode/shiro-trie/commit/37dea69))
* test: adds karma tests so we know browsers will work :) ([5dd131f](https://github.com/entrecode/shiro-trie/commit/5dd131f))



## <small>0.3.4 (2016-02-12)</small>

* chore(package): dependency updates


## <small>0.3.3 (2016-02-05)</small>

* chore(package): dependency updates



## <small>0.3.2 (2015-12-10)</small>

* chore(package): dependency updates



## <small>0.3.1 (2015-11-06)</small>

* chore(package): pin dependencies ([4dd92ad](https://github.com/entrecode/shiro-trie/commit/4dd92ad))



## 0.3.0 (2015-09-07)

* feat: added support for , in check() ([8b01fae](https://github.com/entrecode/shiro-trie/commit/8b01fae))



## <small>0.2.1 (2015-09-01)</small>

* test: added browserify to devDependencies ([537d856](https://github.com/entrecode/shiro-trie/commit/537d856))
* test: moved browserify task to build-script ([d3d8be5](https://github.com/entrecode/shiro-trie/commit/d3d8be5))



## 0.2.0 (2015-09-01)

* chore: bower support added ([cd62428](https://github.com/entrecode/shiro-trie/commit/cd62428))



## <small>0.1.1 (2015-08-03)</small>

* chore: updated dependencies ([39ce309](https://github.com/entrecode/shiro-trie/commit/39ce309))



## 0.1.0 (2015-08-03)

* feat: initial release



