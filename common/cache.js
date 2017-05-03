//缓存渲染模版
module.exports = function (fn, maxAge) {
    let cache = {};
    this.get = function (name) {
        let x = cache[name];
        let now = new Date().getTime();
        if (!x || x.deadline < now) {
            let value = fn(name);
            x = {
                deadline: now + maxAge,
                value: value
            };
            cache[name] = x;
        }
        return x.value;
    };
};