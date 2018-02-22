class DefinePropertyHandler {
  constructor (object, core) {
    this.object = object
    this.core = core

    Object.defineProperty(this.object, '@id', {
      configurable: true,
      get: () => {
        return this.object.iri().toString()
      },
      set: (iri) => {
        this.object.iri(iri)
      }
    })

    Object.defineProperty(this.object, '@type', {
      configurable: true,
      get: () => {
        const type = this.core.type()

        return type && type.toString()
      },
      set: (type) => {
        this.core.type(type)
      }
    })
  }

  addProperty (property, predicate, options) {
    options = options || {}

    Object.defineProperty(this.object, property, {
      configurable: true,
      get: () => {
        return this.core.getValues(predicate, options)
      },
      set: (values) => {
        this.core.removeValues(predicate, options)
        this.core.addValues(predicate, options, values)
      }
    })
  }

  hasProperty (property) {
    return Object.getOwnPropertyDescriptor(this.object, property)
  }
}

module.exports = DefinePropertyHandler
