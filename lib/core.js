const rdf = require('rdf-ext')
const SimpleArray = require('./array')
const SimpleContext = require('./context')

const typeTerm = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')

class SimpleCore {
  constructor (object) {
    this.object = object
    this.objects = {}
  }

  type (type) {
    const description = SimpleContext.parseJsonProperty('@type', {
      '@id': typeTerm.value,
      '@type': '@id'
    })

    if (type) {
      type = SimpleCore.buildNode(type)

      this.removeValue(description)
      this.addValue(description, [type])
    }

    return this.getValue(description)
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

  addValue (description, value) {
    if (description.options.array) {
      this.getArray(description)
    }

    const values = SimpleArray.isArray(value) || Array.isArray(value) ? value : [value]

    // map all values to terms and add them to the dataset and cache
    values.forEach(value => {
      const term = this.context.mapToTerm(description, value)

      if (term !== undefined) {
        const subject = description.options.reverse ? term : this.iri
        const object = description.options.reverse ? this.iri : term

        // add quad to graph
        this.graph.add(rdf.quad(subject, description.predicate, object))

        // add it to the cache if it's a Simple but not array, cause we cache the complete array
        if (SimpleCore.isSimple(value) && !description.options.array) {
          this.objects[description.property] = value
        }
      }
    })
  }

  getValue (description) {
    // use cached object if available
    if (description.property in this.objects) {
      return this.objects[description.property]
    }

    // create a new array
    if (description.options.array) {
      return this.getArray(description)
    }

    return this.context.mapFromDataset(description, this.iri, this.graph, this.object).shift()
  }

  getArray (description) {
    // create a new one if it's not in the cache yet
    if (!(description.property in this.objects)) {
      this.objects[description.property] = new SimpleArray(
        this.addValue.bind(this, description),
        this.getValue.bind(this, description),
        this.removeValue.bind(this, description),
        this.context.mapFromDataset(description, this.iri, this.graph, this.object)
      )
    }

    return this.objects[description.property]
  }

  removeValue (description, value) {
    const term = this.context.mapToTerm(description, value)
    const subject = description.options.reverse ? term : this.iri
    const object = description.options.reverse ? this.iri : term

    this.graph.removeMatches(subject, description.predicate, object)
  }

  quadAdded (quad) {
    // get all descriptions for existing objects and matching predicates
    const descriptions = Object
      .keys(this.objects)
      .map(property => this.context.description(property))
      .filter(description => quad.predicate.equals(description.predicate))

    descriptions.forEach(description => {
      const term = description.options.reverse ? quad.subject : quad.object
      const object = this.objects[description.property]

      if (SimpleArray.isArray(object)) {
        object._valueAdded(this.context.mapFromTerm(description, term, this.object))
      } else {
        // replace object in cache if iri doesn't match anymore
        if (!object.iri().equals(quad.object)) {
          this.objects[description.property] = this.context.mapFromTerm(description, term, this.object)
        }
      }
    })
  }

  quadRemoved (quad) {
    // get all descriptions for existing objects and matching predicates
    const descriptions = Object
      .keys(this.objects)
      .map(property => this.context.description(property))
      .filter(description => quad.predicate.equals(description.predicate))

    descriptions.forEach(description => {
      const term = description.options.reverse ? quad.subject : quad.object
      const object = this.objects[description.property]

      if (SimpleArray.isArray(object)) {
        object._valueRemoved(this.context.mapFromTerm(description, term, this.object))
      } else {
        delete this.objects[description.property]
      }
    })
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

  static isSimple (object) {
    return typeof object.iri === 'function'
  }
}

module.exports = SimpleCore
