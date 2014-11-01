/**
 * Created by bryanerayner on 2014-10-18.
 */
import presenter = require('./Presenter');

export class Demo
{
    div : HTMLDivElement;
    presenter: presenter.Presenter;

    constructor(div:HTMLDivElement){
        this.div = div;
        this.presenter = new presenter.Presenter('AMD Modules Demo');
        this.presenter.setPresenterFunc((value:string)=>this.writeToDiv(value));
    }

    writeToDiv(phrase:string){
        this.div.innerHTML = this.div.innerHTML + phrase;
    }

    present(){
        this.presenter.present();
    }
}