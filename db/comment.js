/**
 * dynamicId: 动态id
 * dynamic:{
 *    data: 动态的类容,
 *    type: 动态的类型 }
 * fromUser:{
 *    id: 用户id
 *    nick: 昵称
 *    headImageUrl: 头像地址
 *    sex: 性别
 *    birthyear: 出身年
 *    birthday: 出生月
 *    tags: 标签
 * }
 * toUser:{
 *    id: 用户id
 *    nick: 昵称
 *    headImageUrl: 头像地址
 * }
 * type: 0为文字, 1为点赞, 2为打赏, 3为回复
 * content: 类容
 * timestamp: 时间戳
 * flag: 0为已经发起, 1为已送达
 * status: -1:冻结 0:激活
 * updateTime 数据最后一次更新的时间
 * **/

var mongo = require('co-mongo');
var Birthday = require('../util/birthday');
var Url = require('../util/url');
/**
 * 新增评论
 * @param: parameters.dynamicId 动态id
 * @param: parameters.dynamic 动态类容
 * @param: parameters.fromUser
 * @param: parameters.toUser
 * @param: parameters.type
 * @param: parameters.content
 * **/
exports.add = function *(db, parameters) {
    var Comment = db.comment;
    var now = new Date();
    if (!parameters.fromUser.headImageUrl) {
        parameters.fromUser.headImageUrl = Url.defaultHeadImageUrl;
    }
    if (!parameters.toUser.headImageUrl) {
        parameters.toUser.headImageUrl = Url.defaultHeadImageUrl;
    }
    var result = yield Comment.insert({
        dynamicId: parameters.dynamicId + '',
        dynamic: parameters.dynamic,
        fromUser: parameters.fromUser,
        toUser: parameters.toUser,
        type: parameters.type,
        content: parameters.content,
        timestamp: now.getTime(),
        status: 0,
        flag: 0,
        updateTime: new Date().getTime()
    });
    return result.ops[0];
};
/**
 * 删除评论
 * @param: commentId 评论的id
 * **/
exports.remove = function *(db, commentId) {
    var Comment = db.comment;
    var r = yield Comment.findOne({
        _id: mongo.ObjectId(commentId + ''),
        status: 0
    });
    if (!r) {
        throw new Error('评论不存在');
    }
    yield Comment.update({
        status: 0,
        _id: mongo.ObjectId(commentId + '')
    }, {
        status: -1
    });
};
/**
 * 查看评论统计
 * **/
exports.list = function *(db, dynamicId) {
    var Comment = db.comment;
    var result = {};
    result.text = yield Comment.count({
        dynamicId: dynamicId + '',
        type: 0,
        status: 0
    });
    result.heart = yield Comment.count({
        dynamicId: dynamicId + '',
        type: 1,
        status: 0
    });
    result.reward = yield Comment.count({
        dynamicId: dynamicId + '',
        type: 2,
        status: 0
    });
    return result
};
/**
 * 查看评论详情
 * **/
exports.listDetails = function *(db, dynamicId) {
    var Comment = db.comment;
    var result = {};
    result.text = yield Comment.find({
        dynamicId: dynamicId + '',
        type: {$in: [0, 3]},
        status: 0
    }, {
        dynamicId: true,
        fromUser: true,
        toUser: true,
        type: true,
        content: true,
        timestamp: true
    }).sort({timestamp: 1}).toArray();

    result.heart = yield Comment.find({
        dynamicId: dynamicId + '',
        type: 1,
        status: 0
    }, {
        dynamicId: true,
        fromUser: true,
        toUser: true,
        type: true,
        content: true,
        timestamp: true
    }).limit(8).sort({timestamp: 1}).toArray();

    result.reward = yield Comment.find({
        dynamicId: dynamicId + '',
        type: 2,
        status: 0
    }, {
        dynamicId: true,
        fromUser: true,
        toUser: true,
        type: true,
        content: true,
        timestamp: true
    }).limit(8).sort({timestamp: 1}).toArray();
    var format = function *(data) {
        if (data.length != 0) {
            for (var i = 0, l = data.length; i < l; i++) {
                data[i].fromUser.headImageUrl = Url.baseUrl + data[i].fromUser.headImageUrl + Url.styleOne;
                if (data[i].fromUser.birthyear == '' || data[i].fromUser.birthday == '') {
                    data[i].fromUser.age = '';
                } else {
                    data[i].fromUser.age = Birthday.getAge(data[i].fromUser.birthyear, data[i].fromUser.birthday);
                }
                data[i].toUser.headImageUrl = Url.baseUrl + data[i].toUser.headImageUrl + Url.styleOne
            }
        }
    };
    yield format(result.text);
    yield format(result.heart);
    // var tmp = [];
    // for (var j = 0, m = result.reward.length; j < m; j++) {
    //     tmp.push({
    //         dynamicId: dynamicId + '',
    //         fromUser: result.reward[j]._id.fromUser,
    //         toUser: result.reward[j]._id.toUser,
    //         timestamp: new Date().getTime(),
    //         content: result.reward[j].content
    //     });
    // }
    // result.reward = tmp;
    yield format(result.reward);
    return result;
};
/**
 * 是否赞过
 * **/
exports.hasHeart = function *(db, fromUserId, toUserId, dynamicId) {
    var Comment = db.comment;
    var result = yield Comment.find({
        'fromUser.id': fromUserId + '',
        'toUser.id': toUserId + '',
        type: 1,
        dynamicId: dynamicId + ''
    }).toArray();
    if (result.length != 0) {
        return 1;
    }
    return 0;
};
/**
 * 查看评论
 * **/
exports.load = function *(db, commentId) {
    var Comment = db.comment;
    var result = yield Comment.findOne({
        _id: mongo.ObjectId(commentId + ''),
        status: 0
    });
    if (!result) {
        throw new Error('评论不存在');
    }
    return result
};
/**
 * 更新头像
 * **/
exports.updateHeadImageUrl = function *(db, userId, headImageUrl) {
    var Comment = db.comment;
    yield Comment.update({
        'fromUser.userId': userId,
    }, {
        $set: {
            'fromUser.headImageUrl': headImageUrl,
            updateTime: new Date().getTime()
        }
    });
    yield Comment.update({
        'toUser.userId': userId,
    }, {
        $set: {
            'toUser.headImageUrl': headImageUrl,
            updateTime: new Date().getTime()
        }
    })
};
/**
 * 更新评论表中的用户信息
 * **/
exports.update = function *(db, user) {
    var Comment = db.comment;
    yield Comment.update({
        'fromUser.userId': user.userId,
    }, {
        $set: {
            'fromUser.nick': user.nick,
            'fromUser.sex': user.sex,
            'fromUser.birthyear': user.birthyear,
            'fromUser.birthday': user.birthday,
            tags: user.tags,
            updateTime: new Date().getTime()
        }
    });
    yield Comment.update({
        'toUser.userId': user.userId,
    }, {
        $set: {
            'toUser.nick': user.nick,
            'toUser.sex': user.sex,
            'toUser.birthyear': user.birthyear,
            'toUser.birthday': user.birthday,
            tags: user.tags,
            updateTime: new Date().getTime()
        }
    })
};
/**
 * 查看所有赞过的人
 * **/
exports.listAllLovers = function *(db, dynamicId, currentPage, size) {
    var Comment = db.comment;
    var skip = (currentPage - 1) * size;
    var result = yield Comment.find({
        dynamicId: dynamicId + '',
        type: 1,
        status: 0
    }, {
        fromUser: true
    }).limit(size).skip(skip).sort({timestamp: 1}).toArray();

    for (var i = 0, l = result.length; i < l; i++) {
        result[i].fromUser.headImageUrl = Url.baseUrl + result[i].fromUser.headImageUrl + Url.styleTwo;
        result[i].fromUser.age = Birthday.getAge(result[i].fromUser.birthyear, result[i].fromUser.birthday);
    }
    return result;
};
/**
 * 查看所有打赏过的人
 * **/
exports.listAllReword = function *(db, dynamicId, currentPage, size) {
    var skip = (currentPage - 1) * size;
    var Comment = db.comment;
    var result = yield Comment.find({
        dynamicId: dynamicId + '',
        type: 2,
        status: 0
    }, {
        dynamicId: true,
        fromUser: true,
        toUser: true,
        type: true,
        content: true,
        timestamp: true
    }).limit(size).skip(skip).sort({timestamp: 1}).toArray();
    for (var i = 0, l = result.length; i < l; i++) {
        result[i].fromUser.headImageUrl = Url.baseUrl + result[i].fromUser.headImageUrl + Url.styleTwo;
        result[i].fromUser.age = Birthday.getAge(result[i].fromUser.birthyear, result[i].fromUser.birthday);
    }
    return result;
};
/**
 * 评论消息已经送达
 * **/
exports.alreadyArrive = function *(db, commentId) {
    var Comment = db.comment;
    yield Comment.update({
        _id: mongo.ObjectId(commentId + ''),
        status: 0
    }, {
        $set: {
            flag: 1,
            updateTime: new Date().getTime()
        }
    });
};
/**
 * listComment 我的消息
 * **/
exports.listComment = function *(db, userId, currentPage, size) {
    var Comment = db.comment;
    var skip = (currentPage - 1) * size;
    return yield Comment.find({
        'toUser.id': userId,
        dynamic: {$exists: true}
    }, {
        dynamicId: true,
        dynamic: true,
        fromUser: true,
        type: true,
        content: true,
        timestamp: true
    }).skip(skip).limit(size).sort({updateTime: -1}).toArray();
};