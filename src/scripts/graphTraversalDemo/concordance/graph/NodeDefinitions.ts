/**
 * Created by bryanerayner on 14-11-05.
 */
///<reference path="node.ts"/>

module concordance.graph
{

    export class VerseNode extends Node
    {

        public computeReference(originalContent:string){
            return 'verse:'
        }

        public setType(){
            this.type = NodeContentType.Verse;
        }


        public renderContent(){
            return this.content;
        }

        /**
         *
         * @returns {string}
         */
        public renderReference(){
            return this.reference;
        }

    }
}