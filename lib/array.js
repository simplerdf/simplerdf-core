const utils = require('./utils')

class SimpleArray {
  constructor (addValue, getValue, removeValue, array) {
    this._addValue = addValue
    this._getValue = getValue
    this._removeValue = removeValue
    this._array = array || []

    Object.defineProperty(this, 'length', {
      configurable: true,
      get: () => {
        return this._array.length
      }
    })
  }

  _valueAdded (value) {
    if (!this._array.some(item => utils.equals(item, value))) {
      this._array.push(value)
    }
  }

  _valueRemoved (value) {
    const index = this._array.reduce((found, item, index) => {
      if (found === -1 && utils.equals(item, value)) {
        return index
      }

      return found
    }, -1)

    if (index !== -1) {
      this._array.splice(index, 1)
    }
  }

  at (index, value) {
    if (value !== undefined) {
      if (this._array[index] !== undefined) {
        this._removeValue(this._array[index])
      }

      this._addValue(this._array[index] = value)
    }

    return this._array[index]
  }

  indexOf (searchElement, fromIndex) {
    return this._array.indexOf(searchElement, fromIndex)
  }

  filter (callback, thisArg) {
    return this._array.filter(callback, thisArg)
  }

  forEach (callback, thisArg) {
    return this._array.forEach(callback, thisArg)
  }

  map (callback, thisArg) {
    return this._array.map(callback, thisArg)
  }

  reduce (callback, initialValue) {
    return this._array.reduce(callback, initialValue)
  }

  reduceRight (callback, initialValue) {
    return this._array.reduceRight(callback, initialValue)
  }

  push (value) {
    let index = this._array.push(value)
    this._addValue(value)
    return index
  }

  pop () {
    let popped = this._array.pop()
    this._removeValue(popped)
    return popped
  }

  splice (index, deleteCount) {
    const args = Array.prototype.slice.call(arguments, 0)

    const toRemove = this._array.splice.apply(this._array, args)

    toRemove.forEach(value => {
      this._removeValue(value)
    })

    // new elements from arguments
    args.slice(2).forEach(value => {
      this._addValue(value)
    })

    return toRemove
  }

  static isArray (obj) {
    return obj instanceof SimpleArray
  }
}

module.exports = SimpleArray
