/**
 * Created by bryanerayner on 2014-10-18.
 */
///<reference path='./presenter' />
define(["require", "exports"], function (require, exports) {
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
    })(demo = exports.demo || (exports.demo = {}));
});
