const rdf = require('rdf-ext')
const CallbackDataset = require('rdf-dataset-callback')

function callbacks (method, object) {
  const func = quad => {
    func.list.forEach(object => {
      object[method](quad)
    })
  }

  func.list = [object]

  return func
}

function factory (dataset, object) {
  dataset = dataset || rdf.dataset()

  if (dataset.simpleCallbackDataset) {
    dataset.callbacks.added.list.push(object)
    dataset.callbacks.removed.list.push(object)

    return dataset
  } else {
    const callbackDataset = new CallbackDataset(dataset, rdf.dataset, {
      added: callbacks('quadAdded', object),
      removed: callbacks('quadRemoved', object)
    })

    callbackDataset.toCanonical = dataset.toCanonical.bind(dataset)
    callbackDataset.toString = dataset.toString.bind(dataset)
    callbackDataset.simpleCallbackDataset = true

    return callbackDataset
  }
}

module.exports = factory
