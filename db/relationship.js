"use strict";
/**
 * 关系集合
 * user:{
 *      id:,
 *      nick:,
 *      headImageUrl:
 * }
 * another:{
 *      id:,
 *      nick:,
 *      headImageUrl:
 * }
 * type: 1为user关注another／2为another关注user
 * createTime 创建时间
 * **/
const ApiError = require('../error/ApiError');
const ApiErrorNames = require('../error/ApiErrorNames');
/**
 * 添加关系
 * **/
exports.add = function *(db, user, another, type) {
    let Relationship = db.relationship;
    let r = yield Relationship.insert({
        user: user,
        type: type,
        another: another,
        createTime: new Date().getTime()
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 解除关系
 * **/
exports.remove = function *(db, userId, anotherId) {
    let Relationship = db.relationship;
    let r = yield Relationship.remove({
        'user.id': userId,
        'another.id': anotherId
    });
    if (r.result.ok != 1 || r.result.n != 1) {
        throw new ApiError(ApiErrorNames.DB_EXCEPTION);
    }
};
/**
 * 查看关注的人
 * **/
exports.listFocus = function *(db, userId, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let Relationship = db.relationship;
    return yield Relationship.find({
        'user.id': userId,
    }, {
        another: true
    }).sort({createTime: -1}).skip(skip).limit(size).toArray();
};
/**
 * 查看粉丝
 * **/
exports.listFans = function *(db, anotherId, currentPage, size) {
    let skip = (currentPage - 1) * size;
    let Relationship = db.relationship;
    return yield Relationship.find({
        'another.id': anotherId,
    }, {
        another: true
    }).sort({createTime: -1}).skip(skip).limit(size).toArray();
};