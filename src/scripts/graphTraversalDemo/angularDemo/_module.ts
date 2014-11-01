/**
 * Created by bryanerayner on 14-11-01.
 */
///<reference path="../types.d.ts" />
///<reference path="../Graph.ts" />

module demo.ts
{
    var ngModule = angular.module('demo.ts', ['demo.ts.factories']);


    interface DemoDataSeed
    {
        people:Person[];
    }

    ngModule.value('demoDataSeed', <DemoDataSeed>{
        people:[
            {
                id:1,
                name:'Tommy',
                age:23,
                friends:[3]
            },{
                id:2,
                name:'Betty',
                age:54,
                friends:[5,6]
            },{
                id:3,
                name:'Frank',
                age:15,
                friends:[1,4]
            },{
                id:4,
                name:'Jennifer',
                age:12,
                friends:[1,3]
            },{
                id:5,
                name:'Lafawnduh',
                age:32,
                friends:[6]
            },{
                id:6,
                name:'Kip',
                age:34,
                friends:[5,7,8]
            },{
                id:7,
                name:'Napoleon',
                age:18,
                friends:[6,8]
            },{
                id:8,
                name:'Uncle Rico',
                age:42,
                friends:[7,6]
            },{
                id:9,
                name:'Starla',
                age:18,
                friends:[7]
            },{
                id:10,
                name:'Tina',
                age:6,
                friends:[7]
            }
        ]
    });
    interface FriendData
    {
        person:Person;
        friendGroupId:number;
    }

    ngModule.controller('DemoCtrl',
        [
            '$scope',
            'Graph',
            'PersonNode',
            'ConnectedComponentComputer',
            'BreadthFirstSearch',
            'demoDataSeed',
            function ($scope:ng.IScope,
                      Graph:typeof graphs.Graph,
                      PersonNode:typeof PersonNode,
                      ConnectedComponentComputer: typeof graphs.ConnectedComponentComputer,
                      BreadthFirstSearch: typeof graphs.BreadthFirstSearch,
                      demoDataSeed:DemoDataSeed) {

                var personNodes:PersonNode[] = [];

                _.each(demoDataSeed.people, (person)=>{
                    personNodes.push(new PersonNode(person));
                });

                var connections:graphs.INodeConnection[] = [];

                _.each(demoDataSeed.people, (person:Person)=>{
                    _.each(person.friends, (friend)=>
                    {
                        connections.push({
                            firstId:friend.toString(),
                            secondId:person.id.toString()
                        });
                    });
                });
                var friendsGraph:graphs.Graph<Person>;
                friendsGraph = new Graph(personNodes, connections);

                var ccPeople:graphs.ConnectedComponentComputer<Person>;
                ccPeople = new ConnectedComponentComputer(friendsGraph);

                ccPeople.getConnectedComponents(friendsGraph);



                this.ccPeople = ccPeople;
                this.friendsGraph = friendsGraph;

                this.numberOfFriendGroups = ccPeople.getCount();


                var friendsData :FriendData[] = [];
                this.friendsData = friendsData;
                this.computeFriendData = ()=>{
                    friendsData = [];

                    ccPeople.getConnectedComponents(friendsGraph);

                    var friendsNodes:graphs.INode<Person>[] = friendsGraph.getAllNodes();

                    _.each(friendsNodes, (friendNode:graphs.INode<Person>)=>{
                        friendsData.push(<FriendData>{
                            person:friendNode._getData(),
                            friendGroupId:ccPeople.getId(friendNode)
                        });
                    });

                    this.friendsData = friendsData;
                };

                // Set up a watch for the friend data
                $scope.$watchCollection(()=>{
                    return _.map(friendsGraph.getAllNodes(), (node:graphs.INode<Person>)=>{
                      return node._getData();
                    });
                }, (allPeople:Person[])=>{
                   this.computeFriendData();
                });


                this.getFriendByName = (name:string)=>{
                    name = name.trim().toLowerCase();
                    if (!name){
                        return null;
                    }
                    return friendsGraph.where((person)=>{
                        return person.name.toLowerCase().indexOf(name) > -1;
                    })[0];
                }

                this.friendsConnectedThrough = [];

                this.friendsAreConnected = (name1:string, name2:string)=>{
                    this.friendsConnectedThrough = [];

                    var firstFriend = this.getFriendByName(name1);
                    var secondFriend = this.getFriendByName(name2);
                    var areConnected:boolean = false;
                    if (firstFriend && secondFriend)
                    {
                        areConnected = ccPeople.areConnected(firstFriend,secondFriend);
                    }else{
                        areConnected = false;
                    }
                    if (areConnected)
                    {
                        // Make a new Breadth First Search to get the shortest path
                        var bfs:graphs.BreadthFirstSearch<Person> = new BreadthFirstSearch(friendsGraph);
                        bfs.search(friendsGraph, firstFriend);
                        var pathIds:string[] = bfs.pathTo(secondFriend);

                        _.each(pathIds, (nodeId)=>{
                            this.friendsConnectedThrough.unshift(friendsGraph.getNodeData(nodeId).name);
                        });
                    }
                    return areConnected;
                }

                this.name1 = '';
                this.name2 = '';

                this.addPerson = (name:string, age:string, friendNames:string = '')=>{

                    if (this.getFriendByName(name))
                    {
                        return;
                    }

                    var friendsNames:string[] = friendNames.split(',');
                    var friendNodes:graphs.INode<Person>[] = [];
                    _.each(friendsNames, (iName:string)=>{
                        var existingNode = this.getFriendByName(iName);
                        if (existingNode){
                            friendNodes.push(existingNode);
                        }
                    });

                    var newNode = new PersonNode({
                        name:name,
                        age:parseInt(age),
                        friends:_.map(friendNodes, (node:graphs.INode<Person>)=>{
                          return parseInt(node._getUId());
                        })
                    });

                    friendsGraph.addNode(newNode, newNode.person.friends);
                }


    }]);
}