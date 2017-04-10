var Database = require('../common/database');
var User = require('../db/user');
var Session = require('../db/session');

/**
 * 用户注册
 * @param db
 * @param user.nick 用户昵称
 * @param user.password 密码
 * **/
exports.login = Database.warp(function *(db, user) {
    if(!user.number || user.number.length < 3 || user.number.length > 15 || !user.password || user.password.length < 3 || user.password.length > 15){
        throw new Error('传参错误');
    }
    //创建session
    var session = yield Session.create(db, 1000, user.number);
    user = yield User.login(db, user, 1);
    //更新user属性
    yield Session.update(db, session.id, user);
    return {
        first: user.first,
        id: session.id,
        token: session.token,
        userId: user._id + ''
    };
});