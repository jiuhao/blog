/**
 * 未读消息存储
 * _id: 消息的id
 * fromUserId: 发送方向id
 * fromUserNick: 发送方的昵称
 * fromUserHeadImageUrl: 发送方的头像
 * fromIdentify: 对方的身份
 * toUserId: 接受用户id
 * toUserNick: 接收用户的昵称
 * toUserHeadImageUrl: 接受用户的头像
 * type: 消息类型, 文本消息 0 、 图片消息 1 、语音消息 2 、位置消息 3 、语音通话 4 、视频通话 5、小视频 6
 * content: 发送消息内容
 * timestamp: 服务端收到客户端发送消息时的服务器时间
 * orderStatus: 是否有订单,0为没有,1为有
 * flag: 1为用户消息 2为客服消息
 * status: 0为已经发起 1为已送达 2为已读
 * **/
var Url = require('../util/url');
/**
 * 保存聊天记录
 * @param: db 数据库连接
 * @param: chattingRecords.fromUserId 发送用户id
 * @param: chattingRecords.toUserId 接受用户id
 * @param: chattingRecords.type 消息类型
 * @param: chattingRecords.content 发送消息类容
 * **/
exports.saveNoReadChattingRecords = function*(db, chattingRecord, flag) {
    var ChattingRecords = db.noReadChattingRecords;
    var r = yield ChattingRecords.findOne({
        _id: chattingRecord._id
    });
    if (!r) {
        if (chattingRecord.type === 1 || chattingRecord.type === 2) {
            chattingRecord.content = chattingRecord.cUrl;
        }
        if (!chattingRecord.fUrl) {
            chattingRecord.fUrl = Url.defaultHeadImageUrl;
        }
        if (!chattingRecord.tUrl) {
            chattingRecord.tUrl = Url.defaultHeadImageUrl;
        }
        yield ChattingRecords.insert({
            _id: chattingRecord._id,
            fromUserId: chattingRecord.fromUserId + '',
            fromUserNick: chattingRecord.fromUserNick,
            fromUserHeadImageUrl: chattingRecord.fUrl,//头像的相对路径
            fromIdentify: chattingRecord.fromIdentify,
            toUserId: chattingRecord.toUserId + '',
            toUserNick: chattingRecord.toUserNick,
            toUserHeadImageUrl: chattingRecord.tUrl,//头像的相对路径
            type: chattingRecord.type,
            content: chattingRecord.content,
            timestamp: chattingRecord.timestamp,
            status: 0,
            orderStatus: chattingRecord.orderStatus,
            flag: flag
        });
    }
};
/**
 * 删除已经接受的消息
 * @param: msgIdArray 消息_id数组
 * **/
exports.removeMsg = function*(db, msgIdArray, userId) {
    var NoChattingRecords = db.noReadChattingRecords;
    var ChattingRecords = db.chattingRecords;
    yield ChattingRecords.update({
        _id: {$in: msgIdArray},
        toUserId: userId
    }, {
        $set: {
            status: 1
        }
    }, {
        multi: true
    });
    yield NoChattingRecords.remove({
        _id: {$in: msgIdArray}
    });
};
/**
 * 用户查看未接收到的消息
 * **/
exports.listNotArrive = function*(db, toUserId) {
    var ChattingRecords = db.noReadChattingRecords;
    return yield ChattingRecords.find({
        toUserId: toUserId,
        status: 0
    }, {
        _id: true,
        type: true,
        fromUserId: true,
        fromUserNick: true,
        fromUserHeadImageUrl: true,
        fromIdentify: true,
        toUserId: true,
        toUserNick: true,
        toUserHeadImageUrl: true,
        content: true,
        timestamp: true,
        orderStatus: true
    }).sort({timestamp: 1}).toArray();
};
/**
 * 更新管理员留言为已读取
 * **/
exports.adminUpdate = function *(db, user) {
    let ChattingRecords = db.noReadChattingRecords;
    if (!user.headImageUrl) {
        user.headImageUrl = Url.defaultHeadImageUrl;
    }
    yield ChattingRecords.update({
        flag: 2,
        status: 0
    }, {
        $set: {
            toUserId: user._id + '',
            toUserNick: user.nick,
            toUserHeadImageUrl: user.headImageUrl,
            status: 0
        }
    }, {
        multi: true
    });
};
// /**
//  * 管理员上线查看所有留言
//  * **/
// exports.listAllMessage = function *(db, ) {
//
// };