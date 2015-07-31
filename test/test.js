'use strict';
var chai = require('chai');
var expect = chai.expect;
var shiroTrie = require('../');

var trie;

describe('shiro-trie node module', function () {
  describe('basic check of testing library', function() {
    it('assert that JavaScript is still a little crazy', function() {
     expect([] + []).to.equal('');
    });
    it('undefined is not a function', function(done) {
      expect(typeof undefined).to.not.eql('function');
      done();
    });
  });

  describe('building permission trie', function() {
    beforeEach(function(done) {
      trie = shiroTrie.new();
      done();
    });
    it('single permission', function(done) {
      trie.add('a:b:c:d');
      expect(trie.get()).to.eql({a:{b:{c:{d:{'*':{}}}}}});
      done();
    });
    it('two single permissions', function(done) {
      trie.add('a:b:c:d');
      trie.add('a:c:c:d');
      expect(trie.get()).to.eql({a:{b:{c:{d:{'*':{}}}}, c: {c:{d:{'*':{}}}}}});
      done();
    });
    it('two permissions as args', function(done) {
      trie.add('a:b:c:d', 'a:c:c:d');
      expect(trie.get()).to.eql({a:{b:{c:{d:{'*':{}}}}, c: {c:{d:{'*':{}}}}}});
      done();
    });
    it('two permissions as array', function(done) {
      trie.add(['a:b:c:d', 'a:c:c:d']);
      expect(trie.get()).to.eql({a:{b:{c:{d:{'*':{}}}}, c: {c:{d:{'*':{}}}}}});
      done();
    });
    it('comma-separated permissions', function(done) {
      trie.add('a:b,c:d');
      expect(trie.get()).to.eql({
        a:{
          b:{d:{'*':{}}},
          c:{d:{'*':{}}}
        }
      });
      done();
    });
  });

  describe('checking permissions', function() {
    beforeEach(function(done) {
      trie = shiroTrie.new();
      done();
    });
    it('simple permission', function(done) {
      trie.add('a:b:c:d');
      expect(trie.check('a:b:c:d')).to.eql(true);
      expect(trie.check('a:c:c:d')).to.eql(false);
      done();
    });
    it('star permission', function(done) {
      trie.add('a:*');
      expect(trie.check('a:b')).to.eql(true);
      expect(trie.check('a:b:c')).to.eql(true);
      expect(trie.check('b:c')).to.eql(false);
      done();
    });
    it('implicit star permission', function(done) {
      trie.add('a');
      expect(trie.check('a:b')).to.eql(true);
      expect(trie.check('a:b:c')).to.eql(true);
      expect(trie.check('b:c')).to.eql(false);
      done();
    });
    it('comma permission', function(done) {
      trie.add('a:b,c:d');
      expect(trie.check('a:b:d')).to.eql(true);
      expect(trie.check('a:c:d')).to.eql(true);
      done();
    });
  });

});
