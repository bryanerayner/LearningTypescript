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

    export class ScriptureReference
    {
        /**
         * Compare two scripture references in ascending order, to be used in
         * Array.prototype.sort
         * @param refA The first reference
         * @param refB The second reference
         * @returns {number}
         */
        public static compare(refA:ScriptureReference, refB:ScriptureReference)
        {
            var chapterComparison = refA.chapter - refB.chapter;
            if (chapterComparison === 0){
                return refA.verse - refB.verse;
            }else
            {
                return chapterComparison;
            }
        }
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

        getBook(bookName:string='ephesians'):VerseNode[]{
            return (this.where((node:VerseNode)=>(
            node.type===NodeContentType.Verse && node.scriptureRef.book===bookName
            ))).sort((nodeA:VerseNode, nodeB:VerseNode)=>{
                    return ScriptureReference.compare(
                        nodeA.scriptureRef,
                        nodeB.scriptureRef
                    );
                });
        }

        renderBook(bookName:string='ephesians'):string {
            return _.reduce(this.getBook(), (total, node)=>{
                return total + node.renderContent();
            }, '');
        }
    }
}