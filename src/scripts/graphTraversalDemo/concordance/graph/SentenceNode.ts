///<reference path="verseNode.ts" />

module concordance.graph {



    export class SentenceNode extends Node implements graphs.INode<Node>
    {
        sentence:number;
        scriptureRefs:IScriptureReference[];

        constructor(originalContent:string, sentenceNumber:number, book:string)
        {
            this.sentence = sentenceNumber;
            this.scriptureRefs = SentenceNode.getScriptureRefs(originalContent, book);
            super(originalContent);
        }

        public computeReference(originalContent:string) {
            return 'sentence:'+
                this.sentence;
        }

        public renderContent(){
            var content = this.content + '';
            var output = content.replace(SentenceNode.verseRefRegex, '').
            replace(SentenceNode.wordMatchRegex, (match)=>{
                var wn = new WordNode(match);
                return wn.renderContent();
            });
            return output;
        }

        public renderReference(){
            return this.makeAnchor(
                'Sentence #' + this.sentence
            );
        }

        public renderName() {
            return 'Sentence ' +
                this.sentence;
        }

        private static wordMatchRegex:RegExp = /([a-zA-Z\’]+)/ig;
        private static verseRefRegex:RegExp = /([\d]\:[\d]{1,3})/ig;

        private static getScriptureRefs(originalContent:string, book:string):IScriptureReference[]
        {
            var verseReferences = originalContent.match(SentenceNode.verseRefRegex);
            return _.map(verseReferences, (verseReference)=>{
                var chapterAndVerse = verseReference.split(':');
                return {
                    book:book,
                    chapter:parseInt(chapterAndVerse[0], 10),
                    verse:parseInt(chapterAndVerse[1], 10)
                };
            });
        }
        public setType(){
            this.type = NodeContentType.Sentence;
        }
    }

    export class SentenceNodeGraphBuilder extends GraphBuilder
    {
        /**
         * The name of the builder. Should be defined by each sub-class
         */
        public builderName = 'sentence';

        public requiredBuilders = ['verse', 'word'];

        /**
         * Should be overwritten by each sub-class. Adds nodes to the graph, and makes connections.
         * @param passage
         * @returns {any}
         */
        public addNodes(passage:string)
        {
            var wordBuilder = this.getSharedBuilder('word');
            var verseBuilder = this.getSharedBuilder('verse');

            if (wordBuilder && verseBuilder)
            {
                // Grab all the verse nodes.
                var sentenceNodes = this.getNodes(passage);

                _.each(sentenceNodes, (sentenceNode:SentenceNode)=>{

                    // Get the text of the verse. This, we will use to add the word nodes to.
                    var sentenceText = sentenceNode.getContent();
                    var wordNodes = wordBuilder.getNodes(sentenceText);
                    var verseNodes = _.map(sentenceNode.scriptureRefs,
                        (scriptureRef)=>{
                            return new VerseNode('', scriptureRef);
                        });

                    this.graph.addNode(sentenceNode);
                    _.each(wordNodes, (wordNode)=>{
                        this.graph.addEdge(sentenceNode, wordNode);
                    });
                    _.each(verseNodes, (verseNode)=>{
                        this.graph.addEdge(sentenceNode, verseNode);
                    });
                });
            }
        }

        private static sentenceRegex:RegExp = /([\dA-Za-z\s\,\-\"\'\*\;\:\’\“\”]*\.)/g;

        /**
         * Get the word nodes from a sentence
         * @param subPassage
         */
        public getNodes(subPassage:string)
        {
            var sentences:RegExpExecArray[] = [];
            var sentence:RegExpExecArray;
            while ((sentence = SentenceNodeGraphBuilder.sentenceRegex.exec(subPassage)) !== null){
                sentences.push(sentence);
            }
            return _.map(sentences, (sentence:string, count:number)=>{
                return new SentenceNode(sentence[1], count, 'ephesians');
            });
        }

    }

}