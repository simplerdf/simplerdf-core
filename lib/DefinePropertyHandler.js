const Handler = require('./Handler')

class DefinePropertyHandler extends Handler {
  constructor (simple) {
    super(simple)

    this.object = this.simple
  }

  addProperty (description) {
    Object.defineProperty(this.object, description.property, {
      configurable: true,
      get: () => {
        return this.getValue(description)
      },
      set: (value) => {
        this.removeValue(description)

        if (typeof value !== 'undefined' && value !== null) {
          this.addValue(description, value)
        }
      }
    })
  }
}

module.exports = DefinePropertyHandler
