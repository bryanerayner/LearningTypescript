/**
 * Created by bryanerayner on 14-11-08.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>

module concordance.graph {


    export class WordNode extends Node
    {

        public computeReference(originalContent:string) {
            return 'word:'+originalContent.trim().toLowerCase();
        }

        public setType(){
            this.type = NodeContentType.Word;
        }
    }

    export class WordNodeGraphBuilder extends GraphBuilder
    {
        /**
         * The name of the builder. Should be defined by each sub-class
         */
        public builderName = 'word';

        /**
         * Should be overwritten by each sub-class. Adds nodes to the graph, and makes connections.
         * @param passage
         * @returns {any}
         */
        public addNodes(passage:string)
        {
            var wordNodes = this.getNodes(passage);
            _.each(wordNodes, (wordNode)=>{
                this.graph.addNode(wordNode);
            });
        }

        /**
         * Get the word nodes from a sentence
         * @param subPassage
         */
        public getNodes(subPassage:string)
        {
            var words = subPassage.split(/[\s\d\.\'\"']*/i);
            return _.map(words, (word)=>{
                return new WordNode(word);
            });
        }

    }

}