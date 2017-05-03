var conf = require("../db/conf");
var database = require('../common/database');
var co = require("co");
// co(database.warp(function*(db) {
// })).then(function () {
//     console.log("init db success");
// }).catch(function (e) {
//     console.error(e);
// });