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
            if (!connections) {
                connections = [];
            }
            if (nodes) {
                _.each(nodes, function (node) {
                    var uId = node._getUId();

                    _this.nodes[uId] = node;
                });
            }

            if (connections) {
                _.each(connections, function (connection) {
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

        Graph.prototype.getNodeData = function (id) {
            return this.getNode(id)._getData();
        };

        Graph.prototype.getAllNodes = function () {
            var _this = this;
            return _.map(this.getNodeIds(), function (id) {
                return _this.getNode(id);
            });
        };

        Graph.prototype.addNode = function (newNode, biDirectionalEdges) {
            var _this = this;
            if (typeof biDirectionalEdges === "undefined") { biDirectionalEdges = []; }
            this.nodes[newNode._getUId()] = newNode;
            _.each(biDirectionalEdges, function (edge) {
                _this.addEdge(newNode, _this.getNode(edge.toString()));
            });
        };

        Graph.prototype.addEdge = function (v, w) {
            if (!v || !w) {
                return;
            }
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

        Graph.prototype.where = function (predicate) {
            var nodes = [];
            _.each(this.getAllNodes(), function (node) {
                if (predicate(node._getData())) {
                    nodes.push(node);
                }
            });
            return nodes;
        };
        return Graph;
    })();
    graphs.Graph = Graph;

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
            if (_.isUndefined(this.startId) || _.isNull(this.startId)) {
                this.init();
                this.startId = startNode._getUId();
            }
        };

        GraphSearch.prototype.reset = function () {
            this.startId = null;
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
            if (typeof visitedCallback === "undefined") { visitedCallback = null; }
            _super.call(this, graph);
            this.onVisitNode = visitedCallback;
        }
        DepthFirstSearch.prototype.search = function (graph, startNode) {
            var _this = this;
            if (typeof startNode === "undefined") { startNode = null; }
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
            if (typeof startNode === "undefined") { startNode = null; }
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

        ConnectedComponentComputer.prototype.getConnectedComponents = function (graph) {
            var _this = this;
            this.graph = graph;
            this.init();

            var dfs = new DepthFirstSearch(graph);

            _.each(graph.getNodeIds(), function (nodeId) {
                if (!_this.marked[nodeId]) {
                    var onVisitNode = function (visitedNodeId) {
                        _this.marked[visitedNodeId] = true;

                        if (_this.marked[visitedNodeId] && _this.marked[nodeId]) {
                            _this.connectedComponents[nodeId] = _this.count;
                            _this.connectedComponents[visitedNodeId] = _this.count;
                        }
                    };
                    dfs.onVisitNode = onVisitNode;

                    dfs.search(graph, graph.getNode(nodeId));

                    _this.count++;
                }
            });
        };

        ConnectedComponentComputer.prototype.areConnected = function (v, w) {
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
var concordance;
(function (concordance) {
    (function (graph) {
        (function (NodeContentType) {
            NodeContentType[NodeContentType["Word"] = 0] = "Word";
            NodeContentType[NodeContentType["Verse"] = 1] = "Verse";
            NodeContentType[NodeContentType["BaseType"] = 2] = "BaseType";
        })(graph.NodeContentType || (graph.NodeContentType = {}));
        var NodeContentType = graph.NodeContentType;

        var Node = (function () {
            function Node(originalContent) {
                this.setReference(originalContent);
                this.setContent(originalContent);
                this.setType();
            }
            Node.prototype.setType = function () {
                this.type = 2 /* BaseType */;
            };

            Node.prototype.setReference = function (originalContent) {
                var newReference = this.computeReference(originalContent);
                this.reference = newReference;
            };

            Node.prototype.setContent = function (originalContent) {
                this.content = originalContent;
            };

            Node.prototype.getContent = function () {
                return this.content;
            };

            Node.prototype.computeReference = function (originalContent) {
                var newReference = originalContent;
                return newReference;
            };

            Node.prototype._getUId = function () {
                return this.reference;
            };

            Node.prototype._getData = function () {
                return this;
            };

            Node.prototype.render = function () {
                return this.content;
            };

            Node.prototype.equals = function (other) {
                return this.content == other.content;
            };
            return Node;
        })();
        graph.Node = Node;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var WordNode = (function (_super) {
            __extends(WordNode, _super);
            function WordNode() {
                _super.apply(this, arguments);
            }
            WordNode.prototype.computeReference = function (originalContent) {
                return originalContent.trim().toLowerCase();
            };
            return WordNode;
        })(graph.Node);
        graph.WordNode = WordNode;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graphData) {
        graphData.ephesians = '1 Paul, an apostle of Christ Jesus through the will of God, to the saints who are at Ephesus, and the faithful in Christ Jesus: 2 Grace to you and peace from God our Father and the Lord Jesus Christ. 3 Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ; 4 even as he chose us in him before the foundation of the world, that we would be holy and without defect before him in love; 5 having predestined us for adoption as children through Jesus Christ to himself, according to the good pleasure of his desire, 6 to the praise of the glory of his grace, by which he freely gave us favor in the Beloved, 7 in whom we have our redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace, 8 which he made to abound toward us in all wisdom and prudence, 9 making known to us the mystery of his will, according to his good pleasure which he purposed in him 10 to an administration of the fullness of the times, to sum up all things in Christ, the things in the heavens, and the things on the earth, in him; 11 in whom also we were assigned an inheritance, having been foreordained according to the purpose of him who does all things after the counsel of his will; 12 to the end that we should be to the praise of his glory, we who had before hoped in Christ. 13 In him you also, having heard the word of the truth, the Good News of your salvation—in whom, having also believed, you were sealed with the promised Holy Spirit, 14 who is a pledge of our inheritance, to the redemption of God’s own possession, to the praise of his glory. 15 For this cause I also, having heard of the faith in the Lord Jesus which is among you, and the love which you have toward all the saints, 16 don’t cease to give thanks for you, making mention of you in my prayers, 17 that the God of our Lord Jesus Christ, the Father of glory, may give to you a spirit of wisdom and revelation in the knowledge of him; 18 having the eyes of your hearts* enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints, 19 and what is the exceeding greatness of his power toward us who believe, according to that working of the strength of his might 20 which he worked in Christ, when he raised him from the dead, and made him to sit at his right hand in the heavenly places, 21 far above all rule, and authority, and power, and dominion, and every name that is named, not only in this age, but also in that which is to come. 22 He put all things in subjection under his feet, and gave him to be head over all things for the assembly, 23 which is his body, the fullness of him who fills all in all.';
    })(concordance.graphData || (concordance.graphData = {}));
    var graphData = concordance.graphData;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var ScriptureGraph = (function (_super) {
            __extends(ScriptureGraph, _super);
            function ScriptureGraph(passage) {
                _super.call(this);
                this.parsePassage(passage);
            }
            ScriptureGraph.prototype.parsePassage = function (passage) {
                this.addVerses(passage);
            };

            ScriptureGraph.prototype.addVerses = function (passage) {
                var verses = passage.split(/[\d]{1,2}/);
                _.each(verses, function (verse) {
                });
            };

            ScriptureGraph.prototype.addWords = function (existingNode) {
                var _this = this;
                var words = existingNode.getContent().split(/[\s]/i);

                _.each(words, function (word) {
                    var newWordNode = new graph.WordNode(word);
                    var oldWordNode = _this.getNode(newWordNode._getUId());
                    if (oldWordNode) {
                        _this.addEdge(oldWordNode, existingNode);
                    } else {
                        _this.addNode(newWordNode, [existingNode._getUId()]);
                    }
                });
            };
            return ScriptureGraph;
        })(graphs.Graph);
        graph.ScriptureGraph = ScriptureGraph;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
//# sourceMappingURL=concordance.js.map
