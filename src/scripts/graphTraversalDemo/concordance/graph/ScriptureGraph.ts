/**
 * Created by bryanerayner on 14-11-04.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>
///<reference path="NodeDefinitions.ts"/>
///<reference path="graphBuilder.ts"/>
///<reference path="ephesians.ts"/>

module concordance.graph
{


    export class ScriptureGraph extends graphs.Graph<Node>
    {
        constructor(passage:string, graphBuilders:GraphBuilder[]){
            super();
            _.each(graphBuilders, (graphBuilder:GraphBuilder)=>{
                graphBuilder.setGraph(this);
                graphBuilder.addNodes(passage);
            });
        }


    }
}