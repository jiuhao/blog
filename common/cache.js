//缓存渲染模版
module.exports = function (fn, maxAge) {
    var cache = {};
    this.get = function (name) {
        var x = cache[name];
        var now = new Date().getTime();
        if (!x || x.deadline < now) {
            var value = fn(name);
            x = {
                deadline: now + maxAge,
                value: value
            };
            cache[name] = x;
        }
        return x.value;
    };
};