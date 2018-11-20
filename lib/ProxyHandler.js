const Handler = require('./Handler')

class DefinePropertyHandler extends Handler {
  constructor (simple) {
    super(simple)

    this.object = new Proxy(this.simple, {
      get: (target, property) => {
        if (property in this.simple) {
          return this.simple[property]
        }

        const description = this.simple._context.description(property)

        if (!description) {
          return undefined
        }

        return this.getValue(description)
      },
      set: (target, property, value) => {
        if (property in this.simple) {
          this.simple[property] = value

          return
        }

        const description = this.simple._context.description(property)

        if (!description) {
          return
        }

        this.removeValue(description)

        if (typeof value !== 'undefined' && value !== null) {
          this.addValue(description, value)
        }
      }
    })
  }
}

module.exports = DefinePropertyHandler
