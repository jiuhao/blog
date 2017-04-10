var hprose = require('hprose');
var co = require('co');
var database = require('../common/database');
var conf = require('../db/conf');
var Publisher = require('../common/publisher');
var User = require('../services/user');
var start = database.warp(function*(db, service) {
    var ops = yield conf.get(db, "services");
    for (var name in ops) {
        var value = ops[name];
        var url = name + "://0.0.0.0:" + value;
        var server = hprose.Server.create(url);
        for (var key in service) {
            var method = service[key];
            if (typeof method == 'function') {
                var fn = (function (m) {
                    return function () {
                        var len = arguments.length;
                        var callback = arguments[len - 1];
                        var args = [];
                        for (var i = 0; i < len - 1; i++) {
                            args.push(arguments[i]);
                        }
                        co(function*() {
                            try {
                                var result = yield m.apply(service, args);
                                callback(result);
                            } catch (e) {
                                callback(e);
                            }
                        });
                    };
                })(method);
                server.addAsyncFunction(fn, key);
            }
        }
        server.use(loghandler);
        Publisher.init(server, ['message']);
        //添加中间键
        server.start();
    }
});

//提供远程调用接口
var service = {};
service.test = User.login;
// 启动
co(function*() {
    try {
        yield start(service);
        console.log('' + 'up api success');
    } catch (e) {
        console.error('start up api error', e);
    }
});
