var shiroTrie = require('../');

var trie;

describe('shiro-trie node module', function () {
  describe('basic check of testing library', function () {
    it('assert that JavaScript is still a little crazy', function () {
      expect([] + []).toBe('');
    });
    it('undefined is not a function', function () {
      expect(typeof undefined).not.toEqual('function');
    });
  });

  describe('building permission trie', function () {
    beforeEach(function () {
      trie = shiroTrie.newTrie();
    });
    it('single permission', function () {
      trie.add('a:b:c:d');
      expect(trie.get()).toEqual({ a: { b: { c: { d: { '*': {} } } } } });
    });
    it('two single permissions', function () {
      trie.add('a:b:c:d');
      trie.add('a:c:c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } }
        }
      });
    });
    it('two permissions as args', function () {
      trie.add('a:b:c:d', 'a:c:c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } }
        }
      });
    });
    it('two permissions as array', function () {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      expect(trie.get()).toEqual({
        a: {
          b: { c: { d: { '*': {} } } },
          c: { c: { d: { '*': {} } } }
        }
      });
    });
    it('non-strings get ignored', function () {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      var trie1 = shiroTrie.newTrie().add(['a:b:c:d', 4, 'a:c:c:d']);
      expect(trie.get()).toEqual(trie1.get());
    });
    it('comma-separated permissions', function () {
      trie.add('a:b,c:d');
      expect(trie.get()).toEqual({
        a: {
          b: { d: { '*': {} } },
          c: { d: { '*': {} } }
        }
      });
    });
    it('multiple comma-separated permissions', function () {
      trie.add('a:b,c,d:e,f,g');
      expect(trie.get()).toEqual({
        a: {
          b: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} }
          },
          c: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} }
          },
          d: {
            e: { '*': {} },
            f: { '*': {} },
            g: { '*': {} }
          }
        }
      });
    });
    it('reset works', function () {
      expect(trie.add('a:b:c').reset().get()).toEqual({});
    });
  });

  describe('checking permissions', function () {
    beforeEach(function () {
      trie = shiroTrie.newTrie();
    });
    it('simple permission', function () {
      trie.add('a:b:c:d');
      expect(trie.check('a:b:c:d')).toEqual(true);
      expect(trie.check('a:c:c:d')).toEqual(false);
      expect(trie.check(1)).toBe(false);
    });
    it('star permission', function () {
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
    it('implicit star permission', function () {
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
    it('comma permission', function () {
      trie.add('a:b,c:d');
      expect(trie.check('a:b:d')).toEqual(true);
      expect(trie.check('a:c:d')).toEqual(true);
    });
  });

  describe('chaining works', function () {
    it('simple add.check', function () {
      expect(shiroTrie.newTrie().add('a:b:c').check('a:b:c:d')).toEqual(true);
    });
  });

  describe('more complex wildcard permissions', function () {

    it('test0', function () {
      expect(shiroTrie.newTrie().add('*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test1', function () {
      expect(shiroTrie.newTrie().add('*').check('l1')).toBe(true);
    });
    it('test2', function () {
      expect(shiroTrie.newTrie().add('*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test3', function () {
      expect(shiroTrie.newTrie().add('*:*').check('l1:l2')).toBe(true);
    });
    it('test4', function () {
      expect(shiroTrie.newTrie().add('*:*').check('l1')).toBe(true);
    });
    it('test5', function () {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test6', function () {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2:l3')).toBe(true);
    });
    it('test7', function () {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1:l2')).toBe(true);
    });
    it('test8', function () {
      expect(shiroTrie.newTrie().add('*:*:*').check('l1')).toBe(true);
    });
    it('test9', function () {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit')).toBe(true);
    });
    it('test10', function () {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit:*')).toBe(true);
    });
    it('test11', function () {
      expect(shiroTrie.newTrie().add('newsletter:*:*').check('newsletter:edit:12')).toBe(true);
    });
    it('test12', function () {
      var trie = shiroTrie.newTrie().add('a:b:*:x,y').add('a:b,c,*');
      expect(trie.check('a:b:d:x')).toBe(true);
      expect(trie.check('a:b:d:z')).toBe(true);
    });
    it('test13', function () {
      var trie = shiroTrie.newTrie().add('a:b:*:x,y').add('a:b,c');
      expect(trie.check('a:b:d:x')).toBe(true);
      expect(trie.check('a:b:d:z')).toBe(true);
    });
    it('test14', function () {
      var trie = shiroTrie.newTrie().add('a:b:*:*:c');
      expect(trie.check('a:b:c')).toBe(false);
      expect(trie.check('a:b:c:d')).toBe(false);
      expect(trie.check('a:b:c:d:c')).toBe(true);
      expect(trie.check('a:b:c:d:d')).toBe(false);
      expect(trie.check('a:b:c:d:c:d')).toBe(true);
    });
  });

  describe('fine grained permissions', function () {
    it('test1', function () {
      expect(shiroTrie.newTrie().add('l1:l2:*').check('l1:l2:l3')).toBe(true);
    });
    it('test2', function () {
      expect(shiroTrie.newTrie().add('l1:l2:*').check('l1:l2')).toBe(true);
    });
    it('test3', function () {
      expect(shiroTrie.newTrie().add('l1:l2:*:*:*').check('l1:l2:l3:l4:l5')).toBe(true);
    });
    it('test4', function () {
      expect(shiroTrie.newTrie().add('l1').check('l1:l2:l3')).toBe(true);
    });
    it('test5', function () {
      expect(shiroTrie.newTrie().add('l1:l2').check('l1:l2:l3')).toBe(true);
    });
    it('test6', function () {
      expect(shiroTrie.newTrie().add('l1:l2').check('l1')).toBe(false);
    });
    it('test7', function () {
      expect(shiroTrie.newTrie().add('l1:a,b,c:l3').check('l1:a:l3')).toBe(true);
    });
    it('test8', function () {
      expect(shiroTrie.newTrie().add('l1:a,b,c:d,e,f').check('l1:a:l3')).toBe(false);
    });
    it('test9', function () {
      expect(shiroTrie.newTrie().add('l1:a,b,c:d,e,f').check('l1:a:f')).toBe(true);
    });
    it('test10', function () {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test11', function () {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2:error')).toBe(false);
    });
    it('test12', function () {
      expect(shiroTrie.newTrie().add('l1:*:l3').check('l1:l2')).toBe(false);
    });
    it('test13', function () {
      expect(shiroTrie.newTrie().add('*:l2').check('l1:l2')).toBe(true);
    });
    it('test14', function () {
      expect(shiroTrie.newTrie().add('*:l2').check('l1:error')).toBe(false);
    });
    it('test15', function () {
      expect(shiroTrie.newTrie().add('*:l2:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test16', function () {
      expect(shiroTrie.newTrie().add('*:l2:l3').check('l1:l2:l3:l4')).toBe(true);
    });
    it('test17', function () {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:l3')).toBe(true);
    });
    it('test18', function () {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:l3:l4')).toBe(true);
    });
    it('test19', function () {
      expect(shiroTrie.newTrie().add('*:*:l3').check('l1:l2:error:l4')).toBe(false);
    });
    it('test20', function () {
      expect(shiroTrie.newTrie().add('newsletter:view,create,edit,delete').check('newsletter:view,create,any,edit,delete')).toBe(false);
    });
    it('test21', function () {
      expect(shiroTrie.newTrie().add('acc:perm:*').check('acc:perm:x:y:z,1,2')).toBe(true);
    });
    it('test22', function () {
      expect(shiroTrie.newTrie().add('acc:perm:x:y:z').check('acc:perm:x:y:z,1,2')).toBe(false);
    });
    it('test23', function () {
      expect(shiroTrie.newTrie().add('acc:perm').check('acc:perm:x,a:y:z,1,2')).toBe(true);
    });
    it('test24', function () {
      expect(shiroTrie.newTrie().add('acc:perm').check('acc:perm:x,a:*:z,1,2')).toBe(true);
    });
    it('test25', function () {
      expect(shiroTrie.newTrie().add('acc:perm:x:y:z').check('acc:perm:x:*:z')).toBe(false);
    });
    it('test26 (no overwrite when adding comma after star)', function () {
      expect(shiroTrie.newTrie()
      .add('a:b:c:d,e')
      .add('a:b:*:d')
      .check('a:b:c:e')).toBe(true);
    });
    it('test27 (no overwrite when adding something after star)', function () {
      expect(shiroTrie.newTrie()
      .add('a:b')
      .add('a:b:c:d')
      .check('a:b:c:e')).toBe(true);
    });
    it('test28 (star at end trumps all, more mighty permission first)', function() {
      var trie = shiroTrie
        .newTrie()
        .add('a:b')
        .add('a:b:*:d');
      expect(trie.check('a:b:c:e')).toBe(true);
    });
    it('test29 (star at end trumps all, more mighty permission last)', function() {
      expect(
        shiroTrie
          .newTrie()
          .add(['a:b:*:d', 'a:b'])
          .check('a:b:c:e')
      ).toBe(true);
    });
    it('test30 (multiple *:x permissions dont give *:*)', function() {
      expect(
        shiroTrie
          .newTrie()
          .add(['a:b:*:d', 'a:b:*:e'])
          .check('a:b:c:f')
      ).toBe(false);
    });
    it('test31 (order of permissions is irrelevant)', function () {
      var trie1 = shiroTrie.newTrie().add(['a:*', '*:*:d']);
      var trie2 = shiroTrie.newTrie().add(['*:*:d', 'a:*']);
      expect(trie1.get()).toEqual(trie2.get());
      expect(trie1.check('a:b:c')).toBe(true);
      expect(trie1.check('b:c:d')).toBe(true);
      expect(trie1.check('b:c:c')).toBe(false);
    });
  });

  describe('get Permissions', function () {
    var trie;
    beforeAll(function () {
      trie = shiroTrie.newTrie();
      trie.add('d:1,2,3:read,write', 'd:4:read', 'x', 'a:1:b:3,4', 'a:2:b:5,6');
      trie.add('z:1,2:y:*', 'z:2,3,4:y:x', 'z:3,4,5:w:v');
      trie.add('k:*:l,n', 'k:l:m');
      trie.add('m:n:*:p:q');
    });
    it('simple id lookup', function () {
      expect(trie.permissions('d:?')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup with explicit any', function () {
      expect(trie.permissions('d:?:$')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup with specific sub-right', function () {
      expect(trie.permissions('d:?:write')).toEqual(['1', '2', '3']);
    });
    it('simple id lookup with specific sub-right', function () {
      expect(trie.permissions('a:?:b')).toEqual(['1', '2']);
    });
    it('simple id lookup with specific sub-right and any at end', function () {
      expect(trie.permissions('a:?:b:$')).toEqual(['1', '2']);
    });
    it('simple id lookup with specific sub-right and any at end #2', function () {
      expect(trie.permissions('z:?:y:$')).toEqual(['1', '2', '3', '4']);
    });
    it('simple id lookup multiple any at end', function () {
      expect(trie.permissions('z:?:$:$')).toEqual(['1', '2', '3', '4', '5']);
    });
    it('simple id lookup many any at end', function () {
      expect(trie.permissions('z:?:$:$:$:$:$')).toEqual(['1', '2', '3', '4', '5']);
    });
    it('explicit lookup at end', function () {
      expect(trie.permissions('d:2:?')).toEqual(['read', 'write']);
      expect(trie.permissions('d:4:?')).toEqual(['read']);
    });
    it('wildcard lookup at end', function () {
      expect(trie.permissions('x:?')).toEqual(['*']);
    });
    it('any flag in middle', function () {
      expect(trie.permissions('a:$:b:?')).toEqual(['3', '4', '5', '6']);
    });
    it('multiple any flags', function () {
      expect(trie.permissions('$:$:?')).toEqual(['read', 'write', 'b', 'y', 'w', 'l', 'n', 'm']);
    });
    it('wildcard', function () {
      expect(trie.permissions('x:$:b:?')).toEqual(['*']);
    });
    it('no string given', function () {
      expect(trie.permissions()).toEqual([]);
    });
    it('illegal string given', function () {
      expect(trie.permissions(':')).toEqual([]);
    });
    it('no tree', function () {
      expect(shiroTrie.newTrie().permissions('a:b')).toEqual([]);
    });
    it('wildcard in the middle and lookup right after it', function () {
      expect(trie.permissions('k:l:?')).toEqual(['m', 'l', 'n']);
    });
    it('ignored wildcard with lookup after it', function () {
      expect(trie.permissions('k:$:?')).toEqual(['l', 'n', 'm']);
    });
    it('simple id lookup with any and explicit sub-right at end', function () {
      expect(trie.permissions('m:?:$:p')).toEqual(['n']);
    });
    it('simple id lookup with any and multiple explicit sub-right at end', function () {
      expect(trie.permissions('m:?:$:p:q')).toEqual(['n']);
    });
    it('simple id lookup with any and wrong explicit sub-right at end', function () {
      expect(trie.permissions('m:?:$:q')).toEqual([]);
    });
    it('simple id lookup with any and wrong explicit sub-right at end #2', function () {
      expect(trie.permissions('m:?:$:p:z')).toEqual([]);
    });
  });

  describe('expand function', function () {
    it('test1', function () {
      expect(shiroTrie._expand('x:a,b')).toEqual(['x:a', 'x:b']);
    });
    it('test2', function () {
      expect(shiroTrie._expand('x,y:a,b')).toEqual(['x:a', 'y:a', 'x:b', 'y:b']);
    });
    it('test3', function () {
      expect(shiroTrie._expand('x:a,b,c')).toEqual(['x:a', 'x:b', 'x:c']);
    });
    it('test4', function () {
      expect(shiroTrie._expand('x:a,b,c:d')).toEqual(['x:a:d', 'x:b:d', 'x:c:d']);
    });
    it('test5', function () {
      expect(shiroTrie._expand('x,y:a,b,c:1,2')).toEqual(['x:a:1', 'y:a:1', 'x:b:1', 'y:b:1', 'x:c:1', 'y:c:1', 'x:a:2', 'y:a:2', 'x:b:2', 'y:b:2', 'x:c:2', 'y:c:2']);
    });
    it('test6', function () {
      expect(shiroTrie._expand('x,y:a')).toEqual(['x:a', 'y:a']);
    });
    it('test7', function () {
      expect(shiroTrie._expand('x:y')).toEqual(['x:y']);
    });
  });

});
