'use strict';
goog.provide('jsnx.classes.DiGraph');

goog.require('goog.object');
goog.require('jsnx.convert');
goog.require('jsnx.exception');
goog.require('jsnx.classes.Graph');
goog.require('jsnx.classes.HashMap');

/**
 * Base class for directed graphs.
 *
 * A DiGraph stores nodes and edges with optional data, or attributes.
 *
 * DiGraphs hold directed edges.  Self loops are allowed but multiple
 * (parallel) edges are not.
 *
 * Nodes can be arbitrary (hashable) Python objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.MultiGraph
 * @see jsnx.classes.MultiDiGraph
 *
 * @param {?=} opt_data 
 *      Data to initialize graph.  If data=None (default) an empty
 *      graph is created.  The data can be an edge list, or any
 *      NetworkX graph object.
 *
 * @param {Object=} opt_attr 
 *       Attributes to add to graph as key=value pairs.
 *
 * WARNING: If only {@code opt_attr} is provided, it will be interpreted as
 * {@code opt_data}, since both arguments can be of the same type. Hence you
 * have to pass {@code null} explicitly:
 *
 * var G = new jsnx.DiGraph(null, {name: 'test'});
 *
 * @extends jsnx.classes.Graph
 * @constructor
 * @export
 */
jsnx.classes.DiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.DiGraph)) {
        return new jsnx.classes.DiGraph(opt_data, opt_attr);
    }
    // load graph attributes (must be afte convert)
    goog.object.extend(this.graph_, opt_attr || {});

    this.graph_ = {}; // dictionary for graph attributes
    this.nodes_ = this.newNodeMap_(); // dictionary for node attributes
    // We store two adjacency lists:
    // the  predecessors of node n are stored in the dict self.pred
    // the successors of node n are stored in the dict self.succ=self.adj
    this.adj_ = this.newNodeMap_();  // empty adjacency dictionary
    this.pred_ = this.newNodeMap_(); // predecessor
    this.succ_ = this.adj_; // successor

    //attempt to load graph with data
    if(goog.isDefAndNotNull(opt_data)) {
        jsnx.convert.to_networkx_graph(opt_data, this);
    }
};
goog.exportSymbol('jsnx.DiGraph', jsnx.classes.DiGraph);
goog.inherits(jsnx.classes.DiGraph, jsnx.classes.Graph);


/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.DiGraph['__name__'] = 'DiGraph';


/**
 * @type {!jsnx.NodeMap}
 */
jsnx.classes.DiGraph.prototype.pred_ = null;


/**
 * @type {!jsnx.NodeMap}
 */
jsnx.classes.DiGraph.prototype.succ_ = null;


/**
 * @return {!jsnx.NodeMap}
 */
jsnx.classes.DiGraph.prototype.pred = function(n){
    if (goog.isDefAndNotNull(n)){
        return this.pred_.get(n);
    }else{
        return this.pred_;
    }
};


/**
 * @type {!Object}
 */
jsnx.classes.DiGraph.prototype.succ = function(n){
    if (goog.isDefAndNotNull(n)){
        return this.succ_.get(n);
    }else{
        return this.succ_;
    }
};


/**
 * @protected
 * @override
 */
jsnx.classes.DiGraph.prototype.add_node_impl = function(n, opt_attr_dict) {

    if (goog.isDefAndNotNull(opt_attr_dict)){
        opt_attr_dict = {};
    }
    if(!this.nodes_.containsKey(n)) {
        this.succ_.set(n,this.newNodeMap_());
        this.pred_.set(n,this.newNodeMap_());
        this.nodes_.set(n,opt_attr_dict);
    }
    else { // update attr even if node already exists
        goog.object.extend(this.node(n), opt_attr_dict);
    }
};


/**
 * Remove node n.
 *
 * Removes the node n and all adjacent edges.
 * Attempting to remove a non-existent node will raise an exception.
 *
 * @see #remove_nodes_from
 *
 * @param {jsnx.Node} n  A node in the graph
 *
 * @override
 * @protected
 */
jsnx.classes.DiGraph.prototype.remove_node_impl = function(n) {
    goog.iter.forEach(this.successors_iter(n), function(u) {
        this.pred(u).remove(n); // remove all edges n-u in digraph
    }, this);
    this.succ_.remove(n); // remove node from succ
    goog.iter.forEach(this.predecessors_iter(n), function(u) {
        this.succ(u).remove(n); // remove all edges u-n in digraph
    }, this);
    this.pred_.remove(n); // remove node from pred

    this.nodes_.remove(n);
};



/**
 * Add an edge between u and v.
 *
 * The nodes u and v will be automatically added if they are
 * not already in the graph.
 * 
 * Edge attributes can be specified with keywords or by providing
 * a dictionary with key/value pairs.
 *
 * @see #add_edges_from
 *
 * Note: Adding an edge that already exists updates the edge data.
 * 
 *       Many NetworkX algorithms designed for weighted graphs use as
 *       the edge weight a numerical value assigned to a keyword
 *       which by default is 'weight'.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 * @param {Object=} opt_attr_dict Dictionary of edge attributes.
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @protected
 */
jsnx.classes.DiGraph.prototype.add_edge_impl = function(u, v, opt_attr_dict) {
    opt_attr_dict = opt_attr_dict || {};

    // add nodes
    this.add_node(u);
    this.add_node(v);

    var edges = this.succ(u);
    var datadict = {};
    // add the edge
    if (edges.containsKey(v)){
        datadict = edges.get(v);
        goog.object.extend(datadict, opt_attr_dict);
    }else {
        goog.object.extend(datadict, opt_attr_dict);
        this.succ(u).set(v,datadict);
        this.pred(v).set(u,datadict);
    }
};

/**
 * 
 * @param u
 * @param v
 * @protected
 * @override
 */
jsnx.classes.DiGraph.prototype.remove_edge_impl = function(u, v) {
    if (this.has_node_(u) && this.has_node_(v)) {
        this.succ(u).remove(v);
        this.pred(v).remove(u);
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
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.remove_edges_from = jsnx.classes.Graph.prototype.remove_edges_from;


/**
 * Return True if node u has successor v.
 *
 * This is true if graph has the edge u->v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has successor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_successor = function(u, v) {
    return this.has_node(u) &&
            this.succ(u).containsKey(v);
};


/**
 * Return True if node u has predecessor v.
 *
 * This is true if graph has the edge u<-v.
 *
 * @param {jsnx.Node} u Node
 * @param {jsnx.Node} v Node
 *
 * @return {boolean} True if node u has predecessor v
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.has_predecessor = function(u, v) {
    return this.has_node(u) &&
            this.pred(u).containsKey(v);
};


/**
 * Return an iterator over successor nodes of n.
 *
 * {@code neighbors_iter()} and {@code successors_iter()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors_iter = jsnx.classes.Graph.prototype.neighbors_iter;


/**
 * Return an iterator over predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!goog.iter.Iterator} Iterator over predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors_iter = function(n) {
    if(!this.has_node(n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }

    return this.pred(n).getKeyIterator();
};


/**
 * Return a list of successor nodes of n.
 *
 * {@code neighbors()} and {@code successors()} are the same.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of successor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.successors = jsnx.classes.Graph.prototype.neighbors;


/**
 * Return list of predecessor nodes of n.
 *
 * @param {jsnx.Node} n Node
 *
 * @return {!Array} List of predecessor nodes of n
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.predecessors = function(n) {
    if(!this.has_node(n)) {
        throw new jsnx.exception.JSNetworkXError(
             'The node ' + n + ' is not in the digraph.'
        );
    }
    return this.pred(n).getKeys();
};


// digraph definitions
/**
 * @see #successors
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors = jsnx.classes.Graph.prototype.neighbors;

/**
 * @see #successors_iter
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.neighbors_iter = jsnx.classes.Graph.prototype.neighbors_iter;


jsnx.classes.DiGraph.prototype.edges_iter = function(opt_nbunch, opt_data) {
    return this.generate_edges_iter(opt_nbunch,opt_data,true,false);
};
/**
 * @see #edges_iter
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges_iter = jsnx.classes.DiGraph.prototype.edges_iter;


/**
 * @see jsnx.Graph#edges
 * @export
 */
jsnx.classes.DiGraph.prototype.out_edges = jsnx.classes.Graph.prototype.edges;



/**
 * Return an iterator of (node, adjacency dict) tuples for all nodes.
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 *      
 * @param {boolean=} opt_pred If true, returns predecessor node map
 *       
 * @param {boolean=} opt_succ If true, returns successor node map
 *
 * @return {!goog.iter.Iterator} An array of (node, edge_dictionary) or
 *      if both predecessors and successors are requested, 
 *      (node, [outgoing_dictionary, incoming_dictionary])
 *      for all nodes in the graph.
 * @export
 */
jsnx.classes.DiGraph.prototype.adjacency_iter = function(opt_nbunch, 
        opt_pred,opt_succ) {
    var iter = null;
    var include_pred = false, include_succ = true;
    if (goog.isDefAndNotNull(opt_pred)) {
        include_pred = opt_pred;
    } 
    if (goog.isDefAndNotNull(opt_succ)){
        include_succ = opt_succ;
    }
    if (include_pred) {// only predecessors
        iter = this.generate_adjacency_iter(this.pred_,opt_nbunch);
        if (include_succ) { // both
            iter = jsnx.helper.zip(iter,
                    this.generate_adjacency_iter(this.succ_,opt_nbunch));
        }
    } else {
        if (include_succ) { // only successors
            iter = this.generate_adjacency_iter(this.succ_,opt_nbunch);
        }else {
            
        }
        
    }
    return iter;
};


/**
 * Return an iterator over the incoming edges.
 *
 * @see #edges_iter
 *
 * 
 * @param {?jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {?boolean=} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!goog.iter.Iterator} An iterator of (u,v) or (u,v,d) tuples of 
 *      incoming edges.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges_iter = function(opt_nbunch, opt_data) {
    return this.generate_edges_iter(opt_nbunch,opt_data,true,false);
};

/**
 * 
 * @private
 */
jsnx.classes.DiGraph.prototype.generate_edges_iter = function(opt_nbunch, 
        opt_data, opt_pred, opt_succ) {
    // handle calls with opt_data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
        opt_data = /** @type {boolean} */ (opt_nbunch);
        opt_nbunch = null;
    }
    var include_pred = false, include_succ = true;
    if (goog.isDefAndNotNull(opt_pred)) {
        include_pred = opt_pred;
    } 
    if (goog.isDefAndNotNull(opt_succ)){
        include_succ = opt_succ;
    }
    
    if (include_pred && include_succ){
        throw new Error("Why are you iterating over both directions?");
    }
    
    var visit;
    if (opt_data) {
        if (include_succ) {
            visit = function(n, nbrd) {
                return [ n, nbrd[0], nbrd[1] ];
            };
        } else {
            visit = function(n, nbrd) {
                return [ nbrd[0], n, nbrd[1] ];
            };
        }
    } else {
        if (include_succ) {
            visit = function(n, nbrd) {
                return [ n, nbrd[0] ];
            };
        } else {
            visit = function(n, nbrd) {
                return [ nbrd[0], n ];
            };
        }
    }
    
    var n = null;

    var nodes_nrbs = this.adjacency_iter(opt_nbunch, include_pred,include_succ);
    
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            if (include_succ && include_pred){
                n = nd[0][0]
                return goog.iter.chain.apply(this,goog.array.map(nd,
                        function(nadj){
                            return nadj[1].getEntryIterator();
                }));
            }else {
                return nd[1].getEntryIterator();
            }
        }, function(nbrd) {
            visit(n,nbrd);
        });
};


/**
 * Return a list of the incoming edges.
 *
 * @see #edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {boolean} opt_data  
 *      If True, return edge attribute dict in 3-tuple (u,v,data).
 *
 * @return {!Array} A list of incoming edges
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_edges = function(opt_nbunch, opt_data) {
    return goog.iter.toArray(this.in_edges_iter(opt_nbunch, opt_data));
};


/**
 * Return an iterator for (node, degree).
 *
 * The node degree is the number of edges adjacent to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
 * @see #out_degree_iter
 *
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {!goog.iter.Iterator}  The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
    return this.generate_degree_iter(opt_nbunch,opt_weight, true, true);
};


/**
 * Return an iterator for (node, in-degree).
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #out_degree_iter
 *
 * @param {(jsnx.Node|jsnx.NodeContainer)=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, in-degree).
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree_iter = function(opt_nbunch, opt_weight) {
    return this.generate_degree_iter(opt_nbunch,opt_weight,true,false);
};
/**
 * 
 * @param {Array.<jsnx.NodeMap>} edges_arr An array of NodeMap edge maps
 * @param {jsnx.NodeContainer} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, in-degree).
 *
 */
jsnx.classes.DiGraph.prototype.generate_degree_iter = function(opt_nbunch,
        opt_weight, opt_pred, opt_succ) {
    var nodes_nbrs = null;
    var include_pred = false, include_succ = true;
    if (goog.isDefAndNotNull(opt_pred)) {
        include_pred = opt_pred;
    } 
    if (goog.isDefAndNotNull(opt_succ)){
        include_succ = opt_succ;
    }
    
    node_nbrs = this.adjacency_iter(opt_nbunch, include_pred, include_succ);
    
    var gen_accum = jsnx.classes.Graph.count_edges;
    if(opt_weight) {
        gen_accum = jsnx.classes.Graph.sum_weights;
    }
    return goog.iter.map(nodes_nbrs, function(nd) {
            var sum = 0, n;
            var accum = gen_accum(nd[0], opt_weight);
            if (include_pred && include_succ){ // edge data is an array of tuples
                n = nd[0][0];
                sum = accum(0, nd[0][1]) + accum(0, nd[1][1]);
            }else {
                n = nd[0]
                sum = accum(sum,nd[1]);
            }
            return [n, sum];
        });
    
};


/**
 * Return an iterator for (node, out-degree).
 *
 * The node out-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #in_degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, out-degree).
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree_iter = function(opt_nbunch, opt_weight) {
    return this.generate_degree_iter(opt_nbunch,opt_weight, false, true);
};


/**
 * Return the in-degree of a node or nodes.
 *
 * The node in-degree is the number of edges pointing in to the node.
 *
 * @see #degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {(number|Object)}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.in_degree = function(opt_nbunch, opt_weight) {
    if(goog.isDefAndNotNull(opt_nbunch) && this.has_node(opt_nbunch)) { 
        // return a single node
        return /** @type {number} */ (this.in_degree_iter(opt_nbunch, opt_weight).next()[1]);
    }
    else {
        var map = this.newNodeMap_();
        map.addAll(this.in_degree_iter(opt_nbunch, opt_weight));
        return map;
    }
};


/**
 * Return the out-degree of a node or nodes.
 *
 * The node out-degree is the number of edges pointing out of the node.
 *
 * @see #degree
 * @see #out_degree
 * @see #in_degree_iter
 *
 *
 * @param {jsnx.NodeContainer=} opt_nbunch  A container of nodes.
 *       The container will be iterated through once.
 *
 * @param {string=} opt_weight 
 *       The edge attribute that holds the numerical value used 
 *       as a weight.  If None, then each edge has weight 1.
 *       The degree is the sum of the edge weights adjacent to the node.
 *
 *
 * WARNING: Since both parameters are optional, and the weight attribute
 * name could be equal to a node name, nbunch as to be set to null explicitly
 * to use the second argument as weight attribute name.
 *
 * @return {(number|Object)}
 *       A dictionary with nodes as keys and in-degree as values or
 *       a number if a single node is specified.
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.out_degree = function(opt_nbunch, opt_weight) {
    if(goog.isDefAndNotNull(opt_nbunch) && this.has_node(opt_nbunch)) {
        // return a single node
        return /** @type {number} */ (this.out_degree_iter(opt_nbunch, opt_weight).next()[1]);
    }
    else {
        var map = this.newNodeMap_();
        map.addAll(this.out_degree_iter(opt_nbunch, opt_weight));
        return map;
    }
};


/**
 * Remove all nodes and edges from the graph.
 *
 * This also removes the name, and all graph, node, and edge attributes.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.clear = function() {
    this.succ_.clear();
    this.pred_.clear();
    this.nodes_.clear();
    goog.object.clear(this.graph_);
};


/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_multigraph = function() {
    return false;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.is_directed = function() {
    return true;
};


/**
 * Return a directed copy of the graph.
 *
 * Notes:
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar D = new DiGraph(G) which returns a
 *      shallow copy of the data.
 *
 * @return {!jsnx.classes.DiGraph} A deepcopy of the graph
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.to_directed = function() {
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
 * Return an undirected representation of the digraph.
 *
 * Notes:
 *
 * If edges in both directions (u,v) and (v,u) exist in the
 * graph, attributes for the new undirected edge will be a combination of
 * the attributes of the directed edges.  The edge data is updated
 * in the (arbitrary) order that the edges are encountered.  For
 * more customized control of the edge attributes use add_edge().
 *
 * This returns a "deepcopy" of the edge, node, and
 * graph attributes which attempts to completely copy
 * all of the data and references.
 *
 * This is in contrast to the similar G=DiGraph(D) which returns a
 * shallow copy of the data.
 *
 * @param {boolean=} opt_reciprocal 
 *      If True only keep edges that appear in both directions 
 *      in the original digraph. 
 *
 * @return {!jsnx.classes.Graph} 
 *      An undirected graph with the same name and nodes and
 *      with edge (u,v,data) if either (u,v,data) or (v,u,data)
 *      is in the digraph.  If both edges exist in digraph and
 *      their edge data is different, only one edge is created
 *      with an arbitrary choice of which edge data to use.
 *      You must check and correct for this manually if desired.
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.to_undirected = function(opt_reciprocal) {
    var H = new jsnx.classes.Graph();
    H.name(this.name());
    // Need to iter.map to make the deep copy
    H.add_nodes_from(goog.iter.map(this.nodes_iter(true),function(n){
        return [n[0],jsnx.helper.deepcopy(n[1])];
    }));

    var edge_iter;
    if(opt_reciprocal) {
        edge_iter = goog.iter.filter(this.edges_iter(true), 
                function(nd) {
            return this.has_edge(nd[1],nd[0]);
        }, this);
    }
    else {
         edge_iter = this.edges_iter(true);
    }
    // Need to iter.map to make the deep copy
    H.add_edges_from(goog.iter.map(edge_iter,function(edge){
        return [edge[0],edge[1],jsnx.helper.deepcopy(edge[2])];
    }));

    H.graph_ = jsnx.helper.deepcopy(this.graph_);
    return H;
};


/**
 * Return the reverse of the graph.
 *
 * The reverse is a graph with the same nodes and edges
 * but with the directions of the edges reversed.
 *
 * @param {boolean=} opt_copy (default=True)
 *      If True, return a new DiGraph holding the reversed edges.
 *      If False, reverse the reverse graph is created using
 *      the original graph (this changes the original graph).
 *
 * @return {!jsnx.classes.DiGraph} A copy of the graph or the graph itself
 *
 * @export
 */
jsnx.classes.DiGraph.prototype.reverse = function(opt_copy) {
    opt_copy = !goog.isDef(opt_copy) || opt_copy;
    
    /** @type {jsnx.DiGraph}*/
    var H;

    if(opt_copy) {
        H = new this.constructor(null, {name: 'Reverse of (' + this.name() + ')'});
        H.add_nodes_from(goog.iter.map(this.nodes_iter(true),function(n){
            return [n[0],jsnx.helper.deepcopy(n[1])];
        }));
        H.add_edges_from(goog.iter.map(this.edges_iter(true), function(ed) {
            return [ed[1], ed[0], jsnx.helper.deepcopy(ed[2])];
        }));
        H.graph_ = jsnx.helper.deepcopy(this.graph_);
    }
    else {
        var this_pred = this.pred_,
            this_succ = this.succ_;

        this.succ_ = this_pred;
        this.pred_ = this_succ;
        this.adj_ = this.succ_;
        H = this;
    }
    return H;
};


/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * Notes:
 *
 * The graph, edge or node attributes just point to the original graph.
 * So changes to the node or edge structure will not be reflected in
 * the original graph while changes to the attributes will.
 *
 * To create a subgraph with its own copy of the edge/node attributes use:
 * nx.Graph(G.subgraph(nbunch))
 *
 * If edge attributes are containers, a deep copy can be obtained using:
 * G.subgraph(nbunch).copy()
 *
 * For an inplace reduction of a graph to a subgraph you can remove nodes:
 * G.remove_nodes_from([ n in G if n not in set(nbunch)])
 *
 * @param {jsnx.NodeContainer} nbunch  
 *      A container of nodes which will be iterated through once.
 *
 * @return {jsnx.classes.DiGraph} A subgraph of the graph with the same edge attributes.
 *
 *
 * @override
 * @export
 */
jsnx.classes.DiGraph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor(this.opts_),
        // namespace shortcuts for speed
        H_succ = H.succ_,
        H_nodes = H.nodes_,
        H_pred = H.pred_,
        this_succ = this.succ_;

    // add edges
    goog.iter.forEach(bunch, function(entry) {
        var u = entry[0],Hnbrs = H.newNodeMap_();
        H_succ.set(u, Hnbrs);
        goog.iter.forEach(this_succ.get(u).getEntryIterator(), 
                function(edge) {
            var v = edge[0];
            if(H_succ.containsKey(v)) {
                // add both representations of edge: u-v and v-u
                Hnbrs.set(v, edge[1]);
                H_pred.get(v).set(u,edge[1]);
            }
        });
    });

    goog.iter.forEach(H_adj.getKeyIterator(),function(n){
        H.add_node(n,this.node(n));        
    },this);

    return H;
};
