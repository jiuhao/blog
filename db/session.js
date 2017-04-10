/**
 * 会话
 * _id:唯一标示
 * number: 用户的编号
 * expireTime:过期时间
 * token:用于加密的随机字符串
 * user:登录的用户信息,携带用户的id,nick,headImageUrl
 * createTime:创建时间
 **/

var uuid = require('uuid');
var crypto = require('crypto');
var mongo = require('co-mongo');
var Url = require('../util/url');
/**
 * 创建一个session
 * **/
exports.create = function*(db, time, number) {
    var session = {};
    session._id = uuid.v1();
    session.token = uuid.v4() + uuid.v4();
    session.number = number;
    var now = new Date().getTime();
    session.createTime = now;
    if (time) {
        time = parseInt(time);
        if (time > 0) {
            session.expireTime = now + time;
        }
    }
    var Session = db.session;
    yield Session.insert({
        _id: session._id,
        token: session.token,
        verificationCode: session.verificationCode,
        mobile: mobile,
        createTime: session.createTime,
        expireTime: session.expireTime
    });
    session = {
        id: session._id,
        token: session.token,
        createTime: session.createTime,
        expireTime: session.expireTime
    };
    return session;
};
/**
 * 修改session的user属性
 * **/
exports.update = function *(db, id, user) {
    var Session = db.session;
    var session = yield Session.findOne({
        _id: id
    });
    if (session) {
        if (!user.headImageUrl) {
            user.headImageUrl = Url.defaultHeadImageUrl;
        }
        yield Session.update({
            _id: id
        }, {
            $set: {
                user: {
                    id: user.id,
                    nick: user.nick,
                    headImageUrl: user.headImageUrl
                }
            }
        });
    } else {
        throw new Error('session记录不存在');
    }
};
/**
 *  session验证
 *  @param db
 *  @param id:session的唯一标示
 *  @param timestamp:客户端的时间戳
 *  @param sign:客户端的签名
 */
exports.check = function*(db, id, timestamp, sign) {
    var now = new Date().getTime();
    if (timestamp > now + 300000 || timestamp < now - 300000) {
        console.log('客户端时间错误');
        throw new Error('客户端时间错误');
    }
    var Session = db.session;
    var session = yield Session.findOne({_id: id + ''});
    if (!session) {
        throw new Error('未登录');
    }
    // if (session.expireTime < now) {//会话永不过期
    //     console.log('会话已经过期');
    //     throw new Error('会话已经过期');
    // }
    if (session.user) {
        var text = session._id + session.user.id + session.token + timestamp;
        text = crypto.createHash('md5').update(text).digest('hex');
        if (text == sign) {
            return session.user;
        } else {
            throw new Error('签名错误');
        }
    } else {
        throw new Error('未登录');
    }
};