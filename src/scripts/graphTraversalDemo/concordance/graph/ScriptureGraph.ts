/**
 * Created by bryanerayner on 14-11-04.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>
///<reference path="graphBuilder.ts"/>
///<reference path="ephesians.ts"/>

module concordance.graph
{

    export interface ScriptureReference
    {
        book:string;
        chapter:number;
        verse:number;
    }

    export class ScriptureGraph extends graphs.Graph<Node>
    {
        constructor(passage:string, graphBuilders:GraphBuilder[]){
            super();
            _(graphBuilders).each(
                (graphBuilder:GraphBuilder)=>{
                    graphBuilder.setGraph(this);
                }).each(
                (graphBuilder:GraphBuilder)=> {
                    graphBuilder.buildGraph(passage);
                });
        }


    }
}