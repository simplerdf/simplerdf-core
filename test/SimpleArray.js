'use strict'

/* global describe, it */

const assert = require('assert')
const SimpleArray = require('../lib/array')

describe('SimpleArray', () => {
  it('constructor should init all member variables', () => {
    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    assert.equal(array._addValue, addValue)
    assert.equal(array._getValue, getValue)
    assert.equal(array._removeValue, removeValue)
    assert(Array.isArray(array._array))
  })

  it('.length should return the number of elements in the array', () => {
    const addValue = () => {}
    const getValue = () => {}
    const removeValue = () => {}

    const array0 = new SimpleArray(addValue, getValue, removeValue)

    const array3 = new SimpleArray(addValue, getValue, removeValue)

    array3._array = [0, 1, 2]

    assert.equal(array0.length, 0)
    assert.equal(array3.length, 3)
  })

  it('.at should handle read access for the array', () => {
    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array._array = [0, 1, 2]

    assert.equal(array.at(0), 0)
    assert.equal(array.at(1), 1)
    assert.equal(array.at(2), 2)
  })

  it('.at should handle write access for the array', () => {
    let addSequence = [0, 1, 2, 3]
    let removeSequence = [1]

    let addValue = (value) => {
      assert.equal(value, addSequence.shift())
    }
    let getValue = () => {}
    let removeValue = (value) => {
      assert.equal(value, removeSequence.shift())
    }

    let array = new SimpleArray(addValue, getValue, removeValue)

    array.at(0, 0)
    array.at(1, 1)
    array.at(2, 2)
    array.at(1, 3)

    assert.equal(array._array[0], 0)
    assert.equal(array._array[1], 3)
    assert.equal(array._array[2], 2)

    assert.deepEqual(addSequence, [])
    assert.deepEqual(removeSequence, [])
  })

  it('.filter should be supported', () => {
    const valueSequence = [0, 1, 2]

    const addValue = () => {}
    const getValue = () => {}
    const removeValue = () => {}

    const array = new SimpleArray(addValue, getValue, removeValue)

    array._array = [0, 1, 2]

    const result = array.filter(function (item) {
      assert.equal(item, valueSequence.shift())
      assert.equal(this, 'context')

      return item & 1
    }, 'context')

    assert.deepEqual(result, [1])
  })

  it('.forEach should be supported', () => {
    let valueSequence = [0, 1, 2]

    let addValue = () => {}
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array._array = [0, 1, 2]

    array.forEach(function (item) {
      assert.equal(item, valueSequence.shift())
      assert.equal(this, 'context')
    }, 'context')

    assert.deepEqual(valueSequence, [])
  })

  it('.push should be supported', () => {
    let addSequence = [0, 1, 2]

    let addValue = (value) => {
      assert.equal(value, addSequence.shift())
    }
    let getValue = () => {}
    let removeValue = () => {}

    let array = new SimpleArray(addValue, getValue, removeValue)

    array.push(0)
    array.push(1)
    array.push(2)

    assert.deepEqual(array._array, [0, 1, 2])
    assert.deepEqual(addSequence, [])
  })
})
