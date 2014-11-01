var demo;
(function (demo) {
    var modules;
    (function (modules) {
        var internal;
        (function (internal) {
            var Presenter = (function () {
                function Presenter(demoName) {
                    this.demoName = demoName;
                    this.setPresenterFunc();
                }
                Presenter.prototype.setPresenterFunc = function (presenterFunc) {
                    if (presenterFunc === void 0) { presenterFunc = function (value) { return console.log(value); }; }
                    this.presenterFunc = presenterFunc;
                };
                Presenter.prototype.present = function () {
                    this.presenterFunc(this.demoName);
                };
                return Presenter;
            })();
            internal.Presenter = Presenter;
        })(internal = modules.internal || (modules.internal = {}));
    })(modules = demo.modules || (demo.modules = {}));
})(demo || (demo = {}));
/**
 * Created by bryanerayner on 2014-10-18.
 */
///<reference path='./presenter' />
var demo;
(function (demo) {
    var modules;
    (function (modules) {
        var internal;
        (function (internal) {
            var Demo = (function () {
                function Demo(div) {
                    var _this = this;
                    this.div = div;
                    this.presenter = new internal.Presenter('AMD Modules Demo');
                    this.presenter.setPresenterFunc(function (value) { return _this.writeToDiv(value); });
                }
                Demo.prototype.writeToDiv = function (phrase) {
                    this.div.innerHTML = this.div.innerHTML + phrase;
                };
                Demo.prototype.present = function () {
                    this.presenter.present();
                };
                return Demo;
            })();
            internal.Demo = Demo;
        })(internal = modules.internal || (modules.internal = {}));
    })(modules = demo.modules || (demo.modules = {}));
})(demo || (demo = {}));
///<reference path='./demo' />
///<reference path='./presenter' />
window.onload = function () {
    var body = document.querySelector('body');
    var div = document.createElement('div');
    body.appendChild(div);
    var demo = new demo.modules.internal.Demo(div);
    demo.present();
};
