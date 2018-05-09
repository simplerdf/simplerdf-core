class Utils {
  static equals (a, b) {
    if (Utils.isSimple(a)) {
      if (Utils.isSimple(b)) {
        return a.iri().equals(b.iri())
      } else {
        return false
      }
    }

    if (a.termType) {
      if (b.termType) {
        return a.equals(b)
      } else {
        return false
      }
    }

    return a === b
  }

  static isSimple (object) {
    return typeof object.iri === 'function'
  }
}

module.exports = Utils
