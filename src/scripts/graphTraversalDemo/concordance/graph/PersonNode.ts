/**
 * Created by bryanerayner on 14-11-08.
 */
///<reference path="../../Graph.ts"/>
///<reference path="node.ts"/>

module concordance.graph {


    export class PersonNode extends Node implements graphs.INode<Node>
    {

        public computeReference(originalContent:string) {
            return 'person:'+originalContent.trim().toLowerCase();
        }

        public renderContent() {
            return this.makeAnchor(this.content);
        }

        public setType(){
            this.type = NodeContentType.Person;
        }

        public renderReference(){
            return this.makeAnchor(this.renderName());
        }

        public renderName(){
            if (this.content === '') {
                return '';
            }
            return 'Person: ' + this.content[0].toUpperCase() + this.content.substr(1).toLowerCase();
        }
    }

    export class PersonNodeGraphBuilder extends GraphBuilder
    {
        /**
         * The name of the builder. Should be defined by each sub-class
         */
        public builderName = 'person';

        public requiredBuilders = ['word', 'verse', 'sentence'];

        /**
         * Should be overwritten by each sub-class. Adds nodes to the graph, and makes connections.
         * @param passage
         * @returns {any}
         */
        public addNodes(passage:string)
        {
            var wordNodeBuilder = this.getSharedBuilder('word');
            var verseNodeBuilder = this.getSharedBuilder('verse');
            var sentenceNodeBuilder = this.getSharedBuilder('sentence');

            if (wordNodeBuilder && verseNodeBuilder && sentenceNodeBuilder){

                var allNodes = verseNodeBuilder.getNodes(passage).concat(
                    sentenceNodeBuilder.getNodes(passage)
                ).concat(
                    wordNodeBuilder.getNodes(passage)
                );

                _.each(allNodes, (node:Node)=>{
                    var personNodes = this.getNodes(node.getContent());
                    if (personNodes.length){
                        _.each(personNodes, (personNode)=>{
                            this.graph.addNode(personNode);
                            this.graph.addEdge(personNode, node);
                        });
                    }
                });

            }

        }


        private static names = ['paul', 'jesus', 'ephesians'];

        /**
         * Get the word nodes from a sentence
         * @param subPassage
         */
        public getNodes(subPassage:string)
        {
            var nodes:PersonNode[] = [];
            _.each(PersonNodeGraphBuilder.names, (name)=>{
                var regex = new RegExp(name, 'gi');
                if (regex.test(subPassage))
                {
                    nodes.push(new PersonNode(name));
                }
            });
            return nodes;
        }


    }

}

