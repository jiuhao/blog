/**
 * _id,英文名
 * content,内容
 **/
exports.get = function*(db, key) {
    var Conf = db.conf;
    var conf = yield Conf.findOne({_id: key});
    return conf ? conf.content : null;
};
exports.set = function*(db, key, value) {
    var Conf = db.conf;
    yield Conf.update({_id: key}, {
        $set: {
            _id: key,
            content: value
        }
    }, {upsert: true});
};