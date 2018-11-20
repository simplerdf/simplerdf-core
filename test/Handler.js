/* global describe, it */

const assert = require('assert')
const Handler = require('../lib/Handler')

describe('Handler', () => {
  describe('constructor', () => {
    it('should assign the simple object', () => {
      const simple = {}
      const handler = new Handler(simple)

      assert.strictEqual(handler.simple, simple)
    })
  })
})
