/**
 * _id: 消息的id
 * fromUserId: 发送方向id
 * fromUserNick: 发送方的昵称
 * fromUserHeadImageUrl: 发送方的头像
 * fromIdentify: 对方的身份 1 10 100
 * toUserId: 接受用户id
 * toUserNick: 接收用户的昵称
 * toUserHeadImageUrl: 接受用户的头像
 * type: 消息类型, 文本消息 0 、 图片消息 1 、语音消息 2 、位置消息 3 、语音通话 4 、视频通话 5、礼物 6
 * content: 发送消息内容
 * timestamp: 服务端收到客户端发送消息时的服务器时间
 * orderStatus: 是否有订单,0为没有,1为有
 * status: 状态字段0为已经发起,1为已送达,2为已读
 * updateTime 数据最后一次更新的时间
 * **/
var mongo = require('co-mongo');
var Publisher = require('../common/publisher');
var User = require('../db/user');
var RealTimeCat = require('realtimecat-node-sdk');
var RealTimeCatUtil = require('../util/realtimecat');
var apiKey = RealTimeCatUtil.apiKey;
var apiSecret = RealTimeCatUtil.apiSecret;
var apiUrl = RealTimeCatUtil.apiUrl;
var Category = require('../db/category');
var System = require('../db/system');
var Session = require('../db/session');
var Url = require('../util/url');
var Push = require('../common/push');
/**
 * 保存聊天记录
 * @param: db 数据库连接
 * @param: chattingRecords.fromUserId 发送用户id
 * @param: chattingRecords.toUserId 接受用户id
 * @param: chattingRecords.type 消息类型
 * @param: chattingRecords.content 发送消息类容
 * **/
exports.saveChattingRecords = function*(db, chattingRecord) {
    var ChattingRecords = db.chattingRecords;
    if (!chattingRecord.fromUserHeadImageUrl) {
        chattingRecord.fromUserHeadImageUrl = Url.headImageUrl;
    }
    if (!chattingRecord.toUserHeadImageUrl) {
        chattingRecord.toUserHeadImageUrl = Url.headImageUrl
    }
    yield ChattingRecords.insert({
        _id: chattingRecord._id,
        fromUserId: chattingRecord.fromUserId + '',
        fromUserNick: chattingRecord.fromUserNick,
        fromUserHeadImageUrl: chattingRecord.fromUserHeadImageUrl,
        fromIdentify: chattingRecord.fromIdentify,
        toUserId: chattingRecord.toUserId + '',
        toUserNick: chattingRecord.toUserNick,
        toUserHeadImageUrl: chattingRecord.toUserHeadImageUrl,
        type: chattingRecord.type,
        content: chattingRecord.content,
        timestamp: chattingRecord.timestamp,
        status: 0,
        orderStatus: chattingRecord.orderStatus,
        updateTime: new Date().getTime()
    });
};
/**
 * 根据消息双方查看未送达的消息记录
 * @param: fromUserId 发起人的id
 * @param: toUserId 接受着的id
 * **/
exports.listChattingRecords = function*(db, fromUserId, toUserId) {
    var ChattingRecords = db.chattingRecords;
    return yield ChattingRecords.find({
            fromUserId: {$in: [fromUserId, toUserId]},
            toUserId: {$in: [fromUserId, toUserId]}
        }
    ).sort({timestamp: 1}).toArray();
};
/**
 * 更新消息状态为已经送达
 * @param: msgIdArray 消息_id数组
 * **/
exports.alreadyArrive = function*(db, msgIdArray) {
    var ChattingRecords = db.chattingRecords;
    var result = yield ChattingRecords.update({
        _id: {$in: msgIdArray}
    }, {
        $set: {
            status: 1,
            updateTime: new Date().getTime()
        }
    }, {
        multi: true
    });
    return result.result.n;
};
/**
 *
 * **/
exports.alreadyRead = function*(db, msgIdArray) {
    var ChattingRecords = db.chattingRecords;
    var result = yield ChattingRecords.update({
        _id: {$in: msgIdArray}
    }, {
        $set: {
            status: 2,
            updateTime: new Date().getTime()
        }
    }, {
        multi: true
    });
    return result.result.n;
};
/**
 * 用户查看未接收到的消息
 * **/
exports.listNotArrive = function*(db, toUserId) {
    var ChattingRecords = db.chattingRecords;
    return yield ChattingRecords.find({
        toUserId: toUserId,
        status: 0
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        toUserId: true,
        toUserNick: true,
        toUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).sort({timestamp: 1}).toArray();
};

/**
 * 系统结束会话
 * **/
exports.over = function*(db, order) {
    var category = yield Category.load(db, order.priceType);
    if (category.type > 1) {
        var realtimecat = new RealTimeCat({apiKey: apiKey, apiSecret: apiSecret, apiUrl: apiUrl});

        function hangup() {
            return new Promise(function (res, rej) {
                    realtimecat.delSession(order.sessionId, function (err, response) {
                        if (err) {
                            rej(err);
                        } else {
                            res(response);
                        }
                    });
                }
            );
        }

        var tmp = yield hangup();
        if (!tmp.status) {
            throw new Error('挂断失败');
        }
    }
    var fromUser = yield User.load(db, order.buyerId);
    var toUser = yield User.load(db, order.loverId);
    var data = {
        userId: fromUser._id + '',
        time: 0,
        type: 1//订单结束
    };
    yield System.add(db, fromUser._id + '', 0, 1);
    var toUserToken = yield Session.loadByUserId(db, toUser._id);
    yield Publisher.unicast('system', toUserToken + '', JSON.stringify(data));
    data.userId = toUser._id + '';
    yield System.add(db, toUser._id + '', 0, 1);
    toUserToken = yield Session.loadByUserId(db, fromUser._id);
    yield Publisher.unicast('system', toUserToken + '', JSON.stringify(data));
};
/**
 * 系统提醒
 * **/
exports.remind = function *(db, order, time) {
    var fromUser = yield User.load(db, order.buyerId);
    var toUser = yield User.load(db, order.loverId);
    var data = {
        userId: fromUser._id + '',
        time: time,
        type: 0//提醒时间
    };
    yield System.add(db, fromUser._id + '', time, 0);
    var toUserToken = yield Session.loadByUserId(db, toUser._id);
    yield Publisher.unicast('system', toUserToken, JSON.stringify(data));
    yield Push.push('ALIAS', toUser._id + '', 'MESSAGE', 'ALL', 'orderMessage', JSON.stringify(data));
    yield Push.push('ALIAS', toUser._id + '', 'NOTICE', 'ALL', '您有新的订单消息', '您有订单即将结束');
    data.userId = toUser._id + '';
    yield System.add(db, toUser._id + '', time, 0);
    toUserToken = yield Session.loadByUserId(db, fromUser._id);
    yield Publisher.unicast('system', toUserToken, JSON.stringify(data));
    yield Push.push('ALIAS', fromUser._id + '', 'MESSAGE', 'ALL', 'orderMessage', JSON.stringify(data));
    yield Push.push('ALIAS', fromUser._id + '', 'NOTICE', 'ALL', '您有新的订单消息', '您有订单即将结束');
};
/**
 * 管理员查询用户的聊天记录
 * **/
exports.adminListChattingRecords = function*(db, parameters) {
    var currentPage = parameters.currentPage;
    var size = parameters.size;
    var userId = parameters.userId;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records = yield ChattingRecords.find({
        toUserId: userId,
        status: {$in: [0, 1, 2]}
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
    var total = yield ChattingRecords.count({
        toUserId: userId,
        status: {$in: [0, 1, 2]}
    });
    return {
        total: total,
        value: records
    };
};
/**
 * 根据双方id查询聊天记录
 * @param: db
 * @param: param
 * **/
exports.adminListChattingHistory = function*(db, param) {
    let currentPage = param.currentPage;
    let size = param.size;
    let userId = param.toUserId;
    let fromUserId = param.fromUserId;
    let skip = (currentPage - 1) * size;
    let ChattingRecords = db.chattingRecords;
    return yield ChattingRecords.find({
        $or: [
            {fromUserId: fromUserId, toUserId: userId},
            {fromUserId: userId, toUserId: fromUserId}
        ],
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
};
/**
 * 管理员查询所有用户的聊天记录
 * @param db
 * @param parameters
 * parameter.currentPage
 * parameter.size
 * */
exports.listAllChattingRecords = function*(db, parameters) {
    var currentPage = parameters.currentPage;
    var size = parameters.size;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records = yield ChattingRecords.find({
        status: {$in: [0, 1, 2, 3, 4, 5]}
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
    var total = yield ChattingRecords.count({
        status: {$in: [0, 1, 2, 3, 4, 5]}
    });
    return {
        total: total,
        value: records
    };
};

/**
 * 管理员查询所有用户的聊天记录
 * @param db
 * @param parameters
 * parameter.currentPage
 * parameter.size
 * */
exports.listAllChattingRecords = function*(db, parameters) {
    var currentPage = parameters.currentPage;
    var size = parameters.size;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records = yield ChattingRecords.find({
        status: {$in: [0, 1, 2, 3, 4, 5]}
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
    var total = yield ChattingRecords.count({
        status: {$in: [0, 1, 2, 3, 4, 5]}
    });
    return {
        total: total,
        value: records
    };
};
/**
 * 管理员根据聊天双方昵称查询聊天记录
 * @param: db
 * @param: parameter.fromUserNick 发送者昵称
 * @param: parameter.toUserNick 接受者昵称
 * @param: parameter.currentPage 当前页
 * @param: parameter.size 显示条数
 * */
exports.listChattingRecordsByBothUser = function*(db, parameters) {
    var currentPage = parameters.currentPage;
    var size = parameters.size;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records = yield ChattingRecords.find({
        status: {$in: [0, 1, 2, 3, 4, 5]},
        fromUserNick: parameters.fromUserNick,
        toUserNick: parameters.toUserNick
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
    var total = yield ChattingRecords.count({
        status: {$in: [0, 1, 2, 3, 4, 5]},
        fromUserNick: parameters.fromUserNick,
        toUserNick: parameters.toUserNick
    });
    return {
        total: total,
        value: records
    };
};

/**
 * 管理员根据多个条件查询聊天记录
 * @param db
 * @param parameter
 * parameter.startTime 开始时间戳
 * parameter.overTime 结束时间戳
 * parameter.currentPage 当前页
 * parameter.size 显示条数
 * */
exports.listChattingRecordsByTime = function*(db, parameter) {
    var currentPage = parameter.currentPage;
    var size = parameter.size;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records = yield ChattingRecords.find({
        status: {$in: [0, 1, 2, 3, 4, 5]},
        timestamp: {
            $gte: parameter.startTime,
            $lte: parameter.overTime
        }
    }).limit(size).skip(skip).sort({timestamp: -1}).toArray();
    var total = yield ChattingRecords.count({
        status: {$in: [0, 1, 2, 3, 4, 5]},
        timestamp: {
            $gte: parameter.startTime,
            $lte: parameter.overTime
        }
    });
    return {
        total: total,
        value: records
    };
};

/**
 * 管理员根据时间段查询聊天记录
 * @param db
 * @param parameter
 * parameter.keyword 关键字(选填)
 * parameter.startTime 开始时间戳(选填和overTime同时存在)
 * parameter.overTime 结束时间戳(选填和startTime同时存在)
 * parameter.fromUserNick 发送者用户昵称(选填)
 * parameter.toUserNick 接受者用户昵称(选填)
 * parameter.currentPage 当前页(必填)
 * parameter.size 显示的条数(必填)
 * */
exports.listChattingRecordsByCondition = function*(db, parameter) {
    var currentPage = parameter.currentPage;
    var size = parameter.size;
    delete parameter.currentPage;
    delete parameter.size;
    var skip = (currentPage - 1) * size;
    var ChattingRecords = db.chattingRecords;
    var records;
    var total;
    if (parameter.keyword) {
        parameter.content = new RegExp(parameter.keyword);
        delete parameter.keyword;
    }
    if (parameter.toUserNick && parameter.fromUserNick) {
        parameter.$or = [{
            toUserNick: parameter.toUserNick,
            fromUserNick: parameter.fromUserNick
        }, {toUserNick: parameter.fromUserNick, fromUserNick: parameter.toUserNick}];
        delete parameter.toUserNick;
        delete parameter.fromUserNick;
    }
    if (parameter.startTime && parameter.overTime) {
        var startTime = parameter.startTime;
        var overTime = parameter.overTime;
        delete parameter.startTime;
        delete parameter.overTime;

        parameter.timestamp = {
            $gte: startTime,
            $lte: overTime
        };
        records = yield ChattingRecords.find(parameter).limit(size).skip(skip).sort({timestamp: -1}).toArray();
        total = yield ChattingRecords.count(parameter);
    } else if (!parameter.startTime && !parameter.overTime) {
        records = yield ChattingRecords.find(parameter).limit(size).skip(skip).sort({timestamp: -1}).toArray();
        total = yield ChattingRecords.count(parameter);
    } else {
        throw new Error('参数错误');
    }
    return {
        total: total,
        value: records
    };
};
/**
 * 根据两个人的id查看到最近的一条记录
 * **/
exports.loadLatelyChattingRecord = function *(db, userAId, userBId) {
    var ChattingRecords = db.chattingRecords;
    var r = yield ChattingRecords.find({
        fromUserId: {$in: [userAId + '', userBId + '']},
        toUserId: {$in: [userAId + '', userBId + '']},
    }).limit(1).sort({timestamp: -1}).toArray();
    return r[0];
};