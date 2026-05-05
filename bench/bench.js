// Side-by-side benchmark of bench/baseline.js (pre-optimization snapshot of
// index.js, see plan) against the current ../index.js. Run via:
//   node bench/bench.js

const baseline = require('./baseline');
const optimized = require('..');

function buildTrie(factory) {
  const t = factory.newTrie();
  for (let i = 0; i < 1000; i++) {
    t.add('user:' + i + ':read,write,delete');
  }
  t.add('admin:*');
  t.add('product:1,2,3,4,5:view,edit');
  t.add('m:n:*:p:q');
  t.add('a:b,c,d:e,f,g');
  return t;
}

function timeOps(label, fn, iterations) {
  // warmup
  for (let i = 0; i < Math.min(5000, iterations); i++) fn(i);
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) fn(i);
  const ns = Number(process.hrtime.bigint() - start);
  return { label, ns, iterations, opsPerSec: iterations / (ns / 1e9), nsPerOp: ns / iterations };
}

function timeBuild(label, build, iterations) {
  // warmup
  for (let i = 0; i < 3; i++) build();
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) build();
  const ns = Number(process.hrtime.bigint() - start);
  return { label, ns, iterations, msPerBuild: ns / 1e6 / iterations };
}

function approxRetainedBytes(node, seen) {
  if (!node || typeof node !== 'object') return 0;
  if (seen.has(node)) return 0;
  seen.add(node);
  let bytes = 24; // V8 object header rough estimate
  for (const k in node) {
    bytes += 16 + k.length * 2; // property slot + UTF-16 key
    bytes += approxRetainedBytes(node[k], seen);
  }
  return bytes;
}

function measureHeapDelta(factory) {
  // Build many tries to amplify per-trie memory cost above GC noise.
  if (global.gc) global.gc();
  const before = process.memoryUsage().heapUsed;
  const tries = [];
  for (let n = 0; n < 50; n++) tries.push(buildTrie(factory));
  if (global.gc) global.gc();
  const after = process.memoryUsage().heapUsed;
  // Reference tries afterwards so V8 doesn't elide them.
  if (tries.length === 0) console.log('unreachable');
  return (after - before) / tries.length;
}

function pct(opt, base) {
  if (base === 0) return '—';
  const delta = ((opt - base) / base) * 100;
  return (delta >= 0 ? '+' : '') + delta.toFixed(1) + '%';
}

function fmtOps(o) {
  return (o / 1e6).toFixed(2) + ' M ops/s';
}
function fmtNs(n) {
  return n.toFixed(0) + ' ns';
}

function runFor(label, lib) {
  const trie = buildTrie(lib);
  const N = 200000;
  const checkHit = timeOps('check hit', () => trie.check('user:500:read'), N);
  const checkMiss = timeOps('check miss', () => trie.check('user:nope:read'), N);
  const checkWildcard = timeOps('check wildcard hit', () => trie.check('admin:foo:bar:baz'), N);
  const checkComma = timeOps('check comma', () => trie.check('user:500:read,write'), N);
  const checkDeep = timeOps('check deep wildcard', () => trie.check('m:n:x:p:q'), N);

  const PN = 50000;
  const permId = timeOps('permissions user:?', () => trie.permissions('user:?'), PN);
  const permSub = timeOps('permissions user:?:write', () => trie.permissions('user:?:write'), PN);
  const permAny = timeOps('permissions $:$:?', () => trie.permissions('$:$:?'), PN);

  const build = timeBuild('build 1000 perms', () => buildTrie(lib), 50);

  // Memory: walk approximation + heap-delta measurement.
  const memTrie = buildTrie(lib);
  const memBytes = approxRetainedBytes(memTrie.get(), new Set());
  const memHeapBytes = measureHeapDelta(lib);

  return {
    label,
    checkHit,
    checkMiss,
    checkWildcard,
    checkComma,
    checkDeep,
    permId,
    permSub,
    permAny,
    build,
    memBytes,
    memHeapBytes,
  };
}

function diffRow(name, base, opt, kind) {
  if (kind === 'ops') {
    const baseO = base.opsPerSec;
    const optO = opt.opsPerSec;
    return `| ${name} | ${fmtOps(baseO)} (${fmtNs(base.nsPerOp)}/op) | ${fmtOps(optO)} (${fmtNs(opt.nsPerOp)}/op) | ${pct(optO, baseO)} |`;
  }
  if (kind === 'build') {
    return `| ${name} | ${base.msPerBuild.toFixed(3)} ms | ${opt.msPerBuild.toFixed(3)} ms | ${pct(base.msPerBuild, opt.msPerBuild)} |`;
  }
  if (kind === 'mem') {
    return `| ${name} | ${(base / 1024).toFixed(1)} KB | ${(opt / 1024).toFixed(1)} KB | ${pct(base, opt)} |`;
  }
}

console.log('Running baseline …');
const baseR = runFor('baseline', baseline);
console.log('Running optimized …');
const optR = runFor('optimized', optimized);

console.log('');
console.log('| Benchmark | Baseline (develop) | Optimized | Δ |');
console.log('|---|---|---|---|');
console.log(diffRow('check hit', baseR.checkHit, optR.checkHit, 'ops'));
console.log(diffRow('check miss', baseR.checkMiss, optR.checkMiss, 'ops'));
console.log(diffRow('check wildcard hit', baseR.checkWildcard, optR.checkWildcard, 'ops'));
console.log(diffRow('check comma', baseR.checkComma, optR.checkComma, 'ops'));
console.log(diffRow('check deep wildcard', baseR.checkDeep, optR.checkDeep, 'ops'));
console.log(diffRow('permissions user:?', baseR.permId, optR.permId, 'ops'));
console.log(diffRow('permissions user:?:write', baseR.permSub, optR.permSub, 'ops'));
console.log(diffRow('permissions $:$:?', baseR.permAny, optR.permAny, 'ops'));
console.log(diffRow('build 1000 perms', baseR.build, optR.build, 'build'));
console.log(diffRow('retained trie size (walk approx)', baseR.memBytes, optR.memBytes, 'mem'));
console.log(diffRow('retained trie size (heap delta)', baseR.memHeapBytes, optR.memHeapBytes, 'mem'));
