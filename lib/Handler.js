const buildNode = require('./buildNode')
const isSimple = require('./isSimple')
const rdf = require('rdf-ext')
const Context = require('./Context')

class Handler {
  constructor (simple) {
    this.simple = simple
  }

  getType () {
    return this.getValue(Context.type)
  }

  setType (type) {
    this.removeValue(Context.type)
    this.addValue(Context.type, [buildNode(type)])
  }

  updateSubject (subject) {
    this.simple.dataset.match(this.simple.term).forEach(quad => {
      this.simple.dataset.remove(quad)
      this.simple.dataset.add(rdf.quad(subject, quad.predicate, quad.object))
    })
  }

  updateObject (object) {
    this.simple.dataset.match(null, null, this.simple.term).forEach(quad => {
      this.simple.dataset.remove(quad)
      this.simple.dataset.add(rdf.quad(quad.subject, quad.predicate, object))
    })
  }

  addValue (description, value) {
    if (description.options.array) {
      this.getArray(description)
    }

    const values = Array.isArray(value) ? value : [value]

    // map all values to terms and add them to the dataset and cache
    values.forEach(value => {
      const term = this.simple._context.mapToTerm(description, value)

      if (term !== undefined) {
        const subject = this.getSubject(description, term)
        const object = this.getObject(description, term)

        // add quad to graph
        this.simple.dataset.add(rdf.quad(subject, description.predicate, object))

        // add it to the cache if it's a Simple but not array, cause we cache the complete array
        if (isSimple(value) && !description.options.array) {
          this.simple._datasetContext.set(value)
        }
      }
    })
  }

  getValue (description) {
    const objectQuad = this.simple.dataset.match(this.simple.term, description.predicate).toArray()[0]
    const cached = objectQuad ? this.simple._datasetContext.get(objectQuad.object) : null

    if (cached) {
      return cached
    }

    // create a new array
    if (description.options.array) {
      return this.getArray(description)
    }

    return this.simple._context.mapFromDataset(description, this.simple.term, this.simple.dataset, this.simple)[0]
  }

  getArray (description) {
    // create a new one if it's not in the cache yet
    if (!(description.property in this.objects)) {
      /* this.objects[description.property] = new SimpleArray(
        this.addValue.bind(this, description),
        this.getValue.bind(this, description),
        this.removeValue.bind(this, description),
        this.context.mapFromDataset(description, this.iri, this.simple.dataset, this.object)
      ) */
    }

    return this.objects[description.property]
  }

  removeValue (description, value) {
    const term = this.simple._context.mapToTerm(description, value)
    const subject = description.options.reverse ? term : this.simple.term
    const object = description.options.reverse ? this.simple.term : term

    this.simple.dataset.removeMatches(subject, description.predicate, object)
  }

  addProperty (description) {}

  getSubject (description, term) {
    return description.options.reverse ? term : this.simple._term
  }

  getObject (description, term) {
    return description.options.reverse ? this.simple._term : term
  }
}

module.exports = Handler
