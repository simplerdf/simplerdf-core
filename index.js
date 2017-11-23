'use strict'

const rdf = require('rdf-ext')
const SimpleArray = require('./lib/array')
const SimpleContext = require('./lib/context')
const SimpleCore = require('./lib/core')
const SimpleHandler = require('./lib/define-property-handler')

class SimpleRDF {
  toString () {
    return this._core.graph.toString()
  }

  context (context) {
    if (context) {
      this._core.context = SimpleContext.create(context)

      this._core.context.descriptions().forEach((description) => {
        // access values with full IRI
        this._handler.addProperty(description.predicate, description.predicate, description.options)

        // access values with short property
        this._handler.addProperty(description.property, description.predicate, description.options)
      })
    }

    return this._core.context
  }

  iri (iri) {
    if (iri) {
      iri = SimpleCore.buildIri(iri)

      if (!iri.equals(this._core.iri)) {
        this._core.updateSubject(iri)
        this._core.updateObject(iri)

        this._core.iri = iri
      }
    }

    return this._core.iri
  }

  graph (graph) {
    if (graph) {
      this._core.graph = graph

      this._core.graph.match(this._core.iri).forEach((triple) => {
        let property = triple.predicate.value

        if (!this._handler.hasProperty(property)) {
          this._handler.addProperty(property, triple.predicate)
        }
      })
    }

    return this._core.graph
  }

  child (iri) {
    return this.create(this._core.context, iri, this._core.graph, this._options)
  }

  static init (context, iri, graph, options) {
    this._core = new SimpleCore(this)
    this._handler = new SimpleHandler(this, this._core)

    this._core.iri = SimpleCore.buildIri(iri)

    this.context(context)
    this.graph(graph || rdf.dataset())

    this._options = options || {}

    this._plugins.forEach((plugin) => {
      if (typeof plugin.prototype.init === 'function') {
        plugin.prototype.init.call(this, context, iri, graph, this._options)
      }
    })
  }

  static isArray (obj) {
    return SimpleArray.isArray(obj)
  }

  static extend (plugin) {
    let NewClass = function (context, iri, graph, options) {
      if (this instanceof NewClass) {
        SimpleRDF.init.call(this, context, iri, graph, options)
      } else {
        return NewClass.prototype.create(context, iri, graph, options)
      }
    }

    // assign prototype from base class
    NewClass.prototype = Object.create(this.prototype)

    NewClass.prototype.init = SimpleRDF.init

    NewClass.prototype.create = function (context, iri, graph, options) {
      return new NewClass(context, iri, graph, options)
    }

    // assign prototype from plugin class
    Object.getOwnPropertyNames(plugin.prototype).forEach((key) => {
      NewClass.prototype[key] = plugin.prototype[key]
    })

    // assign static properties from base class
    Object.getOwnPropertyNames(this).forEach((key) => {
      // ignore Object properties (length, name, prototype, ...)
      if (!(key in Object)) {
        NewClass[key] = this[key]
      }
    })

    // assign static properties from plugin class
    Object.getOwnPropertyNames(plugin).forEach((key) => {
      // ignore Object properties (length, name, prototype, ...)
      if (!(key in Object)) {
        NewClass[key] = plugin[key]
      }
    })

    // clone the plugins array and add the new plugin
    NewClass.prototype._plugins = (this.prototype._plugins || []).slice(0).concat([plugin])

    return NewClass
  }
}

SimpleRDF.prototype._plugins = []

module.exports = SimpleRDF.extend.call(Object, SimpleRDF)
