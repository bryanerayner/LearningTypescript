/**
 * Created by bryanerayner on 2014-10-18.
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var graphs;
(function (graphs) {
    var Graph = (function () {
        function Graph(nodes, connections) {
            var _this = this;
            this.nodes = {};
            this.connections = {};
            if (nodes) {
                nodes.forEach(function (node) {
                    _this.nodes[node._getUId()] = node;
                });
            }
            if (connections) {
                // Build a doubly connected graph for this.
                connections.forEach(function (connection) {
                    var firstId = connection.firstId;
                    var secondId = connection.secondId;
                    _this.connections[firstId] = (_this.connections[firstId] || []).concat(secondId);
                    _this.connections[secondId] = (_this.connections[secondId] || []).concat(firstId);
                });
            }
        }
        Graph.prototype.getNode = function (id) {
            return this.nodes[id];
        };
        Graph.prototype.addEdge = function (v, w) {
            var firstId = v._getUId();
            var secondId = w._getUId();
            if (!this.connections[firstId]) {
                this.connections[firstId] = [];
            }
            if (!this.connections[secondId]) {
                this.connections[secondId] = [];
            }
            this.connections[firstId].push(secondId);
            this.connections[secondId].push(firstId);
        };
        Graph.prototype.getAdjacentNodes = function (v) {
            var _this = this;
            var adjacentNodes = [];
            var nodeId = v._getUId();
            var adjacentNodeIds = this.connections[nodeId] || [];
            adjacentNodeIds.forEach(function (id) {
                adjacentNodes.push(_this.nodes[id]);
            });
            return adjacentNodes;
        };
        Graph.prototype.countVertices = function () {
            return _.keys(this.nodes).length;
        };
        Graph.prototype.getNodeIds = function () {
            return _.keys(this.nodes);
        };
        Graph.prototype.countEdges = function () {
            var edgeCount = _.reduce(this.connections, function (sum, connections) {
                sum = sum + connections.length;
                return sum;
            }, 0);
            return edgeCount;
        };
        return Graph;
    })();
    graphs.Graph = Graph;
    // Base class for Graph computations which require marking of nodes.
    var GraphComputations = (function () {
        function GraphComputations(graph) {
            this.marked = {};
            this.graph = graph;
            this.init();
        }
        GraphComputations.prototype.init = function () {
            var _this = this;
            this.marked = {};
            _.each(this.graph.getNodeIds(), function (nodeId) {
                _this.marked[nodeId] = false;
            });
        };
        return GraphComputations;
    })();
    graphs.GraphComputations = GraphComputations;
    var GraphSearch = (function (_super) {
        __extends(GraphSearch, _super);
        function GraphSearch(graph) {
            _super.call(this, graph);
            this.edgeTo = {};
            this.startId = null;
            this.init();
        }
        GraphSearch.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.edgeTo = {};
            _.each(this.graph.getNodeIds(), function (nodeId) {
                _this.edgeTo[nodeId] = null;
            });
        };
        GraphSearch.prototype.search = function (graph, startNode) {
            if (graph !== this.graph) {
                throw "Graph must be the same throughout operations";
            }
        };
        GraphSearch.prototype.setStartNode = function (startNode) {
            if (this.startId !== startNode._getUId()) {
                this.init();
                this.startId = startNode._getUId();
            }
        };
        GraphSearch.prototype.hasPathTo = function (endNode) {
            return this.marked[endNode._getUId()];
        };
        GraphSearch.prototype.pathTo = function (endNode) {
            if (!this.hasPathTo(endNode)) {
                return null;
            }
            var ret = [];
            for (var i = endNode._getUId(); i !== this.startId; i = this.edgeTo[i]) {
                ret.push(i);
            }
            return ret;
        };
        return GraphSearch;
    })(GraphComputations);
    graphs.GraphSearch = GraphSearch;
    var DepthFirstSearch = (function (_super) {
        __extends(DepthFirstSearch, _super);
        function DepthFirstSearch(graph, visitedCallback) {
            if (visitedCallback === void 0) { visitedCallback = null; }
            _super.call(this, graph);
            this.onVisitNode = visitedCallback;
        }
        DepthFirstSearch.prototype.search = function (graph, startNode) {
            var _this = this;
            if (startNode === void 0) { startNode = null; }
            _super.prototype.search.call(this, graph, startNode);
            this.setStartNode(startNode);
            this.marked[startNode._getUId()] = true;
            if (this.onVisitNode) {
                this.onVisitNode(startNode._getUId());
            }
            var adjacentNodes = graph.getAdjacentNodes(startNode);
            _.each(adjacentNodes, function (iNode) {
                if (!_this.marked[iNode._getUId()]) {
                    _this.search(graph, iNode);
                    _this.edgeTo[iNode._getUId()] = startNode._getUId();
                }
            });
        };
        return DepthFirstSearch;
    })(GraphSearch);
    graphs.DepthFirstSearch = DepthFirstSearch;
    var BreadthFirstSearch = (function (_super) {
        __extends(BreadthFirstSearch, _super);
        function BreadthFirstSearch(graph) {
            _super.call(this, graph);
        }
        BreadthFirstSearch.prototype.search = function (graph, startNode) {
            var _this = this;
            if (startNode === void 0) { startNode = null; }
            _super.prototype.search.call(this, graph, startNode);
            this.setStartNode(startNode);
            var q = [];
            q.push(startNode);
            this.marked[startNode._getUId()] = true;
            while (q.length) {
                var queuedNode = q.shift();
                var adjacentNodes = graph.getAdjacentNodes(queuedNode);
                _.each(adjacentNodes, function (adjacentNode) {
                    var uid = adjacentNode._getUId();
                    if (!_this.marked[uid]) {
                        q.push(adjacentNode);
                        _this.marked[uid] = true;
                        _this.edgeTo[uid] = queuedNode._getUId();
                    }
                });
            }
        };
        return BreadthFirstSearch;
    })(GraphSearch);
    graphs.BreadthFirstSearch = BreadthFirstSearch;
    var ConnectedComponentComputer = (function (_super) {
        __extends(ConnectedComponentComputer, _super);
        function ConnectedComponentComputer(graph) {
            _super.call(this, graph);
            this.count = 0;
            // Mapping from node, to connected component.
            this.connectedComponents = {};
        }
        ConnectedComponentComputer.prototype.init = function () {
            var _this = this;
            _super.prototype.init.call(this);
            this.count = 0;
            this.connectedComponents = {};
            _.each(this.graph.getNodeIds(), function (nodeId) {
                _this.connectedComponents[nodeId] = null;
            });
        };
        // Algorithm: Initialize all vertices as unmarked -
        // For each unmarked vertex v, run Depth First Search to identify
        // all vertices discovered as part of the same component
        ConnectedComponentComputer.prototype.getConnectedComponents = function (graph) {
            var _this = this;
            this.graph = graph;
            this.init();
            var dfs = new DepthFirstSearch(graph);
            _.each(graph.getNodeIds(), function (nodeId) {
                if (!_this.marked[nodeId]) {
                    // This will be called each time that the DFS visits a node.
                    var onVisitNode = function (visitedNodeId) {
                        _this.marked[visitedNodeId] = true;
                        _this.connectedComponents[nodeId] = _this.count;
                    };
                    dfs.onVisitNode = onVisitNode;
                    dfs.search(graph, graph.getNode(nodeId));
                    _this.count++;
                }
            });
        };
        ConnectedComponentComputer.prototype.isConnected = function (v, w) {
            return this.getId(v) === this.getId(w);
        };
        ConnectedComponentComputer.prototype.getCount = function () {
            return this.count;
        };
        ConnectedComponentComputer.prototype.getId = function (v) {
            return this.connectedComponents[v._getUId()];
        };
        return ConnectedComponentComputer;
    })(GraphComputations);
    graphs.ConnectedComponentComputer = ConnectedComponentComputer;
})(graphs || (graphs = {}));
