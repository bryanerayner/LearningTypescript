///<reference path="_module.ts" />

module demo.ts
{
    export interface Person
    {
        id:number;
        name:string;
        age:number;
        friends:number[];
    }

    export interface PersonArgs
    {
        id?:number;
        name:string;
        age:number;
        friends:number[];
    }

    export class PersonNode implements graphs.INode<Person>
    {
        private static highestPersonId:number = -Infinity;
        person:Person;
        constructor(person:PersonArgs)
        {
            this.person={
                name:person.name,
                age:person.age,
                friends:person.friends,
                id: Math.max(PersonNode.highestPersonId, (person.id) ? person.id : 0)
            };
            // Increment the highest person id.
            PersonNode.highestPersonId =
                Math.max(PersonNode.highestPersonId, this.person.id + 1);
        }
        _getUId(){
            return this.person.id.toString();
        }

        _getData(){
            return this.person;
        }

        _getEdges(){
            return _.map(this.person.friends, (friend)=>{
                return friend.toString();
            });
        }
    }
}