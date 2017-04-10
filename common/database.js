var conf = require("../conf");
var pool = require("./pool");
pool.configure(conf);

exports.use = function*(call) {
    var db = yield pool.open();
    try {
        var auth = conf.auth;
        if (auth) {
            yield db.authenticate(auth.user, auth.pwd);
        }
        return yield call(db);
    } finally {
        pool.close(db);
    }
};

exports.warp = function (fn, self) {
    if (!self) {
        self = {};
    }
    return function*() {
        var args = arguments;
        return yield exports.use(function*(db) {
            var arr = [db];
            for (var i in args) {
                arr.push(args[i]);
            }
            return yield fn.apply(self, arr);
        });
    };
};