define(["require", "exports"], function (require, exports) {
    window.onload = function () {
        var body = document.querySelector('body');
        var div = document.createElement('div');
        body.appendChild(div);
        var demo = new demo.Demo(div);
        demo.present();
    };
});
