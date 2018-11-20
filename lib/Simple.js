const buildNode = require('./buildNode')
const rdf = require('rdf-ext')
const Context = require('./Context')
const DatasetContext = require('./DatasetContext')
// const DefinePropertyHandler = require('./DefinePropertyHandler')
const ProxyHandler = require('./ProxyHandler')

class Simple {
  constructor (context = {}, term, dataset = rdf.dataset(), options = {}) {
    this._datasetContext = options.datasetContext || new DatasetContext(dataset)
    this._factory = options.factory || Simple.create
    // this._handler = new DefinePropertyHandler(this)
    this._handler = new ProxyHandler(this)

    this.context = context
    this._term = buildNode(term)
    this._options = Object.assign({}, options, {
      datasetContext: this._datasetContext,
      factory: this._factory
    })

    this.dataset.match(this._term).forEach(quad => {
      const description = Context.parseJsonProperty(quad.predicate.value, quad.predicate.value)

      this._handler.addProperty(description)
    })
  }

  toString () {
    return this._core.graph.toString()
  }

  get context () {
    return this._context
  }

  set context (context) {
    this._context = Context.create(context)

    this._context.descriptions().forEach(description => {
      // access values with full IRI
      this._handler.addProperty(description)

      // access values with short property
      this._handler.addProperty(description)
    })
  }

  get term () {
    return this._term
  }

  set term (term) {
    term = buildNode(term)

    if (!term.equals(this._term)) {
      this._handler.updateSubject(term)
      this._handler.updateObject(term)

      this._term = term
    }
  }

  get '@id' () {
    return this._term && this._term.toString()
  }

  set '@id' (term) {
    this.term = term
  }

  get '@type' () {
    const type = this._handler.getType()

    return type && type.toString()
  }

  set '@type' (type) {
    this._handler.setType(type)
  }

  get dataset () {
    return this._datasetContext.dataset
  }

  node (term) {
    term = buildNode(term)

    const cached = this._datasetContext.get(term)

    if (cached) {
      return cached
    }

    return this._factory(this._context, term, this._dataset, this._options)
  }

  static create (context, term, dataset, options) {
    const simple = new Simple(context, term, dataset, options)

    return simple._handler.object
  }
}

module.exports = Simple
