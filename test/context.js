/* global describe, it */

const assert = require('assert')
const Context = require('../lib/context')

describe('Context', () => {
  it('should be a constructor', () => {
    assert.equal(typeof Context, 'function')
  })

  describe('.expand', () => {
    it('should be a method', () => {
      const context = new Context({})

      assert.equal(typeof context.expand, 'function')
    })

    it('should not touch values which contain a colon', () => {
      const context = new Context({})
      const value = '_:b0'

      assert.equal(context.expand(value), value)
    })

    it('should expand a value which is defined in the context', () => {
      const context = new Context({
        property: 'http://example.org/p'
      })

      assert.equal(context.expand('property'), 'http://example.org/p')
    })

    it('should not touch values not define in the context', () => {
      const context = new Context({
        property0: 'http://example.org/p'
      })

      assert.equal(context.expand('property1'), 'property1')
    })
  })

  describe('.create', () => {
    it('should be a static method', () => {
      assert.equal(typeof Context.create, 'function')
    })

    it('should create a new context if a JSON object is given', () => {
      const json = {
        property: 'http://example.org/property'
      }

      const context = Context.create(json)

      assert.equal(typeof context, 'object')
      assert.equal(context._json, json)
    })

    it('should return the input if it\'s already a context object', () => {
      const json = {
        property: 'http://example.org/property'
      }

      const input = new Context(json)

      const context = Context.create(input)

      assert.equal(typeof context, 'object')
      assert.equal(context._json, json)
    })
  })
})
