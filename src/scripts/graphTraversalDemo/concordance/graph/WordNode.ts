/**
 * Created by bryanerayner on 14-11-05.
 */
///<reference path="node.ts"/>

module concordance.graph
{
    export class WordNode extends Node
    {

        public computeReference(originalContent:string) {
            return originalContent.trim().toLowerCase();
        }

    }
}