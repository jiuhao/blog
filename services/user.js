const Database = require('../common/database');
const User = require('../db/user');
const Session = require('../db/session');
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
const Properties = require('../utils/properties');
/**
 * 用户注册
 * @param db
 * @param param{number,nick,pwd}
 * **/
exports.register = Database.warp(function *(db, param) {
    let number = param.number;
    let nick = param.nick;
    let pwd = param.pwd;
    if (!number || number.length < 3 || number.length > 15 || !nick || nick.length < 3 || nick.length > 15 || !pwd || pwd.length < 3 || pwd.length > 15) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let user = yield User.register(db, {
        number: number,
        nick: nick,
        headImageUrl: Properties.defaultHeadImageUrl,
        pwd: pwd,
        type: 1
    });
    return yield Session.create(db, 62208000000, user);
});
/**
 * 用户登录
 * @param db
 * @param param{number,pwd}
 * **/
exports.login = Database.warp(function *(db, param) {
    let number = param.number;
    let pwd = param.pwd;
    if (!number || number.length < 3 || number.length > 15 || !pwd || pwd.length < 3 || pwd.length > 15) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let user = yield User.login(db, {
        number: number,
        pwd: pwd
    });
    console.log('user:', user);
    return yield Session.create(db, 62208000000, user);
});
/**
 *  更新个人信息
 *  @param db
 *  @param session
 *  @param param
 * **/
exports.updateBaseInfo = Database.warp(function *(db, session, param) {
    let number = param.number;
    let nick = param.nick;
    if (!number || number.length < 3 || number.length > 15 || !nick || nick.length < 3 || nick.length > 15) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    yield User.updateBaseInfo(db, {
        userId: operator.id,
        nick: nick
    });
    return 'success';
});
/**
 * 更新密码
 * @param db
 * @param session
 * @param param{old,pwd}
 * **/
exports.updatePwd = Database.warp(function *(db, session, param) {
    let old = param.old;
    let pwd = param.pwd;
    if (!old || old.length < 3 || old.length > 15 || !pwd || pwd.length < 3 || pwd.length > 15) {
        throw new ApiError(ApiErrorNames.PARAM_ERROR);
    }
    let operator = yield Session.check(db, session.id, session.timestamp, session.sign);
    yield User.updatePwd(db, operator.id, old, pwd);
    return 'success';
});