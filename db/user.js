"use strict";
/**
 * _id 用户id
 * number 编号 学生编号／教师编号
 * nick 用户名
 * password 密码
 * headImageUrl 头像
 * friendCount 好友数量
 * messageCount 消息数量
 * assets{
 *      academic: 0,//学术
 *      topic: 0,//话题
 *      vote: 0,//投票
 *      activity: 0,//活动
 *      emotion: 0,//情感
 *      event: 0//事件
 * },
 * sex 性别
 * birthyear  出生年
 * birthday 出生月日
 * tags 标签
 * type 权限 1为学生 10为教师 100为管理员
 * createTime 注册时间
 * lastLoginTime 最近一次登录时间
 * status -1为冻结 1为激活
 * **/

const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const uuid = require('uuid');
/**
 * 注册
 * @param db
 * @param user 用户对象
 * **/
exports.register = function *(db, user) {
    const User = db.user;
    const now = new Date().getTime();
    let r = yield User.findOne({
        number: user.number,
    });
    if (r) {
        throw new ApiError(ApiErrorNames.ALREADY_REGISTER);
    }
    r = yield User.insert({
        _id: uuid.v1(),
        number: user.number,
        nick: user.nick,
        headImageUrl: user.headImageUrl,
        pwd: user.pwd,
        friendCount: 0,
        messageCount: 0,
        assets: {
            academic: 0,
            topic: 0,
            vote: 0,
            activity: 0,
            emotion: 0,
            event: 0
        },
        type: user.type || 1,
        createTime: now,
        lastLoginTime: now,
        status: 1
    });
    if (r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
    return {
        id: r.ops[0]._id,
        nick: r.ops[0].nick,
        headImageUrl: r.ops[0].headImageUrl
    };
};
/**
 * 登录
 * @param db
 * @param user 用户对象
 * **/
exports.login = function *(db, user) {
    const User = db.user;
    const now = new Date().getTime();
    let r = yield User.findOne({
        number: user.number,
    });
    if (r) {
        let result = {
            id: r._id,
            nick: r.nick,
            headImageUrl: r.headImageUrl
        };
        r = yield User.update({
            number: user.number,
            pwd: user.pwd
        }, {
            $set: {
                lastLoginTime: now
            }
        });
        if (r.result.n != 1) {
            throw new ApiError(ApiErrorNames.LOGIN_ERROR);
        }
        return result;
    } else {
        throw new ApiError(ApiErrorNames.NOT_REGISTER);
    }
};
/**
 * 更新头像 昵称
 * **/
exports.updateBaseInfo = function *(db, param) {
    const User = db.user;
    let query = {};
    if (param.nick) {
        query.nick = param.nick;
    }
    if (query.headImageUrl) {
        query.headImageUrl = param.headImageUrl;
    }
    let r = yield User.update({
        _id: param.userId,
    }, {
        $set: query
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 更新密码
 * @param db
 * @param userId 用户id
 * @param old
 * @param pwd
 * **/
exports.updatePwd = function *(db, userId, old, pwd) {
    const User = db.user;
    let r = yield User.findOne({
        _id: userId,
        pwd: old
    });
    if (!r) {
        throw new ApiError(ApiErrorNames.INFO_ERROR);
    }
    r = yield User.update({
        _id: userId,
        pwd: old
    }, {
        $set: {
            pwd: pwd
        }
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 查看单个用户
 * **/
exports.load = function *(db, userId) {
    const User = db.user;
    let r = yield User.findOne({
        _id: userId
    });
    if (!r) {
        throw new ApiError(ApiErrorNames.USER_NOT_EXIST);
    }
    return r;
};
/**
 * 获取部分用户
 * **/
exports.getFriends = function *(db, userId, size) {
    const User = db.user;
    return yield User.find({
        _id:{$ne: userId}
    }).limit(size).toArray();
};