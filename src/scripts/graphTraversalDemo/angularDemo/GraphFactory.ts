/**
 * Created by bryanerayner on 14-11-01.
 */
///<reference path="_module.ts" />
///<reference path="Person.ts" />

module demo.ts
{
    var ngModule = angular.module('demo.ts.factories', []);


    export class GraphFactory
    {
        constructor(){
            return  <typeof graphs.Graph>graphs.Graph;
        }
    }
    ngModule.factory('Graph', GraphFactory);


    export class PersonNodeFactory
    {
        constructor(){
            return  <typeof demo.ts.PersonNode>demo.ts.PersonNode;
        }
    }
    ngModule.factory('PersonNode', PersonNodeFactory);


    export class ConnectedComponentComputerFactory
    {
        constructor(){
            return  <typeof graphs.ConnectedComponentComputer>graphs.ConnectedComponentComputer;
        }
    }
    ngModule.factory('ConnectedComponentComputer', ConnectedComponentComputerFactory);


    export class BreadthFirstSearchFactory
    {
        constructor(){
            return  <typeof graphs.BreadthFirstSearch>graphs.BreadthFirstSearch;
        }
    }
    ngModule.factory('BreadthFirstSearch', BreadthFirstSearchFactory);
}