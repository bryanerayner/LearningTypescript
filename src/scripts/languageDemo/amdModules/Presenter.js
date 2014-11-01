define(["require", "exports"], function (require, exports) {
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
    exports.Presenter = Presenter;
});
