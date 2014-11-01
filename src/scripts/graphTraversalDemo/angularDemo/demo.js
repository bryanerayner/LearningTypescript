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
var demo;
(function (demo) {
    (function (ts) {
        var ngModule = angular.module('demo.ts', ['demo.ts.factories']);

        ngModule.value('demoDataSeed', {
            people: [
                {
                    id: 1,
                    name: 'Tommy',
                    age: 23,
                    friends: [3]
                }, {
                    id: 2,
                    name: 'Betty',
                    age: 54,
                    friends: [5, 6]
                }, {
                    id: 3,
                    name: 'Frank',
                    age: 15,
                    friends: [1, 4]
                }, {
                    id: 4,
                    name: 'Jennifer',
                    age: 12,
                    friends: [1, 3]
                }, {
                    id: 5,
                    name: 'Lafawnduh',
                    age: 32,
                    friends: [6]
                }, {
                    id: 6,
                    name: 'Kip',
                    age: 34,
                    friends: [5, 7, 8]
                }, {
                    id: 7,
                    name: 'Napoleon',
                    age: 18,
                    friends: [6, 8]
                }, {
                    id: 8,
                    name: 'Uncle Rico',
                    age: 42,
                    friends: [7, 6]
                }, {
                    id: 9,
                    name: 'Starla',
                    age: 18,
                    friends: [7]
                }, {
                    id: 10,
                    name: 'Tina',
                    age: 6,
                    friends: [7]
                }
            ]
        });

        ngModule.controller('DemoCtrl', [
            '$scope',
            'Graph',
            'PersonNode',
            'ConnectedComponentComputer',
            'BreadthFirstSearch',
            'demoDataSeed',
            function ($scope, Graph, PersonNode, ConnectedComponentComputer, BreadthFirstSearch, demoDataSeed) {
                var _this = this;
                var personNodes = [];

                _.each(demoDataSeed.people, function (person) {
                    personNodes.push(new PersonNode(person));
                });

                var connections = [];

                _.each(demoDataSeed.people, function (person) {
                    _.each(person.friends, function (friend) {
                        connections.push({
                            firstId: friend.toString(),
                            secondId: person.id.toString()
                        });
                    });
                });
                var friendsGraph;
                friendsGraph = new Graph(personNodes, connections);

                var ccPeople;
                ccPeople = new ConnectedComponentComputer(friendsGraph);

                ccPeople.getConnectedComponents(friendsGraph);

                this.ccPeople = ccPeople;
                this.friendsGraph = friendsGraph;

                this.numberOfFriendGroups = ccPeople.getCount();

                var friendsData = [];
                this.friendsData = friendsData;
                this.computeFriendData = function () {
                    friendsData = [];

                    ccPeople.getConnectedComponents(friendsGraph);

                    var friendsNodes = friendsGraph.getAllNodes();

                    _.each(friendsNodes, function (friendNode) {
                        friendsData.push({
                            person: friendNode._getData(),
                            friendGroupId: ccPeople.getId(friendNode)
                        });
                    });

                    _this.friendsData = friendsData;
                };

                $scope.$watchCollection(function () {
                    return _.map(friendsGraph.getAllNodes(), function (node) {
                        return node._getData();
                    });
                }, function (allPeople) {
                    _this.computeFriendData();
                });

                this.getFriendByName = function (name) {
                    name = name.trim().toLowerCase();
                    if (!name) {
                        return null;
                    }
                    return friendsGraph.where(function (person) {
                        return person.name.toLowerCase().indexOf(name) > -1;
                    })[0];
                };

                this.friendsConnectedThrough = [];

                this.friendsAreConnected = function (name1, name2) {
                    _this.friendsConnectedThrough = [];

                    var firstFriend = _this.getFriendByName(name1);
                    var secondFriend = _this.getFriendByName(name2);
                    var areConnected = false;
                    if (firstFriend && secondFriend) {
                        areConnected = ccPeople.areConnected(firstFriend, secondFriend);
                    } else {
                        areConnected = false;
                    }
                    if (areConnected) {
                        var bfs = new BreadthFirstSearch(friendsGraph);
                        bfs.search(friendsGraph, firstFriend);
                        var pathIds = bfs.pathTo(secondFriend);

                        _.each(pathIds, function (nodeId) {
                            _this.friendsConnectedThrough.unshift(friendsGraph.getNodeData(nodeId).name);
                        });
                    }
                    return areConnected;
                };

                this.name1 = '';
                this.name2 = '';

                this.addPerson = function (name, age, friendNames) {
                    if (typeof friendNames === "undefined") { friendNames = ''; }
                    if (_this.getFriendByName(name)) {
                        return;
                    }

                    var friendsNames = friendNames.split(',');
                    var friendNodes = [];
                    _.each(friendsNames, function (iName) {
                        var existingNode = _this.getFriendByName(iName);
                        if (existingNode) {
                            friendNodes.push(existingNode);
                        }
                    });

                    var newNode = new PersonNode({
                        name: name,
                        age: parseInt(age),
                        friends: _.map(friendNodes, function (node) {
                            return parseInt(node._getUId());
                        })
                    });

                    friendsGraph.addNode(newNode, newNode.person.friends);
                };
            }]);
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
var demo;
(function (demo) {
    (function (ts) {
        var PersonNode = (function () {
            function PersonNode(person) {
                this.person = {
                    name: person.name,
                    age: person.age,
                    friends: person.friends,
                    id: Math.max(PersonNode.highestPersonId, (person.id) ? person.id : 0)
                };

                PersonNode.highestPersonId = Math.max(PersonNode.highestPersonId, this.person.id + 1);
            }
            PersonNode.prototype._getUId = function () {
                return this.person.id.toString();
            };

            PersonNode.prototype._getData = function () {
                return this.person;
            };

            PersonNode.prototype._getEdges = function () {
                return _.map(this.person.friends, function (friend) {
                    return friend.toString();
                });
            };
            PersonNode.highestPersonId = -Infinity;
            return PersonNode;
        })();
        ts.PersonNode = PersonNode;
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
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

        var PersonNodeFactory = (function () {
            function PersonNodeFactory() {
                return demo.ts.PersonNode;
            }
            return PersonNodeFactory;
        })();
        ts.PersonNodeFactory = PersonNodeFactory;
        ngModule.factory('PersonNode', PersonNodeFactory);

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
    })(demo.ts || (demo.ts = {}));
    var ts = demo.ts;
})(demo || (demo = {}));
//# sourceMappingURL=demo.js.map
