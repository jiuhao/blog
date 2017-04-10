/**
 * number 编号 学生编号／教师编号
 * nick 用户名
 * password 密码
 * headImageUrl 头像
 * mobile 手机号码
 * friendCount 好友数量
 * friendLimit 好友数量限制(与等级相关) 10 20 30 ...
 * messageCount 消息数量
 * type 权限 1为学生 10为教师 100为管理员
 * xp 角色的经验值 111为Lv1 222为Lv2 ... Lv10
 * createTime 注册时间
 * lastLoginTime 最近一次登录时间
 * status -1为冻结 1为激活
 * **/

/**
 * 登录
 * @param db
 * @param user 用户对象
 * **/
exports.login = function *(db, user, type) {
    var User = db.user;
    var now = new Date().getTime();
    var r = yield user.findOne({
        number: user.number,
    });
    if (r) {
        r = yield User.update({
            nick: user.nick,
            password: user.password
        }, {
            $set: {
                lastLoginTime: now
            }
        });
        if (r.result.n != 1) {
            throw new Error('登录失败: 账户名或密码错误');
        }
        return {
            first: 0,
            _id: r.ops[0]._id,
            nick: r.ops[0].nick,
            headImageUrl: r.ops[0].headImageUrl
        };
    }
    r = yield User.insert({
        number: user.nick,
        password: user.password,
        friendCount: 0,
        friendLimit: 10,
        messageCount: 0,
        xp: 100,
        type: type,
        createTime: now,
        lastLoginTime: now,
        status: 1
    });
    if (r.result.n != 1) {
        throw new Error('注册失败: 系统错误');
    }
    return {
        first: 1,
        _id: r.ops[0]._id,
        nick: r.ops[0].nick,
        headImageUrl: r.ops[0].headImageUrl
    };
};