'use strict'

const rdf = require('rdf-ext')
const SimpleArray = require('./array')

const typeTerm = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')

class SimpleCore {
  constructor (object) {
    this.object = object
    this.objects = {}
  }

  type (type) {
    if (type) {
      type = SimpleCore.buildNode(type)

      this.removeValues(typeTerm, {namedNode: true})
      this.addValues(typeTerm, {namedNode: true}, [type])
    }

    return this.getValues(typeTerm, {namedNode: true})
  }

  updateSubject (newSubject) {
    this.graph.match(this.iri).forEach((triple) => {
      this.graph.remove(triple)
      this.graph.add(rdf.quad(newSubject, triple.predicate, triple.object))
    })
  }

  updateObject (newObject) {
    this.graph.match(null, null, this.iri).forEach((triple) => {
      this.graph.remove(triple)
      this.graph.add(rdf.quad(triple.subject, triple.predicate, newObject))
    })
  }

  addValue (predicate, options, value) {
    let valueNode

    if (typeof value === 'string') {
      if (options.namedNode) {
        valueNode = rdf.namedNode(this.context.expand(value))
      } else {
        valueNode = rdf.literal(value)
      }
    } else if (typeof value === 'object') {
      if (value.termType) {
        valueNode = value
      } else {
        valueNode = value._core.iri

        // don't cache array values, because we cache the complete array
        if (!options.array) {
          this.objects[predicate] = value
        }
      }
    } else if (typeof value === 'boolean') {
      valueNode = rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
    } else if (typeof value === 'number') {
      valueNode = rdf.literal(value, rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
    } else if (typeof value === 'undefined') {
      // ignore
    } else {
      console.warn('unsupported type: ' + typeof value)
    }

    if (valueNode) {
      const subject = options.reverse ? valueNode : this.iri
      const object = options.reverse ? this.iri : valueNode

      this.graph.add(rdf.quad(subject, predicate, object))
    }
  }

  addValues (predicate, options, values) {
    if (!SimpleArray.isArray(values) && !Array.isArray(values)) {
      values = [values]
    }

    if (options.array) {
      this.objects[predicate] = this.objects[predicate] || new SimpleArray(
        this.addValues.bind(this, predicate, options),
        this.getValues.bind(this, predicate, options),
        this.removeValues.bind(this, predicate, options),
        values
      )
    }

    values.forEach((value) => {
      this.addValue(predicate, options, value)
    })
  }

  getValuesArray (predicate, options) {
    const subject = options.reverse ? null : this.iri
    const object = options.reverse ? this.iri : null

    return this.graph.match(subject, predicate, object).toArray().map((triple) => {
      const nodeValue = options.reverse ? triple.subject : triple.object

      if (nodeValue.termType === 'Literal') {
        if (nodeValue.datatype) {
          if (nodeValue.datatype.value === 'http://www.w3.org/2001/XMLSchema#boolean') {
            return nodeValue.value === 'true'
          } else if (nodeValue.datatype.value === 'http://www.w3.org/2001/XMLSchema#double') {
            return Number.parseFloat(nodeValue.value)
          }
        }

        return nodeValue.value
      } else {
        if (options.namedNode) {
          return nodeValue.value
        } else {
          return this.object.child(nodeValue)
        }
      }
    })
  }

  getValues (predicate, options) {
    if (predicate in this.objects) {
      return this.objects[predicate]
    }

    let values = this.getValuesArray(predicate, options)

    if (!options.array) {
      values = values.shift()
    } else {
      values = this.objects[predicate] = new SimpleArray(
        this.addValues.bind(this, predicate, options),
        this.getValues.bind(this, predicate, options),
        this.removeValues.bind(this, predicate, options),
        values
      )
    }

    return values
  }

  removeValues (predicate, options) {
    this.graph.removeMatches(this.iri, predicate)
  }

  static buildNode (value) {
    if (typeof value === 'string') {
      if (value.slice(0, 2) === '_:') {
        return rdf.blankNode(value.slice(2))
      } else {
        return rdf.namedNode(value)
      }
    } else {
      return value || rdf.blankNode()
    }
  }
}

module.exports = SimpleCore
