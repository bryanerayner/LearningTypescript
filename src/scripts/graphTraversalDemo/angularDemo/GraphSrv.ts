/// <reference path="_module.ts"/>
/// <reference path="graphFactory.ts"/>

module demo.ts {
    var ngModule = angular.module('demo.ts');

    export class GraphSrv
    {
        graph: concordance.graph.ScriptureGraph;
        nodes: graphs.INode<concordance.graph.Node>[];

        static $inject:string[] = [
            'bibleText',
            'ScriptureGraph',
            'VerseNodeGraphBuilder',
            'WordNodeGraphBuilder'];
        constructor(bibleText:{ephesians:string;},
                    ScriptureGraph:typeof concordance.graph.ScriptureGraph,
                    VerseNodeGraphBuilder:typeof concordance.graph.VerseNodeGraphBuilder,
                    WordNodeGraphBuilder:typeof concordance.graph.WordNodeGraphBuilder) {

            var graphBuilders:concordance.graph.GraphBuilder[];

            graphBuilders = [
                new VerseNodeGraphBuilder(),
                new WordNodeGraphBuilder()
            ];

            this.graph = new ScriptureGraph(bibleText.ephesians, graphBuilders);
            this.nodes = [];

        }
    }

    ngModule.service('GraphSrv', GraphSrv);
}