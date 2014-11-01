define(["require", "exports", './Presenter'], function (require, exports, presenter) {
    var Demo = (function () {
        function Demo(div) {
            var _this = this;
            this.div = div;
            this.presenter = new presenter.Presenter('AMD Modules Demo');
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
    exports.Demo = Demo;
});
