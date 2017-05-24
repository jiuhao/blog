/**
 * anotherId 对方id
 * anotherNick 对方昵称
 * anotherHeadImageUrl 对方头像
 * userId 我的id
 * time 时间
 * notRead 未读消息
 * timestamp 时间戳
 * identify 身份
 * **/
var Time = require('../util/time');
var mongo = require('co-mongo');
var Url = require('../util/url');
/**
 * 添加会话
 * **/
exports.add = function *(db, another, userId) {
    var Dialog = db.dialog;
    var now = new Date().getTime();
    var time = Time.getTime(now);
    var r = yield Dialog.findOne({
        anotherId: another.id + '',
        userId: userId
    });
    if (r) {
        yield Dialog.update({
            anotherId: another.id + '',
            userId: userId
        }, {
            $set: {
                timestamp: now
            }
        });
    }
    if (!r) {
        if (!another.headImageUrl) {
            another.headImageUrl = Url.defaultHeadImageUrl;
        }
        yield Dialog.insert({
            anotherId: another.id + '',
            anotherNick: another.nick,
            anotherHeadImageUrl: another.headImageUrl,
            time: time,
            userId: userId + '',
            timestamp: now,
            notRead: 0,
            identify: another.identify
        });
    }
};
/**
 * 更新会话的时间
 * **/
exports.update = function *(db, another, userId) {
    var Dialog = db.dialog;
    var now = new Date().getTime();
    var time = Time.getTime(now);
    var r = yield Dialog.findOne({
        anotherId: another.id + '',
        userId: userId
    });
    if (!another.headImageUrl) {
        another.headImageUrl = Url.defaultHeadImageUrl;
    }
    if (!r) {
        yield Dialog.insert({
            anotherId: another.id + '',
            anotherNick: another.nick,
            anotherHeadImageUrl: another.headImageUrl,
            time: time,
            userId: userId + '',
            timestamp: now,
            notRead: 0,
            identify: another.identify
        });
    } else {
        yield Dialog.update({
            anotherId: another.id + '',
            userId: userId + ''
        }, {
            $set: {
                anotherNick: another.nick,
                anotherHeadImageUrl: another.headImageUrl,
                time: time,
                timestamp: now,
                identify: another.identify
            },
            $inc: {
                notRead: 1
            }
        });
    }
};
/**
 * 更新会话的时间
 * **/
exports.updateTime = function *(db, another, userId) {
    var Dialog = db.dialog;
    var now = new Date().getTime();
    var time = Time.getTime(now);
    var r = yield Dialog.findOne({
        anotherId: another.id + '',
        userId: userId
    });
    if (!another.headImageUrl) {
        another.headImageUrl = Url.defaultHeadImageUrl;
    }
    if (!r) {
        yield Dialog.insert({
            anotherId: another.id + '',
            anotherNick: another.nick,
            anotherHeadImageUrl: another.headImageUrl,
            time: time,
            userId: userId + '',
            timestamp: now,
            notRead: 0,
            identify: another.identify
        });
    } else {
        yield Dialog.update({
            anotherId: another.id + '',
            userId: userId + ''
        }, {
            $set: {
                anotherNick: another.nick,
                anotherHeadImageUrl: another.headImageUrl,
                time: time,
                timestamp: now,
                notRead: 0,
                identify: another.identify
            }
        });
    }
};
/**
 * 查看所有会话
 * @param
 * @param.status 身份identify
 * @param.keyword
 * @param.userId
 * **/
exports.list = function *(db, param) {
    var Dialog = db.dialog;
    var query = {};
    if (param.status) {
        query.identify = param.status;
    }
    var keywordCondition = [];
    if (param.keyword) {
        var regExp = new RegExp(param.keyword);
        keywordCondition.push({
            anotherNick: regExp
        });
        keywordCondition.push({
            anotherId: regExp
        });
        query.$and = [{
            $or: keywordCondition
        }];
    }
    query.userId = param.userId + '';
    var data = yield Dialog.find(query, {
        _id: true,
        anotherId: true,
        anotherNick: true,
        anotherHeadImageUrl: true,
        time: true,
        notRead: true,
        identify: true
    }).sort({timestamp: -1}).toArray();
    var total = yield Dialog.count(query);
    return {
        data: data,
        total: total
    };
};
/**
 * 删除会话
 * **/
exports.remove = function *(db, anotherId, userId) {
    var Dialog = db.dialog;
    var result = yield Dialog.findOne({
        anotherId: anotherId + '',
        userId: userId + ''
    });
    if (!result) {
        throw new Error('会话已删除');
    }
    var r = yield Dialog.remove({
        anotherId: anotherId + '',
        userId: userId + ''
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new Error('删除会话失败');
    }
};

/**
 * 未读消息清除
 * **/
exports.removeNumber = function*(db, anotherId, userId) {
    var Dialog = db.dialog;
    var r = yield Dialog.update({
        anotherId: anotherId + '',
        userId: userId + ''
    }, {
        $set: {
            notRead: 0
        }
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new Error('更新未读消息数量失败');
    }
};
/**
 * 查看所有会话
 * **/
exports.listLinkman = function *(db, userId) {
    var Dialog = db.dialog;
    return yield Dialog.find({
        userId: userId + '',
    }, {
        _id: false,
        anotherId: true,
        anotherNick: true,
        anotherHeadImageUrl: true,
        identify: true
    }).sort({timestamp: -1}).toArray();
};