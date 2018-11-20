class DatasetContext {
  constructor (dataset) {
    this.dataset = dataset
    this.cache = new Map()
  }

  get (term) {
    return this.cache.get(term.toCanonical())
  }

  set (object) {
    this.cache.set(object.term.toCanonical(), object)
  }
}

module.exports = DatasetContext
