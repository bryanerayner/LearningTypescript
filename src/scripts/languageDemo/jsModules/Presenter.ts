
module demo.modules.internal
{
    export class Presenter
    {
        demoName:string;
        presenterFunc:(value:string)=>void;
        constructor(demoName:string)
        {
            this.demoName = demoName;
            this.setPresenterFunc();
        }

        setPresenterFunc(presenterFunc:(value:string)=>void = (value:string)=>console.log(value))
        {
            this.presenterFunc = presenterFunc;
        }

        present(){
            this.presenterFunc(this.demoName);
        }
    }
}
