'use strict';
goog.provide('jsnx.relabel');

goog.require('goog.iter');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.structs.Set');
goog.require('jsnx.classes.DiGraph');
goog.require('jsnx.helper');
goog.require('jsnx.exception');

/**
 * Relabel the nodes of the graph G.
 *
 * Notes
 * -----
 * Only the nodes specified in the mapping will be relabeled. 
 *
 * The setting copy=false modifies the graph in place.
 * This is not always possible if the mapping is circular.
 * In that case use copy=true.
 *
 * @see #convert_node_labels_to_integers
 *
 * @param {jsnx.classes.Graph} G A JSNetworkX graph
 * @param {Object|function} mapping 
 *      A dictionary with the old labels as keys and new labels as values.
 *      A partial mapping is allowed.
 * @param {boolean=} opt_copy (default: true)
 *      If True return a copy or if False relabel the nodes in place.
 *
 * @return {?jsnx.classes.Graph}
 */
jsnx.relabel.relabel_nodes = function(G, mapping, opt_copy) {
    // you can pass a function f(old_label)->new_label
    // but we'll just make a dictionary here regardless
    var m = mapping;
    if(goog.isFunction(mapping)) {
        m = {};
        goog.iter.forEach(G.nodes_iter(), function(n) {
            m[n] = mapping(n);
        });
    }

    if(!goog.isDef(opt_copy) || opt_copy) {
        return jsnx.relabel.relabel_copy_(G, m);
    }
    else {
        return jsnx.relabel.relabel_inplace_(G, m);
    }
};
goog.exportSymbol('jsnx.relabel_nodes', jsnx.relabel.relabel_nodes);


jsnx.relabel.relabel_inplace_ = function(G, mapping) {
    var old_labels = new goog.structs.Set(goog.object.getKeys(mapping)),
        nodes;

    if(old_labels.intersection(mapping).getCount() > 0) {
        // labels sets overlap
        // can we topological sort and still do the relabeling?
        var D = jsnx.classes.DiGraph(jsnx.helper.items(mapping));
        D.remove_edges_from(D.selfloop_edges());
        try {
            nodes = jsnx.algorithms.dag.topological_sort(D);
        }
        catch(e) {
            if(e instanceof jsnx.exception.JSNetworkXUnfeasible) {
                throw new jsnx.exception.JSNetworkXUnfeasible(
                    'The node label sets are overlapping ' +
                    'and no ordering can resolve the ' +
                    'mapping. Use copy=True.'
                );
            }
        }
        nodes.reverse(); // reverse topological order
    }
    else {
        // non-overlapping label sets
        nodes = old_labels;
    }
    var multigraph = G.is_multigraph(),
        directed = G.is_directed(),
        new_edges;

    goog.iter.forEach(nodes, function(old) {
        var new_;
        if(goog.object.containsKey(mapping, old)) {
            new_ = mapping[old];
        }
        else {
            return; // continue
        }
        
        if(!G.has_node(old)) {
            throw new jsnx.exception.JSNetworkXError(
                'Node ' + old + ' is not in the graph to relabel.'
            );
        }
        G.add_node(new_, G.node(old));
        if(multigraph) {
            new_edges = goog.array.map(G.edges(old, true, true), function(d) {
                return [new_, d[1], d[2], d[3]];
            });

            if(directed) {
                new_edges = goog.array.concat(new_edges, goog.array.map(G.in_edges(old, true, true), function(d) {
                    return [d[0], new_, d[2], d[3]];
                }));
            }
        }
        else {
            new_edges = goog.array.map(G.edges(old, true), function(d) {
                return [new_, d[1], d[2]];
            });

            if(directed) {
                new_edges = goog.array.concat(new_edges, goog.array.map(G.in_edges(old, true), function(d) {
                    return [d[0], new_, d[2]];
                }));
            }
        }
        G.remove_node(old);
        G.add_edges_from(new_edges);
    });
    return G;
};


jsnx.relabel.relabel_copy_ = function(G, mapping) {
    var H = new G.constructor(null,G.graph());
    H.name('(' + G.name() + ')');
    if(G.is_multigraph()) {
        H.add_edges_from(goog.iter.map(G.edges_iter(true, true), function(d) {
            return [goog.object.get(mapping, d[0], d[0]),
                    goog.object.get(mapping, d[1], d[1]),
                    d[2],
                    goog.object.clone(d[3])];
        }));
    }
    else {
        H.add_edges_from(goog.iter.map(G.edges_iter(true), function(d) {
            return [goog.object.get(mapping, d[0], d[0]),
                    goog.object.get(mapping, d[1], d[1]),
                    goog.object.clone(d[2])];
        }));
    }

    H.add_nodes_from(goog.iter.map(G, function(n) {
        return goog.object.get(mapping, n, n);
    }));
    H.add_nodes_from(goog.iter.map(G.nodes_iter(true),
            function(entry){
        return [goog.object.get(mapping, entry[0], entry[0]), entry[1]];
    }));

    return H;
};


/**
 * Return a copy of G node labels replaced with integers.
 *
 * @param {jsnx.Graph} G A JSNetworkX graph
 * @param {number=} opt_first_label (default=0)
 *      An integer specifying the offset in numbering nodes.
 *      The n new integer labels are numbered first_label, ..., n-1+first_label.
 * @param {string=} opt_ordering (default="default")
 *      "default" : inherit node ordering from G.nodes() 
 *      "sorted"  : inherit node ordering from sorted(G.nodes())
 *      "increasing degree" : nodes are sorted by increasing degree
 *      "decreasing degree" : nodes are sorted by decreasing degree
 * @param {boolean=} opt_discard_old_labels (default=true)
 *      If true discard old labels. If false, create a node attribute 
 *      'old_label' to hold the old labels.
 *
 * @return {jsnx.Graph}
 */
jsnx.relabel.convert_node_labels_to_integers = function(G, opt_first_label, 
                                                        opt_ordering,
                                                        opt_discard_old_labels) {
    //   This function strips information attached to the nodes and/or
    //   edges of a graph, and returns a graph with appropriate integer
    //   labels. One can view this as a re-labeling of the nodes. Be
    //   warned that the term "labeled graph" has a loaded meaning
    //   in graph theory. The fundamental issue is whether the names
    //   (labels) of the nodes (and edges) matter in deciding when two
    //   graphs are the same. For example, in problems of graph enumeration
    //   there is a distinct difference in techniques required when
    //   counting labeled vs. unlabeled graphs.
    //
    //   When implementing graph
    //   algorithms it is often convenient to strip off the original node
    //   and edge information and appropriately relabel the n nodes with
    //   the integer values 1,..,n. This is the purpose of this function,
    //   and it provides the option (see discard_old_labels variable) to either
    //   preserve the original labels in separate dicts (these are not
    //   returned but made an attribute of the new graph.

    if(arguments.length === 3 && goog.isBoolean(opt_ordering)) {
        opt_discard_old_labels = opt_ordering;
        opt_ordering = null;
    }
    else if(arguments.length === 2) {
        if(goog.isBoolean(opt_first_label)) {
            opt_discard_old_labels = opt_first_label;
            opt_first_label = null;
        }
        else if(goog.isString(opt_first_label)) {
            opt_ordering = opt_first_label;
            opt_first_label = null;
        }
    }

    if(!goog.isDefAndNotNull(opt_first_label)) {
        opt_first_label = 0;
    }
    if(!goog.isDefAndNotNull(opt_ordering)) {
        opt_ordering = 'default';
    }
    if(!goog.isDefAndNotNull(opt_discard_old_labels)) {
        opt_discard_old_labels = true;
    }

    var N = G.number_of_nodes() + opt_first_label,
        mapping = {}, nodes, dv_pairs, i, j, l;
    if(opt_ordering === 'default') {
        nodes = G.nodes();
        for(i = 0, j = opt_first_label, l = nodes.length; i < l; i++, j++) {
            mapping[nodes[i]] = j;
        }
    }
    else if(opt_ordering === 'sorted') {
        nodes = G.nodes();
        nodes.sort();
        for(i = 0, j = opt_first_label, l = nodes.length; i < l; i++, j++) {
            mapping[nodes[i]] = j;
        }
    }
    else if(opt_ordering === 'increasing degree') {
        dv_pairs = goog.iter.toArray(G.degree_iter());
        dv_pairs.sort(function(a, b) {
            // 0 is the node, 1 is the degree
            return a[1] - b[1];
        });
        for(i = 0, j = opt_first_label, l = dv_pairs.length; i < l; i++, j++) {
            mapping[dv_pairs[i][0]] = j;
        }
    }
    else if(opt_ordering === 'decreasing degree') {
        dv_pairs = goog.iter.toArray(G.degree_iter());
        dv_pairs.sort(function(a, b) {
            // 0 is the node, 1 is the degree
            return b[1] - a[1];
        });
        for(i = 0, j = opt_first_label, l = dv_pairs.length; i < l; i++, j++) {
            mapping[dv_pairs[i][0]] = j;
        }
    }
    else {
        throw new jsnx.exception.JSNetworkXError(
            'Unkown node ordering: ' + opt_ordering
        );
    }

    var H = jsnx.relabel.relabel_nodes(G, mapping);
    H.name('(' + G.name() + ')_with_int_labels');
    if(!opt_discard_old_labels) {
        H['node_labels'] = mapping;
    }
    return H;
};
goog.exportSymbol('jsnx.convert_node_labels_to_integers', jsnx.relabel.convert_node_labels_to_integers);
