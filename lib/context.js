const rdf = require('rdf-ext')

class Context {
  constructor (json) {
    this._descriptions = Context.parseJson(json)
  }

  description (property) {
    return this._descriptions[property]
  }

  descriptions () {
    return Object.keys(this._descriptions).map(property => this._descriptions[property])
  }

  expand (value) {
    if (value.indexOf(':') !== -1) {
      return value
    }

    const description = this.descriptions().filter(d => d.property === value).shift()

    if (description) {
      return description.predicate
    } else {
      return value
    }
  }

  properties () {
    return Object.keys(this._descriptions)
  }

  static create (json) {
    if (typeof json.descriptions === 'function') {
      return json
    } else {
      return new Context(json)
    }
  }

  static parseJson (json) {
    return Object.keys(json).reduce((descriptions, property) => {
      descriptions[property] = Context.parseJsonProperty(property, json[property])

      return descriptions
    }, {})
  }

  static parseJsonProperty (property, json) {
    const description = {}

    description.property = property
    description.options = {
      array: false,
      namedNode: false,
      reverse: false
    }

    if (typeof json === 'string') {
      description.predicate = rdf.namedNode(json)
    } else {
      description.predicate = rdf.namedNode(json['@id'] || json['@reverse'])
      description.options.array = '@container' in json && json['@container'] === '@set'
      description.options.namedNode = '@type' in json && json['@type'] === '@id'
      description.options.reverse = '@reverse' in json
    }

    return description
  }
}

module.exports = Context
