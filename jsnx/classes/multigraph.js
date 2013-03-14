/*jshint strict:false*/
goog.provide('jsnx.classes.MultiGraph');

goog.require('jsnx.classes.Graph');
goog.require('jsnx.helper');
goog.require('jsnx.exception');
goog.require('goog.object');
goog.require('goog.json');
goog.require('goog.iter');

/**
 * An undirected graph class that can store multiedges.
 *
 * Multiedges are multiple edges between two nodes.  Each edge
 * can hold optional data or attributes.
 *
 * A MultiGraph holds undirected edges.  Self loops are allowed.
 *
 * Nodes can be numbers or strings.
 *
 * Edges are represented as links between nodes with optional
 * key/value attributes.
 *
 * @see jsnx.classes.Graph
 * @see jsnx.classes.DiGraph
 * @see jsnx.classes.MultiDiGraph
 *
 * @param {?=} opt_data Data to initialze graph.
 *      If no data is provided, an empty graph is created. The data can be
 *      an edge list or any graph object.
 * @param {Object=} opt_attr Attributes to add to graph as key=value pairs.
 *
 * @extends jsnx.classes.Graph
 * @constructor
 * @export
 */
jsnx.classes.MultiGraph = function(opt_data, opt_attr) {
    // makes it possible to call jsnx.Graph without new
    if (!(this instanceof jsnx.classes.MultiGraph)) {
        return new jsnx.classes.MultiGraph(opt_data, opt_attr);
    }
    goog.base(this, opt_data, opt_attr);
};
goog.inherits(jsnx.classes.MultiGraph, jsnx.classes.Graph);
goog.exportSymbol('jsnx.MultiGraph', jsnx.classes.MultiGraph);

/**
 * Holds the graph type (class) name for information.
 * This is compatible to Pythons __name__ property.
 *
 * @type {string}
 */
jsnx.classes.MultiGraph['__name__'] = 'MultiGraph';

jsnx.classes.MultiGraph.prototype.newEdgeMap_ = function() {
    return new jsnx.classes.HashMap();
}

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
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {(number|string)=} opt_key identifier
 *      Used to distinguish multiedges between a pair of nodes. Default is
 *      the lowest unused integer.
 * @param {Object} opt_attr_dict  Dictionary of edge attributes.  
 *      Key/value pairs will update existing data associated with the edge.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.add_edge = function(u, v, opt_key,
        opt_attr_dict) {
    var datadict, keydict;

    if (goog.isDefAndNotNull(opt_key)
            && !(goog.isString(opt_key) || goog.isNumber(opt_key))) {
        opt_attr_dict = opt_key;
        opt_key = null;
    }

    // set up attribute dict
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
                'The attr_dict argument must be an object.');
    }
    this.add_edge_impl(u, v, opt_key, opt_attr_dict);
}
jsnx.classes.MultiGraph.prototype.add_edge_impl = function(u, v, opt_key,
        opt_attr_dict) {

    this.add_node(u);
    this.add_node(v);

    var uadj = this.adj(u), vadj = this.adj(v);
    if (uadj.containsKey(v)) {
        keydict = uadj.get(v);
        if (!goog.isDefAndNotNull(opt_key)) {
            // find a unique integer key
            // other methods might be better here?
            opt_key = keydict.getCount();
            while (keydict.containsKey(opt_key)) {
                opt_key += 1;
            }
        }
        datadict = keydict.get(opt_key, {});
        goog.object.extend(datadict, opt_attr_dict);
        keydict.set(opt_key, datadict);
    } else {
        // selfloops work this way without special treatment
        if (!goog.isDefAndNotNull(opt_key)) {
            opt_key = 0;
        }
        datadict = {};
        goog.object.extend(datadict, opt_attr_dict);
        keydict = this.newEdgeMap_();
        keydict.set(opt_key, datadict);
        uadj.set(v, keydict);
        // u-v and v-u edge are same object, so it's updated without retrieving above
        vadj.set(u, keydict);
    }
};

/**
 * Add all the edges in ebunch.
 *
 * Notes:
 *
 *      Adding the same edge twice has no effect but any edge data
 *       will be updated when each duplicate edge is added.
 *
 * @see #add_edge
 * @see #ad_weighted_edges_from
 *
 *
 * @param {?} ebunch container of edges
 *      Each edge given in the container will be added to the
 *      graph. The edges can be:
 *
 *          - 2-tuples (u,v) or
 *          - 3-tuples (u,v,d) for an edge attribute dict d or
 *          - 4-tuples (u,v,k,d) for an edge identified by key k
 *
 * @param {Object} opt_attr_dict Dictionary of edge attributes.
 *       Key/value pairs will update existing data associated with each edge.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.add_edges_from = function(ebunch,
        opt_attr_dict) {
    // set up attribute dict
    opt_attr_dict = opt_attr_dict || {};

    if (goog.typeOf(opt_attr_dict) !== 'object') {
        throw new jsnx.exception.JSNetworkXError(
                'The attr_dict argument must be an object.');
    }

    // process ebunch
    jsnx.helper.forEach(ebunch, function(e) {
        var ne = jsnx.helper.len(e), u, v, key = null, dd = {}, datadict;

        if (ne === 4) {
            u = e[0];
            v = e[1];
            key = e[2];
            dd = e[3];
        } else if (ne === 3) {
            u = e[0];
            v = e[1];
            dd = e[2];
        } else if (ne === 2) {
            u = e[0];
            v = e[1];
        } else {
            throw new jsnx.exception.JSNetworkXError('Edge tuple '
                    + goog.json.serialize(e)
                    + ' must be a 2-tuple, 3-tuple or 4-tuple.');
        }

        datadict = goog.object.clone(opt_attr_dict);
        goog.object.extend(datadict, dd);
        this.add_edge_impl(u, v, key, datadict);
    }, this);
};

/**
 * Remove an edge between u and v.
 *
 * @see #remove_edges_from
 *
 * @param {jsnx.Node} u
 * @param {jsnx.Node} v
 * @param {(number|string)} opt_key
 *      Used to distinguish multiple edges between a pair of nodes.
 *      If null or undefined remove a single (abritrary) edge between u and v.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.remove_edge = function(u, v, opt_key) {
    var uadj = this.adj(u);
    if (!goog.isDef(uadj) || !uadj.containsKey(v)) {
        throw new jsnx.exception.JSNetworkXError('The edge ' + u + '-' + v
                + ' is not in the graph to remove');
    }
    this.remove_edge_impl(u, v, opt_key);
}
/**
 * 
 * @param u
 * @param v
 * @param opt_key
 * @override
 */
jsnx.classes.MultiGraph.prototype.remove_edge_impl = function(u, v, opt_key) {

    var uadj = this.adj(u), d = uadj.get(v);

    // remove the edge with specified data
    if (!goog.isDefAndNotNull(opt_key)) {
        //try { // Don't need to do this, we just checked up above
        d.remove(d.getKeyIterator().next());
        //} catch(e) {/** no edges found*/}
    } else {
        if (!d.containsKey(opt_key)) {
            throw new jsnx.exception.JSNetworkXError('The edge ' + u + '-' + v
                    + ' with key ' + opt_key + ' is not in the graph');
        }
        d.remove(opt_key);
    }
    if (d.getCount() === 0) {
        // remove the key entries if last edge
        uadj.remove(v);
        if (u != v) { // check for selfloop
            this.adj(v).remove(u);
        }
    }
};

/**
 * Remove all edges specified in ebunch.
 *
 * Notes:
 *      Will fail silently if an edge in ebunch is not in the graph.
 *
 * @see #remove_edge
 *
 * 
 * @param {?} ebunch list or container of edge tuples
 *      Each edge given in the list or container will be removed
 *      from the graph. The edges can be:
 *
 *          - 2-tuples (u,v) All edges between u and v are removed.
 *          - 3-tuples (u,v,key) The edge identified by key is removed.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.remove_edges_from = function(ebunch) {
    jsnx.helper.forEach(ebunch, function(e) {
        try {
            this.remove_edge_impl(e[0], e[1], e[2]);
        } catch (e) {
            if (!(e instanceof jsnx.exception.JSNetworkXError)) {
                throw e;
            }
        }
    }, this);
};

/**
 * Return True if the graph has an edge between nodes u and v.
 *
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {(string|number)} opt_key If specified return True only 
 *      if the edge with key is found.
 *
 * @return {boolean} True if edge is in the graph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.has_edge = function(u, v, opt_key) {
    var e = null;
    if (!goog.isDefAndNotNull(opt_key)) {
        e = this.adj(u);
        return goog.isDef(e) && e.containsKey(v);
    } else {
        e = this.adj(u);
        if (goog.isDef(e)) {
            return e.containsKey(v) && e.get(v).containsKey(opt_key);
        }
        return false;
    }
};

/**
 * Return a list of edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
 *
 * @see #edges_iter
 *
 * @param {jsnx.NodeContainer} opt_nbunch A container of nodes.
 *      The container will be iterated through once.
 * @param {boolean} opt_data (default=False)
 *      Return two tuples (u,v) (False) or three-tuples (u,v,data) (True).
 * @param {boolean} opt_keys (default=False)
 *      Return two tuples (u,v) (False) or three-tuples (u,v,key) (True).
 *
 * @return {Array} list of edge tuples
 *      Edges that are adjacent to any node in nbunch, or a list
 *      of all edges if nbunch is not specified.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.edges = function(opt_nbunch, opt_data,
        opt_keys) {
    return goog.iter.toArray(this.edges_iter(opt_nbunch, opt_data, opt_keys));
};

jsnx.classes.MultiGraph.prototype._iter = 


/**
 * Return an iterator over edges.
 *
 * Edges are returned as tuples with optional data and keys
 * in the order (node, neighbor, key, data).
 *
 * Notes:
 *
 *       Nodes in nbunch that are not in the graph will be (quietly) ignored.
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
 * 
 */
jsnx.classes.MultiGraph.prototype.edges_iter = function(opt_nbunch, opt_data,
        opt_keys) {
    if (goog.isBoolean(opt_nbunch)) {
        if (goog.isBoolean(opt_data)) {
            opt_keys = opt_data;
        }
        opt_data = opt_nbunch;
        opt_nbunch = null;
    }
    var visit = function(n, nbr,edata) {
        return [ n, nbr ];
    };
    if (opt_keys) {
        if (opt_data){
            visit = function(n, nbr,edata) {
                return [ n, nbr, edata[0], edata[1] ];
            };            
        }else {
        visit = function(n, nbr,edata) {
            return [ n, nbr, edata[0] ];
        };
        }
    }else {
        if (opt_data){
            visit = function(n, nbr,edata) {
                return [ n, nbr, edata[1] ];
            };
        }
    }

    var superiter = jsnx.classes.Graph.prototype.edges_iter.call(this,
            opt_nbunch, true);

    var //seen = this.newNodeMap_(), //don't need this since the superiter takes care of it
                nodes_nbrs, 
                n = null, 
                nbr = null;


    return jsnx.helper.nested_chain(superiter, function(nd) {
        n = nd[0];
        nbr = nd[1];
        return nd[2].getEntryIterator();
        }, 
        function(edata) {
            return visit(n,nbr,edata);
        });
};

/**
 * Return the attribute dictionary associated with edge (u,v).
 *
 * Notes:
 *
 *      It is faster to use G.get_node(u)[v][key]
 *
 * Warning:
 *
 *      Assigning G.get_node(u)[v][key] corrupts the graph data structure.
 *      But it is safe to assign attributes to that dictionary.
 *
 * @param {jsnx.Node} u node
 * @param {jsnx.Node} v node
 * @param {(string|number)=} opt_key Return data only for the edge with 
 *      specified key.
 * @param {?} opt_default Value to return if the edge (u,v) is not found.
 *
 * @return {Object} The edge attribute dictionary.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.get_edge_data = function(u, v, opt_key,
        opt_default) {
    if (!goog.isDef(opt_default)) {
        opt_default = null;
    }

    if (this.has_node(u) && this.adj(u).containsKey(v)) {
        if (!goog.isDefAndNotNull(opt_key)) {
            return this.adj(u).get(v);
        } else {
            return this.adj(u).get(v).get(opt_key, opt_default);
        }
    } else {
        return opt_default;
    }
};

/**
 * Return an iterator for (node, degree).
 *
 * @see #degree
 *
 *
 * @param {jsnx.NodeContainer} opt_nbunch  A container of nodes
 *      The container will be iterated through once.
 * @param {string=} opt_weight  The edge attribute that holds the numerical 
 *      value used as a weight.  If None, then each edge has weight 1.
 *      The degree is the sum of the edge weights adjacent to the node.
 *
 * @return {goog.iter.Iterator} The iterator returns two-tuples of (node, degree).
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.degree_iter = function(opt_nbunch, opt_weight) {
    var iterator, nodes_nbrs, gen_accum;

    nodes_nbrs = this.adjacency_iter(opt_nbunch);

    if (!goog.isDefAndNotNull(opt_weight)) {
        gen_accum = jsnx.classes.MultiGraph.count_edges;
    }else {
        jsnx.classes.MultiGraph.sum_weights;
    }
        iterator = goog.iter.map(nodes_nbrs,
                function(nd) {
                    var n = nd[0], 
                        accum = gen_accum(n, opt_weight), 
                        nbrs = nd[1], 
                        deg = 0;

                    deg = accum(0, nbrs);
                    return [ n, deg ];
                });
    return iterator;
};

/**
 * Return True if graph is a multigraph, False otherwise.
 *
 * @return {boolean} True if graph is a multigraph, False otherwise.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.is_multigraph = function() {
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
jsnx.classes.MultiGraph.prototype.is_directed = function() {
    return false;
};

/**
 * Return a directed representation of the graph.
 *
 * Notes:
 *
 *      This returns a "deepcopy" of the edge, node, and
 *      graph attributes which attempts to completely copy
 *      all of the data and references.
 *
 *      This is in contrast to the similar D = DiGraph(G) which returns a
 *      shallow copy of the data.
 *
 * @return {jsnx.classes.MultiDiGraph} 
 *      A directed graph with the same name, same nodes, and with
 *      each edge (u,v,data) replaced by two directed edges
 *      (u,v,data) and (v,u,data).
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.to_directed = function() {
    var G = new jsnx.classes.MultiDiGraph(null,this.graph_);
    G.add_nodes_from(this.nodes_iter(true));
    G.add_edges_from(goog.iter.map(this.edges_iter(null,true, true),
            function(item) {
            return [ item[0], item[1], item[2], jsnx.helper.deepcopy(item[3]) ];
        }));

    return G;
};

/**
 * Return a list of selfloop edges.
 *
 *
 * @see #nodes_with_selfloops
 * @see #number_of_selfloops
 *
 *
 * @param {boolean} opt_data  (default=False)
 *      Return selfloop edges as two tuples (u,v) (data=False)
 *      or three-tuples (u,v,data) (data=True)
 * @param {boolean} opt_keys  (default=False)
 *       If True, return edge keys with each edge
 *
 * @return {Array} A list of all selfloop edges
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.selfloop_edges = function(opt_data, opt_keys) {
    var edges = [];
    var visit = function(){};
    if (opt_data) {
        if (opt_keys) {
            visit = function(n, entry){
                edges.push([n,n,entry[0],entry[1]]);
            };
        } else {
            visit = function(n, entry){
                edges.push([n,n,entry[1]]);
            };
        }
    } else {
        if (opt_keys) {
            visit = function(n, entry){
                edges.push([n,n,entry[0]]);
            };
        } else {
            visit = function(n, entry){
                edges.push([n,n]);
            };
        }
    }
    goog.iter.forEach(this.adjacency_iter(), function(entry) {
        var nbrs = entry[1], n = entry[0];
        if (nbrs.containsKey(n)) {
            goog.iter.forEach(nbrs.get(n).getEntryIterator(), function(
                    entry) {
                visit(n, entry);
            });
        }
    });

    return edges;
};

/**
 * Return the number of edges between two nodes.
 *
 * @see #size
 *
 * @param {jsnx.Node=} opt_u node
 * @param {jsnx.Node=} opt_v node
 *      If u and v are specified, return the number of edges between
 *      u and v. Otherwise return the total number of all edges.
 *
 * @return {number} The number of edges in the graph.
 *      If nodes u and v are specified return the number of edges between 
 *      those nodes.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.number_of_edges = function(opt_u, opt_v) {
    if (!goog.isDefAndNotNull(opt_u)) {
        return this.size();
    }

    if (this.has_node(opt_u) && this.has_edge(opt_u, opt_v)) {
        return this.adj(opt_u).get(opt_v).getCount();
    }

    return 0; //no such edge
};

/**
 * Return the subgraph induced on nodes in nbunch.
 *
 * The induced subgraph of the graph contains the nodes in nbunch
 * and the edges between those nodes.
 *
 * Notes:
 *
 *      The graph, edge or node attributes just point to the original graph.
 *      So changes to the node or edge structure will not be reflected in
 *      the original graph while changes to the attributes will.
 *
 *      To create a subgraph with its own copy of the edge/node attributes use:
 *      jsnx.Graph(G.subgraph(nbunch))
 *
 *      If edge attributes are containers, a deep copy can be obtained using:
 *      G.subgraph(nbunch).copy()
 *
 *
 * @param {jsnx.NodeContainer} nbunch A container of nodes which will be 
 *      iterated through once.
 * @param {jsnx.classes.MultiGraph} A subgraph of the graph with the same 
 *      edge attributes.
 *
 * @override
 * @export
 */
jsnx.classes.MultiGraph.prototype.subgraph = function(nbunch) {
    var bunch = this.nbunch_iter(nbunch);
    // create new graph and copy subgraph into it
    var H = new this.constructor(null,this.graph_);
    // namespace shortcuts for speed
    var H_adj = H.adj_, this_adj = this.adj_, H_nodes = H.nodes_;
    
    // add nodes and edges (undirected method)
    goog.iter.forEach(bunch, function(n) {
        var Hnbrs = this.newNodeMap_();
        H_adj.set(n, Hnbrs);

        goog.iter.forEach(this_adj.get(n).getEntryIterator(), function(entry) {
            var edgedict = entry[1], nbr = entry[0];
            // Check H_adj so you don't add it twice!
            if (H_adj.containsKey(nbr)) {
                // add both representations of edge: n-nbr and nbr-n
                // they share the same edgedict
                var ed = this.newNodeMap_();
                ed.addAll(goog.iter.map(edgedict.getEntryIterator(), 
                        function(entry){
                    return [entry[0], jsnx.helper.deepcopy(entry[1])];
                }));
                Hnbrs.set(nbr, ed);
                H_adj.get(nbr).set(n, ed);
            }
        });
    });

 // copy node and attribute dictionaries
    goog.iter.forEach(H_adj.getKeyIterator(), function(entry) {
        H_nodes.set(entry[0], entry[1]);
    });
    

    return H;
};

jsnx.classes.MultiGraph.count_edges = function(n) {
    return function(r, nbrs) {
        var deg = 0;
        deg = goog.iter.reduce(nbrs.getValueIterator(), function(data) {
            deg += data.getCount();
        }, deg);
        return deg + (+nbrs.containsKey(n) && nbrs.get(n).getCount());
    };
};

jsnx.classes.MultiGraph.sum_weights = function(n, opt_weight) {
    return function(r, nbrs) {
        var sum = 0;
        sum = goog.iter.reduce(nbrs.getValueIterator(), function(r, data) {
            return r
                    + goog.iter.reduce(data.getValueIterator(),
                            function(sum, d) {
                                return sum + goog.object.get(d, opt_weight, 1);
                            }, 0);
        }, sum);

        if (nbrs.containsKey(n)) {
            sum = goog.iter.reduce(nbrs.get(n).getValueIterator(), function(r,
                    d) {
                return r + goog.object.get(d, opt_weight, 1);
            }, sum);
        }
        return sum;
    };
};
