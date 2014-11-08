/**
 * Created by bryanerayner on 14-11-04.
 */
///<reference path="../../Graph.ts"/>

module concordance.graph
{
    export enum NodeContentType
    {
        Word,
        Verse,
        BaseType
    }

    export interface NodeContent
    {
        content:string;
        reference:string;
        type:NodeContentType;
    }

    export class Node implements graphs.INode<Node>
    {
        public content:string;
        public reference:string;
        public type:NodeContentType;

        constructor(originalContent:string)
        {
            this.setReference(originalContent);
            this.setContent(originalContent);
            this.setType();
        }

        public setType(){
            this.type = NodeContentType.BaseType;
        }

        private setReference(originalContent:string){
            var newReference = this.computeReference(originalContent);
            this.reference = newReference;
        }

        public setContent(originalContent:string){
            this.content = originalContent;
        }

        public getContent(){
            return this.content;
        }

        public computeReference(originalContent:string){
            var newReference = originalContent;
            return newReference;
        }


        public _getUId()
        {
            return this.reference;
        }

        public _getData(){
            return this;
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

        public equals(other:Node) {
            return this.content == other.content;
        }

    }

}