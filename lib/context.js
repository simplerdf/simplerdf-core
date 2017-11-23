'use strict'

class Context {
  constructor (json) {
    this._json = json
  }

  description (property) {
    if (!(property in this._json)) {
      return null
    }

    let json = this._json[property]
    let description = {}

    description.property = property
    description.options = {
      array: false,
      namedNode: false
    }

    if (typeof json === 'string') {
      description.predicate = json
    } else {
      description.predicate = json['@id']
      description.options.array = '@container' in json && json['@container'] === '@set'
      description.options.namedNode = '@type' in json && json['@type'] === '@id'
    }

    return description
  }

  descriptions () {
    return this.properties().map((property) => {
      return this.description(property)
    })
  }

  properties () {
    return Object.keys(this._json)
  }

  static create (json) {
    if (json._json && typeof json.descriptions === 'function') {
      return json
    } else {
      return new Context(json)
    }
  }
}

module.exports = Context
