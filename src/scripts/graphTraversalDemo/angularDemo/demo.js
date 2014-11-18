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
            this.nodesCount = 0;
            this.nodes = {};
            this.connections = {};
            this._uid = _.uniqueId('graph');
            if (!connections) {
                connections = [];
            }
            if (nodes) {
                _.each(nodes, function (node) {
                    _this.addNode(node);
                });
            }

            if (connections) {
                _.each(connections, function (connection) {
                    _this.addEdge(connection.firstId, connection.secondId);
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
            var uid = newNode._getUId();
            if (!this.nodes[uid]) {
                this.nodesCount++;
                this.nodes[uid] = newNode;
                _.each(biDirectionalEdges, function (edge) {
                    _this.addEdge(newNode, _this.getNode(edge.toString()));
                });
            }
        };

        Graph.prototype.addEdge = function (v, w) {
            if (!v || !w) {
                return;
            }
            var firstId;
            var secondId;
            if (_.isString(v) && _.isString(w)) {
                firstId = v;
                secondId = w;
            } else {
                firstId = v._getUId();
                secondId = w._getUId();
            }

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
var demo;
(function (demo) {
    (function (ts) {
        var ngModule = angular.module('demo.ts', [
            'demo.ts.factories',
            'ui.router',
            'ui.bootstrap',
            'ngSanitize'
        ]);

        ngModule.config([
            '$stateProvider', function ($stateProvider) {
                $stateProvider.state({
                    name: 'concordance',
                    url: '/concordance',
                    controller: 'DemoCtrl as demoCtrl',
                    templateUrl: 'demoTpl.html'
                });

                $stateProvider.state({
                    name: 'concordance.inspectNode',
                    url: '/node/{nodeRef}',
                    controller: 'NodeCtrl as nodeCtrl',
                    templateUrl: 'nodeTpl.html',
                    resolve: {
                        node: [
                            'GraphSrv', '$stateParams',
                            function (GraphSrv, $stateParams) {
                                return GraphSrv.graph.getNode($stateParams.nodeRef);
                            }]
                    }
                });
            }]);

        ngModule.run([
            '$state', function ($state) {
                $state.go('concordance');
            }]);

        ngModule.controller('DemoCtrl', [
            '$scope', 'GraphSrv', '$sce', function ($scope, GraphSrv, $sce) {
                var _this = this;
                this.bookContent = '';
                this.nodes = GraphSrv.graph.getAllNodes();

                $scope.$watch(function () {
                    return GraphSrv.graph.nodesCount;
                }, function () {
                    _this.nodes = GraphSrv.graph.getAllNodes();
                    _this.bookContent = $sce.trustAsHtml(GraphSrv.graph.renderBook());
                });

                _.defer(function () {
                    $scope.$digest();
                }, 10);
            }]);

        ngModule.controller('NodeCtrl', [
            '$scope', 'node', 'GraphSrv',
            function ($scope, node, GraphSrv) {
                var _this = this;
                this.nodeName = node.renderName();
                this.nodeReference = node.renderReference();
                this.nodeContent = node.renderContent();

                this.adjacentNodes = [];

                var getNodes = function (depth) {
                    _this.nodeDepth = depth;
                    depth--;

                    _this.adjacentNodes = GraphSrv.graph.getAdjacentNodes(node);

                    for (var i = 0; i < depth; i++) {
                        var newAdjacentNodes = _(_this.adjacentNodes).chain().map(function (node) {
                            return [node].concat(_.map(GraphSrv.graph.getAdjacentNodes(node), function (node) {
                                return node._getData();
                            }));
                        }).flatten().uniq(function (node) {
                            return node._getUId();
                        }).valueOf();
                        _this.adjacentNodes = newAdjacentNodes;
                    }

                    _this.adjacentWords = _.filter(_this.adjacentNodes, function (node) {
                        return node.type === 0 /* Word */;
                    });
                    _this.adjacentVerses = _.filter(_this.adjacentNodes, function (node) {
                        return node.type === 1 /* Verse */;
                    });
                    _this.adjacentSentences = _.filter(_this.adjacentNodes, function (node) {
                        return node.type === 2 /* Sentence */;
                    });
                    _this.adjacentPeople = _.filter(_this.adjacentNodes, function (node) {
                        return node.type === 3 /* Person */;
                    });

                    _this.accordionGroups = [
                        {
                            heading: 'Adjacent Words',
                            renderContent: false,
                            adjacentNodes: _this.adjacentWords,
                            isOpen: !!_this.adjacentWords.length
                        }, {
                            heading: 'Adjacent Verses',
                            renderContent: true,
                            adjacentNodes: _this.adjacentVerses,
                            isOpen: !!_this.adjacentVerses.length
                        }, {
                            heading: 'Adjacent Sentences',
                            renderContent: true,
                            adjacentNodes: _this.adjacentSentences,
                            isOpen: !!_this.adjacentSentences.length
                        }, {
                            heading: 'Adjacent People',
                            renderContent: true,
                            adjacentNodes: _this.adjacentPeople,
                            isOpen: !!_this.adjacentPeople.length
                        }, {
                            heading: 'All Nodes',
                            renderContent: true,
                            adjacentNodes: _this.adjacentNodes,
                            isOpen: !!_this.adjacentNodes.length
                        }];

                    _this.accordionGroups = _.filter(_this.accordionGroups, function (aGroup) {
                        return aGroup.isOpen;
                    });
                };

                this.nodeDepth = 1;

                $scope.$watch(function () {
                    return _this.nodeDepth;
                }, function (nodeDepth) {
                    nodeDepth = Math.max(1, nodeDepth);
                    getNodes(nodeDepth);
                });
            }]);
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        (function (NodeContentType) {
            NodeContentType[NodeContentType["Word"] = 0] = "Word";
            NodeContentType[NodeContentType["Verse"] = 1] = "Verse";
            NodeContentType[NodeContentType["Sentence"] = 2] = "Sentence";
            NodeContentType[NodeContentType["Person"] = 3] = "Person";
            NodeContentType[NodeContentType["BaseType"] = 4] = "BaseType";
        })(graph.NodeContentType || (graph.NodeContentType = {}));
        var NodeContentType = graph.NodeContentType;

        var Node = (function () {
            function Node(originalContent) {
                this.setReference(originalContent);
                this.setContent(originalContent);
                this.setType();
            }
            Node.prototype.setType = function () {
                this.type = 4 /* BaseType */;
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

            Node.prototype.renderContent = function () {
                return this.content;
            };

            Node.prototype.makeAnchor = function (content) {
                return '<a href="#concordance/node/' + this._getUId() + '">' + content + '</a>';
            };

            Node.prototype.renderReference = function () {
                return this.reference;
            };

            Node.prototype.renderName = function () {
                return '';
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
    (function (_graph) {
        var GraphBuilder = (function () {
            function GraphBuilder(graph) {
                this.builderName = 'base';
                this.requiredBuilders = [];
                this.graph = null;
                this.canChangeGraph = true;
                if (graph) {
                    this.setGraph(graph);
                }
            }
            GraphBuilder.prototype.setGraph = function (graph) {
                if (this.canChangeGraph) {
                    this.graph = graph;
                }
            };

            GraphBuilder.prototype.buildGraph = function (passage) {
                var _this = this;
                this.canChangeGraph = false;
                GraphBuilder.beginProcessingGraph(this.graph._uid, this);
                if (this.canProcessGraph()) {
                    this.addNodes(passage);
                    GraphBuilder.finishProcessingGraph(this.graph._uid, this);
                    this.canChangeGraph = true;
                } else {
                    _.defer(function () {
                        _this.buildGraph(passage);
                    });
                }
            };

            GraphBuilder.prototype.addNodes = function (passage) {
            };

            GraphBuilder.prototype.getNodes = function (subPassage) {
                return [];
            };

            GraphBuilder.prototype.getSharedBuilder = function (builderName) {
                return GraphBuilder.getPendingBuilder(this.graph._uid, builderName);
            };

            GraphBuilder.prototype.canProcessGraph = function () {
                return (_.intersection(GraphBuilder.graphsProcessed[this.graph._uid], this.requiredBuilders).length >= this.requiredBuilders.length);
            };

            GraphBuilder.beginProcessingGraph = function (graphUid, graphBuilder) {
                if (!GraphBuilder.graphsProcessed[graphUid]) {
                    GraphBuilder.graphsProcessed[graphUid] = [];
                }

                if (!GraphBuilder.pendingBuilders[graphUid]) {
                    GraphBuilder.pendingBuilders[graphUid] = [];
                }
                GraphBuilder.pendingBuilders[graphUid].push({
                    builderName: graphBuilder.builderName,
                    builder: graphBuilder
                });
            };

            GraphBuilder.finishProcessingGraph = function (graphUid, graphBuilder) {
                GraphBuilder.graphsProcessed[graphUid].push(graphBuilder.builderName);
            };

            GraphBuilder.getPendingBuilder = function (graphUid, builderName) {
                if (GraphBuilder.pendingBuilders[graphUid]) {
                    var firstBuilder = _.find(GraphBuilder.pendingBuilders[graphUid], function (pendingBuilder) {
                        return pendingBuilder.builderName === builderName;
                    });
                    if (firstBuilder) {
                        return firstBuilder.builder;
                    }
                }
                return null;
            };

            GraphBuilder.graphsProcessed = {};

            GraphBuilder.pendingBuilders = {};
            return GraphBuilder;
        })();
        _graph.GraphBuilder = GraphBuilder;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graphData) {
        graphData.ephesians = [
            '1:1 Paul, an apostle of Christ Jesus through the will of God, to the saints who are at Ephesus, and the faithful in Christ Jesus: 1:2 Grace to you and peace from God our Father and the Lord Jesus Christ. 1:3 Blessed be the God and Father of our Lord Jesus Christ, who has blessed us with every spiritual blessing in the heavenly places in Christ; 1:4 even as he chose us in him before the foundation of the world, that we would be holy and without defect before him in love; 1:5 having predestined us for adoption as children through Jesus Christ to himself, according to the good pleasure of his desire, 1:6 to the praise of the glory of his grace, by which he freely gave us favor in the Beloved, 1:7 in whom we have our redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace, 1:8 which he made to abound toward us in all wisdom and prudence, 1:9 making known to us the mystery of his will, according to his good pleasure which he purposed in him 1:10 to an administration of the fullness of the times, to sum up all things in Christ, the things in the heavens, and the things on the earth, in him; 1:11 in whom also we were assigned an inheritance, having been foreordained according to the purpose of him who does all things after the counsel of his will; 1:12 to the end that we should be to the praise of his glory, we who had before hoped in Christ. 1:13 In him you also, having heard the word of the truth, the Good News of your salvation—in whom, having also believed, you were sealed with the promised Holy Spirit, 1:14 who is a pledge of our inheritance, to the redemption of God’s own possession, to the praise of his glory. 1:15 For this cause I also, having heard of the faith in the Lord Jesus which is among you, and the love which you have toward all the saints, 1:16 don’t cease to give thanks for you, making mention of you in my prayers, 1:17 that the God of our Lord Jesus Christ, the Father of glory, may give to you a spirit of wisdom and revelation in the knowledge of him; 1:18 having the eyes of your hearts* enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints, 1:19 and what is the exceeding greatness of his power toward us who believe, according to that working of the strength of his might 1:20 which he worked in Christ, when he raised him from the dead, and made him to sit at his right hand in the heavenly places, 1:21 far above all rule, and authority, and power, and dominion, and every name that is named, not only in this age, but also in that which is to come. 1:22 He put all things in subjection under his feet, and gave him to be head over all things for the assembly, 1:23 which is his body, the fullness of him who fills all in all.',
            '2:1 You were made alive when you were dead in transgressions and sins, 2:2 in which you once walked according to the course of this world, according to the prince of the power of the air, the spirit who now works in the children of disobedience; 2:3 among whom we also all once lived in the lusts of our flesh, doing the desires of the flesh and of the mind, and were by nature children of wrath, even as the rest. 2:4 But God, being rich in mercy, for his great love with which he loved us, 2:5 even when we were dead through our trespasses, made us alive together with Christ (by grace you have been saved), 2:6 and raised us up with him, and made us to sit with him in the heavenly places in Christ Jesus, 2:7 that in the ages to come he might show the exceeding riches of his grace in kindness toward us in Christ Jesus; 2:8 for by grace you have been saved through faith, and that not of yourselves; it is the gift of God, 2:9 not of works, that no one would boast. 2:10 For we are his workmanship, created in Christ Jesus for good works, which God prepared before that we would walk in them. 2:11 Therefore remember that once you, the Gentiles in the flesh, who are called “uncircumcision” by that which is called “circumcision”, (in the flesh, made by hands); 2:12 that you were at that time separate from Christ, alienated from the commonwealth of Israel, and strangers from the covenants of the promise, having no hope and without God in the world. 2:13 But now in Christ Jesus you who once were far off are made near in the blood of Christ. 2:14 For he is our peace, who made both one, and broke down the middle wall of partition, 2:15 having abolished in his flesh the hostility, the law of commandments contained in ordinances, that he might create in himself one new man of the two, making peace; 2:16 and might reconcile them both in one body to God through the cross, having killed the hostility thereby. 2:17 He came and preached peace to you who were far off and to those who were near. 2:18 For through him we both have our access in one Spirit to the Father. 2:19 So then you are no longer strangers and foreigners, but you are fellow citizens with the saints, and of the household of God, 2:20 being built on the foundation of the apostles and prophets, Christ Jesus himself being the chief cornerstone; 2:21 in whom the whole building, fitted together, grows into a holy temple in the Lord; 2:22 in whom you also are built together for a habitation of God in the Spirit.',
            '3:1 For this cause I, Paul, am the prisoner of Christ Jesus on behalf of you Gentiles, 3:2 if it is so that you have heard of the administration of that grace of God which was given me toward you; 3:3 how that by revelation the mystery was made known to me, as I wrote before in few words, 3:4 by which, when you read, you can perceive my understanding in the mystery of Christ; 3:5 which in other generations was not made known to the children of men, as it has now been revealed to his holy apostles and prophets in the Spirit; 3:6 that the Gentiles are fellow heirs, and fellow members of the body, and fellow partakers of his promise in Christ Jesus through the Good News, 3:7 of which I was made a servant, according to the gift of that grace of God which was given me according to the working of his power. 3:8 To me, the very least of all saints, was this grace given, to preach to the Gentiles the unsearchable riches of Christ, 3:9 and to make all men see what is the administration* of the mystery which for ages has been hidden in God, who created all things through Jesus Christ; 3:10 to the intent that now through the assembly the manifold wisdom of God might be made known to the principalities and the powers in the heavenly places, 3:11 according to the eternal purpose which he purposed in Christ Jesus our Lord; 3:12 in whom we have boldness and access in confidence through our faith in him. 3:13 Therefore I ask that you may not lose heart at my troubles for you, which are your glory. 3:14 For this cause, I bow my knees to the Father of our Lord Jesus Christ, 3:15 from whom every family in heaven and on earth is named, 3:16 that he would grant you, according to the riches of his glory, that you may be strengthened with power through his Spirit in the inward man; 3:17 that Christ may dwell in your hearts through faith; to the end that you, being rooted and grounded in love, 3:18 may be strengthened to comprehend with all the saints what is the width and length and height and depth, 3:19 and to know Christ’s love which surpasses knowledge, that you may be filled with all the fullness of God. 3:20 Now to him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us, 3:21 to him be the glory in the assembly and in Christ Jesus to all generations forever and ever. Amen.',
            '4:1 I therefore, the prisoner in the Lord, beg you to walk worthily of the calling with which you were called, 4:2 with all lowliness and humility, with patience, bearing with one another in love; 4:3 being eager to keep the unity of the Spirit in the bond of peace. 4:4 There is one body, and one Spirit, even as you also were called in one hope of your calling; 4:5 one Lord, one faith, one baptism, 4:6 one God and Father of all, who is over all, and through all, and in us all. 4:7 But to each one of us was the grace given according to the measure of the gift of Christ. 4:8 Therefore he says, “When he ascended on high, he led captivity captive, and gave gifts to people.” 4:9 Now this, “He ascended”, what is it but that he also first descended into the lower parts of the earth? 4:10 He who descended is the one who also ascended far above all the heavens, that he might fill all things. 4:11 He gave some to be apostles; and some, prophets; and some, evangelists; and some, shepherds and teachers; 4:12 for the perfecting of the saints, to the work of serving, to the building up of the body of Christ; 4:13 until we all attain to the unity of the faith, and of the knowledge of the Son of God, to a full grown man, to the measure of the stature of the fullness of Christ; 4:14 that we may no longer be children, tossed back and forth and carried about with every wind of doctrine, by the trickery of men, in craftiness, after the wiles of error; 4:15 but speaking truth in love, we may grow up in all things into him, who is the head, Christ; 4:16 from whom all the body, being fitted and knit together through that which every joint supplies, according to the working in measure of each individual part, makes the body increase to the building up of itself in love. 4:17 This I say therefore, and testify in the Lord, that you no longer walk as the rest of the Gentiles also walk, in the futility of their mind, 4:18 being darkened in their understanding, alienated from the life of God, because of the ignorance that is in them, because of the hardening of their hearts; 4:19 who having become callous gave themselves up to lust, to work all uncleanness with greediness. 4:20 But you didn’t learn Christ that way; 4:21 if indeed you heard him, and were taught in him, even as truth is in Jesus: 4:22 that you put away, as concerning your former way of life, the old man, that grows corrupt after the lusts of deceit; 4:23 and that you be renewed in the spirit of your mind, 4:24 and put on the new man, who in the likeness of God has been created in righteousness and holiness of truth. 4:25 Therefore putting away falsehood, speak truth each one with his neighbor. For we are members of one another. 4:26 “Be angry, and don’t sin.” Don’t let the sun go down on your wrath, 4:27 and don’t give place to the devil. 4:28 Let him who stole steal no more; but rather let him labor, producing with his hands something that is good, that he may have something to give to him who has need. 4:29 Let no corrupt speech proceed out of your mouth, but only what is good for building others up as the need may be, that it may give grace to those who hear. 4:30 Don’t grieve the Holy Spirit of God, in whom you were sealed for the day of redemption. 4:31 Let all bitterness, wrath, anger, outcry, and slander, be put away from you, with all malice. 4:32 And be kind to one another, tender hearted, forgiving each other, just as God also in Christ forgave you.',
            '5:1 Be therefore imitators of God, as beloved children. 5:2 Walk in love, even as Christ also loved you, and gave himself up for us, an offering and a sacrifice to God for a sweet-smelling fragrance. 5:3 But sexual immorality, and all uncleanness, or covetousness, let it not even be mentioned among you, as becomes saints; 5:4 nor filthiness, nor foolish talking, nor jesting, which are not appropriate; but rather giving of thanks. 5:5 Know this for sure, that no sexually immoral person, nor unclean person, nor covetous man, who is an idolater, has any inheritance in the Kingdom of Christ and God. 5:6 Let no one deceive you with empty words. For because of these things, the wrath of God comes on the children of disobedience. 5:7 Therefore don’t be partakers with them. 5:8 For you were once darkness, but are now light in the Lord. Walk as children of light, 5:9 for the fruit of the Spirit is in all goodness and righteousness and truth, 5:10 proving what is well pleasing to the Lord. 5:11 Have no fellowship with the unfruitful deeds of darkness, but rather even reprove them. 5:12 For the things which are done by them in secret, it is a shame even to speak of. 5:13 But all things, when they are reproved, are revealed by the light, for everything that reveals is light. 5:14 Therefore he says, “Awake, you who sleep, and arise from the dead, and Christ will shine on you.” 5:15 Therefore watch carefully how you walk, not as unwise, but as wise; 5:16 redeeming the time, because the days are evil. 5:17 Therefore don’t be foolish, but understand what the will of the Lord is. 5:18 Don’t be drunken with wine, in which is dissipation, but be filled with the Spirit, 5:19 speaking to one another in psalms, hymns, and spiritual songs; singing, and making melody in your heart to the Lord; 5:20 giving thanks always concerning all things in the name of our Lord Jesus Christ, to God, even the Father; 5:21 subjecting yourselves to one another in the fear of Christ. 5:22 Wives, be subject to your own husbands, as to the Lord. 5:23 For the husband is the head of the wife, as Christ also is the head of the assembly, being himself the savior of the body. 5:24 But as the assembly is subject to Christ, so let the wives also be to their own husbands in everything. 5:25 Husbands, love your wives, even as Christ also loved the assembly, and gave himself up for it; 5:26 that he might sanctify it, having cleansed it by the washing of water with the word, 5:27 that he might present the assembly to himself gloriously, not having spot or wrinkle or any such thing; but that it should be holy and without defect. 5:28 Even so husbands also ought to love their own wives as their own bodies. He who loves his own wife loves himself. 5:29 For no man ever hated his own flesh; but nourishes and cherishes it, even as the Lord also does the assembly; 5:30 because we are members of his body, of his flesh and bones. 5:31 “For this cause a man will leave his father and mother, and will be joined to his wife. The two will become one flesh.”✡ 5:32 This mystery is great, but I speak concerning Christ and of the assembly. 5:33 Nevertheless each of you must also love his own wife even as himself; and let the wife see that she respects her husband.',
            '6:1 Children, obey your parents in the Lord, for this is right. 6:2 “Honor your father and mother,” which is the first commandment with a promise: 6:3 “that it may be well with you, and you may live long on the earth.” 6:4 You fathers, don’t provoke your children to wrath, but nurture them in the discipline and instruction of the Lord. 6:5 Servants, be obedient to those who according to the flesh are your masters, with fear and trembling, in singleness of your heart, as to Christ; 6:6 not in the way of service only when eyes are on you, as men pleasers; but as servants of Christ, doing the will of God from the heart; 6:7 with good will doing service, as to the Lord, and not to men; 6:8 knowing that whatever good thing each one does, he will receive the same again from the Lord, whether he is bound or free. 6:9 You masters, do the same things to them, and give up threatening, knowing that he who is both their Master and yours is in heaven, and there is no partiality with him. 6:10 Finally, be strong in the Lord, and in the strength of his might. 6:11 Put on the whole armor of God, that you may be able to stand against the wiles of the devil. 6:12 For our wrestling is not against flesh and blood, but against the principalities, against the powers, against the world’s rulers of the darkness of this age, and against the spiritual forces of wickedness in the heavenly places. 6:13 Therefore put on the whole armor of God, that you may be able to withstand in the evil day, and, having done all, to stand. 6:14 Stand therefore, having the utility belt of truth buckled around your waist, and having put on the breastplate of righteousness, 6:15 and having fitted your feet with the preparation of the Good News of peace; 6:16 above all, taking up the shield of faith, with which you will be able to quench all the fiery darts of the evil one. 6:17 And take the helmet of salvation, and the sword of the Spirit, which is the word* of God; 6:18 with all prayer and requests, praying at all times in the Spirit, and being watchful to this end in all perseverance and requests for all the saints: 6:19 on my behalf, that utterance may be given to me in opening my mouth, to make known with boldness the mystery of the Good News, 6:20 for which I am an ambassador in chains; that in it I may speak boldly, as I ought to speak. 6:21 But that you also may know my affairs, how I am doing, Tychicus, the beloved brother and faithful servant in the Lord, will make known to you all things; 6:22 whom I have sent to you for this very purpose, that you may know our state, and that he may comfort your hearts. 6:23 Peace be to the brothers, and love with faith, from God the Father and the Lord Jesus Christ. 6:24 Grace be with all those who love our Lord Jesus Christ with incorruptible love. Amen.'
        ].join('');
    })(concordance.graphData || (concordance.graphData = {}));
    var graphData = concordance.graphData;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var ScriptureReference = (function () {
            function ScriptureReference() {
            }
            ScriptureReference.compare = function (refA, refB) {
                var chapterComparison = refA.chapter - refB.chapter;
                if (chapterComparison === 0) {
                    return refA.verse - refB.verse;
                } else {
                    return chapterComparison;
                }
            };
            return ScriptureReference;
        })();
        graph.ScriptureReference = ScriptureReference;

        var ScriptureGraph = (function (_super) {
            __extends(ScriptureGraph, _super);
            function ScriptureGraph(passage, graphBuilders) {
                var _this = this;
                _super.call(this);
                _(graphBuilders).each(function (graphBuilder) {
                    graphBuilder.setGraph(_this);
                }).each(function (graphBuilder) {
                    graphBuilder.buildGraph(passage);
                });
            }
            ScriptureGraph.prototype.getBook = function (bookName) {
                if (typeof bookName === "undefined") { bookName = 'ephesians'; }
                return (this.where(function (node) {
                    return (node.type === 1 /* Verse */ && node.scriptureRef.book === bookName);
                })).sort(function (nodeA, nodeB) {
                    return ScriptureReference.compare(nodeA.scriptureRef, nodeB.scriptureRef);
                });
            };

            ScriptureGraph.prototype.renderBook = function (bookName) {
                if (typeof bookName === "undefined") { bookName = 'ephesians'; }
                return _.reduce(this.getBook(), function (total, node) {
                    return total + node.renderContent();
                }, '');
            };
            return ScriptureGraph;
        })(graphs.Graph);
        graph.ScriptureGraph = ScriptureGraph;
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
                return 'word:' + originalContent.trim().toLowerCase();
            };

            WordNode.prototype.renderContent = function () {
                return this.makeAnchor(this.content);
            };

            WordNode.prototype.setType = function () {
                this.type = 0 /* Word */;
            };

            WordNode.prototype.renderReference = function () {
                return this.makeAnchor(this.renderName());
            };

            WordNode.prototype.renderName = function () {
                if (this.content === '') {
                    return '';
                }
                return 'Word: ' + this.content[0].toUpperCase() + this.content.substr(1).toLowerCase();
            };
            return WordNode;
        })(graph.Node);
        graph.WordNode = WordNode;

        var WordNodeGraphBuilder = (function (_super) {
            __extends(WordNodeGraphBuilder, _super);
            function WordNodeGraphBuilder() {
                _super.apply(this, arguments);
                this.builderName = 'word';
            }
            WordNodeGraphBuilder.prototype.addNodes = function (passage) {
                var _this = this;
                var wordNodes = this.getNodes(passage);
                _.each(wordNodes, function (wordNode) {
                    _this.graph.addNode(wordNode);
                });
            };

            WordNodeGraphBuilder.prototype.getNodes = function (subPassage) {
                var words = subPassage.split(WordNodeGraphBuilder.wordSpaceRegex);
                return _.map(words, function (word) {
                    return new WordNode(word);
                });
            };
            WordNodeGraphBuilder.wordSpaceRegex = /[\s\“\”\d\:\/\,\(\)]/g;
            return WordNodeGraphBuilder;
        })(graph.GraphBuilder);
        graph.WordNodeGraphBuilder = WordNodeGraphBuilder;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var VerseNode = (function (_super) {
            __extends(VerseNode, _super);
            function VerseNode(originalContent, scriptureRef) {
                this.scriptureRef = scriptureRef;
                _super.call(this, originalContent);
            }
            VerseNode.prototype.computeReference = function (originalContent) {
                return 'verse:' + this.scriptureRef.book + this.scriptureRef.chapter + ':' + this.scriptureRef.verse;
            };

            VerseNode.prototype.renderContent = function () {
                var content = this.content + '';
                var output = content.replace(VerseNode.wordMatchRegex, function (match) {
                    var wn = new graph.WordNode(match);
                    return wn.renderContent();
                });
                return this.renderReference() + output;
            };

            VerseNode.prototype.renderReference = function () {
                return this.makeAnchor(this.scriptureRef.chapter + ':' + this.scriptureRef.verse);
            };

            VerseNode.prototype.renderName = function () {
                return 'Ephesians ' + this.scriptureRef.chapter + ' Verse ' + this.scriptureRef.verse;
            };

            VerseNode.prototype.setType = function () {
                this.type = 1 /* Verse */;
            };
            VerseNode.wordMatchRegex = /([a-zA-Z\’]+)/ig;
            return VerseNode;
        })(graph.Node);
        graph.VerseNode = VerseNode;

        var VerseNodeGraphBuilder = (function (_super) {
            __extends(VerseNodeGraphBuilder, _super);
            function VerseNodeGraphBuilder() {
                _super.apply(this, arguments);
                this.builderName = 'verse';
                this.requiredBuilders = ['word'];
            }
            VerseNodeGraphBuilder.prototype.addNodes = function (passage) {
                var _this = this;
                var wordBuilder = this.getSharedBuilder('word');
                if (wordBuilder) {
                    var verseNodes = this.getNodes(passage);

                    _.each(verseNodes, function (verseNode) {
                        var verseText = verseNode.getContent();
                        var wordNodes = wordBuilder.getNodes(verseText);

                        _this.graph.addNode(verseNode);
                        _.each(wordNodes, function (wordNode) {
                            _this.graph.addEdge(verseNode, wordNode);
                        });
                    });
                }
            };

            VerseNodeGraphBuilder.prototype.getNodes = function (subPassage) {
                var verses = [];
                var verse;
                while ((verse = VerseNodeGraphBuilder.verseRegex.exec(subPassage)) !== null) {
                    verses.push(verse);
                }
                return _.map(verses, function (verse) {
                    var chapterAndVerse = verse[1].split(':');
                    return new VerseNode(verse[2], {
                        book: 'ephesians',
                        chapter: parseInt(chapterAndVerse[0], 10),
                        verse: parseInt(chapterAndVerse[1], 10)
                    });
                });
            };
            VerseNodeGraphBuilder.verseRegex = /([\d]\:[\d]{1,3})([A-Za-z\s\,\.\-\"\'\*\;\:\’\“\”]*)/g;
            return VerseNodeGraphBuilder;
        })(graph.GraphBuilder);
        graph.VerseNodeGraphBuilder = VerseNodeGraphBuilder;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var SentenceNode = (function (_super) {
            __extends(SentenceNode, _super);
            function SentenceNode(originalContent, sentenceNumber, book) {
                this.sentence = sentenceNumber;
                this.scriptureRefs = SentenceNode.getScriptureRefs(originalContent, book);
                _super.call(this, originalContent);
            }
            SentenceNode.prototype.computeReference = function (originalContent) {
                return 'sentence:' + this.sentence;
            };

            SentenceNode.prototype.renderContent = function () {
                var content = this.content + '';
                var output = content.replace(SentenceNode.verseRefRegex, '').replace(SentenceNode.wordMatchRegex, function (match) {
                    var wn = new graph.WordNode(match);
                    return wn.renderContent();
                });
                return output;
            };

            SentenceNode.prototype.renderReference = function () {
                return this.makeAnchor('Sentence #' + this.sentence);
            };

            SentenceNode.prototype.renderName = function () {
                return 'Sentence ' + this.sentence;
            };

            SentenceNode.getScriptureRefs = function (originalContent, book) {
                var verseReferences = originalContent.match(SentenceNode.verseRefRegex);
                return _.map(verseReferences, function (verseReference) {
                    var chapterAndVerse = verseReference.split(':');
                    return {
                        book: book,
                        chapter: parseInt(chapterAndVerse[0], 10),
                        verse: parseInt(chapterAndVerse[1], 10)
                    };
                });
            };
            SentenceNode.prototype.setType = function () {
                this.type = 2 /* Sentence */;
            };
            SentenceNode.wordMatchRegex = /([a-zA-Z\’]+)/ig;
            SentenceNode.verseRefRegex = /([\d]\:[\d]{1,3})/ig;
            return SentenceNode;
        })(graph.Node);
        graph.SentenceNode = SentenceNode;

        var SentenceNodeGraphBuilder = (function (_super) {
            __extends(SentenceNodeGraphBuilder, _super);
            function SentenceNodeGraphBuilder() {
                _super.apply(this, arguments);
                this.builderName = 'sentence';
                this.requiredBuilders = ['verse', 'word'];
            }
            SentenceNodeGraphBuilder.prototype.addNodes = function (passage) {
                var _this = this;
                var wordBuilder = this.getSharedBuilder('word');
                var verseBuilder = this.getSharedBuilder('verse');

                if (wordBuilder && verseBuilder) {
                    var sentenceNodes = this.getNodes(passage);

                    _.each(sentenceNodes, function (sentenceNode) {
                        var sentenceText = sentenceNode.getContent();
                        var wordNodes = wordBuilder.getNodes(sentenceText);
                        var verseNodes = _.map(sentenceNode.scriptureRefs, function (scriptureRef) {
                            return new graph.VerseNode('', scriptureRef);
                        });

                        _this.graph.addNode(sentenceNode);
                        _.each(wordNodes, function (wordNode) {
                            _this.graph.addEdge(sentenceNode, wordNode);
                        });
                        _.each(verseNodes, function (verseNode) {
                            _this.graph.addEdge(sentenceNode, verseNode);
                        });
                    });
                }
            };

            SentenceNodeGraphBuilder.prototype.getNodes = function (subPassage) {
                var sentences = [];
                var sentence;
                while ((sentence = SentenceNodeGraphBuilder.sentenceRegex.exec(subPassage)) !== null) {
                    sentences.push(sentence);
                }
                return _.map(sentences, function (sentence, count) {
                    return new SentenceNode(sentence[1], count, 'ephesians');
                });
            };
            SentenceNodeGraphBuilder.sentenceRegex = /([\dA-Za-z\s\,\-\"\'\*\;\:\’\“\”]*\.)/g;
            return SentenceNodeGraphBuilder;
        })(graph.GraphBuilder);
        graph.SentenceNodeGraphBuilder = SentenceNodeGraphBuilder;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var concordance;
(function (concordance) {
    (function (graph) {
        var PersonNode = (function (_super) {
            __extends(PersonNode, _super);
            function PersonNode() {
                _super.apply(this, arguments);
            }
            PersonNode.prototype.computeReference = function (originalContent) {
                return 'person:' + originalContent.trim().toLowerCase();
            };

            PersonNode.prototype.renderContent = function () {
                return this.makeAnchor(this.content);
            };

            PersonNode.prototype.setType = function () {
                this.type = 3 /* Person */;
            };

            PersonNode.prototype.renderReference = function () {
                return this.makeAnchor(this.renderName());
            };

            PersonNode.prototype.renderName = function () {
                if (this.content === '') {
                    return '';
                }
                return 'Person: ' + this.content[0].toUpperCase() + this.content.substr(1).toLowerCase();
            };
            return PersonNode;
        })(graph.Node);
        graph.PersonNode = PersonNode;

        var PersonNodeGraphBuilder = (function (_super) {
            __extends(PersonNodeGraphBuilder, _super);
            function PersonNodeGraphBuilder() {
                _super.apply(this, arguments);
                this.builderName = 'person';
                this.requiredBuilders = ['word', 'verse', 'sentence'];
            }
            PersonNodeGraphBuilder.prototype.addNodes = function (passage) {
                var _this = this;
                var wordNodeBuilder = this.getSharedBuilder('word');
                var verseNodeBuilder = this.getSharedBuilder('verse');
                var sentenceNodeBuilder = this.getSharedBuilder('sentence');

                if (wordNodeBuilder && verseNodeBuilder && sentenceNodeBuilder) {
                    var allNodes = verseNodeBuilder.getNodes(passage).concat(sentenceNodeBuilder.getNodes(passage)).concat(wordNodeBuilder.getNodes(passage));

                    _.each(allNodes, function (node) {
                        var personNodes = _this.getNodes(node.getContent());
                        if (personNodes.length) {
                            _.each(personNodes, function (personNode) {
                                _this.graph.addNode(personNode);
                                _this.graph.addEdge(personNode, node);
                            });
                        }
                    });
                }
            };

            PersonNodeGraphBuilder.prototype.getNodes = function (subPassage) {
                var nodes = [];
                _.each(PersonNodeGraphBuilder.names, function (name) {
                    var regex = new RegExp(name, 'gi');
                    if (regex.test(subPassage)) {
                        nodes.push(new PersonNode(name));
                    }
                });
                return nodes;
            };
            PersonNodeGraphBuilder.names = ['paul', 'jesus', 'ephesians'];
            return PersonNodeGraphBuilder;
        })(graph.GraphBuilder);
        graph.PersonNodeGraphBuilder = PersonNodeGraphBuilder;
    })(concordance.graph || (concordance.graph = {}));
    var graph = concordance.graph;
})(concordance || (concordance = {}));
var demo;
(function (demo) {
    (function (ts) {
        var ngModule = angular.module('demo.ts.factories', []);

        var GraphFactory = (function () {
            function GraphFactory() {
                return graphs.Graph;
            }
            return GraphFactory;
        })();
        ts.GraphFactory = GraphFactory;
        ngModule.factory('Graph', GraphFactory);

        var ConnectedComponentComputerFactory = (function () {
            function ConnectedComponentComputerFactory() {
                return graphs.ConnectedComponentComputer;
            }
            return ConnectedComponentComputerFactory;
        })();
        ts.ConnectedComponentComputerFactory = ConnectedComponentComputerFactory;
        ngModule.factory('ConnectedComponentComputer', ConnectedComponentComputerFactory);

        var BreadthFirstSearchFactory = (function () {
            function BreadthFirstSearchFactory() {
                return graphs.BreadthFirstSearch;
            }
            return BreadthFirstSearchFactory;
        })();
        ts.BreadthFirstSearchFactory = BreadthFirstSearchFactory;
        ngModule.factory('BreadthFirstSearch', BreadthFirstSearchFactory);

        _.each([
            'GraphBuilder',
            'Node',
            'ScriptureGraph',
            'VerseNode',
            'VerseNodeGraphBuilder',
            'WordNode',
            'WordNodeGraphBuilder',
            'SentenceNodeGraphBuilder',
            'PersonNodeGraphBuilder'
        ], function (className) {
            ngModule.factory(className, [function () {
                    return concordance.graph[className];
                }]);
        });

        ngModule.value('bibleText', {
            ephesians: concordance.graphData.ephesians
        });
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
var demo;
(function (demo) {
    (function (ts) {
        var ngModule = angular.module('demo.ts');

        var GraphSrv = (function () {
            function GraphSrv(bibleText, ScriptureGraph, VerseNodeGraphBuilder, SentenceNodeGraphBuilder, WordNodeGraphBuilder, PersonNodeGraphBuilder) {
                var graphBuilders;

                graphBuilders = [
                    new VerseNodeGraphBuilder(),
                    new WordNodeGraphBuilder(),
                    new SentenceNodeGraphBuilder(),
                    new PersonNodeGraphBuilder()
                ];

                this.graph = new ScriptureGraph(bibleText.ephesians, graphBuilders);
                this.nodes = [];
            }
            GraphSrv.$inject = [
                'bibleText',
                'ScriptureGraph',
                'VerseNodeGraphBuilder',
                'SentenceNodeGraphBuilder',
                'WordNodeGraphBuilder', 'PersonNodeGraphBuilder'];
            return GraphSrv;
        })();
        ts.GraphSrv = GraphSrv;

        ngModule.service('GraphSrv', GraphSrv);
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
//# sourceMappingURL=demo.js.map
