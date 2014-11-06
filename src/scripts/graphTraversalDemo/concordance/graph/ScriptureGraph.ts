/**
 * Created by bryanerayner on 14-11-04.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>
///<reference path="wordnode.ts"/>
///<reference path="ephesians.ts"/>

module concordance.graph
{


    export class ScriptureGraph extends graphs.Graph<Node>
    {
        constructor(passage:string){
            super();
            this.parsePassage(passage);
        }

        parsePassage(passage:string){

            this.addVerses(passage);

        }

        addVerses(passage:string){
            var verses = passage.split(/[\d]{1,2}/);
            _.each(verses, (verse)=>{

            });
        }

        // Get words that are contained in a node, and add them to the graph.
        addWords(existingNode:Node){
            var words = existingNode.getContent().split(/[\s]/i);

            _.each(words, (word)=>{
                var newWordNode = new WordNode(word);
                var oldWordNode = this.getNode(newWordNode._getUId());
                if (oldWordNode)
                {
                    this.addEdge(oldWordNode, existingNode);
                }else{
                    this.addNode(newWordNode, [existingNode._getUId()]);
                }
            });
        }
    }
}