const shiroTrie = require('../');

let trie;

describe('shiro-trie node module', () => {
  describe('building permission trie', () => {
    beforeEach(() => {
      trie = shiroTrie.newTrie();
    });
    it('single permission', () => {
      trie.add('a:b:c:d');
      expect(trie.get()).toEqual({ a: { b: { c: { d: { '*': {} } } } } });
    });
    it('two single permissions', () => {
      trie.add('a:b:c:d');
      trie.add('a:c:c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } },
        },
      });
    });
    it('two permissions as args', () => {
      trie.add('a:b:c:d', 'a:c:c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } },
        },
      });
    });
    it('two permissions as array', () => {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } },
        },
      });
    });
    it('non-strings get ignored', () => {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      const trie1 = shiroTrie.newTrie().add(['a:b:c:d', 4, 'a:c:c:d']);
      expect(trie.get()).toEqual(trie1.get());
    });
    it('comma-separated permissions', () => {
      trie.add('a:b,c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { d: { '*': {} } },
          c: { d: { '*': {} } },
        },
      });
    });
    it('multiple comma-separated permissions', () => {
      trie.add('a:b,c,d:e,f,g');
      expect(trie.get()).toEqual({
        a: {
          b: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} },
          },
          c: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} },
          },
          d: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} },
          },
        },
      });
    });
    it('reset works', () => {
      expect(trie.add('a:b:c').reset().get()).toEqual({});
    });
    it('non-string/non-array single arg is ignored', () => {
      trie.add(42);
      trie.add({ foo: 'bar' });
      expect(trie.get()).toEqual({});
    });
    it('mixed string and array args', () => {
      trie.add('a:b', ['c:d', 'e:f'], 'g:h');
      expect(trie.get()).toEqual({
        a: { b: { '*': {} } },
        c: { d: { '*': {} } },
        e: { f: { '*': {} } },
        g: { h: { '*': {} } },
      });
    });
    it('non-string entries inside an array arg are ignored', () => {
      trie.add('a:b', [null, 'c:d', 7]);
      expect(trie.get()).toEqual({
        a: { b: { '*': {} } },
        c: { d: { '*': {} } },
      });
    });
  });

  describe('checking permissions', () => {
    beforeEach(() => {
      trie = shiroTrie.newTrie();
    });
    it('simple permission', () => {
      trie.add('a:b:c:d');
      expect(trie.check('a:b:c:d')).toEqual(true);
      expect(trie.check('a:c:c:d')).toEqual(false);
      expect(trie.check(1)).toBe(false);
    });
    it('star permission', () => {
      trie.add('a:*');
      expect(trie.check('a:b')).toEqual(true);
      expect(trie.check('a:b:c')).toEqual(true);
      expect(trie.check('b:c')).toEqual(false);
      expect(trie.check('*')).toEqual(false);
      expect(trie.check('b:*')).toEqual(false);
      expect(trie.check('a:*')).toEqual(true);
      expect(trie.check('a:b:*')).toEqual(true);
      expect(trie.check('a:*:c')).toEqual(true);
    });
    it('implicit star permission', () => {
      trie.add('a');
      expect(trie.check('a:b')).toEqual(true);
      expect(trie.check('a:b:c')).toEqual(true);
      expect(trie.check('b:c')).toEqual(false);
      expect(trie.check('*')).toEqual(false);
      expect(trie.check('b:*')).toEqual(false);
      expect(trie.check('a:*')).toEqual(true);
      expect(trie.check('a:b:*')).toEqual(true);
      expect(trie.check('a:*:c')).toEqual(true);
    });
    it('comma permission', () => {
      trie.add('a:b,c:d');
      expect(trie.check('a:b:d')).toEqual(true);
      expect(trie.check('a:c:d')).toEqual(true);
    });
  });

  describe('chaining works', () => {
    it('simple add.check', () => {
      expect(shiroTrie.newTrie().add('a:b:c').check('a:b:c:d')).toEqual(true);
    });
  });

  describe('more complex wildcard permissions', () => {
    it('test0', () => {
      expect(shiroTrie.newTrie().add('*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test1', () => {
      expect(shiroTrie.newTrie().add('*').check('l1')).toBe(true);
    });
    it('test2', () => {
      expect(shiroTrie.newTrie().add('*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test3', () => {
      expect(shiroTrie.newTrie().add('*:*').check('l1:l2')).toBe(true);
    });
    it('test4', () => {
      expect(shiroTrie.newTrie().add('*:*').check('l1')).toBe(true);
    });
    it('test5', () => {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test6', () => {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2:l3')).toBe(true);
    });
    it('test7', () => {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2')).toBe(true);
    });
    it('test8', () => {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1')).toBe(true);
    });
    it('test9', () => {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit')).toBe(true);
    });
    it('test10', () => {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit:*')).toBe(true);
    });
    it('test11', () => {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit:12')).toBe(true);
    });
    it('test12', () => {
      const trie = shiroTrie.newTrie().add('a:b:*:x,y').add('a:b,c,*');
      expect(trie.check('a:b:d:x')).toBe(true);
      expect(trie.check('a:b:d:z')).toBe(true);
    });
    it('test13', () => {
      const trie = shiroTrie.newTrie().add('a:b:*:x,y').add('a:b,c');
      expect(trie.check('a:b:d:x')).toBe(true);
      expect(trie.check('a:b:d:z')).toBe(true);
    });
    it('test14', () => {
      const trie = shiroTrie.newTrie().add('a:b:*:*:c');
      expect(trie.check('a:b:c')).toBe(false);
      expect(trie.check('a:b:c:d')).toBe(false);
      expect(trie.check('a:b:c:d:c')).toBe(true);
      expect(trie.check('a:b:c:d:d')).toBe(false);
      expect(trie.check('a:b:c:d:c:d')).toBe(true);
    });
  });

  describe('fine grained permissions', () => {
    it('test1', () => {
      expect(shiroTrie.newTrie().add('l1:l2:*').check('l1:l2:l3')).toBe(true);
    });
    it('test2', () => {
      expect(shiroTrie.newTrie().add('l1:l2:*').check('l1:l2')).toBe(true);
    });
    it('test3', () => {
      expect(shiroTrie.newTrie().add('l1:l2:*:*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test4', () => {
      expect(shiroTrie.newTrie().add('l1').check('l1:l2:l3')).toBe(true);
    });
    it('test5', () => {
      expect(shiroTrie.newTrie().add('l1:l2').check('l1:l2:l3')).toBe(true);
    });
    it('test6', () => {
      expect(shiroTrie.newTrie().add('l1:l2').check('l1')).toBe(false);
    });
    it('test7', () => {
      expect(shiroTrie.newTrie().add('l1:a,b,c:l3').check('l1:a:l3')).toBe(true);
    });
    it('test8', () => {
      expect(shiroTrie.newTrie().add('l1:a,b,c:d,e,f').check('l1:a:l3')).toBe(false);
    });
    it('test9', () => {
      expect(shiroTrie.newTrie().add('l1:a,b,c:d,e,f').check('l1:a:f')).toBe(true);
    });
    it('test10', () => {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test11', () => {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2:error')).toBe(false);
    });
    it('test12', () => {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2')).toBe(false);
    });
    it('test13', () => {
      expect(shiroTrie.newTrie().add('*:l2').check('l1:l2')).toBe(true);
    });
    it('test14', () => {
      expect(shiroTrie.newTrie().add('*:l2').check('l1:error')).toBe(false);
    });
    it('test15', () => {
      expect(shiroTrie.newTrie().add('*:l2:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test16', () => {
      expect(shiroTrie.newTrie().add('*:l2:l3').check('l1:l2:l3:l4')).toBe(true);
    });
    it('test17', () => {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test18', () => {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:l3:l4')).toBe(true);
    });
    it('test19', () => {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:error:l4')).toBe(false);
    });
    it('test20', () => {
      expect(
        shiroTrie.newTrie().add('newsletter:view,create,edit,delete').check('newsletter:view,create,any,edit,delete'),
      ).toBe(false);
    });
    it('test21', () => {
      expect(shiroTrie.newTrie().add('acc:perm:*').check('acc:perm:x:y:z,1,2')).toBe(true);
    });
    it('test22', () => {
      expect(shiroTrie.newTrie().add('acc:perm:x:y:z').check('acc:perm:x:y:z,1,2')).toBe(false);
    });
    it('test23', () => {
      expect(shiroTrie.newTrie().add('acc:perm').check('acc:perm:x,a:y:z,1,2')).toBe(true);
    });
    it('test24', () => {
      expect(shiroTrie.newTrie().add('acc:perm').check('acc:perm:x,a:*:z,1,2')).toBe(true);
    });
    it('test25', () => {
      expect(shiroTrie.newTrie().add('acc:perm:x:y:z').check('acc:perm:x:*:z')).toBe(false);
    });
    it('test26 (no overwrite when adding comma after star)', () => {
      expect(shiroTrie.newTrie().add('a:b:c:d,e').add('a:b:*:d').check('a:b:c:e')).toBe(true);
    });
    it('test27 (no overwrite when adding something after star)', () => {
      expect(shiroTrie.newTrie().add('a:b').add('a:b:c:d').check('a:b:c:e')).toBe(true);
    });
    it('test28 (star at end trumps all, more mighty permission first)', () => {
      const trie = shiroTrie.newTrie().add('a:b').add('a:b:*:d');
      expect(trie.check('a:b:c:e')).toBe(true);
    });
    it('test29 (star at end trumps all, more mighty permission last)', () => {
      expect(shiroTrie.newTrie().add(['a:b:*:d', 'a:b']).check('a:b:c:e')).toBe(true);
    });
    it('test30 (multiple *:x permissions dont give *:*)', () => {
      expect(shiroTrie.newTrie().add(['a:b:*:d', 'a:b:*:e']).check('a:b:c:f')).toBe(false);
    });
    it('test31 (order of permissions is irrelevant)', () => {
      const trie1 = shiroTrie.newTrie().add(['a:*', '*:*:d']);
      const trie2 = shiroTrie.newTrie().add(['*:*:d', 'a:*']);
      expect(trie1.get()).toEqual(trie2.get());
      expect(trie1.check('a:b:c')).toBe(true);
      expect(trie1.check('b:c:d')).toBe(true);
      expect(trie1.check('b:c:c')).toBe(false);
    });
  });

  describe('get Permissions', () => {
    let trie;
    beforeAll(() => {
      trie = shiroTrie.newTrie();
      trie.add('d:1,2,3:read,write', 'd:4:read', 'x', 'a:1:b:3,4', 'a:2:b:5,6');
      trie.add('z:1,2:y:*', 'z:2,3,4:y:x', 'z:3,4,5:w:v');
      trie.add('k:*:l,n', 'k:l:m');
      trie.add('m:n:*:p:q');
    });
    it('simple id lookup', () => {
      expect(trie.permissions('d:?')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup with explicit any', () => {
      expect(trie.permissions('d:?:$')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup with specific sub-right', () => {
      expect(trie.permissions('d:?:write')).toEqual(['1', '2', '3']);
    });
    it('simple id lookup with specific sub-right', () => {
      expect(trie.permissions('a:?:b')).toEqual(['1', '2']);
    });
    it('simple id lookup with specific sub-right and any at end', () => {
      expect(trie.permissions('a:?:b:$')).toEqual(['1', '2']);
    });
    it('simple id lookup with specific sub-right and any at end #2', () => {
      expect(trie.permissions('z:?:y:$')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup multiple any at end', () => {
      expect(trie.permissions('z:?:$:$')).toEqual(['1', '2', '3', '4', '5']);
    });
    it('simple id lookup many any at end', () => {
      expect(trie.permissions('z:?:$:$:$:$:$')).toEqual(['1', '2', '3', '4', '5']);
    });
    it('explicit lookup at end', () => {
      expect(trie.permissions('d:2:?')).toEqual(['read', 'write']);
      expect(trie.permissions('d:4:?')).toEqual(['read']);
    });
    it('wildcard lookup at end', () => {
      expect(trie.permissions('x:?')).toEqual(['*']);
    });
    it('any flag in middle', () => {
      expect(trie.permissions('a:$:b:?')).toEqual(['3', '4', '5', '6']);
    });
    it('multiple any flags', () => {
      expect(trie.permissions('$:$:?')).toEqual(['read', 'write', 'b', 'y', 'w', 'l', 'n', 'm']);
    });
    it('wildcard', () => {
      expect(trie.permissions('x:$:b:?')).toEqual(['*']);
    });
    it('no string given', () => {
      expect(trie.permissions()).toEqual([]);
    });
    it('illegal string given', () => {
      expect(trie.permissions(':')).toEqual([]);
    });
    it('no tree', () => {
      expect(shiroTrie.newTrie().permissions('a:b')).toEqual([]);
    });
    it('wildcard in the middle and lookup right after it', () => {
      expect(trie.permissions('k:l:?')).toEqual(['m', 'l', 'n']);
    });
    it('ignored wildcard with lookup after it', () => {
      expect(trie.permissions('k:$:?')).toEqual(['l', 'n', 'm']);
    });
    it('simple id lookup with any and explicit sub-right at end', () => {
      expect(trie.permissions('m:?:$:p')).toEqual(['n']);
    });
    it('simple id lookup with any and multiple explicit sub-right at end', () => {
      expect(trie.permissions('m:?:$:p:q')).toEqual(['n']);
    });
    it('simple id lookup with any and wrong explicit sub-right at end', () => {
      expect(trie.permissions('m:?:$:q')).toEqual([]);
    });
    it('simple id lookup with any and wrong explicit sub-right at end #2', () => {
      expect(trie.permissions('m:?:$:p:z')).toEqual([]);
    });
    it('lookup without ? past a known leaf returns empty', () => {
      const t = shiroTrie.newTrie().add('foo');
      expect(t.permissions('foo')).toEqual([]);
    });
    it('star-only branch is followed when literal is missing', () => {
      const t = shiroTrie.newTrie().add('*:read');
      expect(t.permissions('anything:?')).toEqual(['read']);
    });
    it('?:$ at end resolves keys whose subtree has a wildcard', () => {
      const t = shiroTrie.newTrie().add('a:b:*');
      expect(t.permissions('a:?:$')).toEqual(['b']);
    });
  });
});
