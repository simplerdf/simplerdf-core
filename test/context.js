/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const Context = require('../lib/context')

describe('Context', () => {
  it('should be a constructor', () => {
    assert.equal(typeof Context, 'function')
  })

  describe('description', () => {
    const examplePropertyIri = 'http://example.org/property'

    it('should be a method', () => {
      const context = new Context({})

      assert.equal(typeof context.description, 'function')
    })

    it('should return null if a unknown property is given', () => {
      const context = new Context({})

      assert.equal(context.description('test'), null)
    })

    it('should return an object if a known property is given', () => {
      const context = new Context({
        property: examplePropertyIri
      })

      const description = context.description('property')

      assert.equal(description && typeof description, 'object')
    })

    it('should return a description with a property string from the key', () => {
      const context = new Context({
        property: examplePropertyIri
      })

      const description = context.description('property')

      assert.equal(description.property, 'property')
    })

    it('should return a description with a predicate Named Node from a string definition', () => {
      const context = new Context({
        property: examplePropertyIri
      })

      const description = context.description('property')

      assert(description.predicate)
      assert.equal(description.predicate.termType, 'NamedNode')
      assert.equal(description.predicate.value, examplePropertyIri)
    })

    it('should return a description with a predicate Named Node from a object definition', () => {
      const context = new Context({
        property: {
          '@id': examplePropertyIri
        }
      })

      const description = context.description('property')

      assert(description.predicate)
      assert.equal(description.predicate.termType, 'NamedNode')
      assert.equal(description.predicate.value, examplePropertyIri)
    })

    it('should return a description with a options object', () => {
      const context = new Context({
        property: examplePropertyIri
      })

      const description = context.description('property')

      assert.equal(description.options && typeof description.options, 'object')
    })

    it('should return a description with options.array true for @container: @set', () => {
      const context = new Context({
        property: {
          '@id': examplePropertyIri,
          '@container': '@set'
        }
      })

      const description = context.description('property')

      assert(description.options.array)
    })

    it('should return a description with options.namedNode true for @type: @id', () => {
      const context = new Context({
        property: {
          '@id': examplePropertyIri,
          '@type': '@id'
        }
      })

      const description = context.description('property')

      assert(description.options.namedNode)
    })

    it('should return a description with options.reverse true for @reverse property definitions', () => {
      const context = new Context({
        property: {
          '@reverse': examplePropertyIri
        }
      })

      const description = context.description('property')

      assert(description.options.reverse)
    })
  })

  describe('descriptions', () => {
    const examplePropertyIriA = 'http://example.org/propertyA'
    const examplePropertyIriB = 'http://example.org/propertyB'

    it('should be a method', () => {
      const context = new Context({})

      assert.equal(typeof context.descriptions, 'function')
    })

    it('should return an array', () => {
      const context = new Context({})

      assert(Array.isArray(context.descriptions()))
    })

    it('should return an array of all properties defined in the context', () => {
      const context = new Context({
        propertyA: examplePropertyIriA,
        propertyB: {
          '@id': examplePropertyIriB,
          '@container': '@set'
        }
      })

      const descriptions = context.descriptions().sort((a, b) => {
        return a.property.localeCompare(b.property)
      })

      const expected = [{
        property: 'propertyA',
        predicate: rdf.namedNode('http://example.org/propertyA'),
        options: {
          array: false,
          namedNode: false,
          reverse: false
        }
      }, {
        property: 'propertyB',
        predicate: rdf.namedNode('http://example.org/propertyB'),
        options: {
          array: true,
          namedNode: false,
          reverse: false
        }
      }]

      assert.deepEqual(descriptions, expected)
    })
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

  describe('properties', () => {
    const examplePropertyIriA = 'http://example.org/propertyA'
    const examplePropertyIriB = 'http://example.org/propertyB'

    it('should be a method', () => {
      const context = new Context({})

      assert.equal(typeof context.properties, 'function')
    })

    it('should return an array', () => {
      const context = new Context({
        propertyA: examplePropertyIriA,
        propertyB: examplePropertyIriB
      })

      const properties = context.properties()

      assert(Array.isArray(properties))
    })

    it('should return an array of all properties', () => {
      const context = new Context({
        propertyA: examplePropertyIriA,
        propertyB: examplePropertyIriB
      })

      const properties = context.properties().sort((a, b) => {
        return a.localeCompare(b)
      })

      const expected = ['propertyA', 'propertyB']

      assert.deepEqual(properties, expected)
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
      assert.equal(typeof context.descriptions, 'function')
    })

    it('should return the input if it\'s already a context object', () => {
      const json = {
        property: 'http://example.org/property'
      }

      const input = new Context(json)

      const context = Context.create(input)

      assert.equal(context, input)
    })
  })
})
