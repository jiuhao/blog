/**
 * 黑名单
 * userId 用户id
 * list{ 被屏蔽用户数组
 *      userId: 被屏蔽的用户id
 *      nick: 被屏蔽的用户昵称
 *      headImageUrl: 被屏蔽的用户头像
 * }
 * **/

/**
 * 屏蔽用户
 * @param db
 * @param userId
 * @param user 被屏蔽用户
 * **/
exports.shiftInBlacklist = function *(db, userId, user) {
    var Blacklist = db.blacklist;
    var r = yield Blacklist.findOne({
        userId: userId + '',
        'list.userId': user.userId
    });
    if (r) {
        throw new Error('已屏蔽');
    }
    r = yield Blacklist.update({
        userId: userId + ''
    }, {
        $push: {
            list: user
        }
    }, {
        upsert: true
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new Error('屏蔽用户失败');
    }
};
/**
 * 取消屏蔽
 * **/
exports.shiftOutBlacklist = function *(db, userId, anotherId) {
    console.log(userId, anotherId);
    var Blacklist = db.blacklist;
    var r = yield Blacklist.update({
        userId: userId + '',
        'list.userId': anotherId
    }, {
        $pull: {
            list: {userId: anotherId}
        }
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new Error('取消屏蔽失败');
    }
};
/**
 * 查看是否进入屏蔽名单
 * **/
exports.isInBlacklist = function *(db, userId, anotherId) {
    var Blacklist = db.blacklist;
    var r = yield Blacklist.find({
        $or: [{
            userId: anotherId + '',
            'list.userId': userId
        }, {
            userId: userId + '',
            'list.userId': anotherId
        }]
    }).toArray();
    return r && r.length ? 1 : 0;
};
/**
 * 查看我屏蔽的名单
 * **/
exports.listAll = function *(db, userId) {
    var Blacklist = db.blacklist;
    var r = yield Blacklist.findOne({
        userId: userId
    }, {
        list: true
    });
    var result = [];
    if (r) {
        for (var i = 0, l = r.list.length; i < l; i++) {
            result[i] = r.list[i].userId
        }
    }
    return result;
};
/**
 * 查看屏蔽我的人
 * **/
exports.listAllBeShield = function *(db, userId) {
    var Blacklist = db.blacklist;
    var r = yield Blacklist.find({
        'list.userId': userId
    }, {
        _id: false,
        userId: true
    }).toArray();
    var result = [];
    for (var i = 0, l = r.length; i < l; i++) {
        result[i] = r.userId
    }
    return result;
};
/**
 * 分页查询黑名单
 * **/
exports.list = function *(db, userId, currentPage, size) {
    var Blacklist = db.blacklist;
    var startIndex = (currentPage - 1) * size;
    var endIndex = startIndex + size;
    var r = yield Blacklist.findOne({
        userId: userId
    }, {
        list: {$slice: [startIndex, endIndex]}
    });
    return r && r.list || [];
};
/**
 *
 * 查看是否已经拉黑用户
 * **/
exports.isShield = function *(db, userId, anotherId) {
    var Blacklist = db.blacklist;
    var r = yield Blacklist.findOne({
        userId: userId,
        'list.userId': anotherId
    });
    return r ? 1 : 0;
};