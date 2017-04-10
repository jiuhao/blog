var conf = require("../db/conf");
var database = require('../common/database');
var co = require("co");
co(database.warp(function*(db) {
    yield conf.set(db, "services", {
        http: 4001,
        ws: 4002
    });
})).then(function () {
    console.log("init db success");
}).catch(function (e) {
    console.error(e);
});