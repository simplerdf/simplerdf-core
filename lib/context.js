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

  mapToTerm (description, value) {
    if (typeof value === 'string') {
      if (description.options.namedNode) {
        return rdf.namedNode(this.expand(value))
      } else {
        return rdf.literal(value)
      }
    } else if (typeof value === 'object') {
      if (value.termType) {
        return value
      } else {
        return value._core.iri
      }
    } else if (typeof value === 'boolean') {
      return rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
    } else if (typeof value === 'number') {
      return rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
    } else if (typeof value === 'undefined') {
      return undefined
    } else {
      console.warn('unsupported type: ' + typeof value)
    }
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
      if (term.datatype) {
        if (term.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean') {
          return term.value === 'true'
        } else if (term.datatype.value === 'http://www.w3.org/2001/XMLSchema#double') {
          return Number.parseFloat(term.value)
        }
      }

      return term.value
    } else {
      if (description.options.namedNode) {
        return term.value
      } else {
        return simple.child(term)
      }
    }
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
