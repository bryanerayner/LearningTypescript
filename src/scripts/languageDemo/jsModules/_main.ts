///<reference path='./Demo' />
///<reference path='./presenter' />

window.onload = ()=>{

    var body = document.querySelector('body');
    var div = document.createElement('div');
    body.appendChild(div);

    var demo = new demo.modules.internal.Demo(div);

    demo.present();
};
