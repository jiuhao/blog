"use strict";
/**
 * 推荐集合
 * _id
 * userId 被推荐者的id
 * type 'user'/'academic'
 * data[{//推荐的用户
 *      id,
 *      nick,
 *      headImageUrl
 * }]
 * createTime 创建时间
 * updateTime 推荐更新更新
 * **/
/**
 * 添加推荐
 * **/
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');

/**
 * @param db
 * @param userId 指定用户
 * @param user 指定用户
 * **/
exports.add = function *(db, userId, user) {
    let Recommend = db.recommend;
    let r = yield Recommend.findOne({
        userId: userId
    });
    if (r) {//增加推荐人
        yield Recommend.update({
            userId: userId
        }, {
            $push: {
                data: user
            }
        });
    } else {
        yield Recommend.insert({
            userId: userId,
            data: [user]
        });
    }
};