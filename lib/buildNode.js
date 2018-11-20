const isSimple = require('./isSimple')
const rdf = require('rdf-ext')

function buildNode (value) {
  if (!value) {
    return rdf.blankNode()
  }

  if (typeof value === 'string') {
    if (value.slice(0, 2) === '_:') {
      return rdf.blankNode(value.slice(2))
    }

    return rdf.namedNode(value)
  }

  if (isSimple(value)) {
    return value.term
  }

  return value || rdf.blankNode()
}

module.exports = buildNode
