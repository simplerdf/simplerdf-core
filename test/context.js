/* global describe, it */

const assert = require('assert')
const Context = require('../lib/context')

describe('Context', () => {
  it('should be a constructor', () => {
    assert.equal(typeof Context, 'function')
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
