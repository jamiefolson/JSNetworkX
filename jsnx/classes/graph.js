'use strict';

goog.provide('jsnx.classes.Graph');

goog.require('jsnx.classes.HashMap')
goog.require('goog.functions');
goog.require('goog.iter');
goog.require('goog.math');
goog.require('goog.json');
goog.require('goog.object');
goog.require('jsnx.convert');
goog.require('jsnx.exception');
goog.require('jsnx.helper');



/*jshint expr:true*/

/** @typedef {(string|number)} */
jsnx.Node;

/** @typedef {jsnx.helper.Iterable} */
jsnx.NodeContainer;

/** @typedef {(jsnx.classes.HashMap)} */
jsnx.NodeMap;

/*jshint expr:false*/

/**
 * Base class for undirected graphs.
 *
 * A Graph stores nodes and edges with optional data, or attributes.
 *
 * Graphs hold undirected edges.  Self loops are allowed but multiple
 * (parallel) edges are not.
 *
 * Nodes can be arbitrary (hashable) Python objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * See Also
 * --------
 * DiGraph
 * MultiGraph
 * MultiDiGraph
 *
 * @param {*=} opt_data Data to initialize graph.  If data=None (default) an
 *       empty graph is created. The data can be an edge list, or any
 *       NetworkX graph object.
 * @param {Object=} opt_attr (default= no attributes)
 *       Attributes to add to graph as key=value pairs.
 *
 * @export
 * @constructor
 */
jsnx.classes.Graph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.Graph)) {
        return new jsnx.classes.Graph(opt_data, opt_attr);
    }

    this.graph_ = {}; // dictionary for graph attributes
    // load graph attributes (must be after convert)
    goog.object.extend(this.graph_, jsnx.helper.deepcopy(opt_attr) || {});

    this.nodes_ = this.newNodeMap_(); // dictionary for node
                                                // attributes

    // this['node'] = {}; // empty node dict (created before convert)
    this.adj_ = this.newNodeMap_(); // empty adjacency dict

    // attempt to load grpah with data
    if (goog.isDefAndNotNull(opt_data)) {
        if (opt_data instanceof jsnx.classes.Graph){
            //this.add_nodes_from(opt_data.nodes_iter(true)); //shallow copy
            //this.add_edges_from(opt_data.edges_iter(undefined,true)); //shallow copy
            //goog.object.extend(this.graph_,jsnx.helper.deepcopy(op_data.graph));
            goog.object.extend(this.graph_, jsnx.helper.deepcopy(opt_data.graph_));
            this.nodes_ = opt_data.nodes_;
            this.adj_ = opt_data.adj_;
        }else {
            jsnx.convert.to_networkx_graph(opt_data, this);
        }
    }
};
goog.exportSymbol('jsnx.Graph', jsnx.classes.Graph);

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.Graph['__name__'] = 'Graph';



/**
 * Dictionary for graph attributes
 *
<<<<<<< HEAD
 * @type {!Object}
 * @protected
 */
jsnx.classes.Graph.prototype.graph_ = null;

/**
 * Node map
 *
 * @type {!jsnx.NodeMap}
 * @protected
=======
 * @dict
 * @export
>>>>>>> 46b771ec5236e5b7e9b019cd3234f2087d4cc5eb
 */
jsnx.classes.Graph.prototype.node_ = null;


/**
<<<<<<< HEAD
 * Adjacency map
 *
 * @type {!jsnx.NodeMap}
 * @protected
 */
jsnx.classes.Graph.prototype.adj_ = null;


/**
 * Dictionary for graph attributes
 *
 * @return {!Object}
=======
 * Node dict
 *
 * @dict
>>>>>>> 46b771ec5236e5b7e9b019cd3234f2087d4cc5eb
 * @export
 */
jsnx.classes.Graph.prototype.graph = function() {
    return this.graph_;
};

/**
 * Node dict
 *
 * @return {!*}
 * @export
 */
jsnx.classes.Graph.prototype.node = function(n){
    return this.nodes_.get(n);
};


/**
 * Adjacency dict
 *
<<<<<<< HEAD
 * @return {!jsnx.NodeMap}
=======
 * @dict
>>>>>>> 46b771ec5236e5b7e9b019cd3234f2087d4cc5eb
 * @export
 */
jsnx.classes.Graph.prototype.adj = function(n){
    if (arguments.length === 0){
        return this.adj_;
    };
    return this.adj_.get(n);
};


/**
 * Edge dict
 *
<<<<<<< HEAD
 * @return {!jsnx.NodeMap}
=======
 * @dict
>>>>>>> 46b771ec5236e5b7e9b019cd3234f2087d4cc5eb
 * @export
 */
jsnx.classes.Graph.prototype.edge = jsnx.classes.Graph.prototype.adj;

/**
 * Create a node hash for this graph
 *
 * @return {!jsnx.NodeMap} A new node hash
 * @private
 */
jsnx.classes.Graph.prototype.newNodeMap_ = function() {
    return new jsnx.classes.HashMap(this.graph_['hash']);
};

/**
 * Gets or sets the name of the graph.
 *
 * Since we are not using ES5 features
 * instead of name being a normal property, we use
 * an overloaded function.
 *
 *
 * @param {string=} opt_name Graph name.
 *
 * @return {(string|undefined)} Graph name if no
 *      parameter was passed.
 * @export
 */
jsnx.classes.Graph.prototype.name = function(opt_name) {
    if (goog.isDef(opt_name)) {
        this.graph_['name'] = opt_name.toString();
    }
    else {
        return this.graph_['name'] || '';
    }
};


// Implements __str__
/**
 * Return the graph namme
 *
 * @return {string} Graph name.
 * @export
 */
jsnx.classes.Graph.prototype.toString = function() {
    return /** @type {string} */ (this.name());
};

// Implements __iter__
/**
 * Iterate over the nodes. Can be used together with goog.iter.
 *
 * This is the closest we can get to the native Python iteration
 * capabilities (for now).
 *
 * @return {!goog.iter.Iterator}
 * @export
 */
jsnx.classes.Graph.prototype.__iterator__ = function() {
    return this.nodes_.getKeyIterator();
};

// __contains__ is not supported, has_node has to be used


// __len__ is not supported, number_of_nodes or order has to be used


// Implements __getitem__
// This is probably the most signification difference to the original library
/**
 * Return a dict of neighbors of node n.
 *
 * @param {jsnx.Node} n  A node in the graph.
 *
 * @return {!jsnx.NodeMap} The adjacency dictionary for nodes connected to n.
 * @export
 */
jsnx.classes.Graph.prototype.get_node = function(n) {
    if (!(this.has_node(n))) {
        throw {
            name: 'KeyError',
            message: 'Graph does not contain node ' + n + '.'
        };
    }
    return this.adj(n);
};


/**
 * Add a single node n and update node attributes.
 *
 * Since JavaScript does not provide keyword arguments,
 * all attribtues must be passed in an object as second
 * argument.
 *
 * @param {!jsnx.Node} n A node.
 * @param {Object=} opt_attr_dict Dictionary of node attributes.
 *      Key/value pairs will update existing data associated with the node.
 * @export
 */
jsnx.classes.Graph.prototype.add_node = function(n, opt_attr_dict) {
    if (!goog.isDefAndNotNull(opt_attr_dict)) {
        opt_attr_dict = {};
    }

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.');
    }

    this.add_node_impl(n,opt_attr_dict);
};

/**
 * 
 * @param n
 * @param opt_attr_dict
 * @protected
 */
jsnx.classes.Graph.prototype.add_node_impl = function(n,opt_attr_dict){
    if (!this.has_node(n)) {
        this.adj_.set(n,this.newNodeMap_());
        this.nodes_.set(n,opt_attr_dict || {});
    }
    else if (opt_attr_dict){ // update attr even if node already exists
        goog.object.extend(this.node(n), opt_attr_dict || {});
    }
};


/**
 * Add multiple nodes.
 *
 * Since JavaScript does not provide keyword arguments,
 * all attribtues must be passed in an object as second
 * argument.
 *
 * @param {!jsnx.NodeContainer} nodes
 *       A container of nodes (Array, Object, Array-like).
 *       OR
 *       A container of (node, attribute dict) tuples.
 *
 * @param {Object=} opt_attr  Update attributes for all nodes in nodes.
 *       Node attributes specified in nodes as a tuple
 *       take precedence over attributes specified generally.
 * @export
 */
jsnx.classes.Graph.prototype.add_nodes_from = function(nodes, opt_attr) {
    var newnode, nn, ndict;

    if (!goog.isDefAndNotNull(opt_attr)) {
      opt_attr = {};
    }

    jsnx.helper.forEach(nodes, function(n) {
        newnode = !this.has_node(n);

        // test whether n is a (node, attr) tuple
        if (goog.isArray(n)) {
            nn = n[0];
            ndict = n[1];
            var attr = goog.object.clone(/** @type {Object} **/opt_attr);
            goog.object.extend(attr,ndict)
            this.add_node_impl(nn,attr);
            return; // continue next iteration
        }
        if (newnode) {
            this.add_node(n,goog.object.clone(/** @type {Object} **/opt_attr));
        }
        else {
            goog.object.extend(this.node(n), opt_attr);
        }
    }, this);
};


/**
 * Remove node n.
 *
 * Removes the node n and all adjacent edges.
 * Attempting to remove a non-existent node will raise an exception.
 *
 * @param {jsnx.Node} n A node in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.remove_node = function(n) {

    if (!this.has_node(n)) {
        throw new jsnx.exception.JSNetworkXError(
            'The node ' + n + ' is not in the graph to remove.'
        );
    }
    this.remove_node_impl(n);
};

/**
 * 
 * @param n
 * @protected
 */
jsnx.classes.Graph.prototype.remove_node_impl = function(n) {
    //  keys handles self-loops (allow mutation later)
    var nbrs = this.neighbors_iter(n);

    this.nodes_.remove(n);

    goog.iter.forEach(nbrs, function(u) {
        this.adj(u).remove(n); // remove all edges n-u in graph
    }, this);
    this.adj_.remove(n); // now remove node
};


/**
 * Remove multiple nodes.
 *
 * @param {jsnx.NodeContainer} nodes A container of nodes
 *      If a node in the container is not in the graph it is silently ignored.
 *
 * @export
 */
jsnx.classes.Graph.prototype.remove_nodes_from = function(nodes) {

    jsnx.helper.forEach(nodes, 
            function(n){
                if (this.has_node(n)){
                    this.remove_node_impl(n)
                }
    }, this);
};


/**
 * Return an iterator over the nodes.
 *
 * @param {boolean=} data (default false) If false the iterator returns nodes.
 *      If true return a two-tuple of node and node data dictionary.
 *
 * @return {goog.iter.Iterator} of nodes If data=true the iterator gives
 *           two-tuples containing (node, node data dictionary).
 * @export
 */
jsnx.classes.Graph.prototype.nodes_iter = function(data) {
    if (data) {
        return this.nodes_.getEntryIterator();
    }
    return this.nodes_.getKeyIterator();
};


/**
 * Return a list of the nodes in the graph.
 *
<<<<<<< HEAD
 * @param {boolean} data (default false) If false the iterator returns nodes.
=======
 * @param {boolean=} data (default false) If false the iterator returns nodes.
>>>>>>> 46b771ec5236e5b7e9b019cd3234f2087d4cc5eb
 *      If true return a two-tuple of node and node data dictionary.
 *
 * @return {!Array} of nodes If data=true a list of two-tuples containing
 *           (node, node data dictionary).
 * @export
 */
jsnx.classes.Graph.prototype.nodes = function(data) {
    return goog.iter.toArray(this.nodes_iter(data));
};


/**
 * Return the number of nodes in the graph.
 *
 * @return {number} The number of nodes in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.number_of_nodes = function() {
    return this.nodes_.getCount();
};


/**
 * Return the number of nodes in the graph.
 *
 * @return {number} The number of nodes in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.order = function() {
    return this.nodes_.getCount();
};


/**
 * Return true if the graph contains the node n.
 *
 * @param {!(jsnx.Node|jsnx.NodeContainer)} n node.
 *
 * @return {boolean}
 * @export
 */
jsnx.classes.Graph.prototype.has_node = function(n) {
    return !goog.isArray(n) && this.nodes_.containsKey(n);
};



/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 *
 * Edge attributes can be specified by providing
 * a dictionary with key/value pairs.
 *
 * Unlike in Python, attributes can only be defined
 * via the dictionary.
 *
 * @param {jsnx.Node} u Node.
 * @param {jsnx.Node} v Node.
 * @param {?Object=} opt_attr_dict Dictionary of edge attributes.
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @export
 */
jsnx.classes.Graph.prototype.add_edge = function(u, v, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }
    this.add_edge_impl(u,v,opt_attr_dict);
};
/**
 * 
 * @param u
 * @param v
 * @param opt_attr_dict
 * @protected
 */
jsnx.classes.Graph.prototype.add_edge_impl = function(u, v, opt_attr_dict) {
    // add nodes
    this.add_node(u);
    this.add_node(v);

    var edges = this.adj(u);
    var datadict = {};
    // add the edge
    if (edges.containsKey(v)){
        datadict = edges.get(v);
        goog.object.extend(datadict, opt_attr_dict);
    }else {
        goog.object.extend(datadict, opt_attr_dict);
        this.adj(u).set(v,datadict);
        this.adj(v).set(u,datadict);
    }
};

/**
 * Add all the edges in ebunch.
 *
 * Adding the same edge twice has no effect but any edge data
 * will be updated when each duplicate edge is added.
 *
 * @param {jsnx.helper.Iterable} ebunch container of edges
 *      Each edge given in the container will be added to the
 *      graph. The edges must be given as as 2-tuples (u,v) or
 *      3-tuples (u,v,d) where d is a dictionary containing edge
 *      data.
 *
 * @param {Object=} opt_attr_dict
 *     Dictionary of edge attributes.  Key/value pairs will
 *     update existing data associated with each edge.
 * @export
 */
jsnx.classes.Graph.prototype.add_edges_from = function(ebunch, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }

    // process ebunch
    jsnx.helper.forEach(ebunch, function(e) {
        var ne = jsnx.helper.len(e), u, v, dd;
        if (ne === 3) {
            u = e[0];
            v = e[1];
            dd = e[2];
        }
        else if (ne === 2) {
            u = e[0];
            v = e[1];
            dd = {};
        }
        else {
            throw new jsnx.exception.JSNetworkXError(
                'Edge tuple ' + e.toString() + ' must be a 2-tuple or 3-tuple.'
            );
        }
        var dict = goog.object.clone(opt_attr_dict);
        goog.object.extend(dict,dd);
        this.add_edge(u,v,dict);
    }, this);
};


/**
 * Add all the edges in ebunch as weighted edges with specified weights.
 *
 *
 * Adding the same edge twice for Graph/DiGraph simply updates
 * the edge data.  For MultiGraph/MultiDiGraph, duplicate edges
 * are stored.
 *
 * Since JavaScript does not support keyword arguments, all attributes
 * must be passed in the attr object.
 *
 * @param {?} ebunch  container of edges
 *      Each edge given in the list or container will be added
 *      to the graph. The edges must be given as 3-tuples (u,v,w)
 *      where w is a number.
 *
 * @param {string=} opt_weight (default 'weight')
 *      The attribute name for the edge weights to be added.
 *
 * @param {Object=} opt_attr Edge attributes to add/update for all edges.
 *
 * @export
 */
jsnx.classes.Graph.prototype.add_weighted_edges_from = function(ebunch, opt_weight, opt_attr) {
    opt_attr = opt_attr || {};
    if (!goog.isString(opt_weight)) {
        opt_attr = opt_weight;
        opt_weight = 'weight';
    }

    this.add_edges_from(jsnx.helper.map(ebunch, function(e) {
        var attr = {};
        attr[opt_weight] = e[2];
        if(!goog.isDef(attr[opt_weight])) { // simulate too few value to unpack error
            throw new TypeError('Values must consist of three elements: ' + goog.json.serialize(e));
        }
        return [e[0], e[1], attr];
    }), opt_attr);
};


/**
 * Remove the edge between u and v.
 *
 * @param {jsnx.Node} u Node.
 * @param {jsnx.Node} v Node.
 *
 * @export
 */
jsnx.classes.Graph.prototype.remove_edge = function(u, v) {

    try {
        this.remove_edge_impl(u,v);
    }
    catch (e) {
        if (e instanceof TypeError) {
            throw new jsnx.exception.JSNetworkXError(
                'The edge ' + u + '-' + v + ' is not in the graph'
            );
        }
        throw e;
    }
};

/**
 * @protected
 */
jsnx.classes.Graph.prototype.remove_edge_impl = function(u, v) {


            this.adj(u).remove(v);
            if (u != v) {
                this.adj(v).remove(u);
            }
};


/**
 * Remove all edges specified in ebunch.
 *
 * Notes: Will fail silently if an edge in ebunch is not in the graph.
 *
 * @param {?} ebunch 1list or container of edge tuples
 *      Each edge given in the list or container will be removed
 *      from the graph. The edges can be:
 *          - 2-tuples (u,v) edge between u and v.
 *          - 3-tuples (u,v,k) where k is ignored.
 * @export
 */
jsnx.classes.Graph.prototype.remove_edges_from = function(ebunch) {
    jsnx.helper.forEach(ebunch, function(e) {
        var u = e[0], // ignore edge data if present
            v = e[1];
        if (this.has_edge(u,v)){
            this.remove_edge_impl(u,v);
        }
    }, this);
};


/**
 * Return True if the edge (u,v) is in the graph.
 *
 * @param {jsnx.Node} u Node.
 * @param {jsnx.Node} v Node.
 *
 * @return {boolean} True if edge is in the graph, False otherwise.
 * @export
 */
jsnx.classes.Graph.prototype.has_edge = function(u, v) {
    return this.has_node(u) && this.has_node(v) && this.adj(u).containsKey(v);
};

/**
 * Return a list of the nodes connected to the node n.
 *
 * @param {!jsnx.Node} n A node in the graph.
 *
 * @return {!Array} A list of nodes that are adjacent to n.
 * @export
 */
jsnx.classes.Graph.prototype.neighbors = function(n) {
    return goog.iter.toArray(this.neighbors_iter(n));
};


/**
 * Return an iterator over all neighbors of node n.
 *
 * @param {!jsnx.Node} n A node in the graph.
 *
 * @return {!goog.iter.Iterator} A list of nodes that are adjacent to n.
 * @export
 */
jsnx.classes.Graph.prototype.neighbors_iter = function(n) {
    if (!this.has_node(n)) {
        throw new jsnx.exception.JSNetworkXError(
            'The node ' + n + ' is not in the graph to retrieve.'
        );
    }
    return this.adj(n).getKeyIterator();
};


/**
 * Return a list of edges.
 *
 * Edges are returned as tuples with optional data
 * in the order (node, neighbor, data).
 *
 * Note: Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *
 * @param {?jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {?boolean=} opt_data Return two tuples (u,v) (False)
 *      or three-tuples (u,v,data) (True).
 *
 * @return {!Array} list of edge tuples
 *      Edges that are adjacent to any node in nbunch, or a list
 *      of all edges if nbunch is not specified.
 * @export
 */
jsnx.classes.Graph.prototype.edges = function(opt_nbunch, opt_data) {
    return goog.iter.toArray(this.edges_iter(opt_nbunch, opt_data));
};


/**
 * Return an iterator over the edges.
 *
 * Edges are returned as tuples with optional data
 * in the order (node, neighbor, data).
 *
 * Note: Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *
 * @param {?jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {?boolean=} opt_data Return two tuples (u,v) (False)
 *      or three-tuples (u,v,data) (True).
 *
 * @return {!goog.iter.Iterator} list of edge tuples
 *      Edges that are adjacent to any node in nbunch, or a list
 *      of all edges if nbunch is not specified.
 * @export
 */
jsnx.classes.Graph.prototype.edges_iter = function(opt_nbunch, opt_data) {
    // handle calls with data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
        opt_data = /** @type {boolean}*/ (opt_nbunch);
        opt_nbunch = null;
    }
    var visit = function(n,nbrd){
        return [n, nbrd[0]];
    };
    if (opt_data) {
        visit = function(n,nbrd){
            return [n, nbrd[0], nbrd[1]];
        };
    }
    return this.generate_edges_iter(visit,this.adjacency_iter(opt_nbunch));
};

/**
 * Return an iterator over the edges.
 * 
 * @param {!jsnx.NodeMap} edges A node map contain node maps of edges
 * 
 * @param {jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean=} opt_data Return two tuples (u,v) (False)
 *      or three-tuples (u,v,data) (True).
 *
 * @return {!goog.iter.Iterator} list of edge tuples
 *      Edges that are adjacent to any node in nbunch, or a list
 *      of all edges if nbunch is not specified.
 * @private
 */
jsnx.classes.Graph.prototype.generate_edges_iter = function(visit,nbunch_iter) {

    var seen = this.newNodeMap_(), // helper dict to keep track of multiply stored edges
        n = null;

    
    var iterator = jsnx.helper.nested_chain(nbunch_iter, function(nd) {
            n = nd[0];
            var iterator = new goog.iter.Iterator(),
                iterable = nd[1].getEntryIterator();

            iterator.next = function() {
                try {
                    return iterable.next();
                }
                catch (e) {
                    if (e === goog.iter.StopIteration) {
                        // mark n as seen after iterating over all neighbors
                        seen.set(n,true);
                    }
                    throw e;
                }
            };

            return iterator;
        }, function(nbrd) {
            if (!seen.containsKey(nbrd[0])) {
                return visit(n, nbrd);
            }
        });
        return iterator;
};


/**
 * Return the attribute dictionary associated with edge (u,v).
 *
 * @param {jsnx.Node} u Node.
 * @param {jsnx.Node} v Node.
 * @param {T=} opt_default (default=null)
 *      Value to return if the edge (u,v) is not found.
 *
 * @return {(Object|T)} The edge attribute dictionary.
 * @template T
 * 
 * @export
 */
jsnx.classes.Graph.prototype.get_edge_data = function(u, v, opt_default) {
    if (!goog.isDef(opt_default)) {
        opt_default = null;
    }

    if (this.has_node(u)) {
        return this.adj(u).get(v, opt_default);
    }

    return opt_default;
};


/**
 * Return an adjacency list representation of the graph.
 *
 * The output adjacency list is in the order of G.nodes().
 * For directed graphs, only outgoing adjacencies are included.
 *
 * @return {!Array.<Array>} The adjacency structure of the graph as a
 *      list of lists.
 * @export
 */
jsnx.classes.Graph.prototype.adjacency_list = function() {
    return goog.iter.toArray(goog.iter.map(this.adjacency_iter(), 
            function(nd) {
                return nd[1].getKeys();
    }));
};

/**
 * 
 * @param adj
 * @param opt_nbunch
 * @returns
 * @protected
 */
jsnx.classes.Graph.prototype.generate_adjacency_iter = function(adj, opt_nbunch) {
    var iter = null;
    if (!goog.isDefAndNotNull(opt_nbunch)) {
        iter = adj.getEntryIterator();
    }
    else {
        if (!goog.isArray(opt_nbunch)&&!jsnx.helper.isIterator(opt_nbunch)){
            opt_nbunch = [opt_nbunch];
        }
        var missing = goog.array.filter(opt_nbunch,
                goog.functions.not(this.has_node),this);
        if (!goog.array.isEmpty(missing)){
            throw new jsnx.exception.JSNetworkXError(
                    'The nodes [' + missing.join(", ") + '] are not in the graph to retrieve.'
                );
        }
        iter = goog.iter.map(jsnx.helper.iter(opt_nbunch), function(n) {
            return [n, adj.get(n)];
        });
    }
    return iter;
};


/**
 * Return an iterator of (node, adjacency dict) tuples for all nodes.
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 *
 * @return {!goog.iter.Iterator} An array of (node, adjacency dictionary)
 *      for all nodes in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.adjacency_iter = function(opt_nbunch) {
    return this.generate_adjacency_iter(this.adj_,opt_nbunch);
};


/**
 * Return the degree of a node or nodes.
 *
 * The node degree is the number of edges adjacent to that node.
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
 *      A container of nodes.  The container will be iterated
 *      through once.
 *
 * @param {string=} opt_weight (default=None)
 *      The edge attribute that holds the numerical value used
 *      as a weight.  If null or not defined, then each edge has weight 1.
 *      The degree is the sum of the edge weights adjacent to the node.
 *
 * @return {!(number|Object)} A dictionary with nodes as keys and degree as
 * values or a number if a single node is specified.
 * @export
 */
jsnx.classes.Graph.prototype.degree = function(opt_nbunch, opt_weight) {
    if (goog.isDefAndNotNull(opt_nbunch) && this.has_node(opt_nbunch)) {
        // return a single node
        return /** @type {number} */ (this.degree_iter(
            opt_nbunch,
            opt_weight
        ).next()[1]);
    }
    else {
        var degreeHash = this.newNodeMap_();
        degreeHash.addAll(this.degree_iter(opt_nbunch, opt_weight));
        return degreeHash;
    }
};


/**
 * Return an array for (node, degree).
 *
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
 *       A container of nodes.  The container will be iterated
 *       through once.
 * @param {string=} opt_weight (default=None)
 *      The edge attribute that holds the numerical value used
 *      as a weight.  If null or not defined, then each edge has weight 1.
 *      The degree is the sum of the edge weights adjacent to the node.
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {!goog.iter.Iterator} of two-tuples of (node, degree).
 *
 * @export
 */
jsnx.classes.Graph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
    var nodes_nbrs = /** @type {goog.iter.Iterator} */ this.adjacency_iter(opt_nbunch),
        iterator;
    var accum = jsnx.classes.Graph.count_edges;
    
    if (opt_weight){
        accum = jsnx.classes.Graph.sum_weights;
    }
    iterator = /** @type {goog.iter.Iterator} */ goog.iter.map(nodes_nbrs, function(nd) {
        var n = nd[0], nbrs = nd[1], sum = 0;
        sum = accum(n, opt_weight)(sum, nbrs);
        return [ n, sum ];
    });
    return iterator;
};


/**
 * Remove all nodes and edges from the graph.
 * 
 * This also removes the name, and all graph, node, and edge attributes.
 * 
 * @export
 */
jsnx.classes.Graph.prototype.clear = function() {
    this.name('');
    this.adj_.clear();
    this.nodes_.clear();
    goog.object.clear(this['graph']);
};


/**
 * Return a copy of the graph.
 *
 * This makes a complete copy of the graph including all of the
 * node or edge attributes.
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
jsnx.classes.Graph.prototype.clone = function() {
    var G = new this.constructor(null, this.graph_);
    G.add_nodes_from(goog.iter.map(this.nodes_iter(true),
            function(item){
                return [item[0], jsnx.helper.deepcopy(item[1])];
    })); 
    G.add_edges_from(goog.iter.map(this.edges_iter(undefined,true),
            function(item){
                return [item[0], item[1], jsnx.helper.deepcopy(item[2])];
    })); 
    return G;
};

/**
 * @see jsnx.classes.Graph.prototype.clone
 * @return {!jsnx.Graph}
 * @export
 */
jsnx.classes.Graph.prototype.copy = jsnx.classes.Graph.prototype.clone;


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 * @export
 */
jsnx.classes.Graph.prototype.is_multigraph = function() {
    return false;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 * @export
 */
jsnx.classes.Graph.prototype.is_directed = function() {
    return false;
};


/**
 * Return a directed representation of the graph.
 *
 * This returns a "deepcopy" of the edge, node, and
 * graph attributes which attempts to completely copy
 * all of the data and references.
 *
 * This is in contrast to the similar D=DiGraph(G) which returns a
 * shallow copy of the data.
 *
 * @return {!jsnx.classes.DiGraph}
 * @export
 */
jsnx.classes.Graph.prototype.to_directed = function() {
    var G = new jsnx.classes.DiGraph(null,this.graph_);
    G.add_nodes_from(goog.iter.map(this.nodes_iter(true),
            function(item){
                return [item[0], jsnx.helper.deepcopy(item[1])];
    })); 
    G.add_edges_from(goog.iter.map(this.edges_iter(undefined,true),
            function(item){
                return [item[0], item[1], jsnx.helper.deepcopy(item[2])];
    })); 

    return G;
};


/**
 * Return an undirected copy of the graph.
 *
 * This returns a "deepcopy" of the edge, node, and
 * graph attributes which attempts to completely copy
 * all of the data and references.
 *
 * This is in contrast to the similar G=DiGraph(D) which returns a
 * shallow copy of the data.
 *
 * @return {!jsnx.classes.Graph}
 * @export
 */
jsnx.classes.Graph.prototype.to_undirected = function() {
    var G = new jsnx.classes.Graph(null,this.graph_);
    G.add_nodes_from(goog.iter.map(this.nodes_iter(true),
            function(item){
                return [item[0], jsnx.helper.deepcopy(item[1])];
    })); 
    G.add_edges_from(goog.iter.map(this.edges_iter(undefined,true),
            function(item){
                return [item[0], item[1], jsnx.helper.deepcopy(item[2])];
    })); 
    return G;
};


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * The graph, edge or node attributes just point to the original graph.
 * So changes to the node or edge structure will not be reflected in
 * the original graph while changes to the attributes will.
 *
 * To create a subgraph with its own copy of the edge/node attributes use:
 * jsnx.Graph(G.subgraph(nbunch))
 *
 * If edge attributes are containers, a deep copy can be obtained using:
 * G.subgraph(nbunch).copy()
 *
 * For an inplace reduction of a graph to a subgraph you can remove nodes:
 * G.remove_nodes_from(jsnx.array.filter(G.nodes(), function(n) {
 *      return jsnx.array.contains(nbunch, n);
 * }))
 *
 * @param {jsnx.NodeContainer} nbunch
 *      A container of nodes which will be iterated through once.
 *
 * @return {jsnx.classes.Graph}
 * @export
 */
jsnx.classes.Graph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);

    // create new graph and copy subgraph into it
    var H = new this.constructor(null,this.graph_);
    // copy node and attribute dictionaries
    // namespace shortcuts for speed
    var H_nodes = H.nodes_;
    var H_adj = H.adj_;
    var this_adj = this.adj_;

    // add nodes and edges (undirected method)
    goog.iter.forEach(bunch, function(n) {
        var Hnbrs = H.newNodeMap_();
        H_adj.set(n,Hnbrs);

        goog.iter.forEach(this_adj.get(n).getEntryIterator(),
            function(entry) {
                if (H_nodes.containsKey(entry[0])){
                // add both representations of edge: n-br and nbr-n
                Hnbrs.set(entry[0],entry[1]);
                H_adj.get(entry[0]).set(n,entry[1]);
            }});
    });

    goog.iter.forEach(H_adj.getKeyIterator(),function(n){
        H.add_node(n,this.node(n));        
    },this);

    return H;
};

/**
 * Return a list of nodes with self loops.
 *
 * A node with a self loop has an edge with both ends adjacent
 * to that node.
 *
 * @return {Array.<string>} A list of nodes with self loops.
 * @export
 */
jsnx.classes.Graph.prototype.nodes_with_selfloops = function() {
    return goog.iter.toArray(goog.iter.map(
        goog.iter.filter(this.adjacency_iter(), function(nd) {
            return nd[1].containsKey(nd[0]);
        }), function(nd) {
            return nd[0];
        }));
};


/**
 * Return a list of selfloop edges.
 *
 * A selfloop edge has the same node at both ends.
 *
 * @param {boolean=} opt_data (default=False)
 *      Return selfloop edges as two tuples (u,v) (data=False)
 *      or three-tuples (u,v,data) (data=True).
 *
 * @return {Array}  A list of all selfloop edges.
 * @export
 */
jsnx.classes.Graph.prototype.selfloop_edges = function(opt_data) {
    var visitor = function(nd){
        return [nd[0],nd[0]];
    };
    if (opt_data) {
        visitor = function(nd){
            var n = nd[0], nbrs = nd[1];
            return [n, n, nbrs.get(n)];
        };
    }
    return goog.iter.toArray(goog.iter.map(
            goog.iter.filter(this.adjacency_iter(), function(nd) {
                return nd[1].containsKey(nd[0]);
            }), visitor));

};


/**
 * Return the number of selfloop edges.
 *
 * A selfloop edge has the same node at both ends.
 *
 * @return {number} The number of selfloops.
 * @export
 */
jsnx.classes.Graph.prototype.number_of_selfloops = function() {
    return this.selfloop_edges().length;
};


/**
 * Return the number of edges.
 *
 * @param {string=} opt_weight The edge attribute that holds the numerical
 *      value used as a weight.  If not defined, then each edge has weight 1.
 *
 * @return {number} The number of edges of sum of edge weights in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.size = function(opt_weight) {
    var s = goog.math.sum.apply(null, 
            this.degree(null, opt_weight).getValues()) / 2;
    if (!goog.isDefAndNotNull(opt_weight)) {
        return Math.floor(s); // int(s)
    }
    else {
        return s; // no need to cast to float
    }
};


/**
 * Return the number of edges between two nodes.
 *
 * @param {!jsnx.Node=} u node.
 * @param {!jsnx.Node=} v node
 *       If u and v are specified, return the number of edges between
 *       u and v. Otherwise return the total number of all edges.
 *
 * @return {number} The number of edges in the graph.
 *      If nodes u and v are specified return the number of edges between
 *      those nodes.
 * @export
 */
jsnx.classes.Graph.prototype.number_of_edges = function(u, v) {
    if (!goog.isDefAndNotNull(u)) {
        return Math.floor(this.size());
    }
    if (this.has_edge(u,v)) {
        return 1;
    }
    else {
        return 0;
    }
};


/**
 * Add a star.
 *
 * The first node in nodes is the middle of the star.  It is connected
 * to all other nodes.
 *
 * @param {jsnx.NodeContainer} nodes A container of nodes.
 * @param {Object=} opt_attr  Attributes to add to every edge in star.
 * @export
 */
jsnx.classes.Graph.prototype.add_star = function(nodes, opt_attr) {
    var nlist = jsnx.helper.toArray(nodes),
        v = nlist[0],
        edges = jsnx.helper.map(goog.array.slice(nlist, 1), function(n) {
           return [v, n];
        });
    this.add_edges_from(edges, opt_attr);
};


/**
 * Add a path.
 *
 * @param {jsnx.NodeContainer} nodes A container of nodes.
 *      A path will be constructed from the nodes (in order)
 *      and added to the graph.
 * @param {Object=} opt_attr Attributes to add to every edge in path.
 * @export
 */
jsnx.classes.Graph.prototype.add_path = function(nodes, opt_attr) {
    var nlist = jsnx.helper.toArray(nodes),
        edges = goog.array.zip(goog.array.slice(nlist, 0, nlist.length - 1),
                               goog.array.slice(nlist, 1));
    this.add_edges_from(edges, opt_attr);
};


/**
 * Add a cycle.
 *
 * @param {jsnx.NodeContainer} nodes A container of nodes.
 *      A cycle will be constructed from the nodes (in order)
 *      and added to the graph.
 * @param {Object=} opt_attr  Attributes to add to every edge in cycle.
 * @export
 */
jsnx.classes.Graph.prototype.add_cycle = function(nodes, opt_attr) {
    var nlist = jsnx.helper.toArray(nodes);
    var edges = goog.array.zip(
      nlist,
      goog.array.concat(goog.array.slice(nlist, 1),[nlist[0]])
    );
    this.add_edges_from(edges, opt_attr);
};


/**
 * Return an iterator of nodes contained in nbunch that are
 * also in the graph.
 *
 * The nodes in nbunch are checked for membership in the graph
 * and if not are silently ignored.
 *
 * Notes
 * -----
 * When nbunch is an iterator, the returned iterator yields values
 * directly from nbunch, becoming exhausted when nbunch is exhausted.
 *
 * To test whether nbunch is a single node, one can use
 * "if(this.has_node(nbunch)", even after processing with this routine.
 *
 * If nbunch is not a node or a (possibly empty) sequence/iterator
 * or not defined, an Error is raised.
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch (default=all nodes)
 *      A container of nodes.  The container will be iterated
 *      through once.
 *
 * @return {!goog.iter.Iterator} An iterator over nodes in nbunch
 *      that are also in the graph.
 *      If nbunch is null or not defined, iterate over all nodes in the graph.
 * @export
 */
jsnx.classes.Graph.prototype.nbunch_iter = function(opt_nbunch) {
    var bunch;

    if (!goog.isDefAndNotNull(opt_nbunch)) { // include all nodes via iterator
        bunch = this.nodes_.getKeyIterator();
    }
    else if (this.has_node(opt_nbunch)) { // if nbunch is a single node
        bunch = jsnx.helper.iter([opt_nbunch]);
    }
    else { // if nbunch is a sequence of nodes
        bunch = jsnx.helper.iter(opt_nbunch);
    /**    var bunch_iter = function(nlist, adj) {
            var iterator = new goog.iter.Iterator(),
                iterable = jsnx.helper.nested_chain(nlist, function(n) {
                    if (adj.containsKey(n)) {
                        return n; // fix mismatch of numbers and strings
                    }
                });

            iterator.next = function() {
                try {
                    return iterable.next();
                }
                catch (e) {
                    // capture error for non-sequence/iterator nbunch.
                    if (e instanceof TypeError) {
                        throw new jsnx.exception.JSNetworkXError(
                            'nbunch is not a node or a sequence of nodes'
                        );
                    }
                    throw e;
                }
            };
            return iterator;
        };

        bunch = bunch_iter(opt_nbunch, this.adj_);
        */
        
    }
    return bunch;
};
/**
 * 
 * @return {!function}
 * @protected
 */
jsnx.classes.Graph.count_edges = function(n,opt_weight){return function(r,nbrs){
    r += (+nbrs.getCount());
    r += (+nbrs.containsKey(n));
    return r;
};
};

/**
 * 
 * @param nbrs
 * @param opt_weight
 * @return {function}
 * @protected
 */
jsnx.classes.Graph.sum_weights = function(n,opt_weight){return function(prev, nbrs){
        prev = goog.iter.reduce(nbrs.getValueIterator(),
                function(r,e){
                    return r + (+goog.object.get(e, 
                            opt_weight, 1));
                }, prev);
        prev += +(nbrs.containsKey(n) &&
                goog.object.get(nbrs.get(n), opt_weight, 1));
        return prev;
};
};

