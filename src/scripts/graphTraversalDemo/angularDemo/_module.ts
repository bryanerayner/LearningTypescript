/**
 * Created by bryanerayner on 14-11-01.
 */
///<reference path="../types.d.ts" />
///<reference path="../Graph.ts" />

module demo.ts
{
    var ngModule = angular.module('demo.ts', [
        'demo.ts.factories',
        'ui.router',
        'ui.bootstrap',
        'ngSanitize'
    ]);

    ngModule.config(['$stateProvider', ($stateProvider:ng.ui.IStateProvider)=>{

        $stateProvider.state({
            name:'concordance',
            url:'/concordance',
            controller:'DemoCtrl as demoCtrl',
            templateUrl:'demoTpl.html'
        });

        $stateProvider.state({
            name:'concordance.inspectNode',
            url:'/node/{nodeRef}',
            controller:'NodeCtrl as nodeCtrl',
            templateUrl:'nodeTpl.html',
            resolve:
            {
                node:['GraphSrv','$stateParams',
                    (GraphSrv:demo.ts.GraphSrv, $stateParams)=>{
                    return GraphSrv.graph.getNode($stateParams.nodeRef);
                }]
            }
        });
    }]);

    ngModule.run(['$state', ($state:ng.ui.IStateService)=>{
        $state.go('concordance');
    }]);

    ngModule.controller('DemoCtrl', ['$scope', 'GraphSrv', '$sce', function(
        $scope:ng.IScope,
        GraphSrv:demo.ts.GraphSrv,
        $sce:ng.ISCEService)
    {
        this.bookContent = '';
        this.nodes = GraphSrv.graph.getAllNodes();

        $scope.$watch(()=>{
            return GraphSrv.graph.nodesCount;
        }, ()=>{
            this.nodes = GraphSrv.graph.getAllNodes();
            this.bookContent = $sce.trustAsHtml(GraphSrv.graph.renderBook());
        });

        _.defer(()=>{
            $scope.$digest();
        }, 10);
    }]);

    ngModule.controller('NodeCtrl', ['$scope', 'node', 'GraphSrv',
        function(
            $scope:ng.IScope,
            node:concordance.graph.Node,
            GraphSrv:demo.ts.GraphSrv) {

            this.nodeName = node.renderName();
            this.nodeReference = node.renderReference();
            this.nodeContent = node.renderContent();

            this.adjacentNodes = <concordance.graph.Node[]>[];

            var getNodes = (depth:number)=> {
                this.nodeDepth = depth;
                depth--;

                this.adjacentNodes = GraphSrv.graph.getAdjacentNodes(node);

                for (var i = 0; i< depth; i ++){
                    var newAdjacentNodes = _(this.adjacentNodes).
                        chain().
                        map((node:concordance.graph.Node)=>{
                            return [node].concat(
                                _.map(GraphSrv.graph.getAdjacentNodes(node),
                                    (node:concordance.graph.Node) => {
                                        return node._getData();
                                }));
                        }).
                        flatten().
                        uniq((node:concordance.graph.Node)=>{
                            return node._getUId();
                        }).valueOf();
                    this.adjacentNodes = newAdjacentNodes;
                }

                this.adjacentWords = _.filter(this.adjacentNodes, (node:concordance.graph.Node)=> {
                    return node.type === concordance.graph.NodeContentType.Word;
                });
                this.adjacentVerses = _.filter(this.adjacentNodes, (node:concordance.graph.Node)=> {
                    return node.type === concordance.graph.NodeContentType.Verse;
                });
                this.adjacentSentences = _.filter(this.adjacentNodes, (node:concordance.graph.Node)=> {
                    return node.type === concordance.graph.NodeContentType.Sentence;
                });
                this.adjacentPeople = _.filter(this.adjacentNodes, (node:concordance.graph.Node)=>{
                    return node.type === concordance.graph.NodeContentType.Person;
                })

                this.accordionGroups = [{
                    heading: 'Adjacent Words',
                    renderContent:false,
                    adjacentNodes: this.adjacentWords,
                    isOpen:!!this.adjacentWords.length
                }, {
                    heading: 'Adjacent Verses',
                    renderContent:true,
                    adjacentNodes: this.adjacentVerses,
                    isOpen:!!this.adjacentVerses.length
                }, {
                    heading: 'Adjacent Sentences',
                    renderContent:true,
                    adjacentNodes: this.adjacentSentences,
                    isOpen:!!this.adjacentSentences.length
                }, {
                    heading: 'Adjacent People',
                    renderContent:true,
                    adjacentNodes: this.adjacentPeople,
                    isOpen:!!this.adjacentPeople.length
                },{
                    heading: 'All Nodes',
                    renderContent:true,
                    adjacentNodes: this.adjacentNodes,
                    isOpen:!!this.adjacentNodes.length
                }];

                this.accordionGroups = _.filter(this.accordionGroups, (aGroup)=>{
                    return aGroup.isOpen;
                });


            };

            this.nodeDepth = 1;

            $scope.$watch(()=>{
                return this.nodeDepth;
            }, (nodeDepth)=>{
                nodeDepth = Math.max(1, nodeDepth);
                getNodes(nodeDepth);
            });

    }]);

}