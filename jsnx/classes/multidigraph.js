/*jshint strict:false*/
goog.provide('jsnx.classes.MultiDiGraph');

goog.require('goog.object');
goog.require('goog.iter');
goog.require('jsnx.classes.DiGraph');
goog.require('jsnx.classes.MultiGraph');
goog.require('jsnx.helper');
goog.require('jsnx.exception');

/**
 * A directed graph class that can store multiedges.
 *
 * Multiedges are multiple edges between two nodes.  Each edge
 * can hold optional data or attributes.
 *
 * Nodes can be arbitrary (hashable) objects with optional
 * key/value attributes.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.DiGraph
 * @see jsnx.classes.MultiGraph
 *
 * @param {?=} opt_data Data to initialize graph.
 *         If data=None (default) an empty graph is created.  
 *         The data can be an edge list, or any NetworkX graph object. 
 * @param {Object=} opt_attr Attributes to add to graph as key=value pairs.
 *
 * @extends jsnx.classes.DiGraph
 * @borrows jsnx.classes.MultiGraph
 *
 * @constructor
 * @export
 */
jsnx.classes.MultiDiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if(!(this instanceof jsnx.classes.MultiDiGraph)) {
        return new jsnx.classes.MultiDiGraph(opt_data, opt_attr);
    }

    goog.base(this, opt_data, opt_attr);
};
goog.inherits(jsnx.classes.MultiDiGraph, jsnx.classes.DiGraph);
jsnx.helper.mixin(jsnx.classes.MultiDiGraph.prototype, jsnx.classes.MultiGraph.prototype);

goog.exportSymbol('jsnx.MultiDiGraph', jsnx.classes.MultiDiGraph);

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.MultiDiGraph['__name__'] = 'MultiDiGraph';


jsnx.classes.MultiDiGraph.prototype.add_node_impl= function(n, opt_attr_dict){
    if(!this.has_node(n)) {
        this.succ_.set(n, this.newNodeMap_());
        this.pred_.set(n, this.newNodeMap_());
        this.nodes_.set(n, opt_attr_dict);
    }
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
 * Notes:
 *
 * To replace/update edge data, use the optional key argument
 * to identify a unique edge.  Otherwise a new edge will be created.
 *
 * NetworkX algorithms designed for weighted graphs cannot use
 * multigraphs directly because it is not clear how to handle
 * multiedge weights.  Convert to Graph using edge attribute
 * 'weight' to enable weighted graph algorithms.

 *
 * @see #add_edges_from
 *
 * @param {jsnx.Node} u
 * @param {jsnx.Node} v
 * @param {?(number|string)=} opt_key identifier
 *      Used to distinguish multiedges between a pair of nodes. Default is
 *      the lowest unused integer.
 * @param {?Object=} opt_attr_dict  Dictionary of edge attributes.  
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.add_edge = function(u, v, opt_key, opt_attr_dict) {
    var datadict, keydict;

    if(goog.isDefAndNotNull(opt_key) && !(goog.isString(opt_key) || goog.isNumber(opt_key))) {
        opt_attr_dict = /** @type {Object} */ (opt_key);
        opt_key = null;
    }

    // set up attribute dict
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
            'The attr_dict argument must be an object.'
        );
    }
    this.add_edge_impl(u,v,opt_key,opt_attr_dict);
};

jsnx.classes.MultiDiGraph.prototype.add_edge_impl = function(u, v, opt_key, opt_attr_dict) {
    // add nodes
    this.add_node(u);
    this.add_node(v);
    if(this.has_edge(u, v)) {
        keydict = this.adj(u).get(v);
        if(!goog.isDefAndNotNull(opt_key)) {
            // find a unique integer key
            // other methods might be better here?
            opt_key = keydict.getCount();
            while(keydict.containsKey(opt_key)) {
                opt_key += 1;
            }
        }
        datadict = keydict.get(opt_key, {});
        goog.object.extend(datadict, opt_attr_dict);
        keydict.set(opt_key, datadict);
    }
    else {
        // selfloops work this way without special treatment
        if(!goog.isDefAndNotNull(opt_key)) {
            opt_key = 0;
        }
        datadict = {};
        goog.object.extend(datadict, opt_attr_dict);
        keydict = this.newEdgeMap_();
        keydict.set(opt_key, datadict);
        this.succ(u).set(v, keydict);
        this.pred(v).set(u, keydict);
    }
};

/**
 * Remove an edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u
 * @param {jsnx.Node} v
 * @param {(number|string)=} opt_key
 *      Used to distinguish multiple edges between a pair of nodes.
 *      If null or undefined remove a single (abritrary) edge between u and v.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.remove_edge = function(u, v, opt_key) {
    if(!this.has_node(u) ||
       !this.has_edge(u, v)) {
        throw new jsnx.exception.JSNetworkXError(
            'The edge ' + u + '-' + v + ' is not in the graph to remove'
        );
    }
    this.remove_edge_impl(u,v,opt_key);
};

jsnx.classes.MultiDiGraph.prototype.remove_edge_impl = function(u, v, opt_key) {
    var d = this.succ(u).get(v);

    // remove the edge with specified data
    if(!goog.isDefAndNotNull(opt_key)) {
        d.remove(d.getKeyIterator().next());
    }
    else {
        if(!d.containsKey(opt_key)) {
            throw new jsnx.exception.JSNetworkXError(
                'The edge ' + u + '-' + v + ' with key ' + opt_key + ' is not in the graph to remove'
            );
        }
        d.remove(opt_key);
    }
    if(d.getCount() === 0) {
        // remove the key entries if last edge
        this.succ(u).remove(v);
        this.pred(v).remove(u);
    }
};


/**
 * 
 * @override
 * @protected
 */
jsnx.classes.MultiDiGraph.prototype.generate_edges_iter = function(opt_nbunch, 
        opt_data, opt_keys, opt_pred, opt_succ) {
    // handle calls with opt_data being the only argument
    if (goog.isBoolean(opt_nbunch)) {
        opt_data = opt_nbunch;
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
        if (opt_keys) {
            if (include_succ) {
                visit = function(n, nbr, edge) {
                    return [ n, nbr, edge[0], edge[1] ];
                };
            } else {
                visit = function(n, nbr, edge) {
                    return [ nbr, n, edge[0], edge[1] ];
                };
            }
        } else {
            if (include_succ) {
                visit = function(n, nbr, edge) {
                    return [ n, nbr, edge[1] ];
                };
            } else {
                visit = function(n, nbr, edge) {
                    return [ nbr, n, edge[1] ];
                };
            }
        }
    } else {
        if (opt_keys) {
            if (include_succ) {
                visit = function(n, nbr, edge) {
                    return [ n, nbr, edge[0] ];
                };
            } else {
                visit = function(n, nbr, edge) {
                    return [ nbr, n, edge[0] ];
                };
            }
        } else {
            if (include_succ) {
                visit = function(n, nbr, edge) {
                    return [ n, nbr ];
                };
            } else {
                visit = function(n, nbr, edge) {
                    return [ nbr, n];
                };
            }
        }
    }
    
    var n = null, nbr = null;

    var nodes_nrbs = this.adjacency_iter(opt_nbunch, include_pred,include_succ);
    
        return jsnx.helper.nested_chain(nodes_nrbs, function(nd) {
            n = nd[0];
            return nd[1].getEntryIterator();
        }, function(nbrd) {
            nbr = nbrd[0];
            return nbrd[1].getEntryIterator();
        }, function(edgedata){
            return visit(n,nbr,edgedata);
        });
};


/**
 * Return an iterator over edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *       For directed graphs edges() is the same as out_edges().
 *
 * @see #edges
 *
 * @param {jsnx.NodeContainer=} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean=} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean=} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.edges_iter = function(opt_nbunch, opt_data,
        opt_keys) {
    return this.generate_edges_iter(opt_nbunch, opt_data, opt_keys, false, true);
};


/**
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_edges_iter = jsnx.classes.MultiDiGraph.prototype.edges_iter;


/**
 * Return a list of the outgoing edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *      Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *      For directed graphs edges() is the same as out_edges().
 *
 * @see #in_edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {Array}
 *      A list of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_edges = function(opt_nbunch, opt_data, opt_keys) {
    return goog.iter.toArray(this.out_edges_iter(opt_nbunch, opt_data, opt_keys));
};


/**
 * Return an iterator over the incoming edges.
 *
 * @see #edges_iter
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.in_edges_iter = function(opt_nbunch, 
        opt_data, opt_keys) {
    return this.generate_edges_iter(opt_nbunch,opt_data,opt_keys,true,false);
};


/**
 * Return an iterator over the outgoing edges.
 *
 * @see #edges_iter
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {goog.iter.Iterator}
 *      An iterator of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_edges_iter = function(opt_nbunch, 
        opt_data, opt_keys) {
    return this.generate_edges_iter(opt_nbunch,opt_data,opt_keys,false,true);
};

/**
 * Return a list of the incoming edges.
 *
 * @see #in_edges
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      If True, return edge attribute dict with each edge.
 * @param {boolean} opt_keys (default=False)
 *      If True, return edge keys with each edge.
 *
 * @return {!Array}
 *      A list  of (u,v), (u,v,d) or (u,v,key,d) tuples of edges.
 *
 * @override
 * @export
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.in_edges = function(opt_nbunch, opt_data, opt_keys) {
    return goog.iter.toArray(this.in_edges_iter(opt_nbunch, opt_data, opt_keys));
};


jsnx.classes.MultiDiGraph.prototype.generate_degree_iter = function(opt_nbunch, 
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
    
    var gen_accum = jsnx.classes.MultiGraph.count_edges;
    if(opt_weight) {
        gen_accum = jsnx.classes.MultiGraph.sum_weights;
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
 * Return an iterator for (node, degree).
 *
 * The node degree is the number of edges adjacent to the node.
 *
 * @see #degree
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
 * @suppress {checkTypes}
 */
jsnx.classes.MultiDiGraph.prototype.degree_iter = jsnx.classes.DiGraph.prototype.degree_iter;

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
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.in_degree_iter = jsnx.classes.DiGraph.prototype.id_degree_iter;


/**
 * Return an iterator for (node, out-degree).
 *
 * The node out-degree is the number of edges pointing out of the node.
 *
 * @see #degree
 * @see #in_degree
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
 * @return {goog.iter.Iterator}  The iterator returns two-tuples of (node, out-degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.out_degree_iter = jsnx.classes.DiGraph.prototype.out_degree_iter;

/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.is_multigraph = function() {
    return true;
};


/**
 * Return True if graph is directed, False otherwise.
 *
 * @return {boolean}  True if graph is directed, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.is_directed = function() {
    return true;
};


/**
 * Return a directed copy of the graph.
 *
 * Notes:
 *
 *      If edges in both directions (u,v) and (v,u) exist in the
 *      graph, attributes for the new undirected edge will be a combination of
 *      the attributes of the directed edges.  The edge data is updated
 *      in the (arbitrary) order that the edges are encountered.  For
 *      more customized control of the edge attributes use add_edge().
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar G=DiGraph(D) which returns a
 *      shallow copy of the data.
 *
 * @return {!jsnx.classes.MultiDiGraph} A deepcopy of the graph
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.to_directed = function() {
    return jsnx.helper.deepcopy_instance(this);
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
 * @return {!jsnx.classes.MultiGraph} 
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
jsnx.classes.MultiDiGraph.prototype.to_undirected = function(opt_reciprocal) {
    var H = new jsnx.classes.MultiGraph();
    H.graph_ = jsnx.helper.deepcopy(this.graph_);
    // H.name(this.name()); // this is redundant
    H.add_nodes_from(this.nodes_iter(true));

    var u, v;

    if(opt_reciprocal) {
        goog.iter.forEach(this.edges_iter(null, true, true), 
                function(entry) {
                    if (self.has_edge(entry[0], entry[1], entry[2])){
                        N.add_edge_(entry[0],entry[1], entry[2],
                                jsnx.helper.deepcopy(entry[3]));
                    }});
    }
    else {
        H.add_edges_from(goog.iter.map(this.edges_iter(null,true,true), 
                function(entry) {
                    return [entry[0],entry[1], entry[2],
                            jsnx.helper.deepcopy(entry[3])];
        }));
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
 * @return {jsnx.classes.MultiDiGraph} A subgraph of the graph with the same edge attributes.
 *
 *
 * @override
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var self = this,
        H = new this.constructor(null,this.graph_),
        // namespace shortcuts for speed
        H_succ = H.succ_,
        H_pred = H.pred_,
        this_succ = this.succ_;

    // add edges
    jsnx.helper.forEach(bunch, function(u) {
        var Hnbrs = H.newNodeMap_(); 
        H_succ.set(u, Hnbrs);
        goog.iter.forEach(this_succ.get(u).getEntryIterator(),
            function(entry) {
            var v = entry[0], edgedict = entry[1];
            if(H_succ.containsKey(v)) {
                // add both representations of edge: u-v and v-u
                // they share the same edgedict
                var ed = edgedict.clone();
                Hnbrs.set(v, ed);
                H_pred.get(v).set(u, ed);
            }
        });
    });
    // add nodes
    goog.iter.forEach(bunch, function(n) {
        H.add_node_(n,self.node(n));
    });

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
 * @return {!jsnx.classes.MultiDiGraph} A copy of the graph or the graph itself
 *
 * @export
 */
jsnx.classes.MultiDiGraph.prototype.reverse = function(opt_copy) {
    opt_copy = !goog.isDef(opt_copy) || opt_copy;
    var H;

    if(opt_copy) {
        H = new this.constructor(null, this.graph_);
        H.name('Reverse of (' + this.name() + ')');
        H.add_nodes_from(this.nodes_iter(true));
        H.add_edges_from(goog.iter.map(this.edges_iter(true, true), function(ed) {
            return [ed[1], ed[0], ed[2], jsnx.helper.deepcopy(ed[3])];
        }));
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
