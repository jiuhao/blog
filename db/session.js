"use strict";
/**
 * 会话
 * _id:唯一标示
 * expireTime:过期时间
 * token:用于加密的随机字符串
 * user:登录的用户信息,携带用户的id,nick,headImageUrl
 * createTime:创建时间
 * expireTime:过期时间
 **/
const uuid = require('uuid');
const crypto = require('crypto');
const mongo = require('co-mongo');
const Properties = require('../utils/properties');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
/**
 * 创建一个session
 * **/
exports.create = function *(db, time, user) {
    let Session = db.session;
    //将该用户其他session记录清理空
    yield Session.remove({
        'user.id': user.id
    });
    let session = {};
    session._id = uuid.v1();
    session.token = uuid.v4();
    let now = new Date().getTime();
    session.createTime = now;
    if (time) {
        time = parseInt(time);
        if (time > 0) {
            session.expireTime = now + time;
        }
    }
    let r = yield Session.insert({
        _id: session._id,
        token: session.token,
        user: {
            id: user.id,
            nick: user.nick || Properties.defaultNick,
            headImageUrl: Properties.baseUrl + Properties.defaultHeadImageUrl,
            type: user.type || 1
        },
        createTime: session.createTime,
        expireTime: session.expireTime
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
    return {
        id: session._id,
        token: session.token,
        user: {
            id: user.id,
            nick: user.nick || Properties.defaultNick,
            headImageUrl: Properties.baseUrl + Properties.defaultHeadImageUrl
        }
    };
};
/**
 *  session验证
 *  @param db
 *  @param id:session的唯一标示
 *  @param timestamp:客户端的时间戳
 *  @param sign:客户端的签名
 */
exports.check = function *(db, id, timestamp, sign) {
    let now = new Date().getTime();
    let Session = db.session;
    let session = yield Session.findOne({_id: id});
    if (session.expireTime < now) {
        throw new ApiError(ApiErrorNames.SESSION_EXPIRE);
    }
    if (!session) {
        throw new ApiError(ApiErrorNames.NOT_LOGIN)
    }
    if (session.user) {
        let text = session._id + session.user.id + session.token + timestamp;
        text = crypto.createHash('md5').update(text).digest('hex');
        if (text == sign) {
            return session.user;
        } else {
            throw new ApiError(ApiErrorNames.SIGN_ERROR);
        }
    } else {
        throw new ApiError(ApiErrorNames.NOT_LOGIN);
    }
};