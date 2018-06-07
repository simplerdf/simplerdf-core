class Utils {
  static equals (a, b) {
    if (Utils.isSimple(a)) {
      a = a.iri().toString()
    }

    if (Utils.isSimple(b)) {
      b = b.iri().toString()
    }

    if (a.termType) {
      a = a.toString()
    }

    if (b.termType) {
      b = b.toString()
    }

    return a === b
  }

  static isSimple (object) {
    return typeof object.iri === 'function'
  }
}

module.exports = Utils
