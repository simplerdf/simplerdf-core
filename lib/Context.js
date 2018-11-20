const isSimple = require('./isSimple')
const ns = require('./namespaces')
const rdf = require('rdf-ext')

class Context {
  constructor (json) {
    this._descriptions = Context.parseJson(json)
  }

  toJSON () {
    return {}
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

  mapToTerm (description, value) {
    if (typeof value === 'string') {
      if (description.options.namedNode) {
        return rdf.namedNode(this.expand(value))
      }

      return rdf.literal(value)
    }

    if (typeof value === 'object') {
      if (value.termType) {
        return value
      }

      if (isSimple(value)) {
        return value.term
      }
    }

    if (typeof value === 'boolean') {
      return rdf.literal(value, ns.xsd('boolean'))
    }

    if (typeof value === 'number') {
      return rdf.literal(value, ns.xsd('double'))
    }

    if (typeof value === 'undefined') {
      return undefined
    }

    console.warn('unsupported type: ' + typeof value)
  }

  mapFromDataset (description, iri, dataset, simple) {
    const subject = description.options.reverse ? null : iri
    const object = description.options.reverse ? iri : null

    return dataset.match(subject, description.predicate, object).toArray().map(quad => {
      return this.mapFromQuad(description, quad, simple)
    })
  }

  mapFromQuad (description, quad, simple) {
    const term = description.options.reverse ? quad.subject : quad.object

    return this.mapFromTerm(description, term, simple)
  }

  mapFromTerm (description, term, simple) {
    if (term.termType === 'Literal') {
      if (term.datatype.equals(ns.xsd('boolean'))) {
        return term.value === 'true'
      }

      if (term.datatype.equals(ns.xsd('double'))) {
        return Number.parseFloat(term.value)
      }

      return term.value
    }

    if (description.options.namedNode) {
      return term.toString()
    }

    return simple.node(term)
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

Context.type = Context.parseJsonProperty('@type', {
  '@id': ns.rdf('type').value,
  '@type': '@id'
})

module.exports = Context
