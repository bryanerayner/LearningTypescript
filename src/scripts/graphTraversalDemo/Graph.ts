/**
 * Created by bryanerayner on 2014-10-18.
 */
///<reference path="types.d.ts" />

module graphs
{
    export interface INode<T>
    {
        _getUId:()=>string; // The string
        _getData:()=> T; // The function which returns the data about the node
    }

    export interface INodeConnection
    {
        firstId: string;
        secondId: string;
    }

    // An interface for a graph
    export interface IGraph<T>
    {
        /**
         * The Unique Identifier for the graph.
         */
        _uid:string;
        addNode(newNode:INode<T>, biDirectionalEdges?:number[]): void;
        addNode(newNode:INode<T>, biDirectionalEdges?:string[]): void;
        addNode(newNode:INode<T>): void;
        addEdge(v: INode<T>, w: INode<T>): void;
        getAdjacentNodes(v: INode<T>): INode<any>[];
        countVertices(): number;
        countEdges(): number;
        getNodeIds(): string[];
        getNode(id:string): INode<T>;
        getNodeData(id:string): T;
        getAllNodes():INode<T>[];
        where(predicate:(data:T)=>boolean):INode<T>[];
    }

    export class Graph<T> implements IGraph<T>
    {
        public _uid:string;
        private nodes: {[key:string]:INode<T>} = {};
        private connections: {[key:string]:string[]} = {};

        constructor (nodes?:INode<T>[], connections?:INodeConnection[]) {
            this._uid = _.uniqueId('graph');
            if (!connections) {
                connections = [];
            }
            if (nodes) {
                _.each(nodes,(node)=> {
                    var uId = node._getUId();

                    this.nodes[uId] = node;
                });
            }

            if (connections) {
                // Build a doubly connected graph for this.
                _.each(connections, (connection)=> {
                    var firstId = connection.firstId;
                    var secondId = connection.secondId;
                    this.connections[firstId] =
                        (this.connections[firstId] || []).concat(secondId);
                    this.connections[secondId] =
                        (this.connections[secondId] || []).concat(firstId);
                });
            }
        }

        getNode(id:string):INode<T>{
            return this.nodes[id];
        }

        getNodeData(id:string):T{
            return this.getNode(id)._getData();
        }

        getAllNodes():INode<T>[]{
            return _.map(this.getNodeIds(), (id)=>{
                return this.getNode(id);
            });
        }
        addNode(newNode:graphs.INode<T>, biDirectionalEdges?:number[]):void;
        addNode(newNode:graphs.INode<T>, biDirectionalEdges?:string[]):void;
        addNode(newNode:graphs.INode<T>, biDirectionalEdges:any[]=[]):void {
            this.nodes[newNode._getUId()] = newNode;
            _.each(biDirectionalEdges, (edge)=>{
               this.addEdge(newNode, this.getNode(edge.toString()));
            });
        }

        addEdge(v:INode<T>, w:INode<T>):void {
            if (!v || !w){
                return;
            }
            var firstId = v._getUId();
            var secondId = w._getUId();
            if (!this.connections[firstId]){
                this.connections[firstId] = [];
            }
            if (!this.connections[secondId]){
                this.connections[secondId] = [];
            }
            this.connections[firstId].push(secondId);
            this.connections[secondId].push(firstId);
        }

        getAdjacentNodes(v:INode<T>):INode<T>[] {
            var adjacentNodes:any[] = [];
            var nodeId = v._getUId();
            var adjacentNodeIds = this.connections[nodeId] || [];
            adjacentNodeIds.forEach((id)=>{
               adjacentNodes.push(this.nodes[id]);
            });
            return adjacentNodes;
        }

        countVertices():number {
            return _.keys(this.nodes).length;
        }

        getNodeIds():string[]{
            return _.keys(this.nodes);
        }

        countEdges():number {
            var edgeCount:number = _.reduce(this.connections, (sum:number, connections:string[])=>{
                sum = sum + connections.length;
                return sum;
            }, 0);
            return edgeCount;
        }

        where(predicate:(data:T)=>boolean): INode<T>[]{
            var nodes = [];
            _.each(this.getAllNodes(), (node:INode<T>)=>{
                if (predicate(node._getData())){
                    nodes.push(node);
                }
            });
            return nodes;
        }
    }




    export interface IGraphSearch<T>
    {
        search(graph:IGraph<T>, startNode:INode<T>):void;
        hasPathTo(startNode:INode<T>):boolean;
        pathTo(node:INode<T>):string[];
        reset():void;
    }

    // Base class for Graph computations which require marking of nodes.
    export class GraphComputations<T>
    {
        public graph:IGraph<T>;
        public marked:{[key:string]:boolean} = {};


        constructor(graph:IGraph<T>){
            this.graph = graph;
            this.init();
        }

        init(){
            this.marked = {};
            _.each(this.graph.getNodeIds(), (nodeId)=>{
                this.marked[nodeId] = false;
            });
        }
    }

    export class GraphSearch<T> extends GraphComputations<T> implements IGraphSearch<T> {

        public graph:IGraph<T>;
        public edgeTo:{[key:string]:string} = {};
        public startId:string = null;

        constructor(graph:IGraph<T>){
            super(graph);
            this.init();
        }

        init(){
            super.init();
            this.edgeTo = {};
            _.each(this.graph.getNodeIds(), (nodeId)=>{
                this.edgeTo[nodeId] = null;
            });
        }


        search(graph:graphs.IGraph<T>, startNode:graphs.INode<T>){
            if (graph !== this.graph){
                throw "Graph must be the same throughout operations";
            }

        }

        setStartNode(startNode:INode<T>)
        {
            if (_.isUndefined(this.startId) || _.isNull(this.startId)){
                this.init();
                this.startId = startNode._getUId();
            }
        }

        reset(){
            this.startId = null;
        }

        hasPathTo(endNode:graphs.INode<T>):boolean {
            return this.marked[endNode._getUId()];
        }

        pathTo(endNode:graphs.INode<T>) : string[]{
            if (!this.hasPathTo(endNode)) {return null;}
            var ret = [];
            for (var i = endNode._getUId(); i !== this.startId; i = this.edgeTo[i]){
                ret.push(i);
            }
            return ret;
        }
    }

    export class DepthFirstSearch<T> extends GraphSearch<T>
    {
        public onVisitNode:(visitedNodeId:string)=>void;

        constructor(graph:IGraph<T>, visitedCallback:(visitedNodeId:string)=>void = null){
            super(graph);
            this.onVisitNode = visitedCallback;
        }

        search(graph:IGraph<T>):void;
        search(graph:IGraph<T>, startNode:INode<T>):void;
        search(graph:IGraph<T>, startNode:INode<T> = null):void {
            super.search(graph, startNode);
            this.setStartNode(startNode);

            this.marked[startNode._getUId()] = true;
            if (this.onVisitNode){
                this.onVisitNode(startNode._getUId());
            }
            var adjacentNodes:INode<T>[] = graph.getAdjacentNodes(startNode);
            _.each(adjacentNodes, (iNode:graphs.INode<T>) =>{
                if (!this.marked[iNode._getUId()]){
                    this.search(graph, iNode);
                    this.edgeTo[iNode._getUId()] = startNode._getUId();
                }
            });
        }

    }

    export class BreadthFirstSearch<T> extends GraphSearch<T>
    {
        constructor(graph:IGraph<T>){
            super(graph);
        }

        search(graph:IGraph<T>):void;
        search(graph:IGraph<T>, startNode:INode<T>):void;
        search(graph:IGraph<T>, startNode:INode<T> = null):void {
            super.search(graph, startNode);
            this.setStartNode(startNode);

            var q :INode<T>[] = [];
            q.push(startNode);
            this.marked[startNode._getUId()] = true;
            while (q.length){
                var queuedNode = q.shift();
                var adjacentNodes = graph.getAdjacentNodes(queuedNode);
                _.each(adjacentNodes, (adjacentNode)=>{
                    var uid = adjacentNode._getUId();
                    if (!this.marked[uid]){
                        q.push(adjacentNode);
                        this.marked[uid] = true;
                        this.edgeTo[uid] = queuedNode._getUId();
                    }
                });
            }
        }

    }

    export interface IConnectedComponentComputer<T>
    {
        // Find connected components in the graph
        getConnectedComponents(graph: IGraph<T>): void;
        // Are v and y connected?
        areConnected(v: INode<T>, w:INode<T>): boolean;
        // Number of connected components
        getCount():number;
        // Get the component identifier for v
        getId (v: INode<T>): number;
    }

    export class ConnectedComponentComputer<T> extends GraphComputations<T> implements IConnectedComponentComputer<T>
    {
        private count:number = 0;
        // Mapping from node, to connected component.
        connectedComponents:{[key:string]:number} = {};

        /**
         * Construct a new Connected Component Computer out of T
         * @param graph An IGraph of T to compute
         */
        constructor(graph:graphs.IGraph<T>){
            super(graph);
        }

        init()
        {
            super.init();
            this.count = 0;
            this.connectedComponents = {};
            _.each(this.graph.getNodeIds(), (nodeId)=>{
                this.connectedComponents[nodeId] = null;
            });
        }

        // Algorithm: Initialize all vertices as unmarked -
        // For each unmarked vertex v, run Depth First Search to identify
        // all vertices discovered as part of the same component
        getConnectedComponents(graph:graphs.IGraph<T>):void {
            this.graph = graph;
            this.init();

            var dfs:DepthFirstSearch<T> = new DepthFirstSearch(graph);

            _.each(graph.getNodeIds(), (nodeId)=>{

                if (!this.marked[nodeId])
                {
                    // This will be called each time that the DFS visits a node.
                    var onVisitNode = (visitedNodeId:string)=>{
                        this.marked[visitedNodeId] = true;
                        // Connect the two components together.
                        if (this.marked[visitedNodeId] && this.marked[nodeId]) {
                            this.connectedComponents[nodeId] = this.count;
                            this.connectedComponents[visitedNodeId] = this.count;
                        }
                    };
                    dfs.onVisitNode = onVisitNode;

                    dfs.search(graph, graph.getNode(nodeId));

                    this.count++;
                }
            });
        }

        areConnected(v:graphs.INode<T>, w:graphs.INode<T>):boolean {
            return this.getId(v) === this.getId(w);
        }

        getCount():number {
            return this.count;
        }

        getId(v:INode<any>):number {
            return this.connectedComponents[v._getUId()];
        }

    }

}