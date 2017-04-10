var mongo = require("co-mongo");
var co = require("co");

var conf = {
    url: 'mongodb://localhost:27017/blog',
    max: 5,
    min: 0,
    collections: []
};

exports.configure = function (c) {
    for (var name in c) {
        conf[name] = c[name];
    }
};


var pool = [];


function* connect() {
    var db = yield mongo.connect(conf.url);
    var cols = conf.collections.slice(0);
    for(var i in cols){
        var name = cols[i];
        db[name] = yield db.collection(name);
    }
    return db;
}
exports.open = function*() {
    var db = pool.shift();
    if (db) {
        if (pool.length < conf.min) {
            co(function*() {
                var x = yield connect();
                pool.push(x);
            });
        }
        return db;
    } else {
        var db = yield connect();
        return db;
    }
};


exports.close = function (db) {
    co(function*() {
        if (pool.length >= conf.max) {
            yield db.close();
        } else {
            pool.push(db);
        }
    });
};