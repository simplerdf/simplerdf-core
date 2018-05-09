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

  addProperty (description) {
    Object.defineProperty(this.object, description.property, {
      configurable: true,
      get: () => {
        return this.core.getValue(description)
      },
      set: (value) => {
        this.core.removeValue(description)

        if (typeof value !== 'undefined' && value !== null) {
          this.core.addValue(description, value)
        }
      }
    })
  }

  hasProperty (property) {
    return Object.getOwnPropertyDescriptor(this.object, property)
  }
}

module.exports = DefinePropertyHandler
