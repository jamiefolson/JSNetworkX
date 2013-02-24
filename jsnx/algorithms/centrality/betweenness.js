goog.provide('jsnx.algorithms.centrality.betweenness')

goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.Map');
goog.require('goog.iter');
goog.require('goog.math');
goog.require('goog.json');
goog.require('goog.object');
goog.require('jsnx.convert');
goog.require('jsnx.exception');
goog.require('jsnx.helper');

/**
 * Betweenness centrality measures.
 * 
 */
__all__ = [ 'betweenness_centrality', 'edge_betweenness_centrality',
        'edge_betweenness' ]

function sample(arr, size, opts) {
    var replace = opts.replace || false;
    var result = [], n = arr.length;
    if (replace) {
        if (size > n) {
            throw "Cannot sample more items than contained in arr without replacement";
        }
        var sampled = new Array(arr.length), idx = 0;
        while (size > 0) {
            idx = Math.floor(Math.Math.random() * n);
            if (sampled[idx]) {
                continue;
            }
            result.push(arr[idx]);
            sampled[idx] = true;
            size--;
        }
    } else {
        while (size > 0) {
            idx = Math.floor(Math.Math.random() * n);
            result.push(arr[idx]);
            size--;
        }
    }
    return result;
}

/**
 * Compute the shortest-path betweenness centrality for nodes.
 * 
 * Betweenness centrality of a node `v` is the sum of the fraction of all-pairs
 * shortest paths that pass through `v`: .. math::
 * 
 * c_B(v) =\sum_{s,t \in V} \frac{\sigma(s, t|v)}{\sigma(s, t)}
 * 
 * where `V` is the set of nodes, `\sigma(s, t)` is the number of shortest `(s,
 * t)`-paths, and `\sigma(s, t|v)` is the number of those paths passing through
 * some node `v` other than `s, t`. If `s = t`, `\sigma(s, t) = 1`, and if `v
 * \in {s, t}`, `\sigma(s, t|v) = 0` [2]_.
 * 
 * @param G
 *            graph A JSNetworkX graph
 * 
 * @param opts.k
 *            int, optional (default=None) If k is not None use k node samples
 *            to estimate betweenness. The value of k <= n where n is the number
 *            of nodes in the graph. Higher values give better approximation.
 * 
 * @param opts.normalized
 *            bool, optional If True the betweenness values are normalized by
 *            `2/((n-1)(n-2))` for graphs, and `1/((n-1)(n-2))` for directed
 *            graphs where `n` is the number of nodes in G.
 * 
 * @param opts.weight
 *            None or string, optional If None, all edge weights are considered
 *            equal. Otherwise holds the name of the edge attribute used as
 *            weight.
 * 
 * @param opts.endpoints
 *            bool, optional If True include the endpoints in the shortest path
 *            counts.
 * 
 * @return nodes dictionary Dictionary of nodes with betweenness centrality as
 *         the value.
 * 
 * @see edge_betweenness_centrality
 * @see load_centrality
 * 
 * Notes ----- The algorithm is from Ulrik Brandes [1]_. See [2]_ for details on
 * algorithms for variations and related metrics.
 * 
 * For approximate betweenness calculations set k=#samples to use k nodes
 * ("pivots") to estimate the betweenness values. For an estimate of the number
 * of pivots needed see [3]_.
 * 
 * For weighted graphs the edge weights must be greater than zero. Zero edge
 * weights can produce an infinite number of equal length paths between pairs of
 * nodes.
 * 
 * References ---------- .. [1] A Faster Algorithm for Betweenness Centrality.
 * Ulrik Brandes, Journal of Mathematical Sociology 25(2):163-177, 2001.
 * http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf .. [2] Ulrik
 * Brandes: On Variants of Shortest-Path Betweenness Centrality and their
 * Generic Computation. Social Networks 30(2):136-145, 2008.
 * http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf .. [3] Ulrik
 * Brandes and Christian Pich: Centrality Estimation in Large Networks.
 * International Journal of Bifurcation and Chaos 17(7):2303-2318, 2007.
 * http://www.inf.uni-konstanz.de/algo/publications/bp-celn-06.pdf
 * 
 * @export
 */
function betweenness_centrality(G, opts) {
    var k = opts.k || null, normalized = opts.normalized || true, weight = opts.weight
            || null, endpoints = opts.endpoints || false, seed = opts.seed
            || null;

    var nodes, S, P, sigma;

    var betweenness = new goog.structs.Map();
    // b[v]=0 for v in G
    goog.iter.forEach(G.nodes_iter(), function(d) {
        betweenness.set(d, 0.0);
    });

    if (k == null) {
        nodes = G.nodes();
    } else {
        nodes = sample(G.nodes(), k);
    }
    for ( var s in nodes) {
        // single source shortest paths
        if (weight == null) { // use BFS
            var ret = _single_source_shortest_path_basic(G, s);
            S = ret.S, P = ret.P, sigma = ret.sigma;
        } else { // use Dijkstra's algorithm
            var ret = _single_source_dijkstra_path_basic(G, s, weight);
            S = ret.S, P = ret.P, sigma = ret.sigma;
        }// accumulation
        if (endpoints) {
            betweenness = _accumulate_endpoints(betweenness, S, P, sigma, s);
        } else {
            betweenness = _accumulate_basic(betweenness, S, P, sigma, s);
        }
    }
    // rescaling
    betweenness = _rescale(betweenness, len(G), normalized = normalized,
            directed = G.is_directed(), k = k)
    return betweenness;
}

function default_weight(data) {
    return data['weight']
}

/**
 * Compute betweenness centrality for edges.
 * 
 * Betweenness centrality of an edge `e` is the sum of the fraction of all-pairs
 * shortest paths that pass through `e`: .. math::
 * 
 * c_B(v) =\sum_{s,t \in V} \frac{\sigma(s, t|e)}{\sigma(s, t)}
 * 
 * where `V` is the set of nodes,`\sigma(s, t)` is the number of shortest `(s,
 * t)`-paths, and `\sigma(s, t|e)` is the number of those paths passing through
 * edge `e` [2]_.
 * 
 * @param G
 *            graph A NetworkX graph
 * 
 * @param opt.normalized
 *            bool, optional If True the betweenness values are normalized by
 *            `2/(n(n-1))` for graphs, and `1/(n(n-1))` for directed graphs
 *            where `n` is the number of nodes in G.
 * 
 * @param opt.weight
 *            None or string, optional If None, all edge weights are considered
 *            equal. Otherwise holds the name of the edge attribute used as
 *            weight.
 * 
 * @return edges : dictionary Dictionary of edges with betweenness centrality as
 *         the value.
 * 
 * See Also -------- betweenness_centrality edge_load
 * 
 * Notes ----- The algorithm is from Ulrik Brandes [1]_.
 * 
 * For weighted graphs the edge weights must be greater than zero. Zero edge
 * weights can produce an infinite number of equal length paths between pairs of
 * nodes.
 * 
 * References ---------- .. [1] A Faster Algorithm for Betweenness Centrality.
 * Ulrik Brandes, Journal of Mathematical Sociology 25(2):163-177, 2001.
 * http://www.inf.uni-konstanz.de/algo/publications/b-fabc-01.pdf .. [2] Ulrik
 * Brandes: On Variants of Shortest-Path Betweenness Centrality and their
 * Generic Computation. Social Networks 30(2):136-145, 2008.
 * http://www.inf.uni-konstanz.de/algo/publications/b-vspbc-08.pdf
 * 
 * @export
 */
function edge_betweenness_centrality(G, opts) {
    var normalized = opts.normalized || true, weight = opts.weight
            || default_weight;

    var nodes = G.nodes(), S, P, sigma;
    betweenness = new goog.structs.Map();
    // b[v]=0 for v in G
    goog.iter.forEach(G.nodes_iter(), function(d) {
        betweenness.set(d, 0.0);
    })
    // b[e]=0 for e in G.edges()
    goog.iter.forEach(G.edges_iter(), function(d) {
        betweenness.set(d, 0.0);
    })

    for (s in nodes) {
        // single source shortest paths
        if (weight == null) { // use BFS
            var ret = _single_source_shortest_path_basic(G, s)
            S = ret.S, P = ret.P, sigma = ret.sigma;
        } else { // use Dijkstra's algorithm
            var ret = _single_source_dijkstra_path_basic(G, s, weight)
            S = ret.S, P = ret.P, sigma = ret.sigma;
        }// accumulation
        betweenness = _accumulate_edges(betweenness, S, P, sigma, s)
    }// rescaling
    for (n in nodes) { // remove nodes to only return edges
        betweenness.remove(n)
    }
    betweenness = _rescale_e(betweenness, nodes.length,
            normalized = normalized, directed = G.is_directed())
    return betweenness;
}

/**
 * @export
 */
function edge_betweenness(G, opts) {
    return edge_betweenness_centrality(G, opts)
}

// helpers for betweenness centrality

function _single_source_shortest_path_basic(G, s) {
    var S = [], P = new goog.structs.Map(), Q = [], D = new goog.structs.Map(), sigma = new goog.structs.Map(), v, Dv;
    // P[v]=[] for v in G
    // sigma[v]=0 for v in G
    goog.iter.forEach(G.nodes_iter(), function(v) {
        P.set(v, []);
        sigma.set(v, 0.0);
    })

    sigma.set(s, 1.0);
    D.set(s, 0);
    Q.push(s);
    while (Q.length > 0) { // use BFS to find shortest paths
        v = Q.pop();
        S.append(v);
        Dv = D.get(v);
        sigmav = sigma.get(v);
        for (w in G.edges([ v ])) {
            if (!D.containsKey(w)) {
                Q.push(w);
                D.set(w, Dv + 1);
            }
            if (D.get(w) == Dv + 1) { // this is a shortest path, count paths
                sigma.set(w, sigma.get(w) + sigmav);
                P.get(w).push(v); // predecessors
            }
        }
    }
    return {
        S : S,
        P : P,
        sigma : sigma
    };
}

function _single_source_dijkstra_path_basic(G, s, weight) {
    var weight = weight || default_weight;
    // modified from Eppstein
    var S = [], P = new goog.structs.Map(), D = new goog.structs.Map(), sigma = new goog.structs.Map(), seen = new goog.structs.Map(), v, Dv;
    // P[v]=[] for v in G
    // sigma[v]=0 for v in G
    goog.iter.forEach(G.nodes_iter(), function(v) {
        P.set(v, []);
        sigma.set(v, 0.0);
    })

    sigma.set(s, true);

    seen.set(s, true)
    // use Q as heap with {distance,pred,node id} tuples
    var Q = new goog.structs.PriorityQueue();
    Q.enqueue(0, {
        distance : 0,
        pred : s,
        node : s
    });
    var tuple, dist, pred, v, w, edgedata, e, wseen;
    while (Q.length > 0) {
        tuple = Q.dequeue();
        dist = tuple.dist;
        pred = tuple.pred;
        v = tuple.node;
        if (D.containsKey(v)) {
            continue; // already searched this node.
        }
        sigma.set(v, sigma.get(v) + sigma.get(pred)); // count paths
        S.push(v);
        D.set(v, dist);
        for (e in G.edges([ v ], true)) {
            w = e[1];
            edgedata = e[2];
            vw_dist = dist + weight(edgedata) || 1;
            wseen = seen.get(w);
            if (D.containsKey(w) && (!wseen || vw_dist < wseen)) {
                seen.set(w, vw_dist);
                Q.enqueue(vw_dist, {
                    dist : vw_dist,
                    pred : v,
                    node : w
                });
                sigma[w] = 0.0;
                P[w] = [ v ];
            } else if (vw_dist === wseen) { // handle equal paths
                sigma.set(w, sigma.get(w) + sigma.get(v));
                P.get(w).push(v);
            }
        }
    }
    return {
        S : S,
        P : P,
        sigma : sigma
    }
}

function _accumulate_basic(betweenness, S, P, sigma, s) {
    var delta = new goog.structs.Map(), w, coeff;
    goog.array.forEach(S, function(v) {
        delta.set(v, 0.0);
    })
    while (S.length > 0) {
        w = S.pop();
        coeff = (1.0 + delta.get(w)) / sigma.get(w);
        for (v in P.get(w)) {
            delta.set(v, delta.get(v) + sigma[v] * coeff);
        }
        if (w !== s) {
            betweenness.set(w, betweenness.get(w) + delta.get(w));
        }
    }
    return betweenness;
}

function _accumulate_endpoints(betweenness, S, P, sigma, s) {
    betweenness.set(s, betweenness.get(s) + S.length - 1)
    var delta = new goog.structs.Map(), w, coeff;
    goog.array.forEach(S, function(v) {
        delta.set(v, 0.0);
    })
    while (S.length > 0) {
        w = S.pop();
        coeff = (1.0 + delta.get(w)) / sigma.get(w);
        for (v in P.get(w)) {
            delta.set(v, delta.get(v) + sigma[v] * coeff);
        }
        if (w !== s) {
            betweenness.set(w, betweenness.get(w) + delta.get(w));
        }
    }
    return betweenness
}

function _accumulate_edges(betweenness, S, P, sigma, s) {
    var delta = new goog.structs.Map(), w, coeff, c;
    goog.array.forEach(S, function(v) {
        delta.set(v, 0.0);
    })
    while (S.length > 0) {
        w = S.pop()
        coeff = (1.0 + delta.get(w)) / sigma.get(w);
        for (v in P.get(w)) {
            c = sigma.get(v) * coeff
            if (!betweenness.containsKey([ v, w ])) {
                betweenness.set([ w, v ], betweenness.get([ w, v ]) + c)
            } else {
                betweenness.set([ v, w ], betweenness.get([ w, v ]) + c)
            }
            delta.set(v, delta.get(v) + c)
        }
        if (w !== s) {
            betweenness.set(w, betweenness.get(w) + delta.get(w))
        }
    }
    return betweenness
}

function _rescale(betweenness, n, normalized, directed, k) {
    if (normalized) {
        if (n <= 2) {
            scale = null // no normalization b=0 for all nodes
        } else {
            scale = 1.0 / ((n - 1) * (n - 2))
        }
    } else { // rescale by 2 for undirected graphs
        if (!directed) {
            scale = 1.0 / 2.0
        } else {
            scale = null
        }
    }
    if (scale != null) {
        if (k != null) {
            scale = scale * n / k
        }
        for (v in betweenness.getKeys()) {
            betweenness.set(v, betweenness.get(v) * scale)
        }
    }
    return betweenness
}

function _rescale_e(betweenness, n, normalized, directed) {
    if (normalized) {
        if (n <= 1) {
            scale = null // no normalization b=0 for all nodes
        } else {
            scale = 1.0 / (n * (n - 1))
        }
    } else { // rescale by 2 for undirected graphs
        if (!directed) {
            scale = 1.0 / 2.0
        } else {
            scale = null
        }
    }
    if (scale != null) {
        for (v in betweenness.getKeys()) {
            betweenness.set(v, betweenness.get(v) * scale)
        }
    }
    return betweenness
}
