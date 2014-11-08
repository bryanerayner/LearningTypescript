/**
 * Created by bryanerayner on 14-11-08.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>
///<reference path="scriptureGraph.ts"/>

module concordance.graph {



    export class VerseNode extends Node
    {
        public scriptureRef:ScriptureReference;

        constructor(originalContent:string, scriptureRef:ScriptureReference)
        {
            this.scriptureRef = scriptureRef;
            super(originalContent);
        }

        public computeReference(originalContent:string) {
            return 'verse:'+this.scriptureRef.book+this.scriptureRef.chapter+this.scriptureRef.verse;
        }

        public setType(){
            this.type = NodeContentType.Verse;
        }
    }

    export class VerseNodeGraphBuilder extends GraphBuilder
    {
        /**
         * The name of the builder. Should be defined by each sub-class
         */
        public builderName = 'verse';

        public requiredBuilders = ['word'];

        /**
         * Should be overwritten by each sub-class. Adds nodes to the graph, and makes connections.
         * @param passage
         * @returns {any}
         */
        public addNodes(passage:string)
        {
            var wordBuilder = this.getSharedBuilder('word');
            if (wordBuilder)
            {
                // Grab all the verse nodes.
                var verseNodes = this.getNodes(passage);

                _.each(verseNodes, (verseNode)=>{

                    // Get the text of the verse. This, we will use to add the word nodes to.
                    var verseText = verseNode.getContent();
                    var wordNodes = wordBuilder.getNodes(verseText);

                    this.graph.addNode(verseNode);
                    _.each(wordNodes, (wordNode)=>{
                        this.graph.addEdge(verseNode, wordNode);
                    });
                });
            }
        }

        private static verseRegex:RegExp = /([\d]\:[\d]{1,3})([A-Za-z\s\,\.\"\'\;\:\’\“\”]*)/g;

        /**
         * Get the word nodes from a sentence
         * @param subPassage
         */
        public getNodes(subPassage:string)
        {
            var verses = VerseNodeGraphBuilder.verseRegex.exec(subPassage);
            return _.map(verses, (verse)=>{
                var chapterAndVerse = verse[0].split(':');
                return new VerseNode(verse[1], {
                    book:'',
                    chapter:parseInt(chapterAndVerse[0], 10),
                    verse:parseInt(chapterAndVerse[0], 10)
                });
            });
        }

    }

}