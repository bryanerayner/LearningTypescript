define(["require", "exports"], function (require, exports) {
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
    })(demo = exports.demo || (exports.demo = {}));
});
