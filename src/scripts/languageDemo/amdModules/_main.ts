
import demo = require('./Demo');



window.onload = ()=>{

    var body = document.querySelector('body');
    var div = document.createElement('div');
    body.appendChild(div);

    var demo = new demo.Demo(div);

    demo.present();
};
