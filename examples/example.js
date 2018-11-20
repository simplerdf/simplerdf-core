const simple = require('..')

const context = {
  count: 'http://example.org/count',
  child: 'http://example.org/child'
}

// Creates a new SimpleRDF object
// New:
//   It's now a factory function, not a constructor
//   That's a requirement to use the Proxy features
const obj = simple(context)

// Assigns a Named Node
// New:
//   The .child method was renamed to .node.
//   Here the "child" SimpleRDF object is used only for point to a Named Node
//   Only if properties are assigned, it's actually a child
obj['@type'] = obj.node('http://example.org/Type')

// Assign literal values, just like before
obj.count = 10

// Create an actual child
const child = obj.node()

// Assign a literal value
child.count = 5

// And assign the child to the main object
obj.child = child

// Now we test the getter
console.log(`test the getter: ${obj.count}`)

// And the getter of the child (to check if it's assigned to the right subject)
console.log(`test the getter on the child: ${obj.child.count}`)

// Read the current "position" in the dataset
// New:
//   Before it was a method and it was renamed from .iri() to .term
//   The value can be a Blank Node, so .iri() didn't match
//   With the setter/getter, compared to the method with optional value for setting the value, the API should me more readable
console.log(`read the "position" of the object: ${obj.term.toString()}`)

// Read the built dataset
// New:
//   Before it was a method and it was renamed from .graph() to .dataset
console.log(`content of the dataset:\n${obj.dataset.toString()}`)

// obj and child should share a DatasetContext (Dataset + object cache)
// New:
//   The object cache was not shared before
console.log(`do obj and child share the DatasetContext: ${obj._datasetContext === child._datasetContext}`)

// child should be cached
// New:
//   Using child would have created new objects before
console.log(`does child get cached: ${obj.node(child.term) === child}`)
