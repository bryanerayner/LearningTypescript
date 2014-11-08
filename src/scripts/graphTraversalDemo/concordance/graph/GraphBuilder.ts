/**
 * Created by bryanerayner on 14-11-07.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>

module concordance.graph {

    export class GraphBuilder
    {
        /**
         * The name of the builder. Should be defined by each sub-class
         */
        public builderName:string;
        /**
         * A list of builder names which are required by this builder.
         */
        public requiredBuilders:string[];
        public graph:graphs.IGraph<Node>;
        private canChangeGraph:boolean = false;

        constructor(graph?:graphs.IGraph<Node>)
        {
            if (graph)
            {
                this.setGraph(graph);
            }
        }

        setGraph(graph?:graphs.IGraph<Node>)
        {
            if (this.canChangeGraph) {
                this.graph = graph;
            }
        }

        /**
         * Add to a graph.
         * @param passage
         */
        public addToGraph(passage:string)
        {
            this.canChangeGraph = false;
            GraphBuilder.beginProcessingGraph(this.graph._uid, this);
            if (this.canProcessGraph())
            {
                this.addNodes(passage);
                GraphBuilder.finishProcessingGraph(this.graph._uid, this);
                this.canChangeGraph = true;
            }
            else
            {
                _.defer(()=>{
                    this.addToGraph(passage);
                });
            }
        }

        /**
         * Should be overwritten by each sub-class. Adds nodes to the graph, and makes connections.
         * @param passage
         * @returns {any}
         */
        public addNodes(passage:string)
        {

        }

        /**
         * Returns the nodes for a given passage.
         * @param subPassage
         * @returns {Array}
         */
        public getNodes(subPassage:string):graph.Node[]{
            return [];
        }

        public getSharedBuilder(builderName:string):GraphBuilder{
            return GraphBuilder.getPendingBuilder(this.graph._uid, builderName);
        }

        /**
         * Whether or not all the required builders have run on this graph.
         * @returns {boolean}
         */
        private canProcessGraph(){
            return (_.intersection(GraphBuilder.graphsProcessed[this.graph._uid], this.requiredBuilders).length >= this.requiredBuilders.length);
        }

        private static beginProcessingGraph(graphUid:string, graphBuilder:GraphBuilder){
            if (!GraphBuilder.graphsProcessed[graphUid]){
                GraphBuilder.graphsProcessed[graphUid] = [];
            }

            if (!GraphBuilder.pendingBuilders[graphUid]){
                GraphBuilder.pendingBuilders[graphUid] = [];
            }
            GraphBuilder.pendingBuilders[graphUid].push({
                builderName:graphBuilder.builderName,
                builder:graphBuilder
            });
        }

        private static finishProcessingGraph(graphUid:string, graphBuilder:GraphBuilder)
        {
            GraphBuilder.graphsProcessed[graphUid].push(graphBuilder.builderName);
        }

        private static getPendingBuilder(graphUid:string, builderName:string):GraphBuilder
        {
            if (GraphBuilder.pendingBuilders[graphUid]){
                var firstBuilder = _.find(GraphBuilder.pendingBuilders[graphUid],(pendingBuilder)=>{
                    return pendingBuilder.builderName === builderName;
                });
                if (firstBuilder){
                    return firstBuilder.builder;
                }
            }
            return null;
        }
        /**
         * GraphBuilders which have already processed the given graphs.
         * @type {{}}
         */
        private static graphsProcessed:{[key:string]:string[]} = {};
        /**
         * GraphBuilder's which are waiting to build particular graphs.
         * @type {{}}
         */
        private static pendingBuilders:{[key:string]:{
            builderName:string;
            builder:GraphBuilder;}[]} = {};
    }

}