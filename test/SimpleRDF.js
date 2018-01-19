/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-ext')
const SimpleRDF = require('..')

const blogContext = {
  about: 'http://schema.org/about',
  name: 'http://schema.org/name',
  provider: {
    '@id': 'http://schema.org/provider',
    '@type': '@id'
  },
  isFamilyFriendly: 'http://schema.org/isFamilyFriendly',
  post: {
    '@id': 'http://schema.org/post',
    '@container': '@set'
  },
  headline: 'http://schema.org/headline',
  content: 'http://schema.org/content',
  version: 'http://schema.org/version',
  sameAs: 'http://schema.org/sameAs',
  author: {
    '@id': 'http://schema.org/author',
    '@container': '@set'
  }
}

const blogIri = 'http://example.org/blog'

const blogPostNode = rdf.blankNode()

const blogDataset = rdf.dataset([
  rdf.quad(
    rdf.namedNode(blogIri),
    rdf.namedNode('http://schema.org/name'),
    rdf.literal('simple blog'),
    rdf.namedNode(blogIri)),
  rdf.quad(
    rdf.namedNode(blogIri),
    rdf.namedNode('http://schema.org/post'),
    blogPostNode,
    rdf.namedNode(blogIri)),
  rdf.quad(
    blogPostNode,
    rdf.namedNode('http://schema.org/headline'),
    rdf.literal('first blog post'),
    rdf.namedNode(blogIri))
])

const blogGraph = rdf.graph(blogDataset)

describe('SimpleRDF', () => {
  describe('constructor', () => {
    it('should import context', () => {
      const blog = new SimpleRDF(blogContext)

      assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'name'), undefined)
      assert.notEqual(Object.getOwnPropertyDescriptor(blog, 'post'), undefined)
    })

    it('should create BlankNode subject if none was given', () => {
      const blog = new SimpleRDF(blogContext)

      assert.equal(blog._core.iri.termType, 'BlankNode')
    })

    it('should use existing NamedNode subject if one was given', () => {
      const iri = rdf.namedNode(blogIri)
      const blog = new SimpleRDF(blogContext, iri)

      assert(blog._core.iri.equals(iri))
    })

    it('should use existing BlankNode subject if one was given', () => {
      const iri = rdf.blankNode()
      const blog = new SimpleRDF(blogContext, iri)

      assert(blog._core.iri.equals(iri))
    })

    it('should create a NamedNode subject if a String was given', () => {
      const iri = rdf.namedNode(blogIri)
      const blog = new SimpleRDF(blogContext, blogIri)

      assert(blog._core.iri.equals(iri))
    })

    it('should use an existing graph if one was given', () => {
      const blog = new SimpleRDF(blogContext, blogIri, blogGraph)

      assert(blogGraph.equals(blog._core.graph))
    })

    it('should create properties for imported graph predicates', () => {
      const blog = new SimpleRDF(null, blogIri, blogGraph)

      assert.equal(blog['http://schema.org/name'], 'simple blog')
    })
  })

  describe('.child', () => {
    it('should create a child object with a BlankNode subject if none was given', () => {
      const blog = new SimpleRDF(blogContext)
      const post = blog.child()

      assert(post instanceof SimpleRDF)
      assert.equal(post._core.iri.termType, 'BlankNode')
    })

    it('should create a child object with a NamedNode subject if a String was given', () => {
      const blog = new SimpleRDF(blogContext)
      const post = blog.child('http://example.org/post-1')

      assert(post._core.iri.equals(rdf.namedNode('http://example.org/post-1')))
    })
  })

  describe('getter', () => {
    it('should support String values', () => {
      const blog = new SimpleRDF(blogContext, blogIri, blogGraph)
      const name = blog.name

      assert.equal(name, 'simple blog')
    })

    it('should support IRI strings', () => {
      const blogGraph = rdf.dataset()
      const blog = new SimpleRDF(blogContext, null, blogGraph)

      blogGraph.add(rdf.quad(
        blog.iri(),
        rdf.namedNode('http://schema.org/provider'),
        rdf.namedNode('http://example.org/provider')
      ))

      assert.equal(blog.provider, 'http://example.org/provider')
    })

    it('should support boolean values', () => {
      const blogGraph = rdf.dataset()
      const blog = new SimpleRDF(blogContext, null, blogGraph)

      blogGraph.add(rdf.quad(
        blog.iri(),
        rdf.namedNode('http://schema.org/isFamilyFriendly'),
        rdf.literal('true', rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean'))
      ))

      assert.equal(typeof blog.isFamilyFriendly, 'boolean')
      assert.equal(blog.isFamilyFriendly, true)
    })

    it('should support numb er values', () => {
      const blogGraph = rdf.dataset()
      const blog = new SimpleRDF(blogContext, null, blogGraph)

      blogGraph.add(rdf.quad(
        blog.iri(),
        rdf.namedNode('http://schema.org/version'),
        rdf.literal('0.1', rdf.namedNode('http://www.w3.org/2001/XMLSchema#double'))
      ))

      assert.equal(typeof blog.version, 'number')
      assert.equal(blog.version, 0.1)
    })

    it('should support Array values', () => {
      const blog = new SimpleRDF(blogContext, blogIri, blogGraph)
      const posts = blog.post

      assert(SimpleRDF.isArray(posts))
    })

    it('should support Array access', () => {
      const blog = new SimpleRDF(blogContext)
      const post = blog.child()

      blog.post.push(post)

      const node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object

      assert(node.equals(post._core.iri))
    })

    it('should keep objects', () => {
      const blog = new SimpleRDF(blogContext, blogIri)
      const provider = blog.child()

      provider.name = 'test'
      provider.getName = function () {
        return this.name
      }

      blog.provider = provider

      assert.equal(blog.provider.name, 'test')
      assert.equal(blog.provider.getName(), 'test')
    })

    it('should keep arrays', () => {
      const blog = new SimpleRDF(blogContext, blogIri)

      const postBefore = blog.post

      blog.post.push(blog.child())

      const postAfter = blog.post

      assert.equal(postAfter, postBefore)
    })
  })

  describe('setter', () => {
    it('should support String values', () => {
      const blog = new SimpleRDF(blogContext)

      blog.name = 'simple blog'

      const node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/name'))
        .toArray()
        .shift()
        .object
        .value

      assert.equal(node, 'simple blog')
    })

    it('should support IRI values', () => {
      const blog = new SimpleRDF(blogContext)
      const value = 'http://example.org/provider'

      blog.provider = value

      const node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/provider'))
        .toArray()
        .shift()
        .object

      assert.equal(node.termType, 'NamedNode')
      assert.equal(node.value, value)
    })

    it('should expand IRI values', () => {
      const blog = new SimpleRDF(blogContext)

      blog.provider = 'about'

      const node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/provider'))
        .toArray()
        .shift()
        .object

      assert.equal(node.termType, 'NamedNode')
      assert.equal(node.value, 'http://schema.org/about')
    })

    it('should support boolean values', () => {
      const blog = new SimpleRDF(blogContext)

      blog.isFamilyFriendly = true

      const isFamilyFriendly = blog._core.graph.match(null, rdf.namedNode('http://schema.org/isFamilyFriendly'))
        .toArray()
        .shift()
        .object

      assert(isFamilyFriendly)
      assert(isFamilyFriendly.datatype.equals(rdf.namedNode('http://www.w3.org/2001/XMLSchema#boolean')))
    })

    it('should support number values', () => {
      const post = new SimpleRDF(blogContext)

      post.version = 0.1

      const version = post._core.graph.match(null, rdf.namedNode('http://schema.org/version'))
        .toArray()
        .shift()
        .object

      assert(version)
      assert(version.datatype.equals(rdf.namedNode('http://www.w3.org/2001/XMLSchema#double')))
    })

    it('should support Object values', () => {
      const blog = new SimpleRDF(blogContext)
      const project = blog.child()

      blog.about = project

      assert.equal(blog._core.graph.match(blog._iri, rdf.namedNode('http://schema.org/about'), project._iri).length, 1)
    })

    it('should support NamedNode values', () => {
      const blog = new SimpleRDF(blogContext)
      const project = rdf.namedNode('http://example.org/project')

      blog.about = project

      assert.equal(blog._core.graph.match(blog._iri, rdf.namedNode('http://schema.org/about'), project).length, 1)
    })

    it('should support BlankNode values', () => {
      const blog = new SimpleRDF(blogContext)
      const project = rdf.blankNode()

      blog.about = project

      assert.equal(blog._core.graph.match(blog._iri, rdf.namedNode('http://schema.org/about'), project).length, 1)
    })

    it('should support Array values', () => {
      const blog = new SimpleRDF(blogContext)
      const post = blog.child()

      blog.post = [post]

      const node = blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object

      assert(node.equals(post._core.iri))
    })

    it('should support SimpleArray values', () => {
      const blog = new SimpleRDF(blogContext)

      blog.post.push(blog.child())
      blog.post.push(blog.child())

      const authors = blog.post

      blog.author = authors

      assert.equal(blog._core.graph.match(blog.iri(), rdf.namedNode('http://schema.org/author')).length, 2)
    })

    it('should support Array access', () => {
      const blog = new SimpleRDF(blogContext)
      const post = blog.child()

      blog.post.push(post)

      assert(typeof blog.post.push === 'function')
    })
  })

  describe('.iri', () => {
    it('.iri should do subject update inc. subject and object updates in graph', () => {
      const blog = new SimpleRDF(blogContext, blogIri)
      const post = blog.child()
      const postIri = 'http://example.org/post-1'

      post.headline = 'headline'
      blog.post = [post]
      post.iri(postIri)

      assert(blog._core.graph.match(null, rdf.namedNode('http://schema.org/post')).toArray().shift().object.equals(rdf.namedNode(postIri)))
      assert(blog._core.graph.match(null, rdf.namedNode('http://schema.org/headline')).toArray().shift().subject.equals(rdf.namedNode(postIri)))
    })
  })

  describe('@id', () => {
    it('@id should return the IRI', () => {
      const blog = new SimpleRDF(blogContext, blogIri)

      assert.equal(blog['@id'], blogIri)
    })

    it('@id should set the IRI', () => {
      const blog = new SimpleRDF(blogContext)

      blog['@id'] = blogIri

      assert.equal(blog._core.iri, blogIri)
    })
  })

  describe('.toString', () => {
    it('.toString should return the graph as N-Triples', () => {
      const blog = new SimpleRDF(blogContext, blogIri)
      const postIri = 'http://example.org/post-1'
      const post = blog.child(postIri)

      blog.post = [post]

      assert.equal(blog.toString().trim(), '<http://example.org/blog> <http://schema.org/post> <http://example.org/post-1> .')
    })
  })

  it('SimpleRDF prototype should have a _plugins property with an Array value', () => {
    assert.equal(Array.isArray(SimpleRDF.prototype._plugins), true)
  })

  describe('static method', () => {
    describe('.extend', () => {
      it('should assign the prototype properties from the base class', () => {
        class ClassA {}
        const ClassB = SimpleRDF.extend(ClassA)

        assert.equal(typeof ClassB.prototype.context, 'function')
        assert.equal(typeof ClassB.prototype.iri, 'function')
        assert.equal(typeof ClassB.prototype.graph, 'function')
      })

      it('should assign the static properties from the base class', () => {
        class ClassA {}
        const ClassB = SimpleRDF.extend(ClassA)

        assert.equal(typeof ClassB.extend, 'function')
      })

      it('should assign the prototype properties from the plugin class', () => {
        class ClassA {
          test () {}
        }

        const ClassB = SimpleRDF.extend(ClassA)

        assert.equal(typeof ClassB.prototype.test, 'function')
      })

      it('should assign the static properties from the plugin class', () => {
        class ClassA {
          static test () {}
        }

        const ClassB = SimpleRDF.extend(ClassA)

        assert.equal(typeof ClassB.test, 'function')
      })

      it('should add the plugin to the _plugins array', () => {
        class ClassA {}
        const ClassB = SimpleRDF.extend(ClassA)

        assert.equal(ClassB.prototype._plugins[1], ClassA)
      })

      it('should call the init method of the plugin class with all arguments', () => {
        let args

        class ClassA {
          init () {
            args = arguments
          }
        }

        const ClassB = SimpleRDF.extend(ClassA)

        const b = new ClassB({a: 'http://example.org/a'}, 'http://example.org', null, {b: 2})

        assert(b)
        assert.deepEqual(Array.prototype.slice.call(args, 0), [
          {a: 'http://example.org/a'},
          'http://example.org',
          null,
          {b: 2}
        ])
      })
    })

    describe('.create', () => {
      it('should create a new instance', () => {
        class ClassA {}

        const ClassB = SimpleRDF.extend(ClassA)

        const a = new ClassB()
        const b = a.create()

        assert(b)
        assert(b instanceof ClassB)
      })
    })
  })
})
