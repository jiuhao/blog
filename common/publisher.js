var servers = [];
exports.init = function (server, arr) {
    for (var i in arr) {
        var item = arr[i];
        server.publish(item);
    }
    servers.push(server);
};
exports.unicast = function*(topic, token, result) {
    for (var i in servers) {
        var server = servers[i];
        server.unicast(topic, token, result, function (result) {
            result = JSON.parse(result);
        });
    }
};